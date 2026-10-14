// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import editions from './src/data/editions.json' with { type: 'json' };
import { frozenNavigation, navigation } from './src/data/navigation.mjs';

const toSidebarItems = (items, edition, prefix) => items
  .filter((item) => !Array.isArray(item) || !item[2] || item[2].includes(edition))
  .map((item) => {
    if (!Array.isArray(item)) {
      return { label: item.label, collapsed: item.collapsed, items: toSidebarItems(item.items, edition, prefix) };
    }
    const [label, slug] = item;
    return prefix ? { label, link: `${prefix}/${slug}/` } : { label, slug };
  });

const editionNavigation = (sections, edition) => sections.map((section) => ({
  label: section.label,
  items: toSidebarItems(section.items, edition, editions[edition].route_prefix),
}));

// One top-level group per edition; EditionSidebar shows only the group that
// matches the current route prefix.
const sidebar = [
  { label: editions.stable.label, items: editionNavigation(navigation, 'stable') },
  { label: editions.devel.label, items: editionNavigation(navigation, 'devel') },
  { label: editions.frozen.label, items: editionNavigation(frozenNavigation, 'frozen') },
];

// Docs site -> docs.freesense.org (Cloudflare Pages).
export default defineConfig({
  site: 'https://docs.freesense.org',
  integrations: [
    starlight({
      title: 'FreeSense Docs',
      description: 'Build, install, operate, and extend the modern FreeSense firewall platform.',
      logo: {
        light: './src/assets/icon.svg',
        dark: './src/assets/icon-reversed.svg',
        alt: 'FreeSense',
      },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/custom.css'],
      head: [
        {
          // Open WebUI screenshots full size: they are scaled down to the content width.
          tag: 'script',
          content: `document.addEventListener('DOMContentLoaded', () => {
  for (const img of document.querySelectorAll(".sl-markdown-content img[src*='/_astro/']")) {
    if (img.closest('a')) continue;
    const link = document.createElement('a');
    link.href = img.currentSrc || img.src;
    link.target = '_blank';
    link.rel = 'noopener';
    link.className = 'screenshot-link';
    link.title = 'Open the full-size image';
    img.replaceWith(link);
    link.append(img);
  }
});`,
        },
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/FreeSense-org' },
      ],
      editLink: {
        baseUrl: 'https://github.com/FreeSense-org/freesense-docs/edit/main/',
      },
      components: {
        Header: './src/components/Header.astro',
        MobileMenuFooter: './src/components/MobileMenuFooter.astro',
        Sidebar: './src/components/EditionSidebar.astro',
      },
      sidebar,
    }),
  ],
});
