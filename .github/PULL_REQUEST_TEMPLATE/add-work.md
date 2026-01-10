# Add Work

## Work Details

**Name:** <!-- e.g., UNIX Operating System -->
**ID (slug):** <!-- e.g., unix (lowercase, hyphens only) -->
**Kind:** <!-- e.g., operating-system, programming-language, paper, tool -->
**Year:** <!-- e.g., 1969 -->

## Domains

<!-- List the primary domains this work belongs to -->
- [ ] Operating Systems
- [ ] Programming Languages
- [ ] Artificial Intelligence
- [ ] Networking
- [ ] Databases
- [ ] Version Control
- [ ] Developer Tools
- [ ] Other: _____________

## Pre-submission Checklist

### Required Fields
- [ ] `id` - Unique identifier (lowercase, hyphens)
- [ ] `name` - Full name of the work
- [ ] `kind` - Type of work (project, paper, tool, etc.)
- [ ] `year` - Year created/published

### Recommended Fields
- [ ] `domains` - Array of domain tags
- [ ] `links` - Array of {label, url} for external resources

### Image (Required if image provided)
- [ ] Image file saved to `src/assets/images/entities/<id>.jpg`
- [ ] `image.file` - Relative path to local image
- [ ] `image.source` - Source page URL (e.g., Wikimedia Commons)
- [ ] `image.license` - License type (e.g., "CC BY 2.0", "Public Domain")
- [ ] `image.author` - Attribution to creator

## Content Quality
- [ ] Description accurately represents the work
- [ ] Historical context is provided
- [ ] Impact and significance explained
- [ ] Links point to reliable sources

## File Location

```
src/content/works/<id>.mdx
```

## Example Frontmatter

```yaml
---
id: unix
name: UNIX Operating System
kind: operating-system
year: 1969
domains:
  - Operating Systems
  - Programming Languages
links:
  - label: Wikipedia
    url: https://en.wikipedia.org/wiki/Unix
  - label: The Open Group
    url: https://www.opengroup.org/unix
image:
  file: ../../assets/images/entities/unix.jpg
  source: https://commons.wikimedia.org/wiki/File:Unix.png
  license: Public Domain
  author: Bell Labs
---

UNIX is a family of multitasking, multi-user computer operating systems...
```

## Related Changes

<!-- List any edges or related content being added -->
- [ ] Adding influence edges (creator → work)
- [ ] Adding related people who created/contributed
- [ ] Adding institution affiliations
