/**
 * Edge Classification System
 *
 * Edges are classified into two tiers to prevent the graph from becoming
 * "a hairball of vaguely-related edges" as content scales.
 *
 * - Strong edges (influence): Direct intellectual contribution or creation
 * - Weak edges (affiliation): Institutional relationships
 *
 * The graph shows strong edges by default. Weak edges can be toggled on.
 */

/**
 * STRONG EDGES (influence)
 * These represent direct intellectual contribution, creation, or inspiration.
 * Always shown by default.
 */
export const STRONG_EDGE_LABELS = [
  'created', // Built/wrote the thing
  'invented', // Original inventor
  'influenced', // Direct intellectual influence
  'inspired', // Served as inspiration for
  'built_on', // Extended or built upon prior work
  'popularized', // Brought to mainstream adoption
  'standardized', // Formalized into a standard
] as const;

/**
 * WEAK EDGES (affiliation)
 * These represent institutional or organizational relationships.
 * Hidden by default, can be toggled on.
 */
export const WEAK_EDGE_LABELS = [
  'studied at', // Attended as student
  'worked at', // Employee/contractor
  'professor at', // Faculty position
  'fellow at', // Fellowship/research position
  'founded', // Started the organization
  'funded_by', // Received funding from
] as const;

export type StrongEdgeLabel = (typeof STRONG_EDGE_LABELS)[number];
export type WeakEdgeLabel = (typeof WEAK_EDGE_LABELS)[number];
export type EdgeLabel = StrongEdgeLabel | WeakEdgeLabel;

/**
 * Edge kinds map directly to the tier system:
 * - 'influence' = strong edges (shown by default)
 * - 'affiliation' = weak edges (hidden by default)
 */
export type EdgeKind = 'influence' | 'affiliation';

/**
 * Determine edge kind from label
 */
export function getEdgeKind(label: string): EdgeKind {
  if (STRONG_EDGE_LABELS.includes(label as StrongEdgeLabel)) {
    return 'influence';
  }
  if (WEAK_EDGE_LABELS.includes(label as WeakEdgeLabel)) {
    return 'affiliation';
  }
  // Default to influence for unknown labels (conservative)
  console.warn(`Unknown edge label "${label}", defaulting to influence`);
  return 'influence';
}

/**
 * Check if a label is valid
 */
export function isValidEdgeLabel(label: string): label is EdgeLabel {
  return (
    STRONG_EDGE_LABELS.includes(label as StrongEdgeLabel) ||
    WEAK_EDGE_LABELS.includes(label as WeakEdgeLabel)
  );
}
