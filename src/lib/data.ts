import { getCollection, type CollectionEntry } from 'astro:content';

export type NodeKind = 'people' | 'works' | 'institutions';
export type EdgeKind = 'influence' | 'affiliation';

export interface Edge {
  source: string;
  target: string;
  kind: EdgeKind;
  label?: string;
  year?: number;
}

export type PersonEntry = CollectionEntry<'people'>;
export type WorkEntry = CollectionEntry<'works'>;
export type InstitutionEntry = CollectionEntry<'institutions'>;
export type PackEntry = CollectionEntry<'packs'>;

export type AnyEntry = PersonEntry | WorkEntry | InstitutionEntry;

export interface NodeResult {
  kind: NodeKind;
  entry: AnyEntry;
}

export async function loadAll() {
  const [people, works, institutions] = await Promise.all([
    getCollection('people'),
    getCollection('works'),
    getCollection('institutions'),
  ]);

  return { people, works, institutions };
}

export async function findNodeById(id: string): Promise<NodeResult | null> {
  const { people, works, institutions } = await loadAll();

  const person = people.find((p) => p.data.id === id);
  if (person) return { kind: 'people', entry: person };

  const work = works.find((w) => w.data.id === id);
  if (work) return { kind: 'works', entry: work };

  const institution = institutions.find((i) => i.data.id === id);
  if (institution) return { kind: 'institutions', entry: institution };

  return null;
}

export async function listNodes(kind: NodeKind): Promise<AnyEntry[]> {
  const collection = await getCollection(kind);
  return collection.sort((a, b) => a.data.name.localeCompare(b.data.name));
}

export async function getAllNodeIds(): Promise<string[]> {
  const { people, works, institutions } = await loadAll();
  return [
    ...people.map((p) => p.data.id),
    ...works.map((w) => w.data.id),
    ...institutions.map((i) => i.data.id),
  ];
}

export function getKindLabel(kind: NodeKind): string {
  const labels: Record<NodeKind, string> = {
    people: 'Person',
    works: 'Work',
    institutions: 'Institution',
  };
  return labels[kind];
}

export function getKindPluralLabel(kind: NodeKind): string {
  const labels: Record<NodeKind, string> = {
    people: 'People',
    works: 'Works',
    institutions: 'Institutions',
  };
  return labels[kind];
}

export interface SearchableNode {
  id: string;
  name: string;
  kind: NodeKind;
  subtitle?: string;
  domains: string[];
  era?: string;
  year?: number;
  location?: string;
  imageUrl?: string;
}

export async function buildSearchIndex(): Promise<SearchableNode[]> {
  const { people, works, institutions } = await loadAll();

  const nodes: SearchableNode[] = [];

  for (const person of people) {
    nodes.push({
      id: person.data.id,
      name: person.data.name,
      kind: 'people',
      subtitle: person.data.title,
      domains: person.data.domains,
      era: person.data.era,
      imageUrl: person.data.image?.file.src,
    });
  }

  for (const work of works) {
    nodes.push({
      id: work.data.id,
      name: work.data.name,
      kind: 'works',
      subtitle: work.data.kind,
      domains: work.data.domains,
      era: work.data.era,
      year: work.data.year,
    });
  }

  for (const institution of institutions) {
    nodes.push({
      id: institution.data.id,
      name: institution.data.name,
      kind: 'institutions',
      subtitle: institution.data.kind,
      domains: institution.data.domains,
      era: institution.data.era,
      location: institution.data.location,
    });
  }

  return nodes;
}

export function getAllDomains(nodes: SearchableNode[]): string[] {
  const domains = new Set<string>();
  for (const node of nodes) {
    for (const domain of node.domains) {
      domains.add(domain);
    }
  }
  return Array.from(domains).sort();
}

export function getAllEras(nodes: SearchableNode[]): string[] {
  const eras = new Set<string>();
  for (const node of nodes) {
    if (node.era) {
      eras.add(node.era);
    }
  }
  return Array.from(eras).sort();
}

