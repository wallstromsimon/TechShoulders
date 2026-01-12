/**
 * Shared Constants for TechShoulders
 *
 * Central location for visual and UI constants used across components.
 * Prevents duplication and ensures consistency.
 */

/**
 * Node type to color mapping for graph visualization
 */
export const NODE_COLORS: Record<string, string> = {
  people: '#e74c3c', // Red for people
  works: '#3498db', // Blue for works
  institutions: '#27ae60', // Green for institutions
} as const;

/**
 * Edge type to color mapping for graph visualization
 */
export const EDGE_COLORS: Record<string, string> = {
  influence: '#333333', // Dark for strong edges
  affiliation: '#999999', // Gray for weak edges
} as const;

/**
 * Node kinds as a tuple for iteration
 */
export const NODE_KINDS = ['people', 'works', 'institutions'] as const;
export type NodeKind = (typeof NODE_KINDS)[number];

/**
 * Edge kinds as a tuple for iteration
 */
export const EDGE_KINDS = ['influence', 'affiliation'] as const;
export type EdgeKind = (typeof EDGE_KINDS)[number];
