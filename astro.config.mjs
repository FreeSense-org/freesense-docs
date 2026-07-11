// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

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
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/FreeSense-org' },
      ],
      editLink: {
        baseUrl: 'https://github.com/FreeSense-org/freesense-docs/edit/main/',
      },
      components: {
        // (room to override <SiteTitle>, <Hero>, etc. later)
      },
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Introduction', slug: 'introduction' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'First boot & setup', slug: 'getting-started/first-boot' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Migrating from pfSense / OPNsense', slug: 'guides/migrating' },
            { label: 'Updates & release channels', slug: 'guides/updates-and-channels' },
            { label: 'Release process & provenance', slug: 'guides/release-process' },
          ],
        },
        {
          label: 'Package platform',
          items: [
            { label: 'Catalog overview', slug: 'packages/catalog' },
            { label: 'Install & manage packages', slug: 'packages/installing-packages' },
          ],
        },
      ],
    }),
  ],
});
