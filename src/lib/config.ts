/**
 * Configuration Constants for TechShoulders
 *
 * Central location for tunable parameters and magic numbers.
 * Makes it easy to adjust behavior without hunting through components.
 */

/**
 * Graph visualization settings for the main influence graph
 */
export const GRAPH_CONFIG = {
  /** Maximum number of search results to show in dropdown */
  SEARCH_MAX_RESULTS: 8,

  /** Focus mode depth limits (in hops) */
  FOCUS_DEPTH: {
    MIN: 1,
    MAX: 3,
    DEFAULT: 1,
  },

  /** Cytoscape layout parameters for main graph */
  LAYOUT: {
    NODE_REPULSION: 8000,
    IDEAL_EDGE_LENGTH: 100,
    EDGE_ELASTICITY: 100,
    GRAVITY: 0.25,
    PADDING: 50,
  },

  /** Zoom constraints */
  ZOOM: {
    MIN: 0.3,
    MAX: 3,
    WHEEL_SENSITIVITY: 0.3,
  },

  /** Timing constants */
  TIMING: {
    /** Delay to detect double-click vs single-click (ms) */
    DOUBLE_CLICK_DELAY: 250,
    /** Animation duration for zoom/pan (ms) */
    ANIMATION_DURATION: 300,
    /** How long to show "Copied!" message (ms) */
    COPY_FEEDBACK_DURATION: 2000,
  },
} as const;

/**
 * Mini graph visualization settings (for node detail pages)
 */
export const MINI_GRAPH_CONFIG = {
  /** Cytoscape layout parameters (smaller values for compact display) */
  LAYOUT: {
    NODE_REPULSION: 4000,
    IDEAL_EDGE_LENGTH: 80,
    EDGE_ELASTICITY: 100,
    GRAVITY: 0.5,
    PADDING: 30,
  },

  /** Zoom constraints */
  ZOOM: {
    MIN: 0.5,
    MAX: 2,
    WHEEL_SENSITIVITY: 0.3,
  },

  /** Container height in pixels */
  HEIGHT: 280,
} as const;

/**
 * URL parameter parsing constraints
 */
export const URL_PARAMS = {
  /** Maximum depth allowed in URL parameters */
  MAX_DEPTH: 3,
  /** Minimum depth allowed in URL parameters */
  MIN_DEPTH: 1,
} as const;
