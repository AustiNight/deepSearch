#!/usr/bin/env python3
"""Parse the Discovery_API.md into a structured JSON + JSONL chunks for RAG."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Iterable, List, Dict, Any, Optional, Tuple


MARKERS = {
    "REQUEST",
    "RESPONSE",
    "MODEL",
    "EXAMPLE",
    "QUERY-STRING PARAMETERS",
    "QUERY PARAMETERS",
    "PATH PARAMETERS",
    "HEADER PARAMETERS",
    "BODY PARAMETERS",
}

METHOD_RE = re.compile(r"^(get|post|put|delete|patch)\s+/(.+)", re.I)

SECTION_WHITELIST = {
    "Purpose",
    "Asset Visibility",
    "Authentication",
    "App Tokens",
    "Additional API facts",
}

IGNORE_LINES = {
    "Search by this field here.",
    "Search within this field here.",
    "Sort by this field here.",
    "Autocomplete this field here.",
    "Paginate results here.",
    "Scroll through results here.",
}

IGNORE_PREFIXES = (
    "Example:",
    "Allowed:",
)


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "section"


def join_paragraphs(lines: List[str]) -> List[str]:
    paragraphs: List[str] = []
    cur: List[str] = []
    for line in lines:
        if not line.strip():
            if cur:
                paragraphs.append(" ".join(cur).strip())
                cur = []
            continue
        cur.append(line.strip())
    if cur:
        paragraphs.append(" ".join(cur).strip())
    return paragraphs


def is_type_line(line: str) -> bool:
    s = line.strip()
    if not s:
        return False
    if s in {"string", "number", "integer", "boolean", "array", "object"}:
        return True
    if s.startswith("[") and s.endswith("]"):
        return True
    if s.islower() and len(s.split()) <= 3:
        return True
    if "array" in s and len(s.split()) <= 4:
        return True
    return False


def is_ignored_line(line: str) -> bool:
    s = line.strip()
    if s in IGNORE_LINES:
        return True
    if s.startswith(IGNORE_PREFIXES):
        return True
    return False


def next_nonempty(lines: List[str], idx: int) -> Optional[int]:
    i = idx
    while i < len(lines):
        if lines[i].strip():
            return i
        i += 1
    return None


def is_endpoint_start(lines: List[str], idx: int) -> bool:
    if idx >= len(lines):
        return False
    title = lines[idx].strip()
    if not title:
        return False
    if title in MARKERS:
        return False
    if title.startswith("http") or title.startswith("?"):
        return False
    j = next_nonempty(lines, idx + 1)
    if j is None:
        return False
    return METHOD_RE.match(lines[j].strip()) is not None


def is_section_heading(line: str) -> bool:
    return line.strip() in SECTION_WHITELIST


def read_blocks_until(lines: List[str], idx: int, stop_pred) -> Tuple[List[List[str]], int]:
    blocks: List[List[str]] = []
    cur: List[str] = []
    i = idx
    while i < len(lines):
        line = lines[i]
        if stop_pred(i):
            break
        if not line.strip():
            if cur:
                blocks.append(cur)
                cur = []
        else:
            cur.append(line.strip())
        i += 1
    if cur:
        blocks.append(cur)
    return blocks, i


def parse_param_blocks(blocks: List[List[str]]) -> Tuple[List[Dict[str, Any]], List[str]]:
    params: List[Dict[str, Any]] = []
    notes: List[str] = []
    for block in blocks:
        if block and all(is_ignored_line(line) for line in block):
            continue
        if len(block) >= 2 and is_type_line(block[1]):
            params.append(
                {
                    "name": block[0],
                    "type": block[1],
                    "description": " ".join(block[2:]).strip(),
                }
            )
        else:
            note = " ".join(block).strip()
            if note and not is_ignored_line(note):
                notes.append(note)
    return params, notes


def parse_field_blocks(lines: List[str], idx: int) -> Tuple[List[Dict[str, Any]], int]:
    fields: List[Dict[str, Any]] = []

    def stop_pred(i: int) -> bool:
        line = lines[i].strip()
        if not line:
            return False
        if line in MARKERS:
            return True
        if is_endpoint_start(lines, i):
            return True
        if is_section_heading(line):
            return True
        return False

    blocks, new_idx = read_blocks_until(lines, idx, stop_pred)
    for block in blocks:
        if not block:
            continue
        if all(is_ignored_line(line) for line in block):
            continue
        if block[0].startswith(IGNORE_PREFIXES):
            continue
        if len(block) >= 2 and is_type_line(block[1]):
            if block[0].startswith(IGNORE_PREFIXES):
                continue
            fields.append(
                {
                    "name": block[0],
                    "type": block[1],
                    "description": " ".join(block[2:]).strip(),
                }
            )
        else:
            if fields:
                note = " ".join(block).strip()
                if note and not is_ignored_line(note):
                    fields[-1].setdefault("notes", []).append(note)
    return fields, new_idx


def parse(lines: List[str], section_whitelist: Optional[set] = None) -> Dict[str, Any]:
    doc_title = lines[0].strip() if lines else "Discovery API"
    sections: List[Dict[str, Any]] = []
    endpoints: List[Dict[str, Any]] = []

    i = 0
    current_section: Optional[Dict[str, Any]] = None

    def ensure_section(title: str) -> Dict[str, Any]:
        nonlocal current_section
        if current_section is None or current_section["title"] != title:
            current_section = {
                "id": slugify(title),
                "title": title,
                "paragraphs": [],
                "raw_lines": [],
            }
            sections.append(current_section)
        return current_section

    while i < len(lines):
        line = lines[i].rstrip()
        if is_endpoint_start(lines, i):
            title = lines[i].strip()
            method_line_idx = next_nonempty(lines, i + 1)
            method_line = lines[method_line_idx].strip() if method_line_idx is not None else ""
            m = METHOD_RE.match(method_line)
            method = m.group(1).upper() if m else ""
            path = "/" + m.group(2) if m else method_line
            endpoint: Dict[str, Any] = {
                "id": slugify(f"{method}-{path}-{title}"),
                "title": title,
                "method": method,
                "path": path,
                "summary": "",
                "description": [],
                "examples": [],
                "request": {"query": [], "path": [], "header": [], "body": [], "notes": []},
                "response": {"content_type": None, "status": None, "fields": []},
            }
            i = (method_line_idx + 1) if method_line_idx is not None else i + 1

            # description until Examples / REQUEST / RESPONSE / next endpoint
            desc_lines: List[str] = []
            while i < len(lines):
                cur = lines[i].strip()
                if cur in {"Examples", "REQUEST", "RESPONSE"} or is_endpoint_start(lines, i):
                    break
                desc_lines.append(lines[i])
                i += 1
            endpoint["description"] = join_paragraphs(desc_lines)
            endpoint["summary"] = endpoint["description"][0] if endpoint["description"] else ""

            # examples
            if i < len(lines) and lines[i].strip() == "Examples":
                i += 1
                ex_lines: List[str] = []
                while i < len(lines):
                    cur = lines[i].strip()
                    if cur in {"REQUEST", "RESPONSE"} or is_endpoint_start(lines, i):
                        break
                    if cur:
                        ex_lines.append(cur)
                    i += 1
                endpoint["examples"] = ex_lines

            # request params
            if i < len(lines) and lines[i].strip() == "REQUEST":
                i += 1
                while i < len(lines):
                    cur = lines[i].strip()
                    if cur == "RESPONSE" or is_endpoint_start(lines, i):
                        break
                    if cur.endswith("PARAMETERS"):
                        section_name = cur.replace("-", " ").lower()
                        if "query" in section_name:
                            key = "query"
                        elif "path" in section_name:
                            key = "path"
                        elif "header" in section_name:
                            key = "header"
                        elif "body" in section_name:
                            key = "body"
                        else:
                            key = "notes"
                        i += 1

                        def stop_pred(j: int) -> bool:
                            linej = lines[j].strip()
                            if linej in {"RESPONSE"}:
                                return True
                            if linej.endswith("PARAMETERS"):
                                return True
                            if is_endpoint_start(lines, j):
                                return True
                            return False

                        blocks, i = read_blocks_until(lines, i, stop_pred)
                        params, notes = parse_param_blocks(blocks)
                        if key == "notes":
                            endpoint["request"]["notes"].extend(notes)
                        else:
                            endpoint["request"][key].extend(params)
                            if notes:
                                endpoint["request"].setdefault("notes", []).extend(notes)
                        continue
                    i += 1

            # response
            if i < len(lines) and lines[i].strip() == "RESPONSE":
                i += 1
                while i < len(lines):
                    cur = lines[i].strip()
                    if not cur:
                        i += 1
                        continue
                    if cur in {"MODEL", "EXAMPLE"}:
                        i += 1
                        continue
                    if cur.startswith("application/"):
                        endpoint["response"]["content_type"] = cur
                        i += 1
                        continue
                    if re.match(r"^\d{3}\s+-", cur):
                        endpoint["response"]["status"] = cur
                        i += 1
                        continue
                    if cur == "Field":
                        # expect next lines Type, Description
                        i += 1
                        if i < len(lines) and lines[i].strip() == "Type":
                            i += 1
                        if i < len(lines) and lines[i].strip() == "Description":
                            i += 1
                        fields, i = parse_field_blocks(lines, i)
                        endpoint["response"]["fields"].extend(fields)
                        continue
                    if is_endpoint_start(lines, i) or is_section_heading(cur):
                        break
                    # unknown line, treat as response note
                    endpoint["response"].setdefault("notes", []).append(cur)
                    i += 1

            endpoints.append(endpoint)
            continue

        # sections (non-endpoint text)
        if line.strip():
            if section_whitelist and line.strip() in section_whitelist:
                current_section = ensure_section(line.strip())
                i += 1
                continue
            if current_section is None:
                i += 1
                continue
            if not is_ignored_line(line):
                current_section["raw_lines"].append(line)
        i += 1

    # finalize section paragraphs
    for section in sections:
        section["paragraphs"] = join_paragraphs(section.get("raw_lines", []))
        section.pop("raw_lines", None)

    return {
        "title": doc_title,
        "sections": sections,
        "endpoints": endpoints,
    }


def chunk_text(text: str, max_chars: int = 1400) -> List[str]:
    chunks: List[str] = []
    cur = ""
    for para in text.split("\n"):
        if not para.strip():
            continue
        candidate = (cur + "\n" + para).strip() if cur else para
        if len(candidate) > max_chars and cur:
            chunks.append(cur.strip())
            cur = para
        else:
            cur = candidate
    if cur:
        chunks.append(cur.strip())
    return chunks


def build_chunks(doc: Dict[str, Any], *, source_file: str, doc_id: str) -> List[Dict[str, Any]]:
    chunks: List[Dict[str, Any]] = []
    # sections
    for section in doc.get("sections", []):
        text = "\n".join([section["title"]] + section.get("paragraphs", []))
        for n, chunk in enumerate(chunk_text(text)):
            chunks.append(
                {
                    "id": f"section-{section['id']}-{n+1}",
                    "type": "section",
                    "title": section["title"],
                    "path": [doc["title"], section["title"]],
                    "text": chunk,
                    "tags": ["section"],
                    "source_file": source_file,
                    "doc_id": doc_id,
                }
            )
    # endpoints
    for endpoint in doc.get("endpoints", []):
        summary = [
            f"{endpoint['title']}\n{endpoint['method']} {endpoint['path']}",
        ]
        summary.extend(endpoint.get("description", []))
        if endpoint.get("examples"):
            summary.append("Examples:\n" + "\n".join(endpoint["examples"]))
        for n, chunk in enumerate(chunk_text("\n".join(summary))):
            chunks.append(
                {
                    "id": f"endpoint-{endpoint['id']}-summary-{n+1}",
                    "type": "endpoint",
                    "title": endpoint["title"],
                    "path": [doc["title"], endpoint["title"]],
                    "text": chunk,
                    "tags": ["endpoint", endpoint.get("method", "").lower(), endpoint.get("path", "")],
                    "source_file": source_file,
                    "doc_id": doc_id,
                }
            )
        # request params
        req = endpoint.get("request", {})
        for section_name in ("query", "path", "header", "body"):
            params = req.get(section_name, [])
            if not params:
                continue
            lines = [f"{endpoint['title']} - {section_name} parameters"]
            for p in params:
                desc = p.get("description", "")
                lines.append(f"- {p['name']} ({p['type']}): {desc}")
            for n, chunk in enumerate(chunk_text("\n".join(lines))):
                chunks.append(
                    {
                        "id": f"endpoint-{endpoint['id']}-req-{section_name}-{n+1}",
                        "type": "request-params",
                        "title": endpoint["title"],
                        "path": [doc["title"], endpoint["title"], "Request", section_name],
                        "text": chunk,
                        "tags": ["request", section_name],
                        "source_file": source_file,
                        "doc_id": doc_id,
                    }
                )
        # response fields
        fields = endpoint.get("response", {}).get("fields", [])
        if fields:
            lines = [f"{endpoint['title']} - response fields"]
            for f in fields:
                desc = f.get("description", "")
                lines.append(f"- {f['name']} ({f['type']}): {desc}")
                for note in f.get("notes", []) if isinstance(f.get("notes"), list) else []:
                    lines.append(f"  note: {note}")
            for n, chunk in enumerate(chunk_text("\n".join(lines))):
                chunks.append(
                    {
                        "id": f"endpoint-{endpoint['id']}-resp-{n+1}",
                        "type": "response-fields",
                        "title": endpoint["title"],
                        "path": [doc["title"], endpoint["title"], "Response"],
                        "text": chunk,
                        "tags": ["response"],
                        "source_file": source_file,
                        "doc_id": doc_id,
                    }
                )
    return chunks


def parse_generic_sections(lines: List[str]) -> Dict[str, Any]:
    doc_title = lines[0].strip() if lines else "Socrata API"
    sections: List[Dict[str, Any]] = []
    current: Optional[Dict[str, Any]] = None

    def ensure(title: str) -> Dict[str, Any]:
        nonlocal current
        if current is None or current["title"] != title:
            current = {"id": slugify(title), "title": title, "paragraphs": [], "raw_lines": []}
            sections.append(current)
        return current

    for line in lines:
        s = line.strip()
        if not s:
            continue
        # treat title-case short lines as headings
        if len(s) <= 70 and s == s.title() and not s.startswith("http"):
            # skip obvious header-like lines (HTTP header examples, JSON fragments)
            if ":" in s or s.startswith("[") or s.startswith("{"):
                continue
            if s in {"...", "} ]", "}", "]"}:
                continue
            if "\t" in s:
                continue
            ensure(s)
            continue
        if current is None:
            ensure(doc_title)
        if not is_ignored_line(s):
            current["raw_lines"].append(s)

    for section in sections:
        section["paragraphs"] = join_paragraphs(section.get("raw_lines", []))
        section.pop("raw_lines", None)

    return {"title": doc_title, "sections": sections, "endpoints": [], "chunks": []}


def build_endpoints_jsonl(doc: Dict[str, Any]) -> List[Dict[str, Any]]:
    records: List[Dict[str, Any]] = []
    for endpoint in doc.get("endpoints", []):
        req = endpoint.get("request", {})
        resp = endpoint.get("response", {})
        record = {
            "id": endpoint.get("id"),
            "type": "endpoint",
            "title": endpoint.get("title"),
            "method": endpoint.get("method"),
            "path": endpoint.get("path"),
            "summary": endpoint.get("summary"),
            "description": endpoint.get("description", []),
            "examples": endpoint.get("examples", []),
            "request": {
                "query": req.get("query", []),
                "path": req.get("path", []),
                "header": req.get("header", []),
                "body": req.get("body", []),
                "notes": req.get("notes", []),
            },
            "response": {
                "content_type": resp.get("content_type"),
                "status": resp.get("status"),
                "fields": resp.get("fields", []),
                "notes": resp.get("notes", []),
            },
            "tags": ["endpoint", endpoint.get("method", "").lower(), endpoint.get("path", "")],
        }
        records.append(record)
    return records


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="docs/Discovery_API.md")
    parser.add_argument("--out-json", default="docs/Discovery_API.rag.json")
    parser.add_argument("--out-jsonl", default="docs/Discovery_API.rag.chunks.jsonl")
    parser.add_argument(
        "--out-endpoints-jsonl",
        default="docs/Discovery_API.rag.endpoints.jsonl",
    )
    parser.add_argument(
        "--mode",
        choices=["discovery", "generic"],
        default="discovery",
    )
    parser.add_argument(
        "--section-whitelist",
        help="Comma-separated section headings to include (generic mode)",
        default="",
    )
    parser.add_argument("--doc-id", default="")
    args = parser.parse_args()

    path = Path(args.input)
    text = path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    whitelist = None
    if args.mode == "discovery":
        whitelist = SECTION_WHITELIST
    elif args.section_whitelist:
        whitelist = {s.strip() for s in args.section_whitelist.split(",") if s.strip()}

    if args.mode == "generic":
        doc = parse_generic_sections(lines)
    else:
        doc = parse(lines, section_whitelist=whitelist)
    doc_id = args.doc_id or Path(args.input).stem
    chunks = build_chunks(doc, source_file=str(args.input), doc_id=doc_id)
    endpoints_jsonl = build_endpoints_jsonl(doc) if args.mode == "discovery" else []
    doc["schema"] = {
        "title": "Socrata RAG Schema",
        "version": "1.0",
        "doc": {
            "title": "string",
            "sections": "array<Section>",
            "endpoints": "array<Endpoint>",
            "chunks": "array<Chunk>",
        },
        "Section": {
            "id": "string",
            "title": "string",
            "paragraphs": "array<string>",
        },
        "Endpoint": {
            "id": "string",
            "title": "string",
            "method": "string",
            "path": "string",
            "summary": "string",
            "description": "array<string>",
            "examples": "array<string>",
            "request": "RequestParams",
            "response": "Response",
        },
        "RequestParams": {
            "query": "array<Param>",
            "path": "array<Param>",
            "header": "array<Param>",
            "body": "array<Param>",
            "notes": "array<string>",
        },
        "Response": {
            "content_type": "string|null",
            "status": "string|null",
            "fields": "array<Field>",
            "notes": "array<string>",
        },
        "Param": {
            "name": "string",
            "type": "string",
            "description": "string",
        },
        "Field": {
            "name": "string",
            "type": "string",
            "description": "string",
            "notes": "array<string>|undefined",
        },
        "Chunk": {
            "id": "string",
            "type": "section|endpoint|request-params|response-fields",
            "title": "string",
            "path": "array<string>",
            "text": "string",
            "tags": "array<string>",
        },
    }
    doc["chunks"] = chunks

    Path(args.out_json).write_text(json.dumps(doc, indent=2, ensure_ascii=True), encoding="utf-8")
    with Path(args.out_jsonl).open("w", encoding="utf-8") as f:
        for chunk in chunks:
            f.write(json.dumps(chunk, ensure_ascii=True) + "\n")
    if endpoints_jsonl:
        with Path(args.out_endpoints_jsonl).open("w", encoding="utf-8") as f:
            for item in endpoints_jsonl:
                f.write(json.dumps(item, ensure_ascii=True) + "\n")


if __name__ == "__main__":
    main()
