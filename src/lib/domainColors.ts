/**
 * Domain Color System for TechShoulders
 *
 * Maps domains to color categories for visual consistency across the site.
 * Colors are organized by semantic categories to make related domains visually similar.
 */

export interface DomainColorInfo {
  color: string;
  bgColor: string;
  borderColor: string;
  category: string;
}

// Domain categories with their color schemes
const CATEGORY_COLORS: Record<string, { color: string; bgColor: string; borderColor: string }> = {
  languages: { color: '#7c3aed', bgColor: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.3)' },
  systems: { color: '#0891b2', bgColor: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.3)' },
  web: { color: '#ea580c', bgColor: 'rgba(249, 115, 22, 0.1)', borderColor: 'rgba(249, 115, 22, 0.3)' },
  data: { color: '#059669', bgColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' },
  networking: { color: '#2563eb', bgColor: 'rgba(37, 99, 235, 0.1)', borderColor: 'rgba(37, 99, 235, 0.3)' },
  ai: { color: '#db2777', bgColor: 'rgba(236, 72, 153, 0.1)', borderColor: 'rgba(236, 72, 153, 0.3)' },
  security: { color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.1)', borderColor: 'rgba(220, 38, 38, 0.3)' },
  hardware: { color: '#65a30d', bgColor: 'rgba(132, 204, 22, 0.1)', borderColor: 'rgba(132, 204, 22, 0.3)' },
  community: { color: '#16a34a', bgColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' },
  theory: { color: '#9333ea', bgColor: 'rgba(147, 51, 234, 0.1)', borderColor: 'rgba(147, 51, 234, 0.3)' },
  media: { color: '#c026d3', bgColor: 'rgba(192, 38, 211, 0.1)', borderColor: 'rgba(192, 38, 211, 0.3)' },
  telecom: { color: '#0d9488', bgColor: 'rgba(20, 184, 166, 0.1)', borderColor: 'rgba(20, 184, 166, 0.3)' },
  default: { color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.1)', borderColor: 'rgba(100, 116, 139, 0.3)' },
};

// Map domains to their categories
const DOMAIN_CATEGORY_MAP: Record<string, string> = {
  // Languages
  'Programming Languages': 'languages',
  'Compilers': 'languages',
  'Type Systems': 'languages',
  'Functional Programming': 'languages',
  'Object-Oriented Programming': 'languages',
  'Scripting': 'languages',

  // Systems
  'Operating Systems': 'systems',
  'Systems Programming': 'systems',
  'Computer Architecture': 'systems',
  'Distributed Systems': 'systems',
  'Embedded Systems': 'systems',
  'Unix': 'systems',
  'Linux': 'systems',

  // Web
  'Web Development': 'web',
  'Web Standards': 'web',
  'JavaScript': 'web',
  'JavaScript Frameworks': 'web',
  'Frontend': 'web',
  'Browsers': 'web',
  'HTML': 'web',
  'CSS': 'web',

  // Data
  'Databases': 'data',
  'Data Structures': 'data',
  'Big Data': 'data',
  'Data Science': 'data',
  'Information Retrieval': 'data',
  'Search': 'data',

  // Networking
  'Networking': 'networking',
  'Internet': 'networking',
  'Protocols': 'networking',
  'TCP/IP': 'networking',
  'Email': 'networking',

  // AI/ML
  'Artificial Intelligence': 'ai',
  'Machine Learning': 'ai',
  'Deep Learning': 'ai',
  'Neural Networks': 'ai',
  'Natural Language Processing': 'ai',
  'Computer Vision': 'ai',

  // Security
  'Security': 'security',
  'Cryptography': 'security',
  'Privacy': 'security',
  'Authentication': 'security',

  // Hardware
  'Hardware': 'hardware',
  'Microprocessors': 'hardware',
  'Computer Graphics': 'hardware',
  'Graphics': 'hardware',
  'GPU': 'hardware',

  // Community/Open Source
  'Open Source': 'community',
  'Free Software': 'community',
  'Version Control': 'community',
  'Developer Tools': 'community',
  'Software Engineering': 'community',
  'Collaboration': 'community',

  // Theory/Computing
  'Computing': 'theory',
  'Algorithms': 'theory',
  'Computer Science': 'theory',
  'Mathematics': 'theory',
  'Formal Methods': 'theory',
  'Theory of Computation': 'theory',
  'Information Theory': 'theory',

  // Media
  'Media': 'media',
  'Digital Media': 'media',
  'Publishing': 'media',
  'Content': 'media',
  'Journalism': 'media',

  // Telecommunications
  'Telecommunications': 'telecom',
  'Mobile': 'telecom',
  'Wireless': 'telecom',
  'Radio': 'telecom',
  'Television': 'telecom',
  'Satellite': 'telecom',
};

/**
 * Get the category for a domain
 */
export function getDomainCategory(domain: string): string {
  return DOMAIN_CATEGORY_MAP[domain] || 'default';
}

/**
 * Get full color info for a domain
 */
export function getDomainColorInfo(domain: string): DomainColorInfo {
  const category = getDomainCategory(domain);
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
  return { ...colors, category };
}

/**
 * Get just the primary color for a domain
 */
export function getDomainColor(domain: string): string {
  return getDomainColorInfo(domain).color;
}

/**
 * Convert a domain name to a URL-safe slug
 */
export function getDomainSlug(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Convert a slug back to a domain name (best effort match)
 */
export function slugToDomain(slug: string, allDomains: string[]): string | null {
  const normalizedSlug = slug.toLowerCase();
  return allDomains.find((domain) => getDomainSlug(domain) === normalizedSlug) || null;
}

/**
 * Get all unique categories from a list of domains
 */
export function getUniqueCategories(domains: string[]): string[] {
  const categories = new Set<string>();
  for (const domain of domains) {
    categories.add(getDomainCategory(domain));
  }
  return Array.from(categories).sort();
}

/**
 * Group domains by their category
 */
export function groupDomainsByCategory(domains: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  for (const domain of domains) {
    const category = getDomainCategory(domain);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(domain);
  }
  // Sort domains within each category
  for (const category of Object.keys(grouped)) {
    grouped[category].sort();
  }
  return grouped;
}

/**
 * Category display names for UI
 */
export const CATEGORY_LABELS: Record<string, string> = {
  languages: 'Programming Languages',
  systems: 'Systems & OS',
  web: 'Web Development',
  data: 'Data & Databases',
  networking: 'Networking & Internet',
  ai: 'AI & Machine Learning',
  security: 'Security & Cryptography',
  hardware: 'Hardware & Graphics',
  community: 'Open Source & Tools',
  theory: 'Theory & Computing',
  media: 'Media & Publishing',
  telecom: 'Telecommunications',
  default: 'Other',
};

export { CATEGORY_COLORS };
