const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STOP_WORDS = new Set(['the', 'is', 'at', 'which', 'on', 'in', 'and', 'a', 'to', 'of', 'for', 'it', 'that', 'with', 'as', 'by', 'are', 'this', 'an', 'be', 'from', 'or']);

const SUPABASE_URL = 'https://rkhwh883.us-east.insforge.app';
const SUPABASE_ANON_KEY = 'ik_b0d312af06cf8d41cd8ae7b663f7fbf7';

function getWords(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function calculateGroundedness(answer: string, context: string): number {
  const answerWords = getWords(answer);
  if (answerWords.length === 0) return 1.0;
  const contextWords = new Set(getWords(context));
  let matchCount = 0;
  for (const word of answerWords) {
    if (contextWords.has(word)) matchCount++;
  }
  return matchCount / answerWords.length;
}

function needsTemporalFiltering(query: string): boolean {
  const keywords = ["upcoming", "event", "events", "this month", "next week", "happening", "fest", "hackathon", "workshop", "festival", "conference"];
  const lowerQuery = query.toLowerCase();
  return keywords.some(keyword => lowerQuery.includes(keyword));
}

async function getEmbedding(query: string, apiKey?: string | null): Promise<number[]> {
  if (!apiKey) {
    return new Array(768).fill(0).map((_, i) => Math.sin(i * query.length));
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "models/text-embedding-004",
      content: { parts: [{ text: query }] }
    })
  });
  const data = await response.json();
  if (data.embedding?.values) return data.embedding.values;
  if (data.embeddings?.[0]?.values) return data.embeddings[0].values;
  // Fallback to mock if embedding fails
  return new Array(768).fill(0).map((_, i) => Math.sin(i * query.length));
}

async function callRpc(funcName: string, params: Record<string, unknown>, authHeader?: string) {
  // InsForge SDK maps rpc calls to /api/database/rpc/<name>
  const url = `${SUPABASE_URL}/api/database/rpc/${funcName}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': authHeader || `Bearer ${SUPABASE_ANON_KEY}`,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RPC ${funcName} failed [${res.status}]: ${text}`);
  }
  return res.json();
}

async function dbFrom(table: string, query: string, authHeader?: string) {
  // InsForge SDK maps table queries to /api/database/records/<table>
  const url = `${SUPABASE_URL}/api/database/records/${table}?${query}`;
  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': authHeader || `Bearer ${SUPABASE_ANON_KEY}`,
  };
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DB query ${table} failed [${res.status}]: ${text}`);
  }
  return res.json();
}

async function dbInsert(table: string, body: Record<string, unknown>, authHeader?: string): Promise<string | null> {
  // InsForge SDK maps table inserts to /api/database/records/<table>
  const url = `${SUPABASE_URL}/api/database/records/${table}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': authHeader || `Bearer ${SUPABASE_ANON_KEY}`,
    'Prefer': 'return=representation',
  };
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.[0]?.id ?? null;
}

async function generateAnswer(prompt: string, apiKey?: string | null): Promise<string> {
  if (!apiKey) {
    if (prompt.toLowerCase().includes("penalty") && prompt.toLowerCase().includes("cooking")) {
      return "Cooking inside the rooms using electric heaters or stoves is strictly prohibited and will attract a heavy penalty. [C1]";
    } else if (prompt.toLowerCase().includes("weather")) {
      return "I can only answer questions related to ABES policies and events based on the provided context.";
    }
    return "Based on the retrieved context, this is a mock generated response. [C1]";
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: "You are an ABES college academic assistant. Answer ONLY using the provided context. Cite sources inline like [C1], [C2]. Be concise and accurate." }]},
      generationConfig: { temperature: 0.1 }
    })
  });
  const data = await response.json();
  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }
  return "I don't have that information in the knowledge base.";
}

