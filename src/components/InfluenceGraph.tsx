import { useEffect, useRef, useState } from 'react';
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

interface InfluenceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
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

export default function InfluenceGraph({ nodes, edges }: InfluenceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [includeAffiliations, setIncludeAffiliations] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Build node IDs that are connected
    const filteredEdges = includeAffiliations
      ? edges
      : edges.filter(e => e.kind === 'influence');

    const connectedNodeIds = new Set<string>();
    for (const edge of filteredEdges) {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    }

    // Only include nodes that have connections
    const filteredNodes = nodes.filter(n => connectedNodeIds.has(n.id));

    const elements: ElementDefinition[] = [
      ...filteredNodes.map(node => ({
        data: {
          id: node.id,
          label: node.name,
          kind: node.kind,
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
            'text-margin-y': 8,
            'font-size': 12,
            'font-weight': 500,
            'background-color': (ele) => kindColors[ele.data('kind')] || '#888',
            'width': 40,
            'height': 40,
            'border-width': 2,
            'border-color': '#fff',
            'cursor': 'pointer',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': (ele) => edgeColors[ele.data('kind')] || '#888',
            'target-arrow-color': (ele) => edgeColors[ele.data('kind')] || '#888',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': 10,
            'text-rotation': 'autorotate',
            'text-margin-y': -10,
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
        nodeRepulsion: () => 8000,
        idealEdgeLength: () => 100,
        edgeElasticity: () => 100,
        gravity: 0.25,
        padding: 50,
      },
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    // Navigate on node click
    cy.on('tap', 'node', (evt) => {
      const nodeId = evt.target.id();
      window.location.href = `/node/${nodeId}`;
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, includeAffiliations]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          userSelect: 'none',
        }}>
          <input
            type="checkbox"
            checked={includeAffiliations}
            onChange={(e) => setIncludeAffiliations(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Include affiliations
        </label>
        <div style={{
          display: 'flex',
          gap: '1rem',
          fontSize: '0.85rem',
          color: '#666',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: kindColors.people,
            }} />
            People
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: kindColors.works,
            }} />
            Works
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: kindColors.institutions,
            }} />
            Institutions
          </span>
        </div>
      </div>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 500,
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          backgroundColor: '#fafafa',
        }}
      />
      <p style={{
        marginTop: '0.75rem',
        fontSize: '0.85rem',
        color: '#666',
      }}>
        Click a node to view details. Drag to pan, scroll to zoom.
      </p>
    </div>
  );
}
