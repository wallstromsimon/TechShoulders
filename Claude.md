# Claude.md

## Project overview

TechShoulders is an "IMDb for tech pioneers" — a static-first site with an explorable graph showing how people, works, and institutions connect across computing history.

## Tech stack

- **Framework:** Astro (static output)
- **Package manager:** pnpm
- **Hosting:** Cloudflare Pages
- **No backend for MVP**

## Architecture principles

- Content-as-code: all content lives in the repo
- Static-first: minimal JS by default
- Islands architecture: interactivity (search, graph) added as lightweight islands on static pages
- Build-time processing: indexes for search/graph data generated at build time
- Content collections with schema validation

## Content structure

Three node types:

1. **People** — Markdown/MDX files with frontmatter (e.g., Linus Torvalds)
2. **Works** — projects, papers, standards, languages, books (e.g., Linux kernel, Git)
3. **Institutions** — universities, companies, labs, standards bodies

Edges are stored as JSON files in the repo.

## Graph model

Two edge categories:

- **Influence edges (strong):** the core "shoulders" relationships (person created work, work built on work)
- **Affiliation edges (weak):** employment, education, founding — toggleable context layer

## Images

- Source from Wikimedia Commons
- Include license and attribution fields in frontmatter
- Display attribution on the site

## Development guidelines

- Keep it simple and scalable
- Prefer static generation over client-side rendering
- Only add JS where interactivity is essential
- Validate content with schemas
- Structure content for easy expansion to many nodes
