# Antigravity Prompts — Database & Backend (on Insforge)

Continues after Prompts 1-3 (logo swap, Bolt badge removal, Insforge deploy
link — already done). Run these ONE AT A TIME, in order. After each, verify
the result (check Insforge's dashboard/CLI output) before moving on.

---

## Prompt 4 — Insforge Orientation + Database Schema

```
This project's frontend is deployed and linked to Insforge
(project-id fb90992e-4114-40f2-8d31-9003e0dda85b). Insforge provides a
managed Postgres database (with pgvector support), built-in auth, storage,
edge functions, and a model gateway.

Before building anything, inspect what's actually available:
1. Use Insforge's CLI/MCP tools to check whether pgvector is enabled on this
   project's database, and enable it if it's not.
2. Check what the Insforge Model Gateway currently supports — specifically
   whether it exposes an embeddings endpoint, and which LLM providers/models
   are available through it (confirm whether Gemini is available, or only
   OpenAI/Kimi as the docs suggest — I need to know this before the next
   steps).
3. Report back the current database schema (if any tables already exist from
   the auth/login setup).

Then create this schema (adjust types as Insforge's Postgres setup requires):

- `documents` (id, title, source_type ['policy'|'event'], raw_text, created_at)
- `chunks` (id, document_id FK, chunk_text, embedding vector(?), token_count,
  event_date DATE NULL, created_at) — set the vector dimension to match
  whatever embedding model we end up using in Prompt 5.
- `chat_sessions` (id, user_id FK to auth users, created_at)
- `chat_messages` (id, session_id FK, role ['user'|'assistant'], content,
  groundedness_score FLOAT NULL, sources JSONB NULL, created_at)
- `evaluations` (id, run_timestamp, avg_recall, avg_mrr, avg_rouge_l,
  avg_groundedness, refusal_accuracy)

Also add a Postgres full-text search column/index on `chunks.chunk_text`
(tsvector, generated column, GIN index) — this will serve as our keyword/
sparse retrieval alongside the vector column for semantic retrieval.

Show me the migration you ran and confirm all tables exist via the Insforge
dashboard or CLI.
```

---

## Prompt 5 — Document Ingestion Pipeline

```
Build a document ingestion pipeline that populates the `documents` and
`chunks` tables from Prompt 4.

1. Create sample source content covering: attendance policy, examination
   rules, fee structure, library rules, hostel rules, scholarship policy,
   placement eligibility (as 'policy' type documents), and 5-6 event
   announcements with real future/past dates relative to today (as 'event'
   type documents, populating chunks.event_date).
2. Write a chunking function: split each document into paragraphs, further
   splitting any paragraph over ~180 words using a word-based sliding window
   with overlap.
3. For each chunk, generate an embedding:
   - If the Insforge Model Gateway supports embeddings (confirmed in
     Prompt 4), use that.
   - Otherwise, call an external embedding API directly (e.g. Gemini's
     text-embedding-004 or OpenAI's embedding endpoint via the gateway) from
     an Insforge Edge Function — use whichever we confirmed is actually
     available.
4. Insert each chunk with its embedding vector into the `chunks` table,
   linked to its parent `documents` row.
5. Wrap this as a one-off Edge Function or CLI script I can re-run whenever
   source documents change (this is NOT meant to run on every request —
   it's an offline ingestion step).

Run it against the sample content and show me the resulting row counts in
`documents` and `chunks`, plus one sample row showing a populated embedding
vector.
```

---

## Prompt 6 — Hybrid Retrieval

```
Implement hybrid retrieval as an Insforge Edge Function (or a reusable
module called by one), combining:

1. Semantic search: cosine similarity search on `chunks.embedding` using
   pgvector (`<=>` operator or equivalent), returning top-N candidates.
2. Keyword search: Postgres full-text search on the `chunks` tsvector column
   from Prompt 4, returning top-N candidates.
3. Merge both ranked lists using Reciprocal Rank Fusion.
4. Temporal filtering: if the query contains words like "upcoming", "event",
   "events", "this month", "next week", "happening", "fest", "hackathon",
   "workshop", "festival" — restrict candidates to chunks where
   event_date >= CURRENT_DATE before ranking. If this filter produces zero
   keyword/semantic matches, fall back to returning the soonest upcoming
   events (chunks with event_date >= CURRENT_DATE, ordered by event_date
   ascending) instead of an empty result.
5. Return the final top-k chunks with their source document title and
   event_date (if applicable).

Write a quick test using 4 sample queries: one factual policy question, one
generic "any upcoming events?" question, one specific event-keyword question
("any hackathons?"), and one out-of-scope question ("what's the weather?").
Show me the results for all four — out-of-scope should return empty/near-
empty, and the generic events query should return only future-dated events.
```

---

## Prompt 7 — Chat Edge Function (Generation + Groundedness Check)

```
Build the main chat Edge Function that ties retrieval to generation.

Given a user's question and their authenticated session (via Insforge Auth):
1. Call the hybrid retrieval function from Prompt 6.
2. If no chunks are retrieved, save and return a refusal message
   ("I don't have that information in the knowledge base.") without calling
   any LLM.
3. Otherwise, build a prompt with the retrieved chunks (labeled [C1], [C2]...)
   and the question, with a system instruction to answer ONLY from the
   provided context and cite passage ids inline.
4. Call the LLM (via the Model Gateway if it supports a suitable model, or
   directly via the Gemini API from the edge function otherwise — use
   whichever we confirmed works in Prompt 4).
5. Compute a groundedness score: the fraction of the generated answer's
   content words (excluding common stopwords) that also appear in the
   retrieved chunk text. If below 0.25, replace the answer with a safe
   fallback message but still return the sources.
6. Insert the exchange into `chat_messages` (both the user message and the
   assistant response, with groundedness_score and sources JSONB populated).
7. Return JSON: { answer, sources: [...], grounded: bool, groundedness: float,
   refused: bool }.

Test this end-to-end with the same 4 sample queries from Prompt 6 through
the actual chat UI already built in the frontend. Show me the full response
for each, and confirm chat_messages rows are being created correctly.
```

---

## Prompt 8 — Wire Up Auth

```
The frontend already has a working login/signup UI (from the Bolt build).
Connect it to Insforge's built-in Authentication instead of any mock/local
logic currently in place.

1. Replace any placeholder auth logic in the login/signup components with
   real calls to Insforge's Auth API/SDK (sign up, sign in, session
   persistence, sign out).
2. Restrict the college email domain if possible (e.g. require @abes.ac.in)
   — check if Insforge Auth supports email domain restrictions natively; if
   not, add a simple validation check on the frontend and confirm it
   server-side in the chat Edge Function too (reject requests from sessions
   not matching the expected domain, if this is a requirement — otherwise
   skip this restriction and allow any authenticated user).
3. Make sure the chat Edge Function from Prompt 7 requires a valid
   authenticated session and rejects unauthenticated requests.

Show me the diff, and confirm sign-up, sign-in, and an authenticated chat
request all work end-to-end.
```

---

## Prompt 9 — Event Scraper + Scheduling

```
Build a scraper that keeps the `chunks` table's event-type rows fresh.

1. Write a scraper (Node or Python, whichever fits the Insforge Edge
   Function runtime better) using an HTTP client + HTML parser that fetches
   event listings from college/club pages (I'll provide 2-3 real URLs once
   this is scaffolded — for now, scaffold with one working example against a
   page structure I'll specify, plus clear TODOs for the rest).
2. For each scraped event, upsert into `documents`/`chunks` — match existing
   events by (title, event_date) to avoid duplicates; update the chunk text
   if the description changed; insert new rows for new events; re-embed only
   the new/changed chunks (don't re-embed the whole table every run).
3. Set up scheduling: check whether Insforge supports scheduled/cron edge
   functions natively. If yes, schedule this weekly. If not, set up a
   GitHub Actions workflow on a weekly cron schedule that calls this
   function's HTTP endpoint instead.
4. Also expose a manually-triggerable version of this (e.g. an authenticated
   admin-only endpoint) so I can demo a "live" event refresh during my
   project viva without waiting for the schedule.

Show me the diff and confirm a manual trigger successfully adds/updates rows
in the database.
```

---

## Prompt 10 — Evaluation Suite

```
Build an evaluation script (can run outside Insforge, e.g. locally with
Node/Python, calling the deployed Edge Functions over HTTP) to measure
system quality — this is for my project's results section, not part of the
live app.

1. Create a JSON file with ~20-30 question entries, each with: `question`,
   `expected_chunk_ids` (or expected source titles), `question_type`
   ('factual' | 'multi_hop' | 'out_of_scope'), and a `reference_answer` for
   ROUGE scoring.
2. For each question: call the retrieval function and compute Recall@k and
   Mean Reciprocal Rank against the expected chunks; call the full chat
   function and compute ROUGE-L (reference vs. generated answer) and record
   the groundedness score; for out_of_scope questions, check whether the
   system correctly refused.
3. Aggregate: average Recall@k, average MRR, average ROUGE-L, average
   groundedness, refusal accuracy percentage.
4. Insert the aggregate results as a new row into the `evaluations` table
   from Prompt 4.
5. Print a clean summary report to the console.

Run it against the sample data from Prompt 5 and show me the report.
```

---

## Notes

- **Prompt 4 is the most important one to get right** — it establishes
  whether Gemini is actually reachable through Insforge's Model Gateway or
  whether you need to call it directly from an edge function. Don't let
  Antigravity guess here; make it actually check.
- If any step reveals Insforge doesn't support something assumed here
  (e.g. no native cron for edge functions), that's fine — the prompts
  already include a fallback (GitHub Actions) for the known risk points.
- Keep Prompt 9's real scraper URLs and Prompt 10's real question set as
  your own follow-up once the scaffolding works — don't let placeholder
  data end up in your final submission.
