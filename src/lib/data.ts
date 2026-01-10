import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type NodeKind = 'people' | 'works' | 'institutions';
export type EdgeKind = 'influence' | 'affiliation';

export interface Edge {
  source: string;
  target: string;
  kind: EdgeKind;
  label?: string;
}

export type PersonEntry = CollectionEntry<'people'>;
export type WorkEntry = CollectionEntry<'works'>;
export type InstitutionEntry = CollectionEntry<'institutions'>;

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

  const person = people.find(p => p.data.id === id);
  if (person) return { kind: 'people', entry: person };

  const work = works.find(w => w.data.id === id);
  if (work) return { kind: 'works', entry: work };

  const institution = institutions.find(i => i.data.id === id);
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
    ...people.map(p => p.data.id),
    ...works.map(w => w.data.id),
    ...institutions.map(i => i.data.id),
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
      domains: person.data.domains || [],
      era: person.data.era,
      imageUrl: person.data.image?.url,
    });
  }

  for (const work of works) {
    nodes.push({
      id: work.data.id,
      name: work.data.name,
      kind: 'works',
      subtitle: work.data.kind,
      domains: work.data.domains || [],
      year: work.data.year,
    });
  }

  for (const institution of institutions) {
    nodes.push({
      id: institution.data.id,
      name: institution.data.name,
      kind: 'institutions',
      subtitle: institution.data.kind,
      domains: [],
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

export async function loadAllEdges(): Promise<Edge[]> {
  const edgesCollection = await getCollection('edges');
  const allEdges: Edge[] = [];

  for (const entry of edgesCollection) {
    allEdges.push(...entry.data);
  }

  return allEdges;
}

export async function loadEdgesByKind(kind: EdgeKind): Promise<Edge[]> {
  const allEdges = await loadAllEdges();
  return allEdges.filter(edge => edge.kind === kind);
}

export interface GraphData {
  nodes: SearchableNode[];
  edges: Edge[];
}

export async function buildGraphData(includeAffiliations: boolean = true): Promise<GraphData> {
  const [nodes, allEdges] = await Promise.all([
    buildSearchIndex(),
    loadAllEdges(),
  ]);

  const edges = includeAffiliations
    ? allEdges
    : allEdges.filter(e => e.kind === 'influence');

  return { nodes, edges };
}
