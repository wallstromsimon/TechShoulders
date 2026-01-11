import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
  year?: number;
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
  const [includeAffiliations, setIncludeAffiliations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedNode, setFocusedNode] = useState<string | null>(null);
  const [focusDepth, setFocusDepth] = useState(1);
  const [showLegend, setShowLegend] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<{
    sourceId: string;
    targetId: string;
    sourceName: string;
    targetName: string;
    label: string;
    year?: number;
  } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter nodes for search dropdown
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return nodes
      .filter(n => n.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [nodes, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get neighbors within N hops
  const getNeighborhood = useCallback((nodeId: string, depth: number, edgeList: GraphEdge[]) => {
    const visited = new Set<string>([nodeId]);
    const queue = [{ id: nodeId, d: 0 }];

    while (queue.length > 0) {
      const { id, d } = queue.shift()!;
      if (d >= depth) continue;

      for (const edge of edgeList) {
        if (edge.source === id && !visited.has(edge.target)) {
          visited.add(edge.target);
          queue.push({ id: edge.target, d: d + 1 });
        }
        if (edge.target === id && !visited.has(edge.source)) {
          visited.add(edge.source);
          queue.push({ id: edge.source, d: d + 1 });
        }
      }
    }
    return visited;
  }, []);

  // Handle node selection from search
  const handleSelectNode = useCallback((nodeId: string) => {
    setFocusedNode(nodeId);
    setSearchQuery('');
    setShowDropdown(false);

    // Center on the node if cytoscape is ready
    if (cyRef.current) {
      const node = cyRef.current.$(`#${nodeId}`);
      if (node.length > 0) {
        cyRef.current.animate({
          center: { eles: node },
          zoom: 1.5,
        }, { duration: 300 });
      }
    }
  }, []);

  // Clear focus mode
  const clearFocus = useCallback(() => {
    setFocusedNode(null);
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50);
    }
  }, []);

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
    let filteredNodes = nodes.filter(n => connectedNodeIds.has(n.id));

    // If focus mode is active, filter to neighborhood
    let neighborhoodNodes: Set<string> | null = null;
    if (focusedNode && connectedNodeIds.has(focusedNode)) {
      neighborhoodNodes = getNeighborhood(focusedNode, focusDepth, filteredEdges);
      filteredNodes = filteredNodes.filter(n => neighborhoodNodes!.has(n.id));
    }

    // Filter edges to only include those between visible nodes
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    const visibleEdges = filteredEdges.filter(
      e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );

    const elements: ElementDefinition[] = [
      ...filteredNodes.map(node => ({
        data: {
          id: node.id,
          label: node.name,
          kind: node.kind,
          focused: node.id === focusedNode,
        },
      })),
      ...visibleEdges.map((edge, idx) => ({
        data: {
          id: `edge-${idx}`,
          source: edge.source,
          target: edge.target,
          kind: edge.kind,
          label: edge.label || '',
          year: edge.year,
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
          } as cytoscape.Css.Node,
        },
        {
          selector: 'node[?focused]',
          style: {
            'width': 50,
            'height': 50,
            'border-width': 4,
            'border-color': '#ffd700',
            'font-weight': 700,
          } as cytoscape.Css.Node,
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

    // Handle node clicks - focus mode on single click, navigate on double click
    let clickTimeout: ReturnType<typeof setTimeout> | null = null;
    cy.on('tap', 'node', (evt) => {
      const nodeId = evt.target.id();
      setSelectedEdge(null); // Clear edge selection when clicking a node

      if (clickTimeout) {
        // Double click - navigate to node page
        clearTimeout(clickTimeout);
        clickTimeout = null;
        window.location.href = `/node/${nodeId}`;
      } else {
        // Single click - set focus (with delay to detect double click)
        clickTimeout = setTimeout(() => {
          clickTimeout = null;
          setFocusedNode(nodeId);
        }, 250);
      }
    });

    // Handle edge clicks - show explanation panel
    cy.on('tap', 'edge', (evt) => {
      const edgeData = evt.target.data();
      const sourceNode = nodes.find(n => n.id === edgeData.source);
      const targetNode = nodes.find(n => n.id === edgeData.target);

      if (sourceNode && targetNode) {
        setSelectedEdge({
          sourceId: edgeData.source,
          targetId: edgeData.target,
          sourceName: sourceNode.name,
          targetName: targetNode.name,
          label: edgeData.label || '',
          year: edgeData.year,
        });
      }
    });

    // Clear edge selection when clicking on background
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedEdge(null);
      }
    });

    cyRef.current = cy;

    return () => {
      if (clickTimeout) clearTimeout(clickTimeout);
      cy.destroy();
    };
  }, [nodes, edges, includeAffiliations, focusedNode, focusDepth, getNeighborhood]);

  // Get the focused node's name for display
  const focusedNodeName = focusedNode
    ? nodes.find(n => n.id === focusedNode)?.name
    : null;

  return (
    <div style={{ width: '100%' }}>
      {/* Controls Row */}
      <div style={{
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        {/* Search Box */}
        <div ref={searchRef} style={{ position: 'relative', minWidth: 200 }}>
          <input
            type="text"
            placeholder="Find node (e.g., Linus, Git...)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #ccc',
              borderRadius: 6,
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          {showDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: 6,
              marginTop: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 100,
              maxHeight: 240,
              overflowY: 'auto',
            }}>
              {searchResults.map(node => (
                <button
                  key={node.id}
                  onClick={() => handleSelectNode(node.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: kindColors[node.kind],
                    flexShrink: 0,
                  }} />
                  <span>{node.name}</span>
                  <span style={{ color: '#999', fontSize: '0.8rem', marginLeft: 'auto' }}>
                    {node.kind}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Affiliations Toggle */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          userSelect: 'none',
          padding: '0.5rem 0',
        }}>
          <input
            type="checkbox"
            checked={includeAffiliations}
            onChange={(e) => setIncludeAffiliations(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Include affiliations
        </label>

        {/* Legend Toggle */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #ccc',
            borderRadius: 6,
            backgroundColor: showLegend ? '#f0f0f0' : '#fff',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          {showLegend ? 'Hide' : 'Show'} Legend
        </button>
      </div>

      {/* Focus Mode Controls */}
      {focusedNode && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#fffbe6',
          border: '1px solid #ffd700',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontWeight: 500 }}>
            Focus: <strong>{focusedNodeName}</strong>
          </span>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
          }}>
            Depth:
            <select
              value={focusDepth}
              onChange={(e) => setFocusDepth(Number(e.target.value))}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            >
              <option value={1}>1 hop</option>
              <option value={2}>2 hops</option>
              <option value={3}>3 hops</option>
            </select>
          </label>
          <button
            onClick={clearFocus}
            style={{
              padding: '0.35rem 0.75rem',
              border: '1px solid #ccc',
              borderRadius: 4,
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Show All
          </button>
          <a
            href={`/node/${focusedNode}`}
            style={{
              marginLeft: 'auto',
              fontSize: '0.85rem',
              color: '#0066cc',
            }}
          >
            View Details →
          </a>
        </div>
      )}

      {/* Edge Explanation Panel */}
      {selectedEdge && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#e8f4fc',
          border: '1px solid #3498db',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.95rem' }}>
            <strong>{selectedEdge.sourceName}</strong>
            <span style={{ margin: '0 0.5rem', color: '#666' }}>&rarr;</span>
            <strong>{selectedEdge.targetName}</strong>
            <span style={{ marginLeft: '0.5rem', color: '#555' }}>
              ({selectedEdge.label}{selectedEdge.year ? `, ${selectedEdge.year}` : ''})
            </span>
          </span>
          <button
            onClick={() => setSelectedEdge(null)}
            style={{
              marginLeft: 'auto',
              padding: '0.25rem 0.5rem',
              border: '1px solid #ccc',
              borderRadius: 4,
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Expanded Legend */}
      {showLegend && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e0e0e0',
          borderRadius: 8,
        }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Node Types */}
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 600 }}>
                Node Types
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    display: 'inline-block',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: kindColors.people,
                  }} />
                  <strong>People</strong> – innovators, founders, researchers
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    display: 'inline-block',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: kindColors.works,
                  }} />
                  <strong>Works</strong> – projects, inventions, papers
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    display: 'inline-block',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: kindColors.institutions,
                  }} />
                  <strong>Institutions</strong> – universities, companies, labs
                </span>
              </div>
            </div>

            {/* Edge Types */}
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 600 }}>
                Edge Types
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    display: 'inline-block',
                    width: 24,
                    height: 2,
                    backgroundColor: edgeColors.influence,
                  }} />
                  <strong>Influence</strong> – created, invented, inspired, built
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    display: 'inline-block',
                    width: 24,
                    height: 2,
                    backgroundColor: edgeColors.affiliation,
                    backgroundImage: 'repeating-linear-gradient(90deg, #999 0, #999 4px, transparent 4px, transparent 8px)',
                  }} />
                  <strong>Affiliation</strong> – studied at, worked at, founded
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Legend (when expanded legend is hidden) */}
      {!showLegend && (
        <div style={{
          marginBottom: '0.75rem',
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
      )}

      {/* Graph Container */}
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

      {/* Help Text */}
      <p style={{
        marginTop: '0.75rem',
        fontSize: '0.85rem',
        color: '#666',
      }}>
        <strong>Click</strong> a node to focus on its neighborhood.{' '}
        <strong>Click</strong> an edge to see why it&apos;s connected.{' '}
        <strong>Double-click</strong> a node to view details.{' '}
        Drag to pan, scroll to zoom.
      </p>
    </div>
  );
}
