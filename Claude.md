# Claude.md

## Project overview

TechShoulders is an "IMDb for tech pioneers" — a static-first site with an explorable graph showing how people, works, and institutions connect across computing history.

## Tech stack

- **Framework:** Astro (static output)
- **Package manager:** pnpm (NEVER use npm or yarn)
- **Hosting:** Cloudflare Pages
- **Graph:** Cytoscape.js (React island)
- **Search:** Fuse.js (client-side fuzzy search)
- **No backend for MVP**

## Architecture principles

- Content-as-code: all content lives in the repo
- Static-first: minimal JS by default
- Islands architecture: interactivity (search, graph) added as lightweight islands on static pages
- Build-time processing: indexes for search/graph data generated at build time
- Content collections with schema validation

## Content structure

Three node types (MDX files in `src/content/`):

1. **People** — tech pioneers (e.g., Linus Torvalds)
2. **Works** — projects, papers, standards, languages, books (e.g., Linux kernel, Git)
3. **Institutions** — universities, companies, labs, standards bodies

Edges are stored as JSON arrays in `src/content/edges/`:
- `influence.json` — "created", "invented", "built on" relationships
- `affiliation.json` — "studied at", "worked at", "fellow at" relationships

## Graph model

Two edge categories:

- **Influence edges (strong):** the core "shoulders" relationships (person created work, work built on work)
- **Affiliation edges (weak):** employment, education, founding — toggleable context layer

## Images

- Source from Wikimedia Commons
- Include license and attribution fields in frontmatter
- Display attribution on the site

## Development commands

```bash
pnpm install    # Install dependencies
pnpm dev        # Start dev server
pnpm build      # Build for production
pnpm preview    # Preview production build
```

## Key files

- `src/content/config.ts` — Collection schemas (Zod validation)
- `src/lib/data.ts` — Data loading helpers (findNodeById, listNodes, loadAllEdges, buildGraphData, etc.)
- `src/pages/node/[id].astro` — Unified node renderer for all types
- `src/pages/graph.astro` — Interactive influence graph page
- `src/components/InfluenceGraph.tsx` — React island for Cytoscape.js graph
- `src/components/NodeAttribution.astro` — Image attribution display

## Adding content

Create MDX files in `src/content/{people,works,institutions}/`. Required frontmatter:

**People:** id, name, era
**Works:** id, name, kind, year
**Institutions:** id, name, kind

Optional `image` object: `{ url, source, license, author }`

### Citations

For specific claims (statistics, dates), use Wikipedia-style inline citations:

```html
Powers 80% of web servers<sup><a href="#source-1">[1]</a></sup>
```

Add a Sources section at the end with anchor targets:

```markdown
## Sources

1. <span id="source-1"></span>Org. ["Title."](https://url) Description.
```

## Adding edges

Add entries to JSON arrays in `src/content/edges/`:

```json
{
  "source": "person-id",
  "target": "work-id",
  "kind": "influence",
  "label": "created"
}
```

Edge kinds: `influence` (solid lines) or `affiliation` (dashed lines)

## Development guidelines

- Keep it simple and scalable
- Prefer static generation over client-side rendering
- Only add JS where interactivity is essential
- Validate content with schemas
- Structure content for easy expansion to many nodes
