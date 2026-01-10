import { getCollection, type CollectionEntry } from 'astro:content';

export type NodeKind = 'people' | 'works' | 'institutions';

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
