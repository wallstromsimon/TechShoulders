/**
 * Search Filters for TechShoulders
 *
 * Provides utilities for advanced filtering by contribution types,
 * work kinds, and era ranges.
 */

import type { SearchableNode, Edge } from './data';

// Contribution type categories based on edge labels
export const CONTRIBUTION_TYPES = {
  created: {
    label: 'Created',
    description: 'Invented or created something new',
    edgeLabels: ['created', 'invented', 'developed', 'designed', 'wrote'],
  },
  influenced: {
    label: 'Influenced',
    description: 'Inspired or influenced other work',
    edgeLabels: ['influenced', 'inspired', 'mentored'],
  },
  built_on: {
    label: 'Built On',
    description: 'Extended or built upon existing work',
    edgeLabels: ['built_on', 'extended', 'forked', 'ported'],
  },
  popularized: {
    label: 'Popularized',
    description: 'Promoted or standardized',
    edgeLabels: ['popularized', 'standardized', 'promoted', 'advocated'],
  },
  affiliated: {
    label: 'Affiliated',
    description: 'Institutional relationships',
    edgeLabels: ['studied_at', 'worked_at', 'professor_at', 'founded', 'fellow_at', 'researcher_at'],
  },
} as const;

export type ContributionType = keyof typeof CONTRIBUTION_TYPES;

// Work kind categories
export const WORK_KINDS = [
  'project',
  'programming language',
  'operating system',
  'protocol',
  'standard',
  'paper',
  'book',
  'algorithm',
  'tool',
  'framework',
  'library',
  'database',
  'specification',
] as const;

export type WorkKind = (typeof WORK_KINDS)[number];

// Institution kind categories
export const INSTITUTION_KINDS = [
  'university',
  'laboratory',
  'company',
  'research institute',
  'foundation',
  'consortium',
  'agency',
] as const;

export type InstitutionKind = (typeof INSTITUTION_KINDS)[number];

/**
 * Filter nodes by contribution type based on their edges
 */
export function filterByContribution(
  nodes: SearchableNode[],
  edges: Edge[],
  contributionTypes: ContributionType[]
): SearchableNode[] {
  if (contributionTypes.length === 0) return nodes;

  // Collect all edge labels for selected contribution types
  const matchingLabels = new Set<string>();
  for (const type of contributionTypes) {
    for (const label of CONTRIBUTION_TYPES[type].edgeLabels) {
      matchingLabels.add(label);
    }
  }

  // Find nodes that have edges with matching labels
  const matchingNodeIds = new Set<string>();
  for (const edge of edges) {
    if (edge.label && matchingLabels.has(edge.label)) {
      matchingNodeIds.add(edge.source);
      matchingNodeIds.add(edge.target);
    }
  }

  return nodes.filter((n) => matchingNodeIds.has(n.id));
}

/**
 * Filter nodes by work kind (only applies to works)
 */
export function filterByWorkKind(
  nodes: SearchableNode[],
  workKinds: string[]
): SearchableNode[] {
  if (workKinds.length === 0) return nodes;

  return nodes.filter((node) => {
    // If it's not a work, include it (don't filter out people/institutions)
    if (node.kind !== 'works') return true;
    // If it's a work, check if its kind matches
    return node.subtitle && workKinds.some((wk) =>
      node.subtitle!.toLowerCase().includes(wk.toLowerCase())
    );
  });
}

/**
 * Get counts of each work kind in the dataset
 */
export function getWorkKindCounts(nodes: SearchableNode[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const node of nodes) {
    if (node.kind === 'works' && node.subtitle) {
      const subtitle = node.subtitle.toLowerCase();
      for (const kind of WORK_KINDS) {
        if (subtitle.includes(kind)) {
          counts.set(kind, (counts.get(kind) || 0) + 1);
          break; // Only count once per node
        }
      }
    }
  }

  return counts;
}

/**
 * Parse era string into year range
 */