// Extract edges from inline frontmatter of all content entries
export async function loadAllEdges(): Promise<Edge[]> {
  const [people, works, institutions, packs] = await Promise.all([
    getCollection('people'),
    getCollection('works'),
    getCollection('institutions'),
    getCollection('packs'),
  ]);

  const allEdges: Edge[] = [];

  // Extract edges from each content type
  for (const person of people) {
    for (const edge of person.data.edges) {
      allEdges.push({
        source: person.data.id,
        target: edge.target,
        kind: edge.kind,
        label: edge.label,
      });
    }
  }

  for (const work of works) {
    for (const edge of work.data.edges) {
      allEdges.push({
        source: work.data.id,
        target: edge.target,
        kind: edge.kind,
        label: edge.label,
      });
    }
  }

  for (const institution of institutions) {
    for (const edge of institution.data.edges) {
      allEdges.push({
        source: institution.data.id,
        target: edge.target,
        kind: edge.kind,
        label: edge.label,
      });
    }
  }

  for (const pack of packs) {
    for (const edge of pack.data.edges) {
      allEdges.push({
        source: pack.data.id,
        target: edge.target,
        kind: edge.kind,
        label: edge.label,
      });
    }
  }

  return allEdges;
}

export async function loadEdgesByKind(kind: EdgeKind): Promise<Edge[]> {
  const allEdges = await loadAllEdges();
  return allEdges.filter((edge) => edge.kind === kind);
}

export async function getOutgoingEdges(nodeId: string): Promise<Edge[]> {
  const allEdges = await loadAllEdges();
  return allEdges.filter((edge) => edge.source === nodeId);
}

export async function getIncomingEdges(nodeId: string): Promise<Edge[]> {
  const allEdges = await loadAllEdges();
  return allEdges.filter((edge) => edge.target === nodeId);
}

export interface GraphData {
  nodes: SearchableNode[];
  edges: Edge[];
}

export async function buildGraphData(includeAffiliations: boolean = true): Promise<GraphData> {
  const [nodes, allEdges] = await Promise.all([buildSearchIndex(), loadAllEdges()]);

  const edges = includeAffiliations ? allEdges : allEdges.filter((e) => e.kind === 'influence');

  return { nodes, edges };
}

// Pack-related functions

export async function loadAllPacks(): Promise<PackEntry[]> {
  const packs = await getCollection('packs');
  return packs.sort((a, b) => a.data.name.localeCompare(b.data.name));
}

export async function getPackById(id: string): Promise<PackEntry | undefined> {
  const packs = await getCollection('packs');
  return packs.find((p) => p.data.id === id);
}

export async function getPackCards(pack: PackEntry): Promise<SearchableNode[]> {
  const allNodes = await buildSearchIndex();
  const cardIds = pack.data.cards;

  // Return nodes in the order specified by the pack's cards array (learning path order)
  const orderedNodes: SearchableNode[] = [];
  for (const cardId of cardIds) {
    const node = allNodes.find((n) => n.id === cardId);
    if (node) {
      orderedNodes.push(node);
    }
  }

  return orderedNodes;
}

export async function buildPackGraphData(
  pack: PackEntry,
  includeAffiliations: boolean = true
): Promise<GraphData> {
  const [allNodes, allEdges] = await Promise.all([buildSearchIndex(), loadAllEdges()]);

  const cardIds = new Set(pack.data.cards);

  // Filter nodes to only those in the pack
  const nodes = allNodes.filter((n) => cardIds.has(n.id));

  // Filter edges to only those connecting pack nodes
  const edges = allEdges.filter((edge) => {
    const sourceInPack = cardIds.has(edge.source);
    const targetInPack = cardIds.has(edge.target);

    // Include edge if both endpoints are in the pack
    if (!sourceInPack || !targetInPack) return false;

    // Filter by affiliation preference
    if (!includeAffiliations && edge.kind === 'affiliation') return false;

    return true;
  });

  return { nodes, edges };
}

export interface PackStats {
  total: number;
  people: number;
  works: number;
  institutions: number;
}

export async function getPackStats(pack: PackEntry): Promise<PackStats> {
  const cards = await getPackCards(pack);

  return {
    total: cards.length,
    people: cards.filter((c) => c.kind === 'people').length,
    works: cards.filter((c) => c.kind === 'works').length,
    institutions: cards.filter((c) => c.kind === 'institutions').length,
  };
}