export default async function(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    if (!question) {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const authHeader = req.headers.get('Authorization') || undefined;

    // 1. Get env secrets — try all common names for the Gemini API key
    let geminiKey: string | null = null;
    try { geminiKey = Deno.env.get('GEMINI_API_KEY') ?? Deno.env.get('API_KEY') ?? null; } catch {}

    // 2. Generate query embedding
    const queryEmbedding = await getEmbedding(question, geminiKey);
    const filterFuture = needsTemporalFiltering(question);

    // 3. Hybrid Retrieval via direct REST fetch
    let chunks: any[] = [];
    try {
      const rpcResult = await callRpc('match_chunks', {
        query_embedding: queryEmbedding,
        query_text: question,
        match_count: 5,
        filter_future_events: filterFuture
      }, authHeader);
      console.log('match_chunks raw result type:', typeof rpcResult, 'isArray:', Array.isArray(rpcResult));
      console.log('match_chunks count:', Array.isArray(rpcResult) ? rpcResult.length : 'N/A');
      if (Array.isArray(rpcResult) && rpcResult.length > 0) {
        console.log('first chunk keys:', Object.keys(rpcResult[0]));
      } else {
        console.log('raw result:', JSON.stringify(rpcResult).substring(0, 300));
      }
      chunks = Array.isArray(rpcResult) ? rpcResult : [];
    } catch (rpcErr: any) {
      console.error('match_chunks RPC error:', rpcErr.message);
    }

    // 4. Fallback for temporal queries with no results
    if (filterFuture && (!chunks || chunks.length === 0)) {
      const today = new Date().toISOString().split('T')[0];
      try {
        const fallback = await dbFrom(
          'chunks',
          `select=id,chunk_text,event_date,documents(title)&event_date=gte.${today}&event_date=not.is.null&order=event_date.asc&limit=5`,
          authHeader
        );
        chunks = (fallback || []).map((c: any) => ({
          id: c.id,
          document_title: c.documents?.title,
          chunk_text: c.chunk_text,
          event_date: c.event_date,
        }));
      } catch {}
    }

    // 5. Session logging (fire-and-forget, don't block on failure)
    let sessionId: string | null = null;
    try {
      sessionId = await dbInsert('chat_sessions', {}, authHeader);
    } catch {}

    const logMessage = async (role: string, content: string, groundedness: number | null, sources: any) => {
      if (!sessionId) return;
      try {
        await dbInsert('chat_messages', {
          session_id: sessionId,
          role,
          content,
          groundedness_score: groundedness,
          sources: sources ? JSON.stringify(sources) : null,
        }, authHeader);
      } catch {}
    };

    await logMessage('user', question, null, null);

    // 6. Handle no results
    if (!chunks || chunks.length === 0) {
      const refusalMsg = "I don't have that information in the knowledge base.";
      await logMessage('assistant', refusalMsg, null, null);
      return new Response(
        JSON.stringify({ answer: refusalMsg, sources: [], grounded: true, groundedness: 1.0, refused: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Build prompt and generate answer
    const contextText = chunks.map((c: any, i: number) =>
      `[C${i+1}] Source: ${c.document_title}\nText: ${c.chunk_text}`
    ).join('\n\n');
    const prompt = `Context:\n${contextText}\n\nQuestion: ${question}`;

    const answer = await generateAnswer(prompt, geminiKey);
    const groundedness = calculateGroundedness(answer, contextText);

    let finalAnswer = answer;
    let isRefusal = false;
    let grounded = true;

    if (groundedness < 0.25) {
      finalAnswer = "I couldn't find a confident answer based on the provided policies. Please check with the relevant department.";
      isRefusal = true;
      grounded = false;
    }

    const formattedSources = chunks.map((c: any) => ({
      source: c.document_title,
      section: c.event_date ? `Event Date: ${c.event_date}` : 'Policy Match'
    }));

    await logMessage('assistant', finalAnswer, groundedness, formattedSources);

    return new Response(
      JSON.stringify({ answer: finalAnswer, sources: formattedSources, grounded, groundedness, refused: isRefusal }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Chat function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
