# Add Person

## Person Details

**Name:** <!-- e.g., Ada Lovelace -->
**ID (slug):** <!-- e.g., ada-lovelace (lowercase, hyphens only) -->
**Era:** <!-- e.g., 1830s–1850s -->

## Domains

<!-- List the primary domains this person contributed to -->

- [ ] Operating Systems
- [ ] Programming Languages
- [ ] Artificial Intelligence
- [ ] Networking
- [ ] Databases
- [ ] Other: **\*\***\_**\*\***

## Pre-submission Checklist

### Required Fields

- [ ] `id` - Unique identifier (lowercase, hyphens)
- [ ] `name` - Full name
- [ ] `era` - Time period active

### Recommended Fields

- [ ] `title` - Brief description (e.g., "Creator of Linux and Git")
- [ ] `domains` - Array of domain tags
- [ ] `signatureWorks` - Array of work IDs (must exist!)
- [ ] `whyYouCare` - Array of bullet points explaining importance
- [ ] `links` - Array of {label, url} for external resources

### Image (Required if image provided)

- [ ] Image file saved to `src/assets/images/entities/<id>.jpg`
- [ ] `image.file` - Relative path to local image
- [ ] `image.source` - Source page URL (e.g., Wikimedia Commons)
- [ ] `image.license` - License type (e.g., "CC BY 2.0", "Public Domain")
- [ ] `image.author` - Attribution to creator

## Content Quality

- [ ] Biography is factual and well-sourced
- [ ] "Why You Care" bullets explain relevance to modern tech
- [ ] Links point to reliable sources (Wikipedia, official sites)
- [ ] No copyright violations

### Citations (if specific claims made)

- [ ] Inline citations use `<sup><a href="#source-N">[N]</a></sup>` format
- [ ] Sources section added at end with `<span id="source-N"></span>` anchors
- [ ] Citations link to reliable primary sources

## File Location

```
src/content/people/<id>.mdx
```

## Example Frontmatter

```yaml
---
id: ada-lovelace
name: Ada Lovelace
title: First Computer Programmer
era: 1830s–1850s
domains:
  - Programming Languages
  - Mathematics
signatureWorks:
  - analytical-engine-notes
whyYouCare:
  - Wrote the first algorithm intended for machine processing
  - Envisioned computers could go beyond pure calculation
links:
  - label: Wikipedia
    url: https://en.wikipedia.org/wiki/Ada_Lovelace
image:
  file: ../../assets/images/entities/ada-lovelace.jpg
  source: https://commons.wikimedia.org/wiki/File:Example.jpg
  license: Public Domain
  author: Unknown
---
```

## Related Changes

<!-- List any edges or related content being added -->

- [ ] Adding edges in `src/content/edges/influence.json`
- [ ] Adding edges in `src/content/edges/affiliation.json`
- [ ] Adding related works
- [ ] Adding related institutions