export async function buildNodeNeighborhoodData(nodeId: string): Promise<GraphData> {
  const [allNodes, allEdges] = await Promise.all([buildSearchIndex(), loadAllEdges()]);

  // Get all edges connected to this node
  const connectedEdges = allEdges.filter(
    (edge) => edge.source === nodeId || edge.target === nodeId
  );

  // Get all connected node IDs (1-hop neighborhood)
  const neighborIds = new Set<string>([nodeId]);
  for (const edge of connectedEdges) {
    neighborIds.add(edge.source);
    neighborIds.add(edge.target);
  }

  // Filter nodes to neighborhood
  const nodes = allNodes.filter((n) => neighborIds.has(n.id));

  // Include all edges that connect neighborhood nodes
  const edges = allEdges.filter(
    (edge) => neighborIds.has(edge.source) && neighborIds.has(edge.target)
  );

  return { nodes, edges };
}

// Domain-related functions

export interface DomainStats {
  domain: string;
  total: number;
  people: number;
  works: number;
  institutions: number;
}

export function getDomainCounts(nodes: SearchableNode[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const node of nodes) {
    for (const domain of node.domains) {
      counts.set(domain, (counts.get(domain) || 0) + 1);
    }
  }
  return counts;
}

export function getDomainStats(domain: string, nodes: SearchableNode[]): DomainStats {
  const domainNodes = nodes.filter((n) => n.domains.includes(domain));
  return {
    domain,
    total: domainNodes.length,
    people: domainNodes.filter((n) => n.kind === 'people').length,
    works: domainNodes.filter((n) => n.kind === 'works').length,
    institutions: domainNodes.filter((n) => n.kind === 'institutions').length,
  };
}

export function getNodesForDomain(domain: string, nodes: SearchableNode[]): SearchableNode[] {
  return nodes.filter((n) => n.domains.includes(domain));
}

export async function buildDomainGraphData(
  domain: string,
  includeAffiliations: boolean = true
): Promise<GraphData> {
  const [allNodes, allEdges] = await Promise.all([buildSearchIndex(), loadAllEdges()]);

  // Get nodes in this domain
  const domainNodes = allNodes.filter((n) => n.domains.includes(domain));
  const domainNodeIds = new Set(domainNodes.map((n) => n.id));

  // Filter edges to only those connecting domain nodes
  const edges = allEdges.filter((edge) => {
    const sourceInDomain = domainNodeIds.has(edge.source);
    const targetInDomain = domainNodeIds.has(edge.target);

    // Include edge if both endpoints are in the domain
    if (!sourceInDomain || !targetInDomain) return false;

    // Filter by affiliation preference
    if (!includeAffiliations && edge.kind === 'affiliation') return false;

    return true;
  });

  return { nodes: domainNodes, edges };
}

export function getRelatedDomains(
  selectedDomains: string[],
  nodes: SearchableNode[],
  limit: number = 5
): Array<{ domain: string; count: number }> {
  // Find nodes that have the selected domains
  const matchingNodes = nodes.filter((n) =>
    selectedDomains.some((d) => n.domains.includes(d))
  );

  // Count co-occurring domains
  const coOccurrence = new Map<string, number>();
  for (const node of matchingNodes) {
    for (const domain of node.domains) {
      if (!selectedDomains.includes(domain)) {
        coOccurrence.set(domain, (coOccurrence.get(domain) || 0) + 1);
      }
    }
  }

  // Return top related domains
  return Array.from(coOccurrence.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([domain, count]) => ({ domain, count }));
}

export function getDomainsWithCounts(nodes: SearchableNode[]): Array<{ domain: string; count: number }> {
  const counts = getDomainCounts(nodes);
  return Array.from(counts.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count);
}

// Topic-related functions

export interface TopicDefinition {
  slug: string;
  name: string;
  description: string;
  domains: string[];
  icon: string;
}

