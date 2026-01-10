# Add Institution

## Institution Details

**Name:** <!-- e.g., Bell Labs -->
**ID (slug):** <!-- e.g., bell-labs (lowercase, hyphens only) -->
**Kind:** <!-- e.g., lab, university, company, organization -->
**Location:** <!-- e.g., Murray Hill, New Jersey -->

## Pre-submission Checklist

### Required Fields
- [ ] `id` - Unique identifier (lowercase, hyphens)
- [ ] `name` - Full name of the institution
- [ ] `kind` - Type (lab, university, company, organization)

### Recommended Fields
- [ ] `location` - Geographic location
- [ ] `links` - Array of {label, url} for external resources

### Image Attribution (Required if image provided)
- [ ] `image.url` - Direct URL to image (logo or building)
- [ ] `image.source` - Source page URL
- [ ] `image.license` - License type (e.g., "CC BY 2.0", "Public Domain")
- [ ] `image.author` - Attribution to creator

## Content Quality
- [ ] Description covers the institution's tech significance
- [ ] Notable contributions/inventions mentioned
- [ ] Key people associated are referenced
- [ ] Links point to reliable sources

## File Location

```
src/content/institutions/<id>.mdx
```

## Example Frontmatter

```yaml
---
id: bell-labs
name: Bell Labs
kind: lab
location: Murray Hill, New Jersey
links:
  - label: Wikipedia
    url: https://en.wikipedia.org/wiki/Bell_Labs
  - label: Official Site
    url: https://www.bell-labs.com/
image:
  url: https://example.com/bell-labs.jpg
  source: https://commons.wikimedia.org/wiki/File:BellLabs.jpg
  license: CC BY-SA 3.0
  author: Photographer Name
---

Bell Labs (formerly Bell Telephone Laboratories) is an American industrial
research and scientific development company...
```

## Related Changes

<!-- List any edges or related content being added -->
- [ ] Adding affiliation edges (person → institution)
- [ ] Adding people who worked/studied there
- [ ] Adding works created at this institution
