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

Four node types (MDX files in `src/content/`):

1. **People** — tech pioneers (e.g., Ada Lovelace, Alan Turing, Grace Hopper)
2. **Works** — projects, papers, standards, languages, books (e.g., Analytical Engine, COBOL)
3. **Institutions** — universities, companies, labs, standards bodies
4. **Packs** — curated learning paths grouping related nodes

Edges are stored **inline** in each node's frontmatter:

```yaml
edges:
  - target: analytical-engine
    kind: influence
    label: designed
    year: 1837
```

## Graph model

Two edge categories:

- **Influence edges (strong):** the core "shoulders" relationships (person created work, work built on work)
- **Affiliation edges (weak):** employment, education, founding — toggleable context layer

Edge labels for influence: `created`, `invented`, `influenced`, `inspired`, `built_on`, `popularized`, `standardized`
Edge labels for affiliation: `studied at`, `worked at`, `professor at`, `fellow at`, `founded`, `funded_by`

## Adding content (recommended workflow)

### Quick scaffolding

```bash
pnpm new:person <slug>       # Creates template in src/content/people/
pnpm new:work <slug>         # Creates template in src/content/works/
pnpm new:institution <slug>  # Creates template in src/content/institutions/
```

### Full content creation workflow

When adding a person and their work:

1. **Research** the person (biography, era, domains, key contributions)
2. **Create works first** (since people reference them in edges)
3. **Create the person** with:
   - `edges` pointing to their works (influence: created)
   - `signatureWorks` listing their key work IDs
   - `whyYouCare` bullets explaining their importance
4. **Create institutions** if needed (universities, companies)
5. **Add affiliation edges** from person to institutions
6. **Run validation**: `pnpm validate`
7. **Commit** with descriptive message

### Content requirements

**People:** id, type, name, era, domains (required); title, signatureWorks, whyYouCare, edges, links, image (optional)
**Works:** id, type, name, kind, era, domains (required); year, edges, links, image (optional)
**Institutions:** id, type, name, kind, era, domains (required); location, edges, links, image (optional)
**Packs:** id, type, name, description, era, domains, cards (required); icon, difficulty, estimatedTime (optional)

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

## Images

- Source from Wikimedia Commons (preferred) or public domain
- Download full resolution: `wget -O src/assets/images/entities/<slug>.jpg "https://upload.wikimedia.org/wikipedia/commons/..."`
- **Optimize after download**: `pnpm optimize:images` (resizes to 440px width, 85% JPEG quality)
- Include ALL attribution fields in frontmatter:

```yaml
image:
  file: ../../assets/images/entities/person-id.jpg
  source: https://commons.wikimedia.org/wiki/File:...
  license: Public Domain # or CC BY 2.0, etc.
  author: Photographer Name (Year)
```

## Development commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm ci               # Run all CI checks locally
pnpm validate         # Validate content schemas and edges
pnpm typecheck        # TypeScript type checking
pnpm lint             # ESLint code quality
pnpm format:check     # Check code formatting
pnpm check-links      # Validate internal links and sources
pnpm new:person       # Create person template
pnpm new:work         # Create work template
pnpm new:institution  # Create institution template
pnpm optimize:images  # Resize images to 440px width for web
```

## Key files

- `src/content/config.ts` — Collection schemas (Zod validation)
- `src/lib/data.ts` — Data loading helpers (findNodeById, listNodes, loadAllEdges, buildGraphData, etc.)
- `src/pages/node/[id].astro` — Unified node renderer for all types
- `src/pages/graph.astro` — Interactive influence graph page
- `src/components/InfluenceGraph.tsx` — React island for Cytoscape.js graph
- `src/components/NodeAttribution.astro` — Image attribution display
- `scripts/validate-content.js` — Content validation with Zod schemas

## Development guidelines

- Keep it simple and scalable
- Prefer static generation over client-side rendering
- Only add JS where interactivity is essential
- Validate content with schemas
- Structure content for easy expansion to many nodes
- Always run `pnpm validate` before committing content changes
