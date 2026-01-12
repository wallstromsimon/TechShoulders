import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

// Stable fallback date (project launch) - prevents RSS items from appearing "new"
// on every build when content doesn't have explicit dates
const PROJECT_LAUNCH_DATE = new Date('2025-01-01T00:00:00Z');

/**
 * Extract year from era string (e.g., "1990s–present" → 1990, "18th century" → 1700)
 */
function extractYearFromEra(era: string): number | null {
  // Match 4-digit year at start
  const yearMatch = era.match(/^(\d{4})/);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10);
  }
  // Match decade (e.g., "1990s")
  const decadeMatch = era.match(/(\d{4})s/);
  if (decadeMatch) {
    return parseInt(decadeMatch[1], 10);
  }
  return null;
}

export async function GET(context: APIContext) {
  const people = await getCollection('people');
  const works = await getCollection('works');
  const institutions = await getCollection('institutions');
  const packs = await getCollection('packs');

  // Combine all content into RSS items
  const items = [
    ...people.map((person) => {
      const year = extractYearFromEra(person.data.era);
      return {
        title: person.data.name,
        description: person.data.title || `Tech pioneer: ${person.data.name}`,
        link: `/node/${person.data.id}`,
        pubDate: year ? new Date(year, 0, 1) : PROJECT_LAUNCH_DATE,
        categories: person.data.domains || [],
      };
    }),
    ...works.map((work) => ({
      title: work.data.name,
      description: `${work.data.kind}${work.data.year ? ` (${work.data.year})` : ''}`,
      link: `/node/${work.data.id}`,
      pubDate: work.data.year ? new Date(work.data.year, 0, 1) : PROJECT_LAUNCH_DATE,
      categories: work.data.domains || [],
    })),
    ...institutions.map((inst) => {
      const year = extractYearFromEra(inst.data.era);
      return {
        title: inst.data.name,
        description: `${inst.data.kind}${inst.data.location ? ` - ${inst.data.location}` : ''}`,
        link: `/node/${inst.data.id}`,
        pubDate: year ? new Date(year, 0, 1) : PROJECT_LAUNCH_DATE,
        categories: inst.data.domains || [],
      };
    }),
    ...packs.map((pack) => ({
      title: `Pack: ${pack.data.name}`,
      description: pack.data.description,
      link: `/packs/${pack.data.id}`,
      pubDate: PROJECT_LAUNCH_DATE,
      categories: pack.data.domains || [],
    })),
  ];

  return rss({
    title: 'TechShoulders',
    description:
      'Standing on the shoulders of tech giants - a knowledge graph of influential people, works, and institutions in computing history',
    site: context.site?.toString() || 'https://techshoulders.kihlbergwallstrom.com',
    items,
    customData: `<language>en-us</language>`,
  });
}
