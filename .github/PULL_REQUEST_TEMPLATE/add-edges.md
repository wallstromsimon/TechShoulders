# Add Edges (Relationships)

## Edge Summary

**Number of edges being added:** <!-- e.g., 5 -->
**Edge types:**

- [ ] Influence (created, invented, inspired)
- [ ] Affiliation (worked at, studied at, founded)

## Pre-submission Checklist

### Edge Validation

- [ ] All `source` node IDs exist in the codebase
- [ ] All `target` node IDs exist in the codebase
- [ ] Edge `kind` is either "influence" or "affiliation"
- [ ] Labels accurately describe the relationship

### Edge Types Guide

**Influence edges** (`src/content/edges/influence.json`):

- Strong, direct relationships
- Examples: "created", "invented", "designed", "wrote"
- Typically: person → work

**Affiliation edges** (`src/content/edges/affiliation.json`):

- Context/association relationships
- Examples: "worked at", "studied at", "founded", "fellow at"
- Typically: person → institution

## Edges Being Added

<!-- List the edges in this format -->

### Influence Edges

| Source    | Target  | Label   |
| --------- | ------- | ------- |
| person-id | work-id | created |

### Affiliation Edges

| Source    | Target         | Label     |
| --------- | -------------- | --------- |
| person-id | institution-id | worked at |

## Edge Format

```json
{
  "source": "node-id",
  "target": "node-id",
  "kind": "influence",
  "label": "created"
}
```

## File Locations

- Influence: `src/content/edges/influence.json`
- Affiliation: `src/content/edges/affiliation.json`

## Common Labels

### Influence Labels

- `created` - Primary creator
- `invented` - Original inventor
- `designed` - Designed the system/language
- `wrote` - Authored (papers, books)
- `co-created` - Joint creation
- `contributed to` - Significant contributor

### Affiliation Labels

- `worked at` - Employment
- `studied at` - Education
- `founded` - Founder/co-founder
- `fellow at` - Fellowship position
- `researcher at` - Research position
- `professor at` - Academic position

## Verification

<!-- How did you verify these relationships? -->

- [ ] Wikipedia sources
- [ ] Official biographies
- [ ] Academic papers
- [ ] Other: **\*\***\_**\*\***
