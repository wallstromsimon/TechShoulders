import { describe, it, expect } from 'vitest';
import { NODE_COLORS, EDGE_COLORS, NODE_KINDS, EDGE_KINDS } from '../constants';

describe('constants', () => {
  describe('NODE_COLORS', () => {
    it('defines colors for all node kinds', () => {
      expect(NODE_COLORS.people).toBeDefined();
      expect(NODE_COLORS.works).toBeDefined();
      expect(NODE_COLORS.institutions).toBeDefined();
    });

    it('uses valid hex color values', () => {
      const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
      expect(NODE_COLORS.people).toMatch(hexColorRegex);
      expect(NODE_COLORS.works).toMatch(hexColorRegex);
      expect(NODE_COLORS.institutions).toMatch(hexColorRegex);
    });

    it('has distinct colors for each node kind', () => {
      const colors = [NODE_COLORS.people, NODE_COLORS.works, NODE_COLORS.institutions];
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(3);
    });
  });

  describe('EDGE_COLORS', () => {
    it('defines colors for all edge kinds', () => {
      expect(EDGE_COLORS.influence).toBeDefined();
      expect(EDGE_COLORS.affiliation).toBeDefined();
    });

    it('uses valid hex color values', () => {
      const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
      expect(EDGE_COLORS.influence).toMatch(hexColorRegex);
      expect(EDGE_COLORS.affiliation).toMatch(hexColorRegex);
    });

    it('has distinct colors for each edge kind', () => {
      expect(EDGE_COLORS.influence).not.toBe(EDGE_COLORS.affiliation);
    });

    it('uses darker color for influence (strong) edges', () => {
      // Influence should be more prominent (darker) than affiliation
      const influenceBrightness = parseInt(EDGE_COLORS.influence.slice(1), 16);
      const affiliationBrightness = parseInt(EDGE_COLORS.affiliation.slice(1), 16);
      expect(influenceBrightness).toBeLessThan(affiliationBrightness);
    });
  });

  describe('NODE_KINDS', () => {
    it('contains all expected node kinds', () => {
      expect(NODE_KINDS).toContain('people');
      expect(NODE_KINDS).toContain('works');
      expect(NODE_KINDS).toContain('institutions');
    });

    it('has correct length', () => {
      expect(NODE_KINDS).toHaveLength(3);
    });
  });

  describe('EDGE_KINDS', () => {
    it('contains all expected edge kinds', () => {
      expect(EDGE_KINDS).toContain('influence');
      expect(EDGE_KINDS).toContain('affiliation');
    });

    it('has correct length', () => {
      expect(EDGE_KINDS).toHaveLength(2);
    });
  });
});
