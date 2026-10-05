-- Function to perform Hybrid Search using Reciprocal Rank Fusion (RRF)
CREATE OR REPLACE FUNCTION match_chunks(
    query_embedding vector(768),
    query_text text,
    match_count int DEFAULT 5,
    filter_future_events boolean DEFAULT false
) RETURNS TABLE (
    id uuid,
    document_title text,
    chunk_text text,
    event_date date,
    semantic_rank bigint,
    keyword_rank bigint,
    rrf_score float8
) AS $$
#variable_conflict use_variable
BEGIN
    RETURN QUERY
    WITH semantic_matches AS (
        SELECT 
            c.id, 
            ROW_NUMBER() OVER (ORDER BY c.embedding <=> query_embedding) AS rank
        FROM chunks c
        WHERE 
            (NOT filter_future_events OR (c.event_date IS NOT NULL AND c.event_date >= CURRENT_DATE))
        ORDER BY c.embedding <=> query_embedding
        LIMIT match_count * 2
    ),
    keyword_matches AS (
        SELECT 
            c.id, 
            ROW_NUMBER() OVER (ORDER BY ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text)) DESC) AS rank
        FROM chunks c
        WHERE 
            (NOT filter_future_events OR (c.event_date IS NOT NULL AND c.event_date >= CURRENT_DATE))
            AND c.fts @@ websearch_to_tsquery('english', query_text)
        ORDER BY ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text)) DESC
        LIMIT match_count * 2
    )
    SELECT 
        c.id,
        d.title AS document_title,
        c.chunk_text,
        c.event_date,
        COALESCE(sm.rank, 1000) AS semantic_rank,
        COALESCE(km.rank, 1000) AS keyword_rank,
        -- RRF Score: 1 / (60 + rank). The higher the rank number, the lower the score.
        (COALESCE(1.0 / (60 + sm.rank), 0.0) + COALESCE(1.0 / (60 + km.rank), 0.0))::float8 AS rrf_score
    FROM chunks c
    JOIN documents d ON c.document_id = d.id
    LEFT JOIN semantic_matches sm ON c.id = sm.id
    LEFT JOIN keyword_matches km ON c.id = km.id
    WHERE sm.id IS NOT NULL OR km.id IS NOT NULL
    ORDER BY rrf_score DESC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
