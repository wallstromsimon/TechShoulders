import { useState, useEffect, useMemo, useCallback } from 'react';
import EraSlider from './EraSlider';
import TagCloud from './TagCloud';
import {
  CONTRIBUTION_TYPES,
  WORK_KINDS,
  getWorkKindCounts,
  getYearRange,
  applyFilters,
  type ContributionType,
  type FilterOptions,
} from '../lib/searchFilters';
import {
  getSavedFilters,
  saveFilter,
  deleteFilter,
  hasActiveFilters,
  generateFilterName,
  filtersToQueryString,
  queryStringToFilters,
  type SavedFilter,
} from '../lib/savedFilters';
import type { SearchableNode, Edge, NodeKind } from '../lib/data';

interface FacetedSearchProps {
  nodes: SearchableNode[];
  edges: Edge[];
  allDomains: string[];
  onFilteredNodesChange: (filteredNodes: SearchableNode[]) => void;
}

// Domain counts helper
function getDomainsWithCounts(nodes: SearchableNode[]): Array<{ domain: string; count: number }> {
  const counts = new Map<string, number>();
  for (const node of nodes) {
    for (const domain of node.domains) {
      counts.set(domain, (counts.get(domain) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count);
}

export default function FacetedSearch({
  nodes,
  edges,
  allDomains,
  onFilteredNodesChange,
}: FacetedSearchProps) {
  // Filter state
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<NodeKind[]>([]);
  const [selectedContributions, setSelectedContributions] = useState<ContributionType[]>([]);
  const [selectedWorkKinds, setSelectedWorkKinds] = useState<string[]>([]);
  const [eraRange, setEraRange] = useState<[number, number] | null>(null);

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTagCloud, setShowTagCloud] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Compute derived data
  const yearRange = useMemo(() => getYearRange(nodes), [nodes]);
  const domainsWithCounts = useMemo(() => getDomainsWithCounts(nodes), [nodes]);
  const workKindCounts = useMemo(() => getWorkKindCounts(nodes), [nodes]);

  // Initialize from URL and load saved filters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = queryStringToFilters(window.location.search);
      if (params.domains) setSelectedDomains(params.domains);
      if (params.types) setSelectedTypes(params.types);
      if (params.contributionTypes) setSelectedContributions(params.contributionTypes);
      if (params.workKinds) setSelectedWorkKinds(params.workKinds);
      if (params.eraRange) setEraRange(params.eraRange);

      setSavedFilters(getSavedFilters());
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const filters: SavedFilter['filters'] = {};
    if (selectedDomains.length > 0) filters.domains = selectedDomains;
    if (selectedTypes.length > 0) filters.types = selectedTypes;
    if (selectedContributions.length > 0) filters.contributionTypes = selectedContributions;
    if (selectedWorkKinds.length > 0) filters.workKinds = selectedWorkKinds;
    if (eraRange) filters.eraRange = eraRange;

    const queryString = filtersToQueryString(filters);
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [selectedDomains, selectedTypes, selectedContributions, selectedWorkKinds, eraRange]);

  // Apply filters and notify parent
  useEffect(() => {
    const options: FilterOptions = {
      domains: selectedDomains.length > 0 ? selectedDomains : undefined,
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      contributionTypes: selectedContributions.length > 0 ? selectedContributions : undefined,
      workKinds: selectedWorkKinds.length > 0 ? selectedWorkKinds : undefined,
      eraRange: eraRange || undefined,
    };

    const filtered = applyFilters(nodes, edges, options);
    onFilteredNodesChange(filtered);
  }, [nodes, edges, selectedDomains, selectedTypes, selectedContributions, selectedWorkKinds, eraRange, onFilteredNodesChange]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedDomains([]);
    setSelectedTypes([]);
    setSelectedContributions([]);
    setSelectedWorkKinds([]);
    setEraRange(null);
  }, []);

  // Check if any filters are active
  const hasFilters =
    selectedDomains.length > 0 ||
    selectedTypes.length > 0 ||
    selectedContributions.length > 0 ||
    selectedWorkKinds.length > 0 ||
    eraRange !== null;

  // Save current filters
  const handleSaveFilter = useCallback(() => {
    const filters: SavedFilter['filters'] = {};
    if (selectedDomains.length > 0) filters.domains = selectedDomains;
    if (selectedTypes.length > 0) filters.types = selectedTypes;
    if (selectedContributions.length > 0) filters.contributionTypes = selectedContributions;
    if (selectedWorkKinds.length > 0) filters.workKinds = selectedWorkKinds;
    if (eraRange) filters.eraRange = eraRange;

    const name = filterName.trim() || generateFilterName(filters);
    saveFilter(name, filters);
    setSavedFilters(getSavedFilters());
    setSaveDialogOpen(false);
    setFilterName('');
  }, [selectedDomains, selectedTypes, selectedContributions, selectedWorkKinds, eraRange, filterName]);

  // Apply a saved filter
  const applySavedFilter = useCallback((filter: SavedFilter) => {
    setSelectedDomains(filter.filters.domains || []);
    setSelectedTypes(filter.filters.types || []);
    setSelectedContributions(filter.filters.contributionTypes || []);
    setSelectedWorkKinds(filter.filters.workKinds || []);
    setEraRange(filter.filters.eraRange || null);
  }, []);

  // Delete a saved filter
  const handleDeleteFilter = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteFilter(id);
    setSavedFilters(getSavedFilters());
  }, []);

  const activeFilterCount =
    selectedDomains.length +
    selectedTypes.length +
    selectedContributions.length +
    selectedWorkKinds.length +
    (eraRange ? 1 : 0);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Main controls row */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Saved filters dropdown */}
        {savedFilters.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              const filter = savedFilters.find((f) => f.id === e.target.value);
              if (filter) applySavedFilter(filter);
            }}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #ccc',
              borderRadius: 6,
              fontSize: '0.85rem',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value="">Saved Filters ({savedFilters.length})</option>
            {savedFilters.map((filter) => (
              <option key={filter.id} value={filter.id}>
                {filter.name}
              </option>
            ))}
          </select>
        )}

        {/* Type quick filters */}
        {(['people', 'works', 'institutions'] as const).map((kind) => (
          <button
            key={kind}
            onClick={() => {
              if (selectedTypes.includes(kind)) {
                setSelectedTypes(selectedTypes.filter((t) => t !== kind));
              } else {
                setSelectedTypes([...selectedTypes, kind]);
              }
            }}
            style={{
              padding: '0.5rem 0.75rem',
              border: `1px solid ${selectedTypes.includes(kind) ? '#3498db' : '#ccc'}`,
              borderRadius: 6,
              fontSize: '0.85rem',
              background: selectedTypes.includes(kind) ? '#3498db' : '#fff',
              color: selectedTypes.includes(kind) ? '#fff' : 'inherit',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {kind.charAt(0).toUpperCase() + kind.slice(1)}
          </button>
        ))}

        {/* Tag cloud toggle */}
        <button
          onClick={() => setShowTagCloud(!showTagCloud)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #ccc',
            borderRadius: 6,
            fontSize: '0.85rem',
            background: showTagCloud ? '#f0f0f0' : '#fff',
            cursor: 'pointer',
          }}
        >
          {showTagCloud ? 'Hide' : 'Show'} Domains
        </button>

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #ccc',
            borderRadius: 6,
            fontSize: '0.85rem',
            background: showAdvanced ? '#f0f0f0' : '#fff',
            cursor: 'pointer',
          }}
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
          {activeFilterCount > 0 && (
            <span
              style={{
                marginLeft: 6,
                backgroundColor: '#3498db',
                color: '#fff',
                borderRadius: 10,
                padding: '1px 6px',
                fontSize: '0.75rem',
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear / Save buttons */}
        {hasFilters && (
          <>
            <button
              onClick={clearAllFilters}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #ccc',
                borderRadius: 6,
                fontSize: '0.85rem',
                background: '#fff',
                cursor: 'pointer',
                color: '#e74c3c',
              }}
            >
              Clear All
            </button>
            <button
              onClick={() => setSaveDialogOpen(true)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #27ae60',
                borderRadius: 6,
                fontSize: '0.85rem',
                background: '#27ae60',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Save Filter
            </button>
          </>
        )}
      </div>

      {/* Tag Cloud */}
      {showTagCloud && (
        <div
          style={{
            padding: '1rem',
            background: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            marginBottom: '1rem',
          }}
        >
          <TagCloud
            domains={domainsWithCounts}
            selectedDomains={selectedDomains}
            onDomainClick={(domain) => {
              if (selectedDomains.includes(domain)) {
                setSelectedDomains(selectedDomains.filter((d) => d !== domain));
              } else {
                setSelectedDomains([...selectedDomains, domain]);
              }
            }}
            maxTags={30}
          />
        </div>
      )}

      {/* Advanced filters panel */}
      {showAdvanced && (
        <div
          style={{
            padding: '1rem',
            background: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Domain multi-select */}
            <div style={{ minWidth: 200 }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 600 }}>
                Domains
              </h4>
              <select
                multiple
                value={selectedDomains}
                onChange={(e) => {
                  const options = e.target.options;
                  const selected: string[] = [];
                  for (let i = 0; i < options.length; i++) {
                    if (options[i].selected) {
                      selected.push(options[i].value);
                    }
                  }
                  setSelectedDomains(selected);
                }}
                style={{
                  width: '100%',
                  height: 120,
                  padding: '0.25rem',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  fontSize: '0.85rem',
                }}
              >
                {allDomains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.7rem', color: '#666' }}>
                Ctrl/Cmd + click for multiple
              </p>
            </div>

            {/* Contribution types */}
            <div style={{ minWidth: 180 }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 600 }}>
                Contribution Type
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {(Object.keys(CONTRIBUTION_TYPES) as ContributionType[]).map((type) => (
                  <label
                    key={type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                    title={CONTRIBUTION_TYPES[type].description}
                  >
                    <input
                      type="checkbox"
                      checked={selectedContributions.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContributions([...selectedContributions, type]);
                        } else {
                          setSelectedContributions(selectedContributions.filter((t) => t !== type));
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    {CONTRIBUTION_TYPES[type].label}
                  </label>
                ))}
              </div>
            </div>

            {/* Work kinds (only show if works type is selected or no type filter) */}
            {(selectedTypes.length === 0 || selectedTypes.includes('works')) && (
              <div style={{ minWidth: 180 }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 600 }}>
                  Work Type
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}
                >
                  {WORK_KINDS.filter((kind) => workKindCounts.has(kind)).map((kind) => (
                    <label
                      key={kind}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedWorkKinds.includes(kind)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedWorkKinds([...selectedWorkKinds, kind]);
                          } else {
                            setSelectedWorkKinds(selectedWorkKinds.filter((k) => k !== kind));
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      {kind.charAt(0).toUpperCase() + kind.slice(1)}
                      <span style={{ color: '#999', fontSize: '0.75rem' }}>
                        ({workKindCounts.get(kind)})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Era slider */}
            <div style={{ minWidth: 250, flex: 1 }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 600 }}>
                Time Period
              </h4>
              <EraSlider
                minYear={yearRange.min}
                maxYear={yearRange.max}
                value={eraRange || [yearRange.min, yearRange.max]}
                onChange={(range) => {
                  // Only set if different from full range
                  if (range[0] !== yearRange.min || range[1] !== yearRange.max) {
                    setEraRange(range);
                  } else {
                    setEraRange(null);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Save filter dialog */}
      {saveDialogOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSaveDialogOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: 8,
              minWidth: 300,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0' }}>Save Filter</h3>
            <input
              type="text"
              placeholder={generateFilterName({
                domains: selectedDomains,
                types: selectedTypes,
                contributionTypes: selectedContributions,
                workKinds: selectedWorkKinds,
                eraRange: eraRange || undefined,
              })}
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: 4,
                marginBottom: '1rem',
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSaveDialogOpen(false)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFilter}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: 4,
                  background: '#3498db',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasFilters && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center',
            padding: '0.75rem',
            background: '#e8f4fc',
            border: '1px solid #3498db',
            borderRadius: 6,
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2980b9' }}>
            Active filters:
          </span>
          {selectedTypes.map((type) => (
            <span
              key={type}
              style={{
                padding: '0.25rem 0.5rem',
                background: '#3498db',
                color: '#fff',
                borderRadius: 4,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              {type}
              <button
                onClick={() => setSelectedTypes(selectedTypes.filter((t) => t !== type))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '1rem',
                  lineHeight: 1,
                }}
              >
                x
              </button>
            </span>
          ))}
          {selectedDomains.slice(0, 3).map((domain) => (
            <span
              key={domain}
              style={{
                padding: '0.25rem 0.5rem',
                background: '#27ae60',
                color: '#fff',
                borderRadius: 4,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              {domain}
              <button
                onClick={() => setSelectedDomains(selectedDomains.filter((d) => d !== domain))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '1rem',
                  lineHeight: 1,
                }}
              >
                x
              </button>
            </span>
          ))}
          {selectedDomains.length > 3 && (
            <span style={{ fontSize: '0.8rem', color: '#666' }}>
              +{selectedDomains.length - 3} more domains
            </span>
          )}
          {eraRange && (
            <span
              style={{
                padding: '0.25rem 0.5rem',
                background: '#9b59b6',
                color: '#fff',
                borderRadius: 4,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              {eraRange[0]}-{eraRange[1]}
              <button
                onClick={() => setEraRange(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '1rem',
                  lineHeight: 1,
                }}
              >
                x
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
