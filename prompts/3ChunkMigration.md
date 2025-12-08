Create a migration to handle a chunk for the manual. Here is the sql for it:

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE manual_chunks (
    id              TEXT PRIMARY KEY,
    source          TEXT NOT NULL,
    edition         TEXT,
    chapter_number  INT,
    chapter_title   TEXT,
    section_number  TEXT,
    section_title   TEXT,
    page_start      INT,
    page_end        INT,
    doc_type        TEXT,
    jurisdiction    TEXT,
    text            TEXT NOT NULL,
    tags            TEXT[],
    content_type    TEXT,
    complexity      TEXT,
    embedding       VECTOR(1536)  -- dimension depends on the model you use
);

CREATE INDEX ON manual_chunks
USING ivfflat (embedding vector_l2_ops)
WITH (lists = 100);