export function parseEra(era: string): { start: number; end: number } | null {
  if (!era) return null;

  const currentYear = new Date().getFullYear();

  // Handle "present" in era
  const hasPresent = era.toLowerCase().includes('present');

  // Try to extract years
  const yearMatches = era.match(/\d{4}/g);
  if (!yearMatches || yearMatches.length === 0) {
    // Handle century formats like "19th century"
    const centuryMatch = era.match(/(\d{1,2})(?:st|nd|rd|th)\s*century/i);
    if (centuryMatch) {
      const century = parseInt(centuryMatch[1], 10);
      return {
        start: (century - 1) * 100,
        end: century * 100 - 1,
      };
    }
    return null;
  }

  const years = yearMatches.map((y) => parseInt(y, 10));

  if (years.length === 1) {
    // Single year like "1991" or "1990s"
    const year = years[0];
    if (era.includes('s') && !era.includes('s–') && !era.includes('s-')) {
      // Decade like "1990s"
      return {
        start: year,
        end: hasPresent ? currentYear : year + 9,
      };
    }
    return {
      start: year,
      end: hasPresent ? currentYear : year,
    };
  }

  // Range like "1990s–2000s" or "1991–2005"
  return {
    start: Math.min(...years),
    end: hasPresent ? currentYear : Math.max(...years) + (era.includes('s') ? 9 : 0),
  };
}

/**
 * Filter nodes by era range
 */
export function filterByEraRange(
  nodes: SearchableNode[],
  minYear: number,
  maxYear: number
): SearchableNode[] {
  return nodes.filter((node) => {
    if (!node.era && !node.year) return true; // Include nodes without era info

    // If node has a specific year, use that
    if (node.year) {
      return node.year >= minYear && node.year <= maxYear;
    }

    // Otherwise parse the era string
    const parsed = parseEra(node.era || '');
    if (!parsed) return true; // Include if we can't parse

    // Check if era range overlaps with filter range
    return parsed.start <= maxYear && parsed.end >= minYear;
  });
}

/**
 * Get the min and max years from a set of nodes
 */
export function getYearRange(nodes: SearchableNode[]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  const currentYear = new Date().getFullYear();

  for (const node of nodes) {
    if (node.year) {
      min = Math.min(min, node.year);
      max = Math.max(max, node.year);
    } else if (node.era) {
      const parsed = parseEra(node.era);
      if (parsed) {
        min = Math.min(min, parsed.start);
        max = Math.max(max, parsed.end);
      }
    }
  }

  // Default to reasonable range if no data found
  if (min === Infinity) min = 1940;
  if (max === -Infinity) max = currentYear;

  return { min, max };
}

/**
 * Combined filter function that applies all filters
 */
export interface FilterOptions {
  domains?: string[];
  types?: ('people' | 'works' | 'institutions')[];
  contributionTypes?: ContributionType[];
  workKinds?: string[];
  eraRange?: [number, number];
  searchQuery?: string;
}

export function applyFilters(
  nodes: SearchableNode[],
  edges: Edge[],
  options: FilterOptions
): SearchableNode[] {
  let filtered = [...nodes];

  // Domain filter
  if (options.domains && options.domains.length > 0) {
    filtered = filtered.filter((n) =>
      n.domains.some((d) => options.domains!.includes(d))
    );
  }

  // Type filter
  if (options.types && options.types.length > 0) {
    filtered = filtered.filter((n) => options.types!.includes(n.kind));
  }

  // Contribution type filter
  if (options.contributionTypes && options.contributionTypes.length > 0) {
    filtered = filterByContribution(filtered, edges, options.contributionTypes);
  }

  // Work kind filter
  if (options.workKinds && options.workKinds.length > 0) {
    filtered = filterByWorkKind(filtered, options.workKinds);
  }

  // Era range filter
  if (options.eraRange) {
    filtered = filterByEraRange(filtered, options.eraRange[0], options.eraRange[1]);
  }

  return filtered;
}
