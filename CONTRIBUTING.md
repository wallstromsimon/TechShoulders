# Contributing to TechShoulders

Thank you for your interest in contributing to TechShoulders! This project aims to document the influential people, works, and institutions that shaped computing history.

## Ways to Contribute

1. **Add a Person** - Tech pioneers, researchers, engineers
2. **Add a Work** - Projects, papers, tools, systems
3. **Add an Institution** - Universities, labs, companies
4. **Add Edges** - Relationships between nodes
5. **Improve existing content** - Fix errors, add details
6. **Report issues** - Found a bug or inaccuracy?

## Quick Start

1. Fork the repository
2. Create a branch for your changes
3. Add your content following the schemas below
4. Submit a PR using the appropriate template

## Content Guidelines

### General Rules

- **Accuracy first**: All content should be factual and verifiable
- **Notable impact**: Focus on people/works that significantly influenced computing
- **Proper attribution**: Always credit image sources with license info
- **No copyright violations**: Use images from Wikimedia Commons or public domain

### File Naming

Use lowercase slugs with hyphens:
- `linus-torvalds.mdx` (not `Linus_Torvalds.mdx`)
- `linux-kernel.mdx` (not `LinuxKernel.mdx`)

### ID Format

The `id` field must match the filename (without `.mdx`):
```yaml
# File: src/content/people/ada-lovelace.mdx
id: ada-lovelace  # Must match filename
```

## Content Schemas

### People

```yaml
---
id: person-id           # Required: lowercase, hyphens
name: Full Name         # Required
title: Brief Title      # Optional: "Creator of X"
era: 1990s–present      # Required: time period active
domains:                # Optional
  - Operating Systems
  - Programming Languages
signatureWorks:         # Optional: array of work IDs
  - work-id-1
  - work-id-2
whyYouCare:            # Optional: importance bullets
  - Point about relevance
links:                  # Optional
  - label: Wikipedia
    url: https://...
image:                  # Optional (but recommended)
  url: https://...      # Direct image URL
  source: https://...   # Source page URL
  license: CC BY 2.0    # License type
  author: Author Name   # Attribution
---

Biography content in MDX...
```

### Works

```yaml
---
id: work-id             # Required
name: Work Name         # Required
kind: project           # Required: project, paper, tool, etc.
year: 1991              # Required: year created
domains:                # Optional
  - Domain 1
links:                  # Optional
  - label: Official Site
    url: https://...
image:                  # Optional
  url: https://...
  source: https://...
  license: License Type
  author: Author Name
---

Description of the work in MDX...
```

### Institutions

```yaml
---
id: institution-id      # Required
name: Institution Name  # Required
kind: university        # Required: university, lab, company, org
location: City, Country # Optional
links:                  # Optional
  - label: Official Site
    url: https://...
image:                  # Optional
  url: https://...
  source: https://...
  license: License Type
  author: Author Name
---

Description of the institution in MDX...
```

### Edges (Relationships)

Edges are stored in JSON files:

**Influence edges** (`src/content/edges/influence.json`):
```json
[
  {
    "source": "person-id",
    "target": "work-id",
    "kind": "influence",
    "label": "created"
  }
]
```

**Affiliation edges** (`src/content/edges/affiliation.json`):
```json
[
  {
    "source": "person-id",
    "target": "institution-id",
    "kind": "affiliation",
    "label": "worked at"
  }
]
```

## Image Guidelines

### Preferred Sources

1. **Wikimedia Commons** - Best option for licensed images
2. **Public domain** - Historical images, US government works
3. **CC-licensed** - Creative Commons with proper attribution

### Required Attribution Fields

When including an image, ALL fields are required:

```yaml
image:
  url: https://upload.wikimedia.org/...    # Direct URL to image
  source: https://commons.wikimedia.org/... # Page where image is hosted
  license: CC BY 2.0                        # Exact license
  author: Photographer Name                 # Creator attribution
```

### License Types

Common acceptable licenses:
- `Public Domain`
- `CC0` (Public Domain Dedication)
- `CC BY 2.0`, `CC BY 3.0`, `CC BY 4.0`
- `CC BY-SA 2.0`, `CC BY-SA 3.0`, `CC BY-SA 4.0`
- `GFDL` (GNU Free Documentation License)

## Edge Guidelines

### When to Use Influence

Use `influence` edges for direct, strong relationships:
- Person **created** a work
- Person **invented** something
- Person **designed** a system
- Person **wrote** a paper

### When to Use Affiliation

Use `affiliation` edges for context/association:
- Person **worked at** an institution
- Person **studied at** a university
- Person **founded** a company
- Person was **fellow at** an organization

### Edge Validation

CI will verify:
1. Both `source` and `target` node IDs exist
2. `kind` is either "influence" or "affiliation"
3. JSON format is valid

## Development Setup

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Pull Request Process

1. **Choose the right template** when creating your PR
2. **Fill out the checklist** completely
3. **Wait for CI** to pass (schema validation, edge checks)
4. **Address review feedback** promptly

### CI Checks

Your PR will be automatically validated for:
- Schema compliance (all required fields present)
- Edge integrity (referenced nodes exist)
- Image attribution (all fields present when image exists)
- JSON syntax (for edge files)

## Questions?

- Open an issue for questions about content
- Check existing people/works as examples
- Review the PR templates for guidance

Thank you for helping document computing history!
