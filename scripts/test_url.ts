import { createClient } from '@insforge/sdk';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local' });
else dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://rkhwh883.us-east.insforge.app';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'ik_b0d312af06cf8d41cd8ae7b663f7fbf7';
const supabase = createClient({ baseUrl: SUPABASE_URL, anonKey: SUPABASE_KEY });

// Replace the fetch in the database postgrest to log URLs
const db = (supabase as any).database;
const pgRest = db.postgrest;
const origCustomFetch = pgRest.fetch;
pgRest.fetch = (url: any, options: any) => {
  console.log('pgRest FETCH URL:', typeof url === 'string' ? url : url?.toString());
  return origCustomFetch(url, options);
};

const testEmbedding = new Array(768).fill(0).map((_, i) => Math.sin(i * 5));
const result = await supabase.database.rpc('match_chunks', {
  query_embedding: testEmbedding,
  query_text: 'hostel rules',
  match_count: 1,
  filter_future_events: false
});
console.log('Result error:', result.error?.message || 'none');
console.log('Result data count:', result.data?.length ?? 0);
