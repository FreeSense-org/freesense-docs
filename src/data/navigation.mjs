// Documentation navigation, shared by astro.config.mjs (sidebar) and
// scripts/generate-editions.mjs (which pages each edition materializes).
//
// An item is [label, slug] or [label, slug, availableIn]. availableIn lists the
// maintained editions ('stable', 'devel') that publish the page; without it the
// page is published in both. A nested { label, items } object is a collapsed
// sidebar group.

const pkg = (label, items) => ({ label, collapsed: true, items });

export const navigation = [
  {
    label: 'Start here',
    items: [
      ['Introduction', 'introduction'],
      ["What's new in 1.1", 'releases/whats-new-1.1'],
      ['Hardware and virtualization', 'getting-started/hardware-and-virtualization'],
      ['Installation', 'getting-started/installation'],
      ['Cloud images', 'getting-started/cloud-images'],
      ['Raspberry Pi appliances', 'getting-started/raspberry-pi', ['devel']],
      ['First boot & setup', 'getting-started/first-boot'],
    ],
  },
  {
    label: 'Upgrades and releases',
    items: [
      ['Upgrading from 1.0', 'guides/upgrading-from-1.0'],
      ['Updates and release channels', 'guides/updates-and-channels'],
      ['Release notes 1.1.9', 'releases/1.1.9'],
      ['Previous 1.1 releases', 'releases/previous-1.1'],
      ['Stable release line', 'releases/stable'],
      ['Development release line', 'releases/development'],
      ['Version compatibility', 'releases/compatibility'],
      ['Release process and provenance', 'guides/release-process'],
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
    label: 'Configure',
    items: [
      ['Interfaces, VLANs, bridges, and VXLAN', 'configure/interfaces-vlans-bridges'],
      ['Firewall rules and aliases', 'configure/firewall-rules-aliases'],
      ['NAT', 'configure/nat'],
      ['Routing and Multi-WAN', 'configure/routing-multiwan'],
      ['Core services', 'configure/core-services'],
      ['Access and recovery', 'configure/access-and-recovery'],
      pkg('Fleet (central management)', [
        ['FreeSense Fleet', 'configure/fleet', ['devel']],
        ['How Fleet is installed and works', 'configure/fleet-install', ['devel']],
        ['Add a firewall to a Fleet', 'configure/fleet-join', ['devel']],
        ['Connection points and rules', 'configure/fleet-connect', ['devel']],
        ['Live view and NOC screens', 'configure/fleet-live-view', ['devel']],
        ['Internet connectivity', 'configure/fleet-internet', ['devel']],
        ['HA pairs', 'configure/fleet-ha', ['devel']],
        ['Policies', 'configure/fleet-policies', ['devel']],
        ['Updates, templates and schedules', 'configure/fleet-operations', ['devel']],
        ['Settings', 'configure/fleet-settings', ['devel']],
        ['Status and known issues', 'configure/fleet-status', ['devel']],
      ]),
    ],
  },
  {
    label: 'Optional packages',
    items: [
      ['Package catalog', 'packages/catalog'],
      ['Install and manage packages', 'packages/installing-packages'],
      ['Custom repositories', 'packages/custom-repositories'],
      pkg('Security and filtering', [
        ['Overview', 'packages/security-and-filtering'],
        ['Threat Shield & DNS Protection', 'packages/threat-shield'],
        ['Threat Shield inbound protection', 'packages/threat-shield-inbound'],
        ['Threat Shield threat map', 'packages/threat-shield-map'],
        ['Secure Web Gateway', 'packages/web-gateway'],
        ['Suricata', 'packages/suricata'],
        ['CrowdSec', 'packages/crowdsec'],
        ['ACME certificates', 'packages/acme'],
      ]),
      pkg('VPN and private networking', [
        ['Overview', 'packages/vpn-and-private-networking'],
        ['WireGuard', 'packages/wireguard'],
        ['Tailscale', 'packages/tailscale'],
        ['ZeroTier', 'packages/zerotier'],
        ['OpenVPN client export', 'packages/openvpn-client-export'],
      ]),
      pkg('Routing, services, and delivery', [
        ['Overview', 'packages/routing-services-and-delivery'],
        ['FRR dynamic routing', 'packages/frr'],
        ['HAProxy', 'packages/haproxy'],
        ['BIND DNS server', 'packages/bind'],
        ['FreeRADIUS', 'packages/freeradius'],
        ['Avahi', 'packages/avahi'],
        ['mDNS Bridge', 'packages/mdns-bridge'],
        ['Multicast bridge', 'packages/mcast-bridge'],
        ['UDP broadcast relay', 'packages/udpbroadcastrelay'],
        ['TFTP server', 'packages/tftpd'],
      ]),
      pkg('Monitoring and automation', [
        ['Overview', 'packages/monitoring-and-automation'],
        ['Automation', 'packages/automation'],
        ['ntopng', 'packages/ntopng'],
        ['Telegraf', 'packages/telegraf'],
        ['Prometheus node exporter', 'packages/node-exporter'],
        ['Zabbix agent and proxy', 'packages/zabbix'],
        ['SNMP (net-snmp)', 'packages/net-snmp'],
        ['syslog-ng', 'packages/syslog-ng'],
        ['softflowd', 'packages/softflowd'],
        ['Traffic Totals', 'packages/traffic-totals'],
        ['ANDwatch', 'packages/andwatch'],
        ['LLDP (lldpd)', 'packages/lldpd'],
        ['Network UPS Tools', 'packages/nut'],
      ]),
      pkg('System and diagnostics', [
        ['Overview', 'packages/system-and-diagnostics'],
        ['Diagnostics', 'packages/diagnostics'],
        ['Open VM Tools', 'packages/open-vm-tools'],
        ['QEMU Guest Agent', 'packages/qemu-guest-agent'],
      ]),
    ],
  },
  {
    label: 'Operate and troubleshoot',
    items: [
      ['Monitoring and logs', 'operations/monitoring-and-logs'],
      ['Diagnostics and troubleshooting', 'operations/diagnostics-and-troubleshooting'],
      ['ZFS boot environments', 'operations/zfs-boot-environments'],
    ],
  },
  {
    label: 'REST API',
    items: [
      ['API overview', 'api/overview'],
      ['Getting started with the API', 'api/getting-started'],
      ['Route reference', 'api/reference'],
    ],
  },
  {
    label: 'Package development',
    items: [
      ['Building optional packages', 'developers/building-optional-packages'],
      ['Package integration', 'developers/package-integration'],
      ['WebUI menu system', 'developers/webui-menu-system'],
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

// The frozen 1.0 edition keeps the navigation it was published with.
export const frozenNavigation = [
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
    ],
  },
  {
    label: 'Package development',
    items: [
      ['Building optional packages', 'developers/building-optional-packages'],
      ['Package integration', 'developers/package-integration'],
      ['WebUI menu system', 'developers/webui-menu-system'],
    ],
  },
  {
    label: 'Operate and troubleshoot',
    items: [
      ['Monitoring and logs', 'operations/monitoring-and-logs'],
      ['Diagnostics and troubleshooting', 'operations/diagnostics-and-troubleshooting'],
      ['ZFS boot environments', 'operations/zfs-boot-environments'],
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

// Every [label, slug, availableIn] entry, depth first.
export function flattenNavigation(sections) {
  const entries = [];
  const walk = (items) => {
    for (const item of items) {
      if (Array.isArray(item)) entries.push(item);
      else walk(item.items);
    }
  };
  for (const section of sections) walk(section.items);
  return entries;
}

// Pages that the sidebar restricts to other editions are not materialized.
export function isPublishedIn(slug, edition) {
  const entry = flattenNavigation(navigation).find(([, entrySlug]) => entrySlug === slug);
  return !entry?.[2] || entry[2].includes(edition);
}
