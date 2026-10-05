import { createClient } from '@insforge/sdk';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rkhwh883.us-east.insforge.app';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'ik_b0d312af06cf8d41cd8ae7b663f7fbf7';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const supabase = createClient({ baseUrl: SUPABASE_URL, anonKey: SUPABASE_KEY });

// Configuration
const DATA_DIR = path.join(process.cwd(), 'data', 'documents');
const POLICY_FILES = [
  'aktu_btech_ordinance.txt',
  'abes_fee_structure.txt',
  'abes_refund_policy.txt',
  'abes_scholarship_policy.txt',
  'abes_library_rules.txt',
  'abes_hostel_rules.txt',
  'abes_placement_eligibility.txt'
];
const EVENT_FILES = [
  'abes_events.txt'
];

interface ChunkData {
  text: string;
  eventDate: string | null;
}

// 1. Chunking Logic
export function chunkText(text: string, maxWords: number = 180, overlapWords: number = 30): ChunkData[] {
  const chunks: ChunkData[] = [];
  
  // Split on double newlines to keep blocks like "Title: ...\nOrganizer: ..." together
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter((p) => p !== '');

  for (const paragraph of paragraphs) {
    // Extract [EVENT: YYYY-MM-DD] tag if it exists
    const eventMatch = paragraph.match(/\[EVENT:\s*(\d{4}-\d{2}-\d{2})\]/i);
    const eventDate = eventMatch ? eventMatch[1] : null;
    const eventTagStr = eventMatch ? eventMatch[0] : null;

    const words = paragraph.split(/\s+/);
    
    // If the paragraph is small enough, keep it intact
    if (words.length <= maxWords) {
      chunks.push({
        text: paragraph,
        eventDate: eventDate
      });
    } else {
      // Sliding window
      let startIndex = 0;
      while (startIndex < words.length) {
        const chunkWords = words.slice(startIndex, startIndex + maxWords);
        let chunkTextStr = chunkWords.join(' ');
        
        // Ensure the [EVENT: YYYY-MM-DD] tag is not lost if this chunk doesn't have it
        if (eventTagStr && !chunkTextStr.includes(eventTagStr)) {
            // Prepend the tag to ensure context is maintained
            chunkTextStr = `${eventTagStr}\n${chunkTextStr}`;
        }

        chunks.push({
          text: chunkTextStr,
          eventDate: eventDate
        });
        
        startIndex += (maxWords - overlapWords);
      }
    }
  }

  return chunks;
}

// 2. Generate Embeddings
export async function getEmbedding(text: string): Promise<number[]> {
  if (!GEMINI_API_KEY) {
    console.warn("⚠️  GEMINI_API_KEY is not set. Generating a mock embedding vector for demonstration purposes.");
    // Generate a deterministic random vector of length 768
    return new Array(768).fill(0).map((_, i) => Math.sin(i * text.length));
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  // Exponential backoff or retries could be added here if rate limited
  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: text,
  });

  if (response.embeddings && response.embeddings.length > 0 && response.embeddings[0].values) {
    return response.embeddings[0].values;
  }
  throw new Error("Failed to generate embedding");
}

function getTokenCountEstimate(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 1.3); // Rough estimate
}

