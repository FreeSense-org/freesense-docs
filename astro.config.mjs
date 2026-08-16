// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const navigation = [
  {
    label: 'Start here',
    items: [
      ['Introduction', 'introduction'],
      ['Hardware and virtualization', 'getting-started/hardware-and-virtualization'],
      ['Installation', 'getting-started/installation'],
      ['Cloud images', 'getting-started/cloud-images'],
      ['First boot & setup', 'getting-started/first-boot'],
    ],
  },
  {
    label: 'Releases and lifecycle',
    items: [
      ['Updates & release channels', 'guides/updates-and-channels'],
      ['Release process & provenance', 'guides/release-process'],
      ['Version compatibility', 'releases/compatibility'],
      ['Development channel', 'releases/development'],
      ['Stable channel', 'releases/stable'],
    ],
  },
  {
    label: 'Configure the firewall',
    items: [
      ['Interfaces, VLANs, and bridges', 'configure/interfaces-vlans-bridges'],
      ['Firewall rules and aliases', 'configure/firewall-rules-aliases'],
      ['NAT', 'configure/nat'],
      ['Routing and multi-WAN', 'configure/routing-multiwan'],
      ['Core services', 'configure/core-services'],
      ['Users, certificates, and backup', 'configure/access-and-recovery'],
    ],
  },
  {
    label: 'Secure and operate',
    items: [
      ['Suricata 8', 'security/suricata'],
      ['CrowdSec', 'security/crowdsec'],
      ['Monitoring and logs', 'operations/monitoring-and-logs'],
      ['ZFS boot environments', 'operations/zfs-boot-environments'],
      ['Diagnostics and troubleshooting', 'operations/diagnostics-and-troubleshooting'],
    ],
  },
  {
    label: 'Package platform',
    items: [
      ['Catalog overview', 'packages/catalog'],
      ['Install & manage packages', 'packages/installing-packages'],
      ['VPN and private networking', 'packages/vpn-and-private-networking'],
      ['WireGuard', 'packages/wireguard'],
      ['Routing, services, and delivery', 'packages/routing-services-and-delivery'],
      ['Secure Web Gateway', 'packages/web-gateway', ['devel']],
      ['Monitoring and automation', 'packages/monitoring-and-automation'],
    ],
  },
  {
    label: 'Guides and reference',
    items: [
      ['Migration boundaries', 'guides/migrating'],
      ['Configuration recipes', 'recipes'],
      ['WebUI menu reference', 'reference/menu-guide'],
      ['Glossary', 'reference/glossary'],
      ['Documentation policy', 'contributors/documentation-policy'],
    ],
  },
];

const editionNavigation = (edition) => navigation.map((section) => ({
  label: section.label,
  items: section.items
    .filter(([, , availableIn]) => !availableIn || availableIn.includes(edition))
    .map(([label, slug]) => ({ label, slug: `${edition}/${slug}` })),
}));

const sidebar = [
  { label: 'Stable 1.0.7', items: editionNavigation('stable') },
  { label: 'Development 1.1', items: editionNavigation('devel') },
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
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/FreeSense-org' },
      ],
      editLink: {
        baseUrl: 'https://github.com/FreeSense-org/freesense-docs/edit/main/',
      },
      components: {
        Header: './src/components/Header.astro',
        MobileMenuFooter: './src/components/MobileMenuFooter.astro',
        Banner: './src/components/EditionBanner.astro',
        Sidebar: './src/components/EditionSidebar.astro',
      },
      sidebar,
    }),
  ],
});
