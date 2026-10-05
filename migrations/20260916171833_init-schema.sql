-- 1. Custom Types
CREATE TYPE source_type_enum AS ENUM ('policy', 'event');
CREATE TYPE role_enum AS ENUM ('user', 'assistant');

-- 2. Tables
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    source_type source_type_enum NOT NULL,
    raw_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    embedding VECTOR(768),
    token_count INT NOT NULL,
    event_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fts tsvector GENERATED ALWAYS AS (to_tsvector('english', chunk_text)) STORED
);

-- GIN Index for Full Text Search
CREATE INDEX chunks_fts_idx ON chunks USING GIN (fts);

CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role role_enum NOT NULL,
    content TEXT NOT NULL,
    groundedness_score FLOAT,
    sources JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    avg_recall FLOAT,
    avg_mrr FLOAT,
    avg_rouge_l FLOAT,
    avg_groundedness FLOAT,
    refusal_accuracy FLOAT
);
