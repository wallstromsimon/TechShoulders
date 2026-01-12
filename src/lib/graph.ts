/**
 * Graph Utilities for TechShoulders
 *
 * Shared graph traversal and manipulation functions used by
 * InfluenceGraph and MiniGraph components.
 */

export interface GraphEdge {
  source: string;
  target: string;
  kind: 'influence' | 'affiliation';
  label?: string;
  year?: number;
}

/**
 * Get all nodes within N hops of a given node using BFS.
 *
 * @param nodeId - The starting node ID
 * @param depth - Maximum number of hops (1 = direct neighbors only)
 * @param edges - Array of edges to traverse
 * @returns Set of node IDs within the neighborhood (includes the starting node)
 */
export function getNeighborhood(nodeId: string, depth: number, edges: GraphEdge[]): Set<string> {
  const visited = new Set<string>([nodeId]);
  const queue: Array<{ id: string; d: number }> = [{ id: nodeId, d: 0 }];

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item || item.d >= depth) continue;

    for (const edge of edges) {
      // Check outgoing edges
      if (edge.source === item.id && !visited.has(edge.target)) {
        visited.add(edge.target);
        queue.push({ id: edge.target, d: item.d + 1 });
      }
      // Check incoming edges (graph is undirected for neighborhood purposes)
      if (edge.target === item.id && !visited.has(edge.source)) {
        visited.add(edge.source);
        queue.push({ id: edge.source, d: item.d + 1 });
      }
    }
  }

  return visited;
}

/**
 * Get direct neighbors (1-hop) of a node.
 * Optimized version for when depth is always 1.
 *
 * @param nodeId - The starting node ID
 * @param edges - Array of edges to check
 * @returns Set of node IDs that are directly connected (includes the starting node)
 */
export function getDirectNeighbors(nodeId: string, edges: GraphEdge[]): Set<string> {
  const neighbors = new Set<string>([nodeId]);

  for (const edge of edges) {
    if (edge.source === nodeId) {
      neighbors.add(edge.target);
    }
    if (edge.target === nodeId) {
      neighbors.add(edge.source);
    }
  }

  return neighbors;
}
