# TechShoulders

An "IMDb for tech pioneers" with an explorable "shoulders" graph that shows how people, works, and institutions connect across computing history.

## Why it exists

To make it easy (and fun) to:

- Discover the people behind foundational tech
- Understand lineage: what influenced what
- Browse like a collectible card set ("Pokémon cards" vibe), but grounded in factual credits

## Core concepts

TechShoulders has three primary node types:

### People

The "stars" — e.g., Linus Torvalds. Each person has a card-style summary + a deeper profile page.

### Works

The "credits" — projects, papers, standards, languages, books — e.g., Linux kernel, Git.

### Institutions

Context nodes — universities, companies, labs, standards bodies — e.g., University of Helsinki, OSDL.

## Graph model ("who stands on whose shoulders")

The graph is the differentiator. We model two categories of edges:

- **Influence edges (strong):** the default "shoulders" layer (e.g., person created work, work built on work)
- **Affiliation edges (weak/context):** employment/education/founding/where-work-happened — useful context, but toggleable so they don't muddy "influence"

Default graph view shows influence only. Users can toggle institutions/affiliations on.

## User experience

- Browse nodes (people/works/institutions) as cards
- Click into a node for a profile page
- Explore the graph and discover upstream/downstream relationships
- Over time: packs/collections ("UNIX & Systems pack"), learning paths, "related nodes"

## Content approach

All content is stored in the repo (content-as-code):

- Each node is a Markdown/MDX file with structured frontmatter
- Edges live as JSON files in the repo
- Images come from Wikimedia Commons, including license/attribution fields displayed on the site

## Tech stack

- **Framework:** Astro (static output)
- **Package manager:** pnpm
- **Hosting:** Cloudflare Pages
- **Graph visualization:** Cytoscape.js (React island)
- **Architecture:**
  - Content collections + schema validation
  - Build-time indexes for search/graph data
  - Minimal JS by default; islands only for interactive components

## Getting started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Cloudflare Pages deployment

Configure your Cloudflare Pages project with:

| Setting | Value |
|---------|-------|
| Build command | `pnpm build` |
| Output directory | `dist` |
| Install command | `pnpm install` |

The site is fully static and requires no server-side runtime.

## Project structure

```
src/
├── content/           # Content collections
│   ├── config.ts      # Collection schemas
│   ├── people/        # Person profiles (MDX)
│   ├── works/         # Project/tool entries (MDX)
│   ├── institutions/  # University/lab/org entries (MDX)
│   └── edges/         # Relationship data (JSON)
├── components/        # Reusable components (Astro + React)
├── layouts/           # Page layouts
├── lib/               # Data loading utilities
└── pages/             # Route pages
    ├── index.astro
    ├── browse.astro
    ├── graph.astro      # Interactive influence graph
    ├── people/
    ├── works/
    ├── institutions/
    └── node/[id].astro  # Unified node renderer
```

## Current content

The seed content includes:

- **Person:** Linus Torvalds
- **Works:** Linux kernel, Git
- **Institutions:** University of Helsinki, Open Source Development Labs
- **Edges:** Influence (created) and affiliation (studied at, fellow at) relationships

All nodes include Wikimedia Commons images with proper license attribution.

## Features

- **Browse:** Search and filter nodes by type, domain, and era
- **Graph:** Interactive influence visualization with Cytoscape.js
  - Toggle between "Influence only" and "Include affiliations"
  - Click nodes to navigate to detail pages
  - Color-coded by node type
- **Node pages:** Detailed profiles with related items and external links