export function getBuiltInTopics(): TopicDefinition[] {
  return [
    {
      slug: 'programming-languages',
      name: 'Programming Languages',
      description: 'The creators and languages that define how we communicate with computers.',
      domains: ['Programming Languages', 'Compilers', 'Type Systems', 'Functional Programming'],
      icon: '{ }',
    },
    {
      slug: 'operating-systems',
      name: 'Operating Systems',
      description: 'The foundational software that powers our devices, from Unix to modern systems.',
      domains: ['Operating Systems', 'Unix', 'Linux', 'Systems Programming'],
      icon: '~$',
    },
    {
      slug: 'web-development',
      name: 'Web Development',
      description: 'The technologies, standards, and people who built the modern web.',
      domains: ['Web Development', 'Web Standards', 'JavaScript', 'JavaScript Frameworks', 'Browsers'],
      icon: '</>',
    },
    {
      slug: 'databases-data',
      name: 'Databases & Data',
      description: 'How we store, query, and manage the world\'s information.',
      domains: ['Databases', 'Data Structures', 'Big Data', 'Data Science', 'Information Retrieval'],
      icon: '|||',
    },
    {
      slug: 'networking-internet',
      name: 'Networking & Internet',
      description: 'The protocols and infrastructure connecting billions of devices.',
      domains: ['Networking', 'Internet', 'Protocols', 'TCP/IP', 'Email'],
      icon: '://',
    },
    {
      slug: 'artificial-intelligence',
      name: 'Artificial Intelligence',
      description: 'Machine learning, neural networks, and the quest for intelligent systems.',
      domains: ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Neural Networks'],
      icon: '(AI)',
    },
    {
      slug: 'open-source',
      name: 'Open Source & Tools',
      description: 'The movement and tools that democratized software development.',
      domains: ['Open Source', 'Free Software', 'Version Control', 'Developer Tools'],
      icon: 'OS',
    },
    {
      slug: 'security-cryptography',
      name: 'Security & Cryptography',
      description: 'Protecting data, privacy, and systems in the digital age.',
      domains: ['Security', 'Cryptography', 'Privacy', 'Authentication'],
      icon: '[*]',
    },
    {
      slug: 'computer-graphics',
      name: 'Computer Graphics',
      description: 'Visual computing from early displays to modern GPUs and 3D rendering.',
      domains: ['Computer Graphics', 'Graphics', 'GPU', 'Hardware'],
      icon: '3D',
    },
    {
      slug: 'computing-theory',
      name: 'Computing Theory',
      description: 'The mathematical and theoretical foundations of computer science.',
      domains: ['Computing', 'Algorithms', 'Computer Science', 'Mathematics', 'Theory of Computation'],
      icon: 'f(x)',
    },
    {
      slug: 'telecommunications',
      name: 'Telecommunications',
      description: 'From telegraph to satellites - the history of global communication.',
      domains: ['Telecommunications', 'Mobile', 'Wireless', 'Radio', 'Satellite'],
      icon: '((()))',
    },
  ];
}

export interface TopicStats {
  total: number;
  people: number;
  works: number;
  institutions: number;
}

export function getTopicStats(topic: TopicDefinition, nodes: SearchableNode[]): TopicStats {
  const topicNodes = nodes.filter((n) =>
    n.domains.some((d) => topic.domains.includes(d))
  );
  return {
    total: topicNodes.length,
    people: topicNodes.filter((n) => n.kind === 'people').length,
    works: topicNodes.filter((n) => n.kind === 'works').length,
    institutions: topicNodes.filter((n) => n.kind === 'institutions').length,
  };
}

export function getNodesForTopic(topic: TopicDefinition, nodes: SearchableNode[]): SearchableNode[] {
  return nodes.filter((n) =>
    n.domains.some((d) => topic.domains.includes(d))
  );
}

export async function buildTopicGraphData(
  topic: TopicDefinition,
  includeAffiliations: boolean = true
): Promise<GraphData> {
  const [allNodes, allEdges] = await Promise.all([buildSearchIndex(), loadAllEdges()]);

  // Get nodes matching any of the topic's domains
  const topicNodes = allNodes.filter((n) =>
    n.domains.some((d) => topic.domains.includes(d))
  );
  const topicNodeIds = new Set(topicNodes.map((n) => n.id));

  // Filter edges to only those connecting topic nodes
  const edges = allEdges.filter((edge) => {
    const sourceInTopic = topicNodeIds.has(edge.source);
    const targetInTopic = topicNodeIds.has(edge.target);

    // Include edge if both endpoints are in the topic
    if (!sourceInTopic || !targetInTopic) return false;

    // Filter by affiliation preference
    if (!includeAffiliations && edge.kind === 'affiliation') return false;

    return true;
  });

  return { nodes: topicNodes, edges };
}

export function getTopicBySlug(slug: string): TopicDefinition | undefined {
  return getBuiltInTopics().find((t) => t.slug === slug);
}
