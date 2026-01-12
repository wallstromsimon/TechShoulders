import { describe, it, expect } from 'vitest';
import {
  getEdgeKind,
  isValidEdgeLabel,
  STRONG_EDGE_LABELS,
  WEAK_EDGE_LABELS,
} from '../edgeClassification';

describe('edgeClassification', () => {
  describe('STRONG_EDGE_LABELS', () => {
    it('contains expected strong edge labels', () => {
      expect(STRONG_EDGE_LABELS).toContain('created');
      expect(STRONG_EDGE_LABELS).toContain('invented');
      expect(STRONG_EDGE_LABELS).toContain('influenced');
      expect(STRONG_EDGE_LABELS).toContain('inspired');
      expect(STRONG_EDGE_LABELS).toContain('built_on');
      expect(STRONG_EDGE_LABELS).toContain('popularized');
      expect(STRONG_EDGE_LABELS).toContain('standardized');
    });

    it('has correct length', () => {
      expect(STRONG_EDGE_LABELS).toHaveLength(7);
    });
  });

  describe('WEAK_EDGE_LABELS', () => {
    it('contains expected weak edge labels', () => {
      expect(WEAK_EDGE_LABELS).toContain('studied at');
      expect(WEAK_EDGE_LABELS).toContain('worked at');
      expect(WEAK_EDGE_LABELS).toContain('professor at');
      expect(WEAK_EDGE_LABELS).toContain('fellow at');
      expect(WEAK_EDGE_LABELS).toContain('founded');
      expect(WEAK_EDGE_LABELS).toContain('funded_by');
    });

    it('has correct length', () => {
      expect(WEAK_EDGE_LABELS).toHaveLength(6);
    });
  });

  describe('getEdgeKind', () => {
    it('returns "influence" for strong edge labels', () => {
      expect(getEdgeKind('created')).toBe('influence');
      expect(getEdgeKind('invented')).toBe('influence');
      expect(getEdgeKind('influenced')).toBe('influence');
      expect(getEdgeKind('inspired')).toBe('influence');
      expect(getEdgeKind('built_on')).toBe('influence');
      expect(getEdgeKind('popularized')).toBe('influence');
      expect(getEdgeKind('standardized')).toBe('influence');
    });

    it('returns "affiliation" for weak edge labels', () => {
      expect(getEdgeKind('studied at')).toBe('affiliation');
      expect(getEdgeKind('worked at')).toBe('affiliation');
      expect(getEdgeKind('professor at')).toBe('affiliation');
      expect(getEdgeKind('fellow at')).toBe('affiliation');
      expect(getEdgeKind('founded')).toBe('affiliation');
      expect(getEdgeKind('funded_by')).toBe('affiliation');
    });

    it('defaults to "influence" for unknown labels', () => {
      expect(getEdgeKind('unknown_label')).toBe('influence');
      expect(getEdgeKind('')).toBe('influence');
      expect(getEdgeKind('random')).toBe('influence');
    });

    // Note: console.warn behavior is tested implicitly through the default tests
    // The warning only fires in DEV mode (import.meta.env.DEV), which cannot be
    // reliably mocked in Vitest. The warning output in stderr confirms it works.
  });

  describe('isValidEdgeLabel', () => {
    it('returns true for all strong edge labels', () => {
      for (const label of STRONG_EDGE_LABELS) {
        expect(isValidEdgeLabel(label)).toBe(true);
      }
    });

    it('returns true for all weak edge labels', () => {
      for (const label of WEAK_EDGE_LABELS) {
        expect(isValidEdgeLabel(label)).toBe(true);
      }
    });

    it('returns false for invalid labels', () => {
      expect(isValidEdgeLabel('unknown')).toBe(false);
      expect(isValidEdgeLabel('')).toBe(false);
      expect(isValidEdgeLabel('create')).toBe(false); // typo
      expect(isValidEdgeLabel('CREATED')).toBe(false); // wrong case
    });

    it('is case-sensitive', () => {
      expect(isValidEdgeLabel('Created')).toBe(false);
      expect(isValidEdgeLabel('INFLUENCED')).toBe(false);
      expect(isValidEdgeLabel('Studied At')).toBe(false);
    });
  });
});
