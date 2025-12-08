-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "manual_chunks" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "edition" TEXT,
    "chapter_number" INT,
    "chapter_title" TEXT,
    "section_number" TEXT,
    "section_title" TEXT,
    "page_start" INT,
    "page_end" INT,
    "doc_type" TEXT,
    "jurisdiction" TEXT,
    "text" TEXT NOT NULL,
    "tags" TEXT[],
    "content_type" TEXT,
    "complexity" TEXT,
    "embedding" vector(1536),

    CONSTRAINT "manual_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (IVFFlat for vector similarity search)
CREATE INDEX "manual_chunks_embedding_idx" ON "manual_chunks" 
USING ivfflat (embedding vector_l2_ops) 
WITH (lists = 100);
