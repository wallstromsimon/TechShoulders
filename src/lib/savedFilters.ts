/**
 * Saved Filters utilities for TechShoulders
 *
 * Manages saving and loading filter configurations to/from localStorage.
 * Follows the same pattern as PackProgress.tsx.
 */

import type { ContributionType } from './searchFilters';
import type { NodeKind } from './data';

const STORAGE_KEY = 'techshoulders_saved_filters';
const MAX_SAVED_FILTERS = 10;

export interface SavedFilter {
  id: string;
  name: string;
  createdAt: number;
  filters: {
    domains?: string[];
    types?: NodeKind[];
    contributionTypes?: ContributionType[];
    workKinds?: string[];
    eraRange?: [number, number];
  };
}

/**
 * Generate a unique ID for a saved filter
 */
function generateId(): string {
  return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all saved filters from localStorage
 */
export function getSavedFilters(): SavedFilter[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading saved filters:', e);
    return [];
  }
}

/**
 * Save filters to localStorage
 */
function persistFilters(filters: SavedFilter[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (e) {
    console.error('Error saving filters:', e);
  }
}

/**
 * Save a new filter
 */
export function saveFilter(
  name: string,
  filters: SavedFilter['filters']
): SavedFilter {
  const savedFilters = getSavedFilters();

  const newFilter: SavedFilter = {
    id: generateId(),
    name,
    createdAt: Date.now(),
    filters,
  };

  // Add to beginning of list
  const updated = [newFilter, ...savedFilters];

  // Limit to max saved filters
  if (updated.length > MAX_SAVED_FILTERS) {
    updated.splice(MAX_SAVED_FILTERS);
  }

  persistFilters(updated);
  return newFilter;
}

/**
 * Delete a saved filter by ID
 */
export function deleteFilter(id: string): void {
  const savedFilters = getSavedFilters();
  const updated = savedFilters.filter((f) => f.id !== id);
  persistFilters(updated);
}

/**
 * Update an existing filter
 */
export function updateFilter(
  id: string,
  updates: Partial<Pick<SavedFilter, 'name' | 'filters'>>
): SavedFilter | null {
  const savedFilters = getSavedFilters();
  const index = savedFilters.findIndex((f) => f.id === id);

  if (index === -1) return null;

  const updated = [...savedFilters];
  updated[index] = {
    ...updated[index],
    ...updates,
  };

  persistFilters(updated);
  return updated[index];
}

/**
 * Get a filter by ID
 */
export function getFilterById(id: string): SavedFilter | null {
  const savedFilters = getSavedFilters();
  return savedFilters.find((f) => f.id === id) || null;
}

/**
 * Check if filters object has any active filters
 */
export function hasActiveFilters(filters: SavedFilter['filters']): boolean {
  return !!(
    (filters.domains && filters.domains.length > 0) ||
    (filters.types && filters.types.length > 0) ||
    (filters.contributionTypes && filters.contributionTypes.length > 0) ||
    (filters.workKinds && filters.workKinds.length > 0) ||
    filters.eraRange
  );
}

/**
 * Generate a default name for a filter based on its contents
 */
export function generateFilterName(filters: SavedFilter['filters']): string {
  const parts: string[] = [];

  if (filters.types && filters.types.length > 0) {
    parts.push(filters.types.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(', '));
  }

  if (filters.domains && filters.domains.length > 0) {
    if (filters.domains.length <= 2) {
      parts.push(filters.domains.join(', '));
    } else {
      parts.push(`${filters.domains[0]} +${filters.domains.length - 1} more`);
    }
  }

  if (filters.eraRange) {
    parts.push(`${filters.eraRange[0]}-${filters.eraRange[1]}`);
  }

  if (parts.length === 0) {
    return 'Custom Filter';
  }

  const name = parts.join(' | ');
  return name.length > 40 ? name.substring(0, 37) + '...' : name;
}

/**
 * Encode filters to URL query string
 */
export function filtersToQueryString(filters: SavedFilter['filters']): string {
  const params = new URLSearchParams();

  if (filters.domains && filters.domains.length > 0) {
    params.set('domains', filters.domains.map((d) => encodeURIComponent(d)).join(','));
  }

  if (filters.types && filters.types.length > 0) {
    params.set('types', filters.types.join(','));
  }

  if (filters.contributionTypes && filters.contributionTypes.length > 0) {
    params.set('contributions', filters.contributionTypes.join(','));
  }

  if (filters.workKinds && filters.workKinds.length > 0) {
    params.set('workKinds', filters.workKinds.map((k) => encodeURIComponent(k)).join(','));
  }

  if (filters.eraRange) {
    params.set('era', `${filters.eraRange[0]}-${filters.eraRange[1]}`);
  }

  return params.toString();
}

/**
 * Parse filters from URL query string
 */
export function queryStringToFilters(queryString: string): SavedFilter['filters'] {
  const params = new URLSearchParams(queryString);
  const filters: SavedFilter['filters'] = {};

  const domains = params.get('domains');
  if (domains) {
    filters.domains = domains.split(',').map((d) => decodeURIComponent(d));
  }

  const types = params.get('types');
  if (types) {
    filters.types = types.split(',').filter(
      (t): t is NodeKind => ['people', 'works', 'institutions'].includes(t)
    );
  }

  const contributions = params.get('contributions');
  if (contributions) {
    filters.contributionTypes = contributions.split(',') as ContributionType[];
  }

  const workKinds = params.get('workKinds');
  if (workKinds) {
    filters.workKinds = workKinds.split(',').map((k) => decodeURIComponent(k));
  }

  const era = params.get('era');
  if (era) {
    const match = era.match(/(\d+)-(\d+)/);
    if (match) {
      filters.eraRange = [parseInt(match[1], 10), parseInt(match[2], 10)];
    }
  }

  return filters;
}
