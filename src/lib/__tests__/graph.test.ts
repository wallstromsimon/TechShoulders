import { describe, it, expect } from 'vitest';
import { getNeighborhood, getDirectNeighbors, type GraphEdge } from '../graph';

describe('graph utilities', () => {
  // Sample edges for testing:
  // A -> B -> C -> D
  // A -> E
  const sampleEdges: GraphEdge[] = [
    { source: 'a', target: 'b', kind: 'influence', label: 'created' },
    { source: 'b', target: 'c', kind: 'influence', label: 'influenced' },
    { source: 'c', target: 'd', kind: 'affiliation', label: 'worked at' },
    { source: 'a', target: 'e', kind: 'influence', label: 'invented' },
  ];

  describe('getNeighborhood', () => {
    it('returns only the node itself when depth is 0', () => {
      const result = getNeighborhood('a', 0, sampleEdges);
      expect(result).toEqual(new Set(['a']));
    });

    it('returns direct neighbors at depth 1', () => {
      const result = getNeighborhood('a', 1, sampleEdges);
      expect(result).toEqual(new Set(['a', 'b', 'e']));
    });

    it('returns 2-hop neighbors at depth 2', () => {
      const result = getNeighborhood('a', 2, sampleEdges);
      expect(result).toEqual(new Set(['a', 'b', 'c', 'e']));
    });

    it('returns 3-hop neighbors at depth 3', () => {
      const result = getNeighborhood('a', 3, sampleEdges);
      expect(result).toEqual(new Set(['a', 'b', 'c', 'd', 'e']));
    });

    it('handles nodes with no edges', () => {
      const result = getNeighborhood('z', 2, sampleEdges);
      expect(result).toEqual(new Set(['z']));
    });

    it('traverses edges bidirectionally', () => {
      // Starting from C, should be able to reach B and A going backward
      const result = getNeighborhood('c', 2, sampleEdges);
      expect(result.has('b')).toBe(true);
      expect(result.has('a')).toBe(true);
      expect(result.has('d')).toBe(true);
    });

    it('handles empty edge list', () => {
      const result = getNeighborhood('a', 3, []);
      expect(result).toEqual(new Set(['a']));
    });

    it('handles cycles without infinite loop', () => {
      const cyclicEdges: GraphEdge[] = [
        { source: 'a', target: 'b', kind: 'influence' },
        { source: 'b', target: 'c', kind: 'influence' },
        { source: 'c', target: 'a', kind: 'influence' }, // cycle back to A
      ];
      const result = getNeighborhood('a', 5, cyclicEdges);
      expect(result).toEqual(new Set(['a', 'b', 'c']));
    });
  });

  describe('getDirectNeighbors', () => {
    it('returns only direct neighbors (1-hop)', () => {
      const result = getDirectNeighbors('a', sampleEdges);
      expect(result).toEqual(new Set(['a', 'b', 'e']));
    });

    it('includes nodes from both incoming and outgoing edges', () => {
      const result = getDirectNeighbors('b', sampleEdges);
      expect(result.has('a')).toBe(true); // incoming from A
      expect(result.has('c')).toBe(true); // outgoing to C
      expect(result.has('b')).toBe(true); // self
    });

    it('handles nodes with no edges', () => {
      const result = getDirectNeighbors('z', sampleEdges);
      expect(result).toEqual(new Set(['z']));
    });

    it('handles empty edge list', () => {
      const result = getDirectNeighbors('a', []);
      expect(result).toEqual(new Set(['a']));
    });

    it('is equivalent to getNeighborhood with depth 1', () => {
      const neighborhood = getNeighborhood('a', 1, sampleEdges);
      const directNeighbors = getDirectNeighbors('a', sampleEdges);
      expect(neighborhood).toEqual(directNeighbors);
    });
  });
});
