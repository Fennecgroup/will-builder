# ingest_manual_chunks.py

import os
import psycopg2 #pip install psycopg2-binary
from typing import List, Dict
from openai import OpenAI #pip install openai

from chunker import build_manual_chunks_from_text

from dotenv import load_dotenv
load_dotenv()

OPENAI_EMBEDDING_MODEL = "text-embedding-3-large"  # or 'text-embedding-3-small'

def get_db_connection():
    return psycopg2.connect(
        dbname=os.environ.get("PGDATABASE", "your_db_name"),
        user=os.environ.get("PGUSER", "your_user"),
        password=os.environ.get("PGPASSWORD", "your_password"),
        host=os.environ.get("PGHOST", "localhost"),
        port=os.environ.get("PGPORT", 5432),
    )

def get_embedding(client: OpenAI, text: str) -> list[float]:
    # It's a good idea to truncate very long text to model's max tokens for embeddings
    response = client.embeddings.create(
        model=OPENAI_EMBEDDING_MODEL,
        input=text,
        dimensions=1536
    )
    return response.data[0].embedding

def ingest_chunks(chunks: List[Dict], text_path: str):
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    conn = get_db_connection()
    conn.autocommit = True
    cur = conn.cursor()

    for i, chunk in enumerate(chunks, start=1):
        emb = get_embedding(client, chunk["text"])

        cur.execute(
            """
            INSERT INTO manual_chunks (
                id, source, edition, chapter_number, chapter_title,
                section_number, section_title, page_start, page_end,
                doc_type, jurisdiction, text, tags, content_type,
                complexity, embedding
            )
            VALUES (
                %(id)s, %(source)s, %(edition)s, %(chapter_number)s, %(chapter_title)s,
                %(section_number)s, %(section_title)s, %(page_start)s, %(page_end)s,
                %(doc_type)s, %(jurisdiction)s, %(text)s, %(tags)s, %(content_type)s,
                %(complexity)s, %(embedding)s
            )
            ON CONFLICT (id) DO UPDATE
            SET text = EXCLUDED.text,
                embedding = EXCLUDED.embedding,
                tags = EXCLUDED.tags,
                content_type = EXCLUDED.content_type,
                complexity = EXCLUDED.complexity;
            """,
            {
                "id": chunk["id"],
                "source": chunk["source"],
                "edition": chunk["edition"],
                "chapter_number": chunk["chapter_number"],
                "chapter_title": chunk["chapter_title"],
                "section_number": chunk["section_number"],
                "section_title": chunk["section_title"],
                "page_start": chunk["page_start"],
                "page_end": chunk["page_end"],
                "doc_type": chunk["doc_type"],
                "jurisdiction": chunk["jurisdiction"],
                "text": chunk["text"],
                "tags": chunk["tags"],
                "content_type": chunk["content_type"],
                "complexity": chunk["complexity"],
                "embedding": emb,
            },
        )

        if i % 50 == 0:
            print(f"Ingested {i} chunks from {text_path}")

    cur.close()
    conn.close()

if __name__ == "__main__":
    text_path = "docs/will_manual.txt"
    chunks = build_manual_chunks_from_text(text_path)
    print(f"Built {len(chunks)} chunks from {text_path}")
    ingest_chunks(chunks, text_path)
    print("Ingestion complete.")
