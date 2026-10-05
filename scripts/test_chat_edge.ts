import { createClient } from '@insforge/sdk';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local' });
else dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rkhwh883.us-east.insforge.app';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'ik_b0d312af06cf8d41cd8ae7b663f7fbf7';
const supabase = createClient({ baseUrl: SUPABASE_URL, anonKey: SUPABASE_KEY });

async function runTests() {
  console.log("==========================================");
  console.log("CHAT EDGE FUNCTION TEST (Prompt 7)");
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
    
    try {
        const { data, error } = await supabase.functions.invoke('chat', {
            body: { question: query }
        });

        if (error) {
            console.error("Function Error:", error);
            continue;
        }
        
        console.log(`\nAnswer: ${data.answer}`);
        console.log(`\nGrounded: ${data.grounded} (Score: ${data.groundedness})`);
        console.log(`Refused: ${data.refused}`);
        if (data.sources && data.sources.length > 0) {
            console.log("Sources:");
            data.sources.forEach((s: any) => console.log(` - ${s.source} (${s.section})`));
        }
    } catch (e: any) {
        console.error("Failed to invoke:", e.message);
    }
  }
}

runTests().catch(console.error);
