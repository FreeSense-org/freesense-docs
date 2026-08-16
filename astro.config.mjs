// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const navigation = [
  {
    label: 'Get started',
    items: [
      ['Introduction', 'introduction'],
      ['Hardware and virtualization', 'getting-started/hardware-and-virtualization'],
      ['Installation', 'getting-started/installation'],
      ['Cloud images', 'getting-started/cloud-images'],
      ['First boot & setup', 'getting-started/first-boot'],
    ],
  },
  {
    label: 'Base OS',
    items: [
      ['System administration', 'base-os/system-administration'],
      ['Interfaces and networking', 'base-os/interfaces-and-networking'],
      ['Firewall and NAT', 'base-os/firewall-and-nat'],
      ['Routing and high availability', 'base-os/routing-and-high-availability'],
      ['Built-in services', 'base-os/built-in-services'],
      ['Built-in VPN', 'base-os/built-in-vpn'],
    ],
  },
  {
    label: 'Optional packages',
    items: [
      ['Package catalog', 'packages/catalog'],
      ['Install and manage packages', 'packages/installing-packages'],
      ['Security and filtering', 'packages/security-and-filtering'],
      ['VPN and private networking', 'packages/vpn-and-private-networking'],
      ['Routing, services, and delivery', 'packages/routing-services-and-delivery'],
      ['Monitoring and automation', 'packages/monitoring-and-automation'],
      ['System and diagnostics', 'packages/system-and-diagnostics'],
      ['Secure Web Gateway', 'packages/web-gateway', ['devel']],
    ],
  },
  {
    label: 'Operate and troubleshoot',
    items: [
      ['Monitoring and logs', 'operations/monitoring-and-logs'],
      ['Diagnostics and troubleshooting', 'operations/diagnostics-and-troubleshooting'],
      ['ZFS boot environments', 'operations/zfs-boot-environments'],
      ['Status and diagnostics reference', 'reference/menu-guide'],
    ],
  },
  {
    label: 'Releases',
    items: [
      ['Updates and release channels', 'guides/updates-and-channels'],
      ['Release process and provenance', 'guides/release-process'],
      ['Version compatibility', 'releases/compatibility'],
      ['Stable release line', 'releases/stable'],
      ['Development release line', 'releases/development'],
    ],
  },
  {
    label: 'Reference and contribution',
    items: [
      ['Migration boundaries', 'guides/migrating'],
      ['Configuration recipes', 'recipes'],
      ['WebUI menu reference', 'reference/menu-guide'],
      ['WebUI context help', 'reference/context-help'],
      ['Glossary', 'reference/glossary'],
      ['Documentation policy', 'contributors/documentation-policy'],
    ],
  },
];

const editionNavigation = (edition) => navigation.map((section) => ({
  label: section.label,
  items: section.items
    .filter(([, , availableIn]) => !availableIn || availableIn.includes(edition))
    .map(([label, slug]) => edition === 'devel'
      ? { label, link: `/1.1/${slug}/` }
      : { label, slug }),
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
        Sidebar: './src/components/EditionSidebar.astro',
      },
      sidebar,
    }),
  ],
});
