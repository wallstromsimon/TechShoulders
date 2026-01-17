import { useMemo } from 'react';

interface TagCloudProps {
  domains: Array<{ domain: string; count: number }>;
  onDomainClick: (domain: string) => void;
  selectedDomains?: string[];
  maxTags?: number;
}

// Domain color mapping (simplified version of domainColors.ts for client-side)
const DOMAIN_COLORS: Record<string, string> = {
  'Programming Languages': '#7c3aed',
  'Compilers': '#7c3aed',
  'Type Systems': '#7c3aed',
  'Operating Systems': '#0891b2',
  'Systems Programming': '#0891b2',
  'Unix': '#0891b2',
  'Linux': '#0891b2',
  'Web Development': '#ea580c',
  'Web Standards': '#ea580c',
  'JavaScript': '#ea580c',
  'JavaScript Frameworks': '#ea580c',
  'Databases': '#059669',
  'Data Structures': '#059669',
  'Big Data': '#059669',
  'Networking': '#2563eb',
  'Internet': '#2563eb',
  'Protocols': '#2563eb',
  'Artificial Intelligence': '#db2777',
  'Machine Learning': '#db2777',
  'Deep Learning': '#db2777',
  'Security': '#dc2626',
  'Cryptography': '#dc2626',
  'Open Source': '#16a34a',
  'Version Control': '#16a34a',
  'Developer Tools': '#16a34a',
  'Computing': '#9333ea',
  'Algorithms': '#9333ea',
  'Computer Science': '#9333ea',
  'Telecommunications': '#0d9488',
  'Mobile': '#0d9488',
};

function getDomainColor(domain: string): string {
  return DOMAIN_COLORS[domain] || '#64748b';
}

export default function TagCloud({
  domains,
  onDomainClick,
  selectedDomains = [],
  maxTags = 20,
}: TagCloudProps) {
  const displayDomains = useMemo(() => {
    return domains.slice(0, maxTags);
  }, [domains, maxTags]);

  const { minCount, maxCount } = useMemo(() => {
    if (displayDomains.length === 0) return { minCount: 0, maxCount: 1 };
    const counts = displayDomains.map((d) => d.count);
    return {
      minCount: Math.min(...counts),
      maxCount: Math.max(...counts),
    };
  }, [displayDomains]);

  const getSize = (count: number): number => {
    if (maxCount === minCount) return 1;
    const normalized = (count - minCount) / (maxCount - minCount);
    return 0.75 + normalized * 0.75; // 0.75rem to 1.5rem
  };

  if (displayDomains.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'center',
        padding: '0.5rem 0',
      }}
    >
      {displayDomains.map(({ domain, count }) => {
        const isSelected = selectedDomains.includes(domain);
        const color = getDomainColor(domain);
        const size = getSize(count);

        return (
          <button
            key={domain}
            onClick={() => onDomainClick(domain)}
            title={`${domain} (${count} items) - Click to ${isSelected ? 'remove' : 'add'} filter`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              fontSize: `${size}rem`,
              fontWeight: isSelected ? 600 : 400,
              color: isSelected ? '#fff' : color,
              backgroundColor: isSelected ? color : `${color}15`,
              border: `1px solid ${isSelected ? color : `${color}40`}`,
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = `${color}30`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = `${color}15`;
              }
            }}
          >
            {domain}
            <span
              style={{
                fontSize: '0.7em',
                opacity: 0.7,
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
