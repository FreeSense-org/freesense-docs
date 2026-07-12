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
            { label: 'Hardware and virtualization', slug: 'getting-started/hardware-and-virtualization' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'First boot & setup', slug: 'getting-started/first-boot' },
          ],
        },
        {
          label: 'Releases and lifecycle',
          items: [
            { label: 'Updates & release channels', slug: 'guides/updates-and-channels' },
            { label: 'Release process & provenance', slug: 'guides/release-process' },
            { label: 'Version compatibility', slug: 'releases/compatibility' },
            { label: 'Development channel', slug: 'releases/development' },
            { label: 'Candidate channel', slug: 'releases/candidate' },
            { label: 'Stable channel', slug: 'releases/stable' },
          ],
        },
        {
          label: 'Configure the firewall',
          items: [
            { label: 'Interfaces, VLANs, and bridges', slug: 'configure/interfaces-vlans-bridges' },
            { label: 'Firewall rules and aliases', slug: 'configure/firewall-rules-aliases' },
            { label: 'NAT', slug: 'configure/nat' },
            { label: 'Routing and multi-WAN', slug: 'configure/routing-multiwan' },
            { label: 'Core services', slug: 'configure/core-services' },
            { label: 'Users, certificates, and backup', slug: 'configure/access-and-recovery' },
          ],
        },
        {
          label: 'Secure and operate',
          items: [
            { label: 'Suricata 8', slug: 'security/suricata' },
            { label: 'CrowdSec', slug: 'security/crowdsec' },
            { label: 'Monitoring and logs', slug: 'operations/monitoring-and-logs' },
            { label: 'Diagnostics and troubleshooting', slug: 'operations/diagnostics-and-troubleshooting' },
          ],
        },
        {
          label: 'Package platform',
          items: [
            { label: 'Catalog overview', slug: 'packages/catalog' },
            { label: 'Install & manage packages', slug: 'packages/installing-packages' },
            { label: 'VPN and private networking', slug: 'packages/vpn-and-private-networking' },
            { label: 'Routing, services, and delivery', slug: 'packages/routing-services-and-delivery' },
            { label: 'Monitoring and automation', slug: 'packages/monitoring-and-automation' },
          ],
        },
        {
          label: 'Guides and reference',
          items: [
            { label: 'Migration boundaries', slug: 'guides/migrating' },
            { label: 'Configuration recipes', slug: 'recipes' },
            { label: 'WebUI menu reference', slug: 'reference/menu-guide' },
            { label: 'Glossary', slug: 'reference/glossary' },
            { label: 'Documentation policy', slug: 'contributors/documentation-policy' },
          ],
        },
      ],
    }),
  ],
});
