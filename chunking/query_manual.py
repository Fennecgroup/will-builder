# query_manual.py

import os
import psycopg2
from pgvector.psycopg2 import register_vector
from pgvector import Vector
from typing import List, Dict
from openai import OpenAI

from dotenv import load_dotenv
load_dotenv()

OPENAI_EMBEDDING_MODEL = "text-embedding-3-large"

def get_db_connection():
    conn = psycopg2.connect(
        dbname=os.environ.get("PGDATABASE", "your_db_name"),
        user=os.environ.get("PGUSER", "your_user"),
        password=os.environ.get("PGPASSWORD", "your_password"),
        host=os.environ.get("PGHOST", "localhost"),
        port=os.environ.get("PGPORT", 5432),
    )
    register_vector(conn)
    return conn

def get_embedding(client: OpenAI, text: str) -> list[float]:
    response = client.embeddings.create(
        model=OPENAI_EMBEDDING_MODEL,
        input=text,
        dimensions=1536
    )
    return Vector(response.data[0].embedding)

def search_manual(query: str, top_k: int = 5) -> List[Dict]:
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    q_emb = get_embedding(client, query)

    conn = get_db_connection()
    cur = conn.cursor()

    # Parameter binding for vector works if psycopg2 + pgvector are set up;
    # otherwise you may need to adapt to your driver.
    cur.execute(
        """
        SELECT
            id,
            chapter_number,
            chapter_title,
            section_number,
            section_title,
            page_start,
            page_end,
            text,
            1 - (embedding <=> %s::vector) AS similarity
        FROM manual_chunks
        WHERE jurisdiction = 'South Africa'
        ORDER BY embedding <=> %s::vector
        LIMIT %s;
        """,
        (q_emb, q_emb, top_k)
    )

    rows = cur.fetchall()
    cur.close()
    conn.close()

    results = []
    for row in rows:
        results.append({
            "id": row[0],
            "chapter_number": row[1],
            "chapter_title": row[2],
            "section_number": row[3],
            "section_title": row[4],
            "page_start": row[5],
            "page_end": row[6],
            "text": row[7],
            "similarity": float(row[8]),
        })

    return results

if __name__ == "__main__":
    query = "usufruct for surviving spouse over primary residence, bare dominium to children per stirpes"
    results = search_manual(query, top_k=5)
    for r in results:
        print(
            f"[{r['similarity']:.3f}] {r['section_number']} {r['section_title']} "
            f"(pages {r['page_start']}–{r['page_end']})"
        )
        print(r["text"][:400], "...\n")