// 3. Process a Single Document
export async function processDocument(filename: string, sourceType: 'policy' | 'event') {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}, skipping...`);
    return { docsInserted: 0, chunksInserted: 0, embeddedChunks: 0, eventDatesFound: 0 };
  }

  const rawText = fs.readFileSync(filePath, 'utf-8');
  const title = filename; // Use filename as title for determinism/idempotency

  console.log(`Processing ${sourceType} document: ${title}...`);

  // Idempotency: Delete if exists (Cascade will delete chunks)
  const { error: deleteError } = await supabase.database
    .from('documents')
    .delete()
    .eq('title', title);

  if (deleteError) {
    console.error(`❌ Error deleting existing document ${title}:`, deleteError.message);
  }

  // Insert Document
  const { data: documentData, error: docError } = await supabase.database
    .from('documents')
    .insert([{
      title: title,
      source_type: sourceType,
      raw_text: rawText
    }])
    .select('id')
    .single();

  if (docError) {
    console.error(`❌ Error inserting document ${title}:`, docError.message);
    return { docsInserted: 0, chunksInserted: 0, embeddedChunks: 0, eventDatesFound: 0 };
  }

  const documentId = documentData.id;
  
  // Chunking
  const textChunks = chunkText(rawText);
  let chunksInserted = 0;
  let embeddedChunks = 0;
  let eventDatesFound = 0;

  console.log(`  - Created ${textChunks.length} chunks. Generating embeddings...`);

  // Process chunks sequentially to avoid rate limits (or use Promise.all with chunks if limit allows)
  for (let i = 0; i < textChunks.length; i++) {
    const chunkData = textChunks[i];
    
    // For policy docs, eventDate must be NULL
    const finalEventDate = sourceType === 'policy' ? null : chunkData.eventDate;
    
    try {
        const embedding = await getEmbedding(chunkData.text);
        embeddedChunks++;
        
        const tokenCount = getTokenCountEstimate(chunkData.text);

        const chunkRow: Record<string, unknown> = {
          document_id: documentId,
          chunk_text: chunkData.text,
          embedding: embedding,
          token_count: tokenCount,
          event_date: finalEventDate
        };

        if (finalEventDate) {
            eventDatesFound++;
        }

        const { error: chunkError } = await supabase.database
          .from('chunks')
          .insert([chunkRow]);

        if (chunkError) {
          console.error(`  ❌ Error inserting chunk ${i+1} for ${title}:`, chunkError.message);
        } else {
          chunksInserted++;
        }
    } catch (err: any) {
        console.error(`  ❌ Error generating embedding for chunk ${i+1} in ${title}:`, err.message);
    }
  }

  return { docsInserted: 1, chunksInserted, embeddedChunks, eventDatesFound };
}

// 4. Main Execution
async function runIngestion() {
  console.log("Starting Offline Document Ingestion Pipeline...");
  
  let totalDocsInserted = 0;
  let totalPolicyDocs = 0;
  let totalEventDocs = 0;
  let totalChunksInserted = 0;
  let totalEmbeddedChunks = 0;
  let totalEventChunksWithDate = 0;
  let totalPolicyChunksWithNullDate = 0;

  // Process Policy Files
  for (const file of POLICY_FILES) {
    const stats = await processDocument(file, 'policy');
    totalDocsInserted += stats.docsInserted;
    if (stats.docsInserted > 0) totalPolicyDocs++;
    totalChunksInserted += stats.chunksInserted;
    totalEmbeddedChunks += stats.embeddedChunks;
    // By definition, all policy chunks should have NULL dates based on our logic
    totalPolicyChunksWithNullDate += stats.chunksInserted;
  }

  // Process Event Files
  for (const file of EVENT_FILES) {
    const stats = await processDocument(file, 'event');
    totalDocsInserted += stats.docsInserted;
    if (stats.docsInserted > 0) totalEventDocs++;
    totalChunksInserted += stats.chunksInserted;
    totalEmbeddedChunks += stats.embeddedChunks;
    totalEventChunksWithDate += stats.eventDatesFound;
  }

  console.log("\n✅ Ingestion Complete!");
  
  // Validation Reporting
  console.log(`\n📊 Validation Metrics:`);
  console.log(`- Number of documents inserted: ${totalDocsInserted}`);
  console.log(`- Number of policy documents: ${totalPolicyDocs}`);
  console.log(`- Number of event documents: ${totalEventDocs}`);
  console.log(`- Total chunks inserted: ${totalChunksInserted}`);
  console.log(`- Number of chunks with embeddings: ${totalEmbeddedChunks}`);
  console.log(`- Number of event chunks with non-NULL event_date: ${totalEventChunksWithDate}`);
  console.log(`- Number of policy chunks with NULL event_date: ${totalPolicyChunksWithNullDate}`);

  // Show samples
  console.log(`\n🔍 Fetching Samples for Validation...`);
  
  // 1. One complete policy document row
  const { data: policyDoc } = await supabase.database
    .from('documents')
    .select('*')
    .eq('source_type', 'policy')
    .limit(1)
    .single();

  if (policyDoc) {
    console.log(`\n--- 1. Complete Policy Document Row ---`);
    console.log(`ID: ${policyDoc.id}`);
    console.log(`Title: ${policyDoc.title}`);
    console.log(`Source Type: ${policyDoc.source_type}`);
    console.log(`Created At: ${policyDoc.created_at}`);
    console.log(`Raw Text (first 100 chars): ${policyDoc.raw_text.substring(0, 100)}...`);
  }

  // 2. One policy chunk with embedding dimension
  if (policyDoc) {
      const { data: policyChunk } = await supabase.database
        .from('chunks')
        .select('chunk_text, embedding, event_date')
        .eq('document_id', policyDoc.id)
        .limit(1)
        .single();
        
      if (policyChunk) {
        console.log(`\n--- 2. Policy Chunk ---`);
        console.log(`Event Date: ${policyChunk.event_date === null ? 'NULL (Correct)' : policyChunk.event_date}`);
        console.log(`Embedding Dimension: ${policyChunk.embedding ? policyChunk.embedding.length : 'N/A'}`);
        console.log(`Chunk Text Preview: "${policyChunk.chunk_text.substring(0, 80)}..."`);
      }
  }

  // 3. One event chunk showing text, extracted date, and embedding dimension
  const { data: eventDoc } = await supabase.database
    .from('documents')
    .select('id')
    .eq('source_type', 'event')
    .limit(1)
    .single();

  if (eventDoc) {
      const { data: eventChunk } = await supabase.database
        .from('chunks')
        .select('chunk_text, embedding, event_date')
        .eq('document_id', eventDoc.id)
        .not('event_date', 'is', null)
        .limit(1)
        .single();
        
      if (eventChunk) {
        console.log(`\n--- 3. Event Chunk ---`);
        console.log(`Extracted event_date: ${eventChunk.event_date}`);
        console.log(`Embedding Dimension: ${eventChunk.embedding ? eventChunk.embedding.length : 'N/A'}`);
        console.log(`Chunk Text:\n${eventChunk.chunk_text}`);
      }
  }
}

import { fileURLToPath } from 'url';
if (import.meta.url.startsWith('file:') && process.argv[1] === fileURLToPath(import.meta.url)) {
  runIngestion().catch(console.error);
}
