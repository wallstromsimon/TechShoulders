import { useEffect, useRef, useCallback } from 'react';
import cytoscape, { type Core, type ElementDefinition } from 'cytoscape';

interface GraphNode {
  id: string;
  name: string;
  kind: 'people' | 'works' | 'institutions';
}

interface GraphEdge {
  source: string;
  target: string;
  kind: 'influence' | 'affiliation';
  label?: string;
}

interface MiniGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  focusNodeId: string;
}

const kindColors: Record<string, string> = {
  people: '#e74c3c',
  works: '#3498db',
  institutions: '#27ae60',
};

const edgeColors: Record<string, string> = {
  influence: '#333333',
  affiliation: '#999999',
};

export default function MiniGraph({ nodes, edges, focusNodeId }: MiniGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  // Get neighbors within 1 hop
  const getNeighborhood = useCallback((nodeId: string, edgeList: GraphEdge[]) => {
    const visited = new Set<string>([nodeId]);

    for (const edge of edgeList) {
      if (edge.source === nodeId) {
        visited.add(edge.target);
      }
      if (edge.target === nodeId) {
        visited.add(edge.source);
      }
    }

    return visited;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Get 1-hop neighborhood of the focus node
    const neighborhoodIds = getNeighborhood(focusNodeId, edges);

    // Filter nodes to neighborhood
    const filteredNodes = nodes.filter(n => neighborhoodIds.has(n.id));

    // Filter edges to only those connecting neighborhood nodes
    const filteredEdges = edges.filter(
      e => neighborhoodIds.has(e.source) && neighborhoodIds.has(e.target)
    );

    const elements: ElementDefinition[] = [
      ...filteredNodes.map(node => ({
        data: {
          id: node.id,
          label: node.name,
          kind: node.kind,
          focused: node.id === focusNodeId,
        },
      })),
      ...filteredEdges.map((edge, idx) => ({
        data: {
          id: `edge-${idx}`,
          source: edge.source,
          target: edge.target,
          kind: edge.kind,
          label: edge.label || '',
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 6,
            'font-size': 10,
            'font-weight': 500,
            'background-color': (ele) => kindColors[ele.data('kind')] || '#888',
            'width': 30,
            'height': 30,
            'border-width': 2,
            'border-color': '#fff',
          } as cytoscape.Css.Node,
        },
        {
          selector: 'node[?focused]',
          style: {
            'width': 40,
            'height': 40,
            'border-width': 3,
            'border-color': '#ffd700',
            'font-weight': 700,
            'font-size': 11,
          } as cytoscape.Css.Node,
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': (ele) => edgeColors[ele.data('kind')] || '#888',
            'target-arrow-color': (ele) => edgeColors[ele.data('kind')] || '#888',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': 8,
            'text-rotation': 'autorotate',
            'text-margin-y': -8,
            'color': '#666',
          },
        },
        {
          selector: 'edge[kind = "affiliation"]',
          style: {
            'line-style': 'dashed',
          },
        },
        {
          selector: 'node:active',
          style: {
            'overlay-opacity': 0.2,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        nodeDimensionsIncludeLabels: true,
        nodeRepulsion: () => 4000,
        idealEdgeLength: () => 80,
        edgeElasticity: () => 100,
        gravity: 0.5,
        padding: 30,
      },
      minZoom: 0.5,
      maxZoom: 2,
      wheelSensitivity: 0.3,
      userPanningEnabled: true,
      userZoomingEnabled: true,
      boxSelectionEnabled: false,
    });

    // Handle double click to navigate
    cy.on('dblclick', 'node', (evt) => {
      const nodeId = evt.target.id();
      window.location.href = `/node/${nodeId}`;
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, focusNodeId, getNeighborhood]);

  return (
    <div style={{ width: '100%' }}>
      {/* Compact Legend */}
      <div style={{
        marginBottom: '0.5rem',
        display: 'flex',
        gap: '0.75rem',
        fontSize: '0.75rem',
        color: '#666',
        flexWrap: 'wrap',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: kindColors.people,
          }} />
          People
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: kindColors.works,
          }} />
          Works
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: kindColors.institutions,
          }} />
          Institutions
        </span>
      </div>

      {/* Graph Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 280,
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          backgroundColor: '#fafafa',
        }}
      />

      {/* Help Text */}
      <p style={{
        marginTop: '0.5rem',
        fontSize: '0.75rem',
        color: '#888',
      }}>
        <strong>Double-click</strong> a node to view details. Drag to pan.
      </p>
    </div>
  );
}
