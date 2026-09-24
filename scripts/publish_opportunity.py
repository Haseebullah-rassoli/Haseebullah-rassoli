#!/usr/bin/env python3
"""Publish/update a source-linked opportunity from GitHub's manual Actions form."""
import html, json, os, re, sys
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "opportunities-data.json"
OUT = ROOT / "opportunity"
ALLOWED = {"Scholarships", "Fellowships", "Youth Programs", "Events", "Jobs", "Training"}
def clean(value, limit=2500):
    return str(value or "").strip()[:limit]
def https_url(value, required=True):
    value = clean(value, 1200)
    if not value and not required: return ""
    parsed = urlsplit(value)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password or any(c.isspace() for c in value):
        raise ValueError("Please provide a valid HTTPS official URL.")
    return value
def iso(value, required=False):
    value = clean(value, 10)
    if not value and not required: return ""
    if not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", value): raise ValueError("Use YYYY-MM-DD for dates.")
    date.fromisoformat(value)
    return value
def slug(value):
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value[:70].rstrip("-") or "opportunity"
def esc(value): return html.escape(str(value), quote=True)
def main():
    event = json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text(encoding="utf-8"))
    inputs = event.get("inputs") or {}
    title = clean(inputs.get("title"), 140)
    summary = clean(inputs.get("summary"), 500)
    details = clean(inputs.get("details"), 5000)
    category = clean(inputs.get("category"), 50)
    source = https_url(inputs.get("official_source"))
    apply = https_url(inputs.get("application_url"))
    deadline = iso(inputs.get("deadline"))
    funding = clean(inputs.get("funding"), 160) or "Not stated"
    eligibility = clean(inputs.get("eligibility"), 1200) or "Check the official guidelines"
    status = clean(inputs.get("status"), 20) or "Open"
    existing_id = clean(inputs.get("listing_id"), 100)
    if not title or not summary or not details: raise ValueError("Title, summary and details are required.")
    if category not in ALLOWED: raise ValueError("Invalid category.")
    if status not in ("Open", "Closed", "Draft"): raise ValueError("Invalid status.")
    if existing_id and not re.fullmatch(r"[a-z0-9-]{1,100}", existing_id): raise ValueError("Invalid listing ID.")
    records = json.loads(DATA.read_text(encoding="utf-8")) if DATA.exists() else []
    if not isinstance(records, list): raise ValueError("Invalid data file.")
    ids = {r["id"] for r in records}
    if existing_id:
        if existing_id not in ids: raise ValueError("Listing ID not found. Leave blank to create a new listing.")
        identifier = existing_id
    else:
        base = slug(title); identifier = base; n = 2
        while identifier in ids:
            identifier = f"{base}-{n}"; n += 1
    record = dict(id=identifier, title=title, summary=summary, details=details, category=category,
                  official_source=source, application_url=apply, deadline=deadline, funding=funding,
                  eligibility=eligibility, status=status, checked=date.today().isoformat())
    records = [r for r in records if r["id"] != identifier] + [record]
    records.sort(key=lambda r: (r["status"] != "Open", r["deadline"] or "9999-12-31", r["title"].lower()))
    DATA.write_text(json.dumps(records, ensure_ascii=False, indent=2) + chr(10), encoding="utf-8")
    OUT.mkdir(exist_ok=True)
    for r in records:
        target = OUT / (r["id"] + ".html")
        if r["status"] == "Draft":
            target.unlink(missing_ok=True)
            continue
        deadline_text = esc(r["deadline"] or "See official announcement")
        lines = "".join("<p>" + esc(line) + "</p>" for line in r["details"].splitlines() if line.strip())
        target.write_text(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="index,follow"><meta name="referrer" content="no-referrer"><meta name="description" content="{esc(r["summary"])}"><title>{esc(r["title"])} | Verified Digital Hub</title><link rel="stylesheet" href="../site.css"><link rel="stylesheet" href="../opportunity-publisher.css"><link rel="canonical" href="https://haseebullah-rassoli.github.io/Haseebullah-rassoli/opportunity/{esc(r["id"])}.html"></head><body class="op-detail"><header class="op-top"><div class="container"><a href="../index.html">Verified Digital Hub</a><a href="../opportunities.html">← All opportunities</a></div></header><main class="container op-detail-main"><div class="op-eyebrow">{esc(r["category"])} · {esc(r["status"])}</div><h1>{esc(r["title"])}</h1><p class="op-lead">{esc(r["summary"])}</p><div class="op-meta"><div><strong>Deadline</strong><span>{deadline_text}</span></div><div><strong>Funding</strong><span>{esc(r["funding"])}</span></div><div><strong>Eligibility</strong><span>{esc(r["eligibility"])}</span></div><div><strong>Last checked</strong><span>{esc(r["checked"])}</span></div></div><section class="op-details"><h2>About this opportunity</h2>{lines}</section><div class="op-actions"><a class="op-button" href="{esc(r["official_source"])}" target="_blank" rel="noopener noreferrer">Read Official Announcement ↗</a>{('<a class="op-button op-button-primary" href="' + esc(r["application_url"]) + '" target="_blank" rel="noopener noreferrer">Apply on Official Website ↗</a>') if r["status"] == "Open" else '<span class="op-closed">Applications are not marked open.</span>'}</div><p class="op-disclaimer">Independent summary, not an official organizer or application portal. Confirm all requirements and deadlines on the original website. No documents or payments are collected here.</p></main></body></html>''', encoding="utf-8")
    print(f"Saved {identifier}: {status}. Page: opportunity/{identifier}.html")
if __name__ == "__main__":
    try: main()
    except (ValueError, KeyError, json.JSONDecodeError) as exc:
        print(f"Publishing failed: {exc}", file=sys.stderr); sys.exit(1)
