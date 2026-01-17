import { useState, useEffect, useMemo, useCallback } from 'react';
import FacetedSearch from './FacetedSearch';
import type { SearchableNode, Edge, NodeKind } from '../lib/data';

interface BrowseClientProps {
  nodes: SearchableNode[];
  edges: Edge[];
  allDomains: string[];
}

export default function BrowseClient({ nodes, edges, allDomains }: BrowseClientProps) {
  const [filteredNodes, setFilteredNodes] = useState<SearchableNode[]>(nodes);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchableNode[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Initialize Fuse.js for search
  const [fuse, setFuse] = useState<any>(null);

  useEffect(() => {
    import('https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.mjs' as any).then(
      ({ default: Fuse }) => {
        setFuse(
          new Fuse(nodes, {
            keys: [
              { name: 'name', weight: 2 },
              { name: 'subtitle', weight: 1 },
              { name: 'domains', weight: 1.5 },
              { name: 'era', weight: 0.5 },
            ],
            threshold: 0.3,
          })
        );
      }
    );
  }, [nodes]);

  // Handle search
  useEffect(() => {
    if (!fuse || !searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = fuse.search(searchQuery).slice(0, 8);
    setSearchResults(results.map((r: any) => r.item));
  }, [fuse, searchQuery]);

  // Apply search filter to already filtered nodes
  const displayedNodes = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return filteredNodes;
    }

    if (!fuse) return filteredNodes;

    const searchMatchIds = new Set(
      fuse.search(searchQuery).map((r: any) => r.item.id)
    );
    return filteredNodes.filter((n) => searchMatchIds.has(n.id));
  }, [filteredNodes, searchQuery, fuse]);

  // Sort by name
  const sortedNodes = useMemo(() => {
    return [...displayedNodes].sort((a, b) => a.name.localeCompare(b.name));
  }, [displayedNodes]);

  const handleFilteredNodesChange = useCallback((filtered: SearchableNode[]) => {
    setFilteredNodes(filtered);
  }, []);

  // Get node badge color
  const getBadgeStyle = (kind: NodeKind) => {
    const styles: Record<NodeKind, { bg: string; color: string }> = {
      people: { bg: '#fce4e4', color: '#c0392b' },
      works: { bg: '#e3f2fd', color: '#1565c0' },
      institutions: { bg: '#e8f5e9', color: '#2e7d32' },
    };
    return styles[kind];
  };

  // Get border color
  const getBorderColor = (kind: NodeKind) => {
    const colors: Record<NodeKind, string> = {
      people: '#e74c3c',
      works: '#3498db',
      institutions: '#27ae60',
    };
    return colors[kind];
  };

  return (
    <div>
      {/* Search box */}
      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search by name, domain, or keyword..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchDropdown(true);
          }}
          onFocus={() => setShowSearchDropdown(true)}
          onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            fontSize: '1rem',
            border: '2px solid #e0e0e0',
            borderRadius: 8,
            background: '#fff',
            outline: 'none',
          }}
        />
        {showSearchDropdown && searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              marginTop: 4,
              zIndex: 100,
              maxHeight: 400,
              overflowY: 'auto',
            }}
          >
            {searchResults.map((node) => {
              const badge = getBadgeStyle(node.kind);
              return (
                <a
                  key={node.id}
                  href={`/node/${node.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    borderBottom: '1px solid #e0e0e0',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      padding: '0.125rem 0.375rem',
                      borderRadius: 3,
                      background: badge.bg,
                      color: badge.color,
                    }}
                  >
                    {node.kind === 'people'
                      ? 'Person'
                      : node.kind === 'works'
                      ? 'Work'
                      : 'Institution'}
                  </span>
                  <span style={{ fontWeight: 500 }}>{node.name}</span>
                  {node.subtitle && (
                    <span style={{ color: '#666', fontSize: '0.85rem', marginLeft: 'auto' }}>
                      {node.subtitle}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Faceted search */}
      <FacetedSearch
        nodes={nodes}
        edges={edges}
        allDomains={allDomains}
        onFilteredNodesChange={handleFilteredNodesChange}
      />

      {/* Results count */}
      <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
        {sortedNodes.length} item{sortedNodes.length !== 1 ? 's' : ''}
        {sortedNodes.length !== nodes.length && ` (filtered from ${nodes.length})`}
      </div>

      {/* Card grid */}
      {sortedNodes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
          <p style={{ marginBottom: '1rem' }}>No items match your filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilteredNodes(nodes);
            }}
            style={{
              padding: '0.5rem 1.5rem',
              fontSize: '0.9rem',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {sortedNodes.map((node) => {
            const badge = getBadgeStyle(node.kind);
            const borderColor = getBorderColor(node.kind);

            return (
              <a
                key={node.id}
                href={`/node/${node.id}`}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderLeft: `3px solid ${borderColor}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={{ padding: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: 4,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: badge.bg,
                        color: badge.color,
                      }}
                    >
                      {node.kind === 'people'
                        ? 'Person'
                        : node.kind === 'works'
                        ? 'Work'
                        : 'Institution'}
                    </span>
                    {node.year && (
                      <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 500 }}>
                        {node.year}
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      margin: '0 0 0.25rem 0',
                      lineHeight: 1.3,
                    }}
                  >
                    {node.name}
                  </h3>

                  {node.subtitle && (
                    <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 0.25rem 0' }}>
                      {node.subtitle}
                    </p>
                  )}

                  {node.era && (
                    <p style={{ fontSize: '0.8rem', color: '#999', margin: 0 }}>{node.era}</p>
                  )}

                  {node.domains.length > 0 && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.25rem',
                      }}
                    >
                      {node.domains.slice(0, 3).map((domain) => (
                        <span
                          key={domain}
                          style={{
                            padding: '0.125rem 0.375rem',
                            background: '#f5f5f5',
                            border: '1px solid #e0e0e0',
                            borderRadius: 3,
                            fontSize: '0.7rem',
                            color: '#666',
                          }}
                        >
                          {domain}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
