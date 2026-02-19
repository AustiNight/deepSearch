# PDF Export Specification

## Approach
- Generation method: print-optimized DOM using `window.print()` (browser Save to PDF)
- Rationale: no client-side PDF dependency, preserves live DOM/Markdown rendering, predictable table and visualization output

## PDF Spec
- Default page size: US Letter (8.5 x 11 in)
- Margins: 0.5 in on all sides
- Font stack:
  - Body: `Inter`, `Arial`, `sans-serif`
  - Mono/metadata: `JetBrains Mono`, `SFMono-Regular`, `Menlo`, `monospace`
- Accessibility tags:
  - HTML headings (`h1`-`h4`) preserved for outline structure
  - Tables use semantic `<table>`, `<thead>`, `<th>` for header association
  - Charts include `aria-label` on SVG
  - Note: PDF tag fidelity is browser-controlled; we rely on native print-to-PDF tagging
- Max file size target: 10 MB for a typical multi-page report with charts
- Filename convention: `deepsearch-report-<topic>-YYYYMMDD.pdf`
  - `<topic>` is a lowercase slug derived from the report title
- Citations & bibliography formatting:
  - Each section contains a `SOURCES` block listing source domains
  - Bibliography section lists full URLs as numbered entries
  - Links remain clickable in exported PDF

## Supported Browser/OS Matrix
- Windows 11
  - Chrome (latest stable)
  - Edge (latest stable)
- macOS 14+
  - Chrome (latest stable)
  - Safari (latest stable)
- Ubuntu 22.04+
  - Chrome (latest stable)

Parity targets:
- Visual layout matches on-screen report content (allow minor line wrapping differences)
- Pagination is consistent within a browser family (Chrome/Edge) and acceptable within Safari
- Fonts render with legible weights, headings, and table gridlines
- Links remain clickable in the PDF

## QA Checklist
- Export button triggers print dialog and suggests filename with date suffix
- Report title and coverage status appear on page 1
- Tables wrap long values without clipping
- Visualizations scale to fit page width without cropping
- Section headers are not orphaned at page bottom (break-avoid where possible)
- Sources blocks and bibliography render with readable URLs
- Footer renders with generated date and product label
- Backgrounds do not render as dark blocks; text remains black on white
- Multi-page reports break cleanly between sections
