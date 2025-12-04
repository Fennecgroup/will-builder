import re
from typing import List, Dict

CHAPTER_NUMBER = 5
CHAPTER_TITLE = "The Drafting of Wills"

SECTION_HEADING_RE = re.compile(r"^(5\.\d+(?:\.\d+)?)\s+(.+)$")

def load_text(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def split_into_sections(raw_text: str) -> List[Dict]:
    sections = []
    current_section = None

    for line in raw_text.splitlines():
        line = line.rstrip()

        # Skip empty lines at this stage
        if not line.strip():
            continue

        m = SECTION_HEADING_RE.match(line)
        if m:
            # New section heading found
            section_number = m.group(1)      # e.g. "5.21"
            section_title = m.group(2).strip()

            # Save previous section if any
            if current_section is not None:
                sections.append(current_section)

            # Start new section
            current_section = {
                "section_number": section_number,
                "section_title": section_title,
                "paragraphs": [],
            }
        else:
            # Normal paragraph/content line
            if current_section is None:
                # We haven't hit a heading yet – you can ignore or put in a dummy section
                continue
            current_section["paragraphs"].append(line)

    # Add last section if present
    if current_section is not None:
        sections.append(current_section)

    return sections

def chunk_section(section: Dict, max_chars: int = 1500) -> List[Dict]:
    """
    Turn a section with paragraphs into smaller chunks based on character length.
    max_chars is a rough limit; adjust as needed.
    """
    chunks = []
    buffer = []
    buffer_len = 0
    section_number = section["section_number"]
    section_title = section["section_title"]

    # Merge paragraph lines into paragraph blocks (split by blank lines if needed)
    paragraphs = [" ".join(p.strip() for p in section["paragraphs"]).strip()]

    chunk_index = 1

    for para in paragraphs:
        if not para:
            continue

        if buffer_len + len(para) + 1 <= max_chars:
            buffer.append(para)
            buffer_len += len(para) + 1
        else:
            # Flush buffer as a chunk
            if buffer:
                chunks.append({
                    "section_number": section_number,
                    "section_title": section_title,
                    "chunk_index": chunk_index,
                    "text": "\n\n".join(buffer).strip(),
                })
                chunk_index += 1
            # Start new buffer with current paragraph
            buffer = [para]
            buffer_len = len(para)

    # Flush any remaining buffer
    if buffer:
        chunks.append({
            "section_number": section_number,
            "section_title": section_title,
            "chunk_index": chunk_index,
            "text": "\n\n".join(buffer).strip(),
        })

    return chunks

def build_manual_chunks_from_text(path: str) -> List[Dict]:
    raw_text = load_text(path)
    sections = split_into_sections(raw_text)
    all_chunks = []

    for section in sections:
        section_chunks = chunk_section(section, max_chars=1500)
        for sc in section_chunks:
            chunk_id = f"meyerowitz-ch{CHAPTER_NUMBER}-{sc['section_number']}-{sc['chunk_index']}"
            all_chunks.append({
                "id": chunk_id,
                "source": "Meyerowitz on Administration of Estates and their Taxation",
                "edition": "2022",
                "chapter_number": CHAPTER_NUMBER,
                "chapter_title": CHAPTER_TITLE,
                "section_number": sc["section_number"],
                "section_title": sc["section_title"],
                "page_start": None,
                "page_end": None,
                "doc_type": "manual_passage",
                "jurisdiction": "South Africa",
                "text": sc["text"],
                "tags": [],
                "content_type": None,
                "complexity": None,
            })

    return all_chunks

if __name__ == "__main__":
    chunks = build_manual_chunks_from_text("docs/will_manual.txt")
    print(f"Built {len(chunks)} chunks.")
    for chunk in chunks:
        print(chunk["id"], chunk["section_number"], chunk["section_title"])
        
    print("--------------------------------")
    print(chunks[0]["id"], chunks[0]["section_number"], chunks[0]["section_title"])
    print(chunks[0]["text"][:500], "...")