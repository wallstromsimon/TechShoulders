import type { APIRoute } from 'astro';
import { buildSearchIndex } from '../lib/data';

export const GET: APIRoute = async () => {
  const searchIndex = await buildSearchIndex();

  return new Response(JSON.stringify(searchIndex), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
