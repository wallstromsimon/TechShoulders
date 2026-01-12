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
3. Use the CLI tools to scaffold your content:
   ```bash
   pnpm new:person ada-lovelace      # Creates person template
   pnpm new:work analytical-engine   # Creates work template
   pnpm new:institution bell-labs    # Creates institution template
   ```
4. Fill in the frontmatter (including required fields: `type`, `era`, `domains`)
5. Add inline edges to connect your node to others
6. Run `pnpm validate` to check for errors
7. Submit a PR using the appropriate template

## Content CLI Tools

These scripts create properly formatted template files to speed up content creation:

| Command                       | Example                           | Description                  |
| ----------------------------- | --------------------------------- | ---------------------------- |
| `pnpm new:person <slug>`      | `pnpm new:person ada-lovelace`    | Create a person profile      |
| `pnpm new:work <slug>`        | `pnpm new:work analytical-engine` | Create a work entry          |
| `pnpm new:institution <slug>` | `pnpm new:institution bell-labs`  | Create an institution        |
| `pnpm validate`               | `pnpm validate`                   | Check all content for errors |

### What `pnpm validate` checks

- **Schema compliance**: Required fields present, correct types
- **Edge integrity**: Both source and target nodes exist
- **Reference integrity**: signatureWorks and pack cards reference valid nodes
- **Image attribution**: All attribution fields present when image exists
- **Orphaned nodes**: Warns about nodes with no edges (disconnected from graph)
- **ID matching**: Node ID matches filename

## Content Guidelines

### General Rules

- **Accuracy first**: All content should be factual and verifiable
- **Notable impact**: Focus on people/works that significantly influenced computing
- **Proper attribution**: Always credit image sources with license info
- **No copyright violations**: Use images from Wikimedia Commons or public domain

### Citations and Sources

When making specific factual claims (statistics, dates, quotes), include inline citations that link to a Sources section. Use Wikipedia-style numbered references.

**Inline citation format:**

```html
Powers the majority of web servers<sup><a href="#source-1">[1]</a></sup>
```

**Sources section format:**

```markdown
---

## Sources

1. <span id="source-1"></span>Author/Org. ["Article Title."](https://example.com) Brief description of what this source establishes.
2. <span id="source-2"></span>Author/Org. ["Article Title."](https://example.com) Brief description.
```

**Guidelines:**

- Use `<sup><a href="#source-N">[N]</a></sup>` for clickable superscript citations
- Place `<span id="source-N"></span>` at the start of each source entry as the anchor target
- Number citations sequentially as they appear in the text
- Link to primary sources when possible (official reports, academic papers, reputable news)
- Not every sentence needs a citation—focus on specific claims that readers might want to verify

### File Naming

Use lowercase slugs with hyphens:

- `linus-torvalds.mdx` (not `Linus_Torvalds.mdx`)
- `linux-kernel.mdx` (not `LinuxKernel.mdx`)

### ID Format

The `id` field must match the filename (without `.mdx`):

```yaml
# File: src/content/people/ada-lovelace.mdx
id: ada-lovelace # Must match filename
```

## Content Schemas

All nodes require `type`, `era`, and `domains` fields. Edges are defined inline within each node.

### People

```yaml
---
id: person-id # Required: lowercase, hyphens
type: person # Required
name: Full Name # Required
era: 1990s-present # Required: time period active
domains: # Required: at least one
  - Operating Systems
  - Programming Languages
title: Brief Title # Optional: "Creator of X"
signatureWorks: # Optional: array of work IDs
  - work-id-1
  - work-id-2
whyYouCare: # Optional: importance bullets
  - Point about relevance
edges: # Inline relationships
  - target: linux-kernel
    kind: influence
    label: created
  - target: university-of-helsinki
    kind: affiliation
    label: studied at
links: # Optional
  - label: Wikipedia
    url: https://...
image: # Optional (but recommended)
  file: ../../assets/images/entities/person-id.jpg
  source: https://...
  license: CC BY 2.0
  author: Author Name
---
Biography content in MDX...
```

### Works

```yaml
---
id: work-id # Required
type: work # Required
name: Work Name # Required
kind: project # Required: project, paper, tool, etc.
year: 1991 # Optional: year created
era: 1990s-present # Required
domains: # Required: at least one
  - Domain 1
edges: [] # Inline relationships (usually empty for works)
links: # Optional
  - label: Official Site
    url: https://...
image: # Optional
  file: ../../assets/images/entities/work-id.jpg
  source: https://...
  license: License Type
  author: Author Name
---
Description of the work in MDX...
```

### Institutions

```yaml
---
id: institution-id # Required
type: institution # Required
name: Institution Name # Required
kind: university # Required: university, lab, company, org
era: 1900s-present # Required
domains: # Required: at least one
  - Research
  - Education
location: City, Country # Optional
edges: [] # Inline relationships (usually empty for institutions)
links: # Optional
  - label: Official Site
    url: https://...
image: # Optional
  file: ../../assets/images/entities/institution-id.jpg
  source: https://...
  license: License Type
  author: Author Name
---
Description of the institution in MDX...
```

### Edges (Inline Relationships)

Edges are defined inline within each node's frontmatter using the `edges` array:

```yaml
edges:
  - target: linux-kernel # Target node ID
    kind: influence # influence or affiliation
    label: created # Optional: relationship label
```

Edges flow **from** the node containing them **to** the target. For example, to show that Linus Torvalds created Linux, add an edge in `linus-torvalds.mdx` pointing to `linux-kernel`.

## Image Guidelines

### Local Images (Preferred)

Images should be stored locally in `src/assets/images/entities/` for reliability and optimization. Astro automatically converts them to optimized WebP format.

**Steps to add an image:**

1. Download the image from Wikimedia Commons or another licensed source
2. Save it to `src/assets/images/entities/<entity-id>.jpg`
3. Reference it in your frontmatter with a relative path

### Required Attribution Fields

When including an image, ALL fields are required:

```yaml
image:
  file: ../../assets/images/entities/person-id.jpg # Relative path to local image
  source: https://commons.wikimedia.org/wiki/File:... # Source page for attribution
  license: CC BY 2.0 # Exact license
  author: Photographer Name # Creator attribution
```

### Preferred Sources

1. **Wikimedia Commons** - Best option for licensed images
2. **Public domain** - Historical images, US government works
3. **CC-licensed** - Creative Commons with proper attribution

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

1. Target node IDs exist
2. `kind` is either "influence" or "affiliation"
3. Orphaned nodes are flagged (nodes with no edges)

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

# Create new content
pnpm new:person <slug>
pnpm new:work <slug>
pnpm new:institution <slug>

# Validate all content
pnpm validate
```

## Pull Request Process

1. **Choose the right template** when creating your PR
2. **Fill out the checklist** completely
3. **Wait for CI** to pass (schema validation, edge checks)
4. **Address review feedback** promptly

### CI Checks

Your PR will be automatically validated for:

- Schema compliance (all required fields present, correct types)
- Edge integrity (target nodes exist)
- Image attribution (all fields present when image exists)
- Orphaned nodes (nodes with no connections)

## Questions?

- Open an issue for questions about content
- Check existing people/works as examples
- Review the PR templates for guidance

Thank you for helping document computing history!
