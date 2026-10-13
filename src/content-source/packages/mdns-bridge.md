---
title: mDNS Bridge
description: Share mDNS service discovery between FreeSense interfaces with the mDNS Bridge package and its global and per-interface filters.
---

The **mDNS Bridge** package (`FreeSense-pkg-mDNS-Bridge` 2.2) runs the `mdns-bridge` daemon
(version 2.2.0 or later, from the FreeBSD package repository). It forwards Multicast DNS (mDNS)
packets between two or more interfaces, so DNS Service Discovery works across network segments:
printers, AirPlay and Chromecast devices, home automation hubs and similar services become
visible on other VLANs.

mDNS Bridge only forwards and filters mDNS. It does not publish records for the firewall. If you
also need publishing, use [Avahi](/packages/avahi/) instead. The two packages must not reflect
mDNS at the same time, and each refuses to save while the other is active.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **mDNS Bridge** (package `FreeSense-pkg-mDNS-Bridge`) and click **Install**.

On Stable 1.1 the package is available for amd64. See
[Installing packages](/packages/installing-packages/).

## Where to find it

**Services → mDNS Bridge** (in the *Network* group of the Services menu), page `mdns-bridge.php`.
The page has **General Settings**, **Global Settings**, one settings section per
eligible interface (for example **LAN Settings**), and **Advanced**.

## First-time setup

1. Open **Services → mDNS Bridge**.
2. Check **Enable**.
3. In **Interfaces**, select at least two interfaces, for example *LAN* and *IOT*. Interfaces
   that have a gateway (WAN-type interfaces) are not offered.
4. Leave **IP Protocols** on **IPv4 and IPv6** unless one family is not used.
5. Optional: to reflect only some services, set **Global Filter** to **Allow** and enter
   service names in **Global Filter List**, for example `_ipp, _airplay, _googlecast`.
6. Click **Save**. The daemon is restarted with the new configuration.
7. Add firewall rules for mDNS on each selected interface (see below) and test discovery from a
   client.

## Settings reference

### General Settings

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Runs the daemon. When unchecked, the daemon is stopped and its config and rc files are removed. | Off |
| **CARP Status VHID** | In an HA pair, the daemon runs only while the selected VHID is MASTER. | `none` |
| **Interfaces** | Interfaces the daemon operates on. At least two are required. Interfaces with a gateway are excluded from the list. | None |
| **Decode Warnings** | Log mDNS decoding errors that are silent by default (`-w`). | Off |

### Global Settings

| Field | What it does | Default |
| --- | --- | --- |
| **IP Protocols** | **IPv4 and IPv6**, **IPv4 only** or **IPv6 only**. A global choice overrides the per-interface setting. | IPv4 and IPv6 |
| **Global Filter** | Filter applied to incoming packets on all interfaces before any interface filter. **none** allows all names; **Allow** drops names not in the list; **Deny** drops names in the list. | none |
| **Global Filter List** | Comma-separated mDNS names, usually single service labels such as `_printer`, `_ipp`, `_ipps`, `_airplay`, `_hap`, `_http` or `_ssh`. | Empty |

### Per-interface settings

Each eligible interface has its own section. The settings apply only when the interface is
selected in **Interfaces**.

| Field | What it does | Default |
| --- | --- | --- |
| **IP Protocols** | Protocol family for this interface. Ignored when a global protocol limit is set. | IPv4 and IPv6 |
| **Inbound Filter** | Applied to packets received on this interface, after the global filter: **none**, **Allow** or **Deny**. | none |
| **Inbound Filter List** | Names for the inbound filter. | Empty |
| **Outbound Filter** | Applied before packets are sent out on this interface: **none**, **Allow** or **Deny**. | none |
| **Outbound Filter List** | Names for the outbound filter. | Empty |

Every filter list entry must be a valid domain label; invalid entries are rejected on save.

### Advanced

| Field | What it does | Default |
| --- | --- | --- |
| **Disable Packet Filtering** | Forwards packets between interfaces without decoding or validating them. This disables all mDNS validation and filtering, including link-local address checks. Only takes effect when no filters are set. Use with extreme caution. | Off |

## Firewall rules and interfaces

- mDNS uses UDP port 5353 to `224.0.0.251` (IPv4) and `ff02::fb` (IPv6).
- The package adds no firewall rules. On each selected interface, allow **UDP** from the
  interface network to destination port **5353**.
- Add rules for the service traffic itself (printing, casting, control ports) between the
  networks. Discovery alone does not let clients connect.
- Use filters to keep the bridge narrow. For example, allow only `_ipp` and `_ipps` from a
  printer VLAN, rather than every service from every segment.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service name | `mdns-bridge` (*mDNS Bridge* in **Status → Services**) |
| rc script | `/usr/local/etc/rc.d/mdns-bridge.sh` |
| Configuration file | `/usr/local/etc/mdns-bridge.conf` (generated, do not edit) |
| PID file | `/var/run/mdns-bridge.pid` |
| Logs | The daemon logs to syslog (`-s`). Messages appear in **Status → System Logs → System → General**; package messages use the `mDNS Bridge` tag. |

## Upgrade, backup, and removal

- Settings are stored in `config.xml` under `installedpackages/mdns-bridge` and included in
  configuration backups.
- Removing the package stops the daemon and deletes its config and rc files. The settings stay in
  `config.xml` for a later reinstall.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Save fails with *Avahi reflection must be disabled before enabling mDNS Bridge* | Avahi is enabled with reflection. Turn off Avahi reflection or use Avahi instead. |
| Save fails with *A minimum of two interfaces are required* | Select two or more interfaces. |
| An interface is missing from the list | It has a gateway configured, so it is treated as a WAN and excluded. |
| *Invalid domain in ... Filter List* | An entry contains characters that are not valid in a DNS label. Use names such as `_ipp`. |
| Services are not discovered | Check the UDP 5353 rules, the filters (set them to **none** while testing) and that the service is running on **Status → Services**. Enable **Decode Warnings** to log malformed packets. |
| The daemon does not run on the HA backup | Expected with **CARP Status VHID** set; it starts when the VHID becomes MASTER. |

:::note[Changes in FreeSense 1.1]
- **mDNS Bridge** is listed in the *Network* group of the 1.1 Services menu
  (freesense-packages 4ae11df).
- Otherwise the package is unchanged from 1.0.x apart from the rebuild for the FreeBSD 16
  platform.
:::
