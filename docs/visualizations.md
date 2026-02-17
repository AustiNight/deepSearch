# Report Visualizations

## Component Selection

**Selected approach:** Custom SVG chart components (bar, line, area) plus native `img` for media.

**Why this choice**
- No additional dependencies or SSR constraints.
- Keeps bundle growth minimal (local components only).
- Full control over styling for light/dark and print output.

**Tradeoffs**
- Fewer chart types and no advanced interactivity out of the box.
- Custom code must be maintained as features expand.

**Alternatives considered**
- `recharts`: Rich React API, but adds a sizable dependency footprint and increases bundle weight.
- `chart.js` + wrapper: Strong ecosystem, but heavier runtime and more complex SSR handling.
- `visx`: Powerful and low-level, but more code and steeper maintenance cost.

## Data & Safety Constraints

Visualization data is sanitized in `services/reportFormatter.ts` with hard caps:
- Max visualizations per report: 6
- Max series per chart: 4
- Max points/rows per series: 24
- Max label length: 40 chars
- Max title length: 80 chars
- Max caption length: 280 chars
- Max sources per visualization: 10
- Max image URL length: 800

Image URLs must be `http` or `https`. An optional allowlist (`IMAGE_HOST_ALLOWLIST`) can be populated to restrict external images.

## Fixture

A static report fixture is available at `data/reportVisualizationFixture.ts` to manually validate chart and image rendering across breakpoints and in print preview.
