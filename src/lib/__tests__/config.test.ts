import { describe, it, expect } from 'vitest';
import { GRAPH_CONFIG, MINI_GRAPH_CONFIG, URL_PARAMS } from '../config';

describe('config', () => {
  describe('GRAPH_CONFIG', () => {
    it('has search configuration', () => {
      expect(GRAPH_CONFIG.SEARCH_MAX_RESULTS).toBeGreaterThan(0);
      expect(GRAPH_CONFIG.SEARCH_MAX_RESULTS).toBeLessThanOrEqual(20);
    });

    it('has focus depth configuration', () => {
      expect(GRAPH_CONFIG.FOCUS_DEPTH.MIN).toBe(1);
      expect(GRAPH_CONFIG.FOCUS_DEPTH.MAX).toBeGreaterThan(GRAPH_CONFIG.FOCUS_DEPTH.MIN);
      expect(GRAPH_CONFIG.FOCUS_DEPTH.DEFAULT).toBeGreaterThanOrEqual(GRAPH_CONFIG.FOCUS_DEPTH.MIN);
      expect(GRAPH_CONFIG.FOCUS_DEPTH.DEFAULT).toBeLessThanOrEqual(GRAPH_CONFIG.FOCUS_DEPTH.MAX);
    });

    it('has layout configuration', () => {
      expect(GRAPH_CONFIG.LAYOUT.NODE_REPULSION).toBeGreaterThan(0);
      expect(GRAPH_CONFIG.LAYOUT.IDEAL_EDGE_LENGTH).toBeGreaterThan(0);
      expect(GRAPH_CONFIG.LAYOUT.EDGE_ELASTICITY).toBeGreaterThan(0);
      expect(GRAPH_CONFIG.LAYOUT.GRAVITY).toBeGreaterThan(0);
      expect(GRAPH_CONFIG.LAYOUT.GRAVITY).toBeLessThanOrEqual(1);
      expect(GRAPH_CONFIG.LAYOUT.PADDING).toBeGreaterThanOrEqual(0);
    });

    it('has zoom configuration', () => {
      expect(GRAPH_CONFIG.ZOOM.MIN).toBeGreaterThan(0);
      expect(GRAPH_CONFIG.ZOOM.MAX).toBeGreaterThan(GRAPH_CONFIG.ZOOM.MIN);
      expect(GRAPH_CONFIG.ZOOM.WHEEL_SENSITIVITY).toBeGreaterThan(0);
      expect(GRAPH_CONFIG.ZOOM.WHEEL_SENSITIVITY).toBeLessThanOrEqual(1);
    });

    it('has timing configuration', () => {
      expect(GRAPH_CONFIG.TIMING.DOUBLE_CLICK_DELAY).toBeGreaterThan(100);
      expect(GRAPH_CONFIG.TIMING.DOUBLE_CLICK_DELAY).toBeLessThan(500);
      expect(GRAPH_CONFIG.TIMING.ANIMATION_DURATION).toBeGreaterThan(0);
      expect(GRAPH_CONFIG.TIMING.COPY_FEEDBACK_DURATION).toBeGreaterThan(0);
    });
  });

  describe('MINI_GRAPH_CONFIG', () => {
    it('has layout configuration', () => {
      expect(MINI_GRAPH_CONFIG.LAYOUT.NODE_REPULSION).toBeGreaterThan(0);
      expect(MINI_GRAPH_CONFIG.LAYOUT.IDEAL_EDGE_LENGTH).toBeGreaterThan(0);
    });

    it('has smaller node repulsion than main graph', () => {
      // Mini graph should be more compact
      expect(MINI_GRAPH_CONFIG.LAYOUT.NODE_REPULSION).toBeLessThan(
        GRAPH_CONFIG.LAYOUT.NODE_REPULSION
      );
    });

    it('has zoom configuration', () => {
      expect(MINI_GRAPH_CONFIG.ZOOM.MIN).toBeGreaterThan(0);
      expect(MINI_GRAPH_CONFIG.ZOOM.MAX).toBeGreaterThan(MINI_GRAPH_CONFIG.ZOOM.MIN);
    });

    it('has container height', () => {
      expect(MINI_GRAPH_CONFIG.HEIGHT).toBeGreaterThan(100);
      expect(MINI_GRAPH_CONFIG.HEIGHT).toBeLessThan(500);
    });
  });

  describe('URL_PARAMS', () => {
    it('has valid depth constraints', () => {
      expect(URL_PARAMS.MIN_DEPTH).toBe(1);
      expect(URL_PARAMS.MAX_DEPTH).toBeGreaterThan(URL_PARAMS.MIN_DEPTH);
    });

    it('matches GRAPH_CONFIG focus depth', () => {
      // URL params should be consistent with graph config
      expect(URL_PARAMS.MIN_DEPTH).toBe(GRAPH_CONFIG.FOCUS_DEPTH.MIN);
      expect(URL_PARAMS.MAX_DEPTH).toBe(GRAPH_CONFIG.FOCUS_DEPTH.MAX);
    });
  });
});
