import { useEffect, useRef } from 'react';
import cytoscape, { type Core, type ElementDefinition } from 'cytoscape';
import { NODE_COLORS, EDGE_COLORS, type NodeKind } from '../lib/constants';
import { MINI_GRAPH_CONFIG } from '../lib/config';

interface GraphNode {
  id: string;
  name: string;
  kind: NodeKind;
}

interface GraphEdge {
  source: string;
  target: string;
  kind: 'influence' | 'affiliation';
  label?: string;
}

interface DomainGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  height?: number;
}

export default function DomainGraph({ nodes, edges, height = 350 }: DomainGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const elements: ElementDefinition[] = [
      ...nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.name,
          kind: node.kind,
        },
      })),
      ...edges.map((edge, idx) => ({
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
            label: 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 6,
            'font-size': 10,
            'font-weight': 500,
            'background-color': (ele) => NODE_COLORS[ele.data('kind')] || '#888',
            width: 30,
            height: 30,
            'border-width': 2,
            'border-color': '#fff',
          } as cytoscape.Css.Node,
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': (ele) => EDGE_COLORS[ele.data('kind')] || '#888',
            'target-arrow-color': (ele) => EDGE_COLORS[ele.data('kind')] || '#888',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)',
            'font-size': 8,
            'text-rotation': 'autorotate',
            'text-margin-y': -8,
            color: '#666',
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
        nodeRepulsion: () => MINI_GRAPH_CONFIG.LAYOUT.NODE_REPULSION,
        idealEdgeLength: () => MINI_GRAPH_CONFIG.LAYOUT.IDEAL_EDGE_LENGTH,
        edgeElasticity: () => MINI_GRAPH_CONFIG.LAYOUT.EDGE_ELASTICITY,
        gravity: MINI_GRAPH_CONFIG.LAYOUT.GRAVITY,
        padding: MINI_GRAPH_CONFIG.LAYOUT.PADDING,
      },
      minZoom: MINI_GRAPH_CONFIG.ZOOM.MIN,
      maxZoom: MINI_GRAPH_CONFIG.ZOOM.MAX,
      wheelSensitivity: MINI_GRAPH_CONFIG.ZOOM.WHEEL_SENSITIVITY,
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
  }, [nodes, edges]);

  if (nodes.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height,
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          backgroundColor: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
        }}
      >
        No connections to display
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Compact Legend */}
      <div
        style={{
          marginBottom: '0.5rem',
          display: 'flex',
          gap: '0.75rem',
          fontSize: '0.75rem',
          color: '#666',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: NODE_COLORS.people,
            }}
          />
          People
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: NODE_COLORS.works,
            }}
          />
          Works
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: NODE_COLORS.institutions,
            }}
          />
          Institutions
        </span>
      </div>

      {/* Graph Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height,
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          backgroundColor: '#fafafa',
        }}
      />

      {/* Help Text */}
      <p
        style={{
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          color: '#888',
        }}
      >
        <strong>Double-click</strong> a node to view details. Drag to pan, scroll to zoom.
      </p>
    </div>
  );
}
