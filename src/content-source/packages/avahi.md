---
title: Avahi
description: Use the Avahi package for mDNS/DNS-SD service discovery and reflection across FreeSense interfaces.
---

The **Avahi Service Discovery** package (`FreeSense-pkg-Avahi` 2.2) runs `avahi-daemon` on the
firewall. Avahi implements multicast DNS (mDNS) and DNS Service Discovery (DNS-SD), the protocols
behind Bonjour and Zeroconf. In FreeSense it is mostly used as a **reflector**: it repeats mDNS
announcements between interfaces, so a client on one VLAN can find printers, media players or
smart-home devices on another. It can also publish records about the firewall itself.

The package depends on the FreeBSD `avahi-app` and `nss_mdns` packages.

If you only need to forward mDNS between interfaces, also consider [mDNS Bridge](/packages/mdns-bridge/),
a smaller daemon built for exactly that job with per-interface filters. Do not run Avahi
reflection and mDNS Bridge at the same time; each package refuses to save while the other is
active.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **Avahi Service Discovery** (package `FreeSense-pkg-Avahi`) and click **Install**.

On Stable 1.1 the package is available for amd64. See
[Installing packages](/packages/installing-packages/) for the general procedure.

## Where to find it

**Services → Avahi** (in the *Network* group of the Services menu). It is a single settings page,
`avahi_settings.php`, with the sections **General Settings**, **Reflection Filtering**,
**Publishing** and **Advanced settings** (shown with **Display Advanced**).

## First-time setup

The common case is reflecting service discovery from a device VLAN to a client LAN.

1. Open **Services → Avahi**.
2. Check **Enable**.
3. Keep **Interface Action** on **Allow Interfaces**.
4. In **Interfaces**, select the interfaces that should see each other's services, for example
   *LAN* and *IOT*. WAN is not offered in the list.
5. Check **Enable reflection**.
6. Optional: under **Reflection Filtering**, add the service types to reflect, for example
   `_ipp._tcp.local` and `_airplay._tcp.local`. With no entries, all services are reflected.
7. Leave **Enable publishing** off unless you want clients to discover the firewall itself.
8. Click **Save**. The daemon restarts with the new settings.
9. Add firewall rules for mDNS on each selected interface (see below), then browse for the
   service from a client on the other network.

Discovery is only half the job. The client then connects directly to the device, so the
firewall must also allow that traffic, for example TCP 631 for IPP printing.

## Settings reference

### General Settings

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Runs the Avahi daemon. When unchecked, the daemon is stopped and its rc script removed. | Off |
| **CARP Status VIP** | In a high-availability pair, Avahi runs only while the selected CARP VIP is MASTER and stops in BACKUP. | `none` |
| **Interface Action** | **Allow Interfaces** binds Avahi to the selected interfaces only. **Deny Interfaces** binds to all interfaces except the selected ones, including unassigned interfaces, so select WANs explicitly in that mode. | Allow Interfaces |
| **Interfaces** | The interfaces to allow or deny. If empty, Avahi uses all available interfaces. | Empty |
| **Disable IPv4** | Do not use IPv4. | Off |
| **Disable IPv6** | Do not use IPv6. At least one protocol must stay enabled. | Off |
| **Enable reflection** | Repeat mDNS packets between the selected interfaces. | Off |

### Reflection Filtering

| Field | What it does | Default |
| --- | --- | --- |
| **Service** (repeatable) | Allowed service names to reflect, such as `_printer._tcp.local`, `_ipp._tcp.local` or `_pdl-datastream._tcp.local`. An entry can also match the name of the host providing the service. Each entry must be a valid domain name. | Empty (reflect everything) |

### Publishing

| Field | What it does | Default |
| --- | --- | --- |
| **Enable publishing** | Publishes information about the firewall. This also enables the default `ssh` and `sftp-ssh` service files. Publishing can reveal a lot about the firewall; use with care. | Off |
| **Publish addresses** | Publish address records for the firewall. | Off |
| **Publish host info** | Publish a host information record (OS and CPU). | Off |
| **Publish workstation** | Publish a workstation record. | Off |
| **Publish domain** | Publish the domain name in use. | Off |

### Advanced settings

| Field | What it does | Default |
| --- | --- | --- |
| **Override host name** | Host name used in published records. Letters, digits and `-` only. | System host name |
| **Override domain** | Domain used in published records. Letters, digits, `-` and `.` only. | `local` |
| **IPv4 AAAA records** | Publish IPv6 addresses (AAAA) over IPv4. | Off |
| **IPv6 A records** | Publish IPv4 addresses (A) over IPv6. | Off |

The generated configuration always disables D-Bus, wide-area DNS-SD, the record cache and
per-user service publishing.

## Firewall rules and interfaces

- mDNS uses UDP port 5353 to the multicast groups `224.0.0.251` (IPv4) and `ff02::fb` (IPv6).
- The package does not add firewall rules. On every interface Avahi uses, allow **UDP** from the
  interface network to destination port **5353**. A rule to destination *any* is simplest; a
  rule to `224.0.0.251` also works for IPv4.
- Add separate rules for the actual service traffic between the networks (for example IPP, AirPlay
  or Chromecast ports). Reflection only makes the services visible.
- Keep Avahi off WAN interfaces. In **Deny Interfaces** mode, always deny the WANs.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service name | `avahi` (*Avahi mDNS/DNS-SD daemon* in **Status → Services**) |
| rc script | `/usr/local/etc/rc.d/avahi-daemon.sh` |
| Configuration file | `/usr/local/etc/avahi/avahi-daemon.conf` (generated, do not edit) |
| Service files | `/usr/local/etc/avahi/services/` |
| Logs | **Status → System Logs → System → General**. Package messages use the `avahi` tag. |

## Upgrade, backup, and removal

- Settings are stored in `config.xml` and included in configuration backups.
- If the configuration still uses the older Avahi settings layout, the page shows a migration
  warning. Review the converted settings and save; the old settings are dropped on save.
- Removing the package stops the daemon and removes its rc script. The settings stay in
  `config.xml` for a later reinstall.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Save fails with *mDNS Bridge must be disabled before enabling Avahi reflection* | mDNS Bridge is enabled. Use one of the two packages, not both. |
| Save fails with *At least one IP protocol must be enabled* | Both **Disable IPv4** and **Disable IPv6** are checked. |
| Services are not seen on the other network | Check the UDP 5353 pass rules on each interface, that both interfaces are selected, and that **Enable reflection** is checked. Remove reflection filters while testing. |
| Services are seen but connections fail | The firewall blocks the service traffic itself. Add pass rules for the service ports between the networks. |
| Avahi does not run on the backup node | Expected when **CARP Status VIP** is set. It starts when the VIP becomes MASTER. |

:::note[Changes in FreeSense 1.1]
- **Avahi** is listed in the *Network* group of the 1.1 Services menu (freesense-packages
  4ae11df).
- Otherwise the package is unchanged from 1.0.x apart from the rebuild for the FreeBSD 16
  platform.
:::
