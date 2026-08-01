import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    // Astro's default ID generator strips dots from directory names. Keep the
    // edition prefix literal so the public Development route is `/1.1/`.
    loader: docsLoader({
      generateId: ({ entry }) => entry
        .replace(/\\/g, '/')
        .replace(/\.(md|mdx)$/, '')
        .replace(/\/index$/, ''),
    }),
    schema: docsSchema(),
  }),
};
