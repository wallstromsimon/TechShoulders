import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const people = await getCollection('people');
  const works = await getCollection('works');
  const institutions = await getCollection('institutions');
  const packs = await getCollection('packs');

  // Combine all content into RSS items
  const items = [
    ...people.map((person) => ({
      title: person.data.name,
      description: person.data.title || `Tech pioneer: ${person.data.name}`,
      link: `/node/${person.data.id}`,
      pubDate: new Date(), // Content doesn't have dates, use current
      categories: person.data.domains || [],
    })),
    ...works.map((work) => ({
      title: work.data.name,
      description: `${work.data.kind} (${work.data.year})`,
      link: `/node/${work.data.id}`,
      pubDate: new Date(work.data.year, 0, 1),
      categories: work.data.domains || [],
    })),
    ...institutions.map((inst) => ({
      title: inst.data.name,
      description: `${inst.data.kind}${inst.data.location ? ` - ${inst.data.location}` : ''}`,
      link: `/node/${inst.data.id}`,
      pubDate: new Date(),
      categories: [],
    })),
    ...packs.map((pack) => ({
      title: `Pack: ${pack.data.name}`,
      description: pack.data.description,
      link: `/packs/${pack.data.id}`,
      pubDate: new Date(),
      categories: [],
    })),
  ];

  return rss({
    title: 'TechShoulders',
    description: 'Standing on the shoulders of tech giants - a knowledge graph of influential people, works, and institutions in computing history',
    site: context.site?.toString() || 'https://techshoulders.kihlbergwallstrom.com',
    items,
    customData: `<language>en-us</language>`,
  });
}
