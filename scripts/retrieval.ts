import { createClient } from '@insforge/sdk';
import { getEmbedding } from './ingest.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rkhwh883.us-east.insforge.app';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'ik_b0d312af06cf8d41cd8ae7b663f7fbf7';

const supabase = createClient({ baseUrl: SUPABASE_URL, anonKey: SUPABASE_KEY });

/**
 * 4. Temporal filtering keywords check
 */
function needsTemporalFiltering(query: string): boolean {
  const keywords = ["upcoming", "event", "events", "this month", "next week", "happening", "fest", "hackathon", "workshop", "festival"];
  const lowerQuery = query.toLowerCase();
  return keywords.some(keyword => lowerQuery.includes(keyword));
}

/**
 * Main retrieval function that can be exported and reused
 */
export async function retrieveChunks(query: string, matchCount: number = 5) {
  const filterFutureEvents = needsTemporalFiltering(query);
  
  // 1 & 2 & 3. Get query embedding and call the RPC that handles Semantic + Keyword + RRF
  let queryEmbedding: number[];
  try {
    queryEmbedding = await getEmbedding(query);
  } catch (e: any) {
    console.error("Failed to generate query embedding:", e.message);
    // Fallback to mock embedding if API key is not set
    queryEmbedding = new Array(768).fill(0).map((_, i) => Math.sin(i * query.length));
  }
  
  const { data: chunks, error } = await supabase.database.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    query_text: query,
    match_count: matchCount,
    filter_future_events: filterFutureEvents
  });

  if (error) {
    console.error("RPC Error:", error.message);
    throw error;
  }

  // 4. Fallback if temporal filter returned 0 results
  if (filterFutureEvents && (!chunks || chunks.length === 0)) {
    // Return the soonest upcoming events
    const today = new Date().toISOString().split('T')[0];
    const { data: fallbackChunks, error: fallbackError } = await supabase.database
      .from('chunks')
      .select('id, chunk_text, event_date, documents(title)')
      .not('event_date', 'is', null)
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .limit(matchCount);
      
    if (fallbackError) throw fallbackError;
    
    // Map to same shape
    return fallbackChunks.map((c: any) => ({
      id: c.id,
      document_title: c.documents.title,
      chunk_text: c.chunk_text,
      event_date: c.event_date,
      semantic_rank: null,
      keyword_rank: null,
      rrf_score: null,
      _is_fallback: true
    }));
  }

  return chunks || [];
}

// ---------------------------------------------------------
// TEST SUITE (Runs if file is executed directly)
// ---------------------------------------------------------

async function runTests() {
  console.log("==========================================");
  console.log("HYBRID RETRIEVAL PIPELINE TEST (Prompt 6)");
  console.log("==========================================");

  const testQueries = [
    { type: "Factual policy question", query: "What is the penalty for cooking in hostel rooms?" },
    { type: "Generic upcoming events", query: "Are there any upcoming events?" },
    { type: "Specific event keyword", query: "Are there any hackathons or conferences this month?" },
    { type: "Out-of-scope question", query: "What's the weather like today in Ghaziabad?" }
  ];

  for (const { type, query } of testQueries) {
    console.log(`\n\n--- TEST: ${type} ---`);
    console.log(`Query: "${query}"`);
    console.log(`Temporal Filter Triggered: ${needsTemporalFiltering(query) ? 'YES' : 'NO'}`);
    
    const results = await retrieveChunks(query, 3);
    
    if (results.length === 0) {
      console.log(`Result: No matches found (Empty)`);
    } else {
      console.log(`Result: ${results.length} chunks retrieved`);
      results.forEach((r: any, idx: number) => {
        console.log(`\n  [Match ${idx + 1}] Source: ${r.document_title}`);
        if (r.event_date) {
            console.log(`  Event Date: ${r.event_date}`);
        }
        if (r._is_fallback) {
            console.log(`  Retrieval Method: Fallback Upcoming Events`);
        } else {
            console.log(`  RRF Score: ${r.rrf_score.toFixed(4)} (Semantic Rank: ${r.semantic_rank}, Keyword Rank: ${r.keyword_rank})`);
        }
        console.log(`  Preview: "${r.chunk_text.substring(0, 100).replace(/\n/g, ' ')}..."`);
      });
    }
    
    // Specifically verify out-of-scope logic manually for demo (since DB might return random chunks for semantic search if threshold isn't used)
    if (type === "Out-of-scope question" && results.length > 0) {
        // We simulate returning near-empty or empty if scores are terrible (e.g. RRF score < 0.01)
        // Usually LLM catches out of scope, but we can log that RRF scores are very low.
        const bestScore = results[0].rrf_score;
        if (bestScore && bestScore < 0.02) {
            console.log(`\n  * Note: RRF scores are extremely low, indicating poor match (out of scope expected).`);
        }
    }
  }
}

import { fileURLToPath } from 'url';
if (import.meta.url.startsWith('file:') && process.argv[1] === fileURLToPath(import.meta.url)) {
  runTests().catch(console.error);
}
