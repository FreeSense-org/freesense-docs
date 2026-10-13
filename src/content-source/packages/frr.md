---
title: FRRouting (FRR)
description: Run dynamic routing on FreeSense with the FRR package - BGP, OSPF, OSPFv3, RIP and BFD, with prefix lists, route maps, raw configuration and the 1.1 status page.
---

The **FRRouting** package (`FreeSense-pkg-frr` 2.1.2) manages FRR 10 (`frr10`; the 1.1.0 Stable
repository ships FRR 10.7.1) on the firewall. It provides dynamic routing with **BGP** (including
RPKI and graceful restart), **OSPF** (OSPFv2 for IPv4), **OSPF6** (OSPFv3 for IPv6), **RIP** and
**BFD**, plus static routes in FRR's own table, access lists, prefix lists, route maps and a raw
configuration mode for setups the forms do not cover.

Use FRR when routes must be learned from or advertised to other routers: multi-site networks over
VPN tunnels, upstream BGP sessions, data-center fabrics or redundant WAN designs. For a few fixed
routes, static routes in **System → Routing** are simpler; see
[Routing and multi-WAN](/configure/routing-multiwan/).

:::caution[Routing changes affect every network]
A wrong advertisement or filter can withdraw your own routes or attract traffic you did not
intend to carry. Start with one protocol, explicit prefix lists in both directions, and console
access to the firewall. Save a configuration backup before each change.
:::

FRR conflicts with the older OpenBGPD and Quagga OSPF packages; they cannot be installed at the
same time.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **FRRouting** (package `FreeSense-pkg-frr`) and click **Install**.

`frr10` and `frr10-pythontools` are installed as dependencies. On Stable 1.1 the package is
available for amd64. See [Installing packages](/packages/installing-packages/).

During install the package raises the system tunable `kern.ipc.maxsockbuf` to `20971520` (the
value FRR 10 expects; OSPF and OSPF6 may fail without it). The tunable appears in **System →
Advanced → System Tunables** as *Maximum socket buffer size - set by FRR package*.

## Where to find it

Configuration is under **Services** (in the *Routing* group):

| Menu entry | Page | Purpose |
| --- | --- | --- |
| **FRR Global/Zebra** | `pkg_edit.php?xml=frr.xml` | Master switch, router ID, password, logging, static routes; tabs **Global Settings**, **Access Lists**, **Prefix Lists**, **Route Maps**, **Raw Config** |
| **FRR BFD** | `pkg_edit.php?xml=frr/frr_bfd.xml` | BFD enable, peers and profiles |
| **FRR BGP** | `pkg_edit.php?xml=frr/frr_bgp.xml` | Tabs **BGP**, **Advanced**, **Neighbors**, **AS Paths**, **Communities**, **RPKI Cache Servers** |
| **FRR OSPF** | `pkg_edit.php?xml=frr/frr_ospf.xml` | Tabs **OSPF**, **Areas**, **Interfaces**, **Neighbors** |
| **FRR OSPF6** | `pkg_edit.php?xml=frr/frr_ospf6.xml` | OSPFv3 with areas and interfaces |
| **FRR RIP** | `pkg_edit.php?xml=frr/frr_rip.xml` | RIP with interfaces and neighbors |

Status is under **Status → FRR** (in the *Network* group), page `status_frr.php`. Every FRR page
also links to the other protocols with the bracketed tabs (**[BGP]**, **[OSPF]** and so on) and to
**Status**.

## First-time setup

FRR needs the global master switch **and** each protocol's own **Enable**. Nothing runs until
both are set. This example brings up OSPF between two sites over a routed tunnel.

1. Open **Services → FRR Global/Zebra**.
2. Check **Enable**, enter a **Default Router ID** (for example `10.255.0.1`, unique per router)
   and a **Master Password** (required; it protects the FRR management interface). Optionally
   check **Encrypt Password**.
3. Check **Syslog Logging** so the daemons log, and **Save**.
4. Open **Prefix Lists** and create a list, for example `SITE_A_OUT`, that permits only the
   networks this site should advertise (for example `192.168.10.0/24`).
5. Open **Services → FRR OSPF**:
   1. On **OSPF**, check **Enable**, set **Default Area** to `0.0.0.0`, and check **Log Adjacency
      Changes**. If connected networks should be advertised, check **Connected Networks** under
      redistribution and attach the route map or distribute list that limits them.
   2. On **Interfaces**, add the tunnel interface with **Area** `0.0.0.0` and **Network Type**
      *Point-to-Point*. Add the LAN as well and check **Interface is Passive** so OSPF advertises it
      without forming neighbors there.
   3. **Save**.
6. Add firewall rules that allow OSPF on the tunnel interface (see below).
7. Open **Status → FRR**. The **OSPF** tab should show the neighbor in state *Full*, and the
   **Zebra** tab the learned routes.

For BGP the order is the same: enable FRR, then on **FRR BGP** set **Local AS**, enable BGP, add
each peer on **Neighbors** with **Remote AS**, and attach prefix lists or route maps for inbound
and outbound filtering. FRR 10 refuses to exchange routes with eBGP peers that have no policy
applied, unless **Disable eBGP Require Policy** is checked on the **Advanced** tab. Prefer
applying explicit filters.

## Settings reference

### Global Settings (FRR Global/Zebra)

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Master switch for all FRR daemons. | Off |
| **Default Router ID** | Router ID used when a protocol does not set its own. | Empty |
| **Master Password** | Password for the FRR management daemons. Required. | Empty |
| **Encrypt Password** | Enables FRR's password encryption service. | Off |
| **Ignore IPsec Restart** | When unchecked, IPsec VTI interfaces are reset in FRR after IPsec restarts, so routes do not stay inactive. | Off |
| **CARP Status IP** | FRR is not started while the selected CARP VIP is BACKUP, and starts when it becomes MASTER. | none |
| **Syslog Logging** | Daemon logs are written via syslog. | Off |
| **Package Logging Level** | Normal or Extended logging for the package scripts. | Normal |
| **Enable SNMP AgentX** | Expose Zebra data over SNMP through the [NET-SNMP](/packages/net-snmp/) package. | Off |
| **Routes** (Route Handling) | Rows of **Subnet** with **Do Not Accept** (reject exact-match routes from protocols), **Null Route** (drop traffic), or a **Static Route Target** (add an FRR static route that protocols can redistribute; also installed in the system routing table). | Empty |
| **Resolve via default route** | Allow next-hop tracking to resolve through the default route (none, IPv4, IPv6 or both), for example so BGP can peer across the default route. | Default (none) |
| **Force Service Restart** | Restarts FRR. All protocols reconverge. | |

### Access Lists, Prefix Lists and Route Maps

| Page | Main fields |
| --- | --- |
| **Access Lists** | **Type**, **IP Type**, **Name**, **Description** and **Access List Entries** rows: **Sequence**, **Action**, **Source Network** or **Source Any**, **Destination Network** or **Destination Any**, **Exact**. |
| **Prefix Lists** | **IP Type** (IPv4/IPv6), **Name**, **Description** and **Prefix List Entries** rows: **Sequence**, **Action**, **Network** or **Any**, **Minimum Prefix**, **Maximum Prefix**. |
| **Route Maps** | **Name**, **Action** (permit/deny), **Sequence**, **Call Route Map**, **Exit Action**, **Match ACL**, **Match Prefix List**, next hop, metric, weight, local preference, AS path, community, origin, source protocol and tag actions, and **Validate BGP Updates** (RPKI). |

### BGP

| Field | What it does |
| --- | --- |
| **Enable** / **Log Adjacency Changes** | Run `bgpd`; log peer state changes. |
| **Local AS** / **Router ID** | Local autonomous system number and BGP router ID. |
| **Timers** (keepalive), **Hold Time**, **Update Delay**, **Peer Wait** | Session timers. |
| **Disable Default IPv4 Unicast** | Do not activate IPv4 unicast for every neighbor automatically. |
| **Enable BGP RPKI** | Load the RPKI module; configure caches on **RPKI Cache Servers**. |
| **Global Neighbor Shutdown** / **Message** | Administratively shut down all sessions. |
| Graceful restart and graceful shutdown fields | **Disable BGP Graceful Restart**, **Preserve FW State**, stale-path, restart, select-defer and RIB-stale timers, **Enable BGP Graceful Shutdown**. |
| **Redistribute Local / Static / Kernel / OSPF / OSPFv3 / RIP** | Redistribute other route sources, with an optional route map. |
| **Networks to Distribute** | Prefixes to originate (**Subnet to Route** and **Route Map**). |

The **Advanced** tab holds local preference, dampening, route reflector, MED, confederation,
administrative distance and best-path options, including **Network Import Check** and **Disable
eBGP Require Policy**.

**Neighbors** fields include **Name/Address**, **Peer Group**, **Remote AS**, **Password** with
**Password Type** (None, FRR only, setkey only, or FRR and setkey, outbound or bidirectional),
**Update Source**, **Default Originate**, **Send Community**, **Next Hop Self**, per-direction
distribute list, prefix list, AS path and route map filters, **BFD**, timers, **EBGP Multi-Hop**,
**TTL Security Hops**, **Maximum Prefix** limits, **Remove Private AS**, route reflector and route
server client options.

### OSPF and OSPF6

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** / **Log Adjacency Changes** | Run the daemon; log neighbor changes. | Off |
| **Router ID** | OSPF router ID. | Global router ID |
| **SPF Hold Time** / **SPF Delay** | SPF throttling. | Empty |
| **Default Area** / **Default Area Type** | Area for interfaces without one, and its type. | Empty / Normal |
| Redistribution | **Connected Networks**, **FreeSense Kernel Routes**, **BGP Routes**, **RIP Routes**, **FRR Static Routes**, each with metric, metric type, route map and distribute list; **Redistribute Default** with **Always Redistribute**. | Off |
| **RFC 1583 Compatibility**, **Opaque LSA**, **Reference Bandwidth**, **Max Metric**, **Write Multiplier**, **ABR type** | Advanced OSPF behaviour. ABR type defaults to `cisco`. | |

**Areas**: **Area**, **Area Type** (Normal, Stub, Totally Stub, NSSA, NSSA no-summary),
**Default Route Cost**, **ABR Shortcut**, authentication and range options.

**Interfaces**: **Interface**, **Network Type** (Broadcast, Non-Broadcast, Point-to-Multipoint,
Point-to-Point), **Interface is Passive**, **Ignore MTU**, **Metric**, **Area**, **Authentication
Type** (None, Message Digest, Simple Password) and **Password**, **Router Priority**,
**Retransmit Interval**, **Hello Interval**, **Dead Interval**, **Minimal Hello** and **BFD
Enable**. OSPF6 has a similar set, plus **Disable FIB updates**.

### RIP and BFD

- **FRR RIP**: **Enable**, RIP subnets, redistribution (connected, kernel, static, OSPF, BGP)
  with metric, route map and distribute list, plus interface and neighbor tabs.
- **FRR BFD**: **Enable**; **Peers** with **Peer Address**, **Profile**, **Multihop**,
  **Shutdown**, **Interface**, **Local Source Address**, **Detect Multiplier**, receive, transmit
  and echo intervals; **Profiles** hold reusable timer sets. BGP neighbors and OSPF interfaces can
  enable BFD.

### Raw Config

| Field | What it does |
| --- | --- |
| **Manual TCP MD5 Peers** | Source and destination addresses with an MD5 password, for TCP MD5 sessions that are not configured as BGP neighbors. |
| **SAVED frr.conf** | A complete FRR configuration. When it is non-empty, it **replaces** the configuration generated from all the other tabs. Save it empty to return to the GUI configuration. |
| **RUNNING frr.conf** | Filled with the running configuration when you click **Update Running**. A status line says whether SAVED and RUNNING match. |

## Firewall rules and interfaces

The package does not add firewall rules for routing protocols. On each interface that runs a
protocol, allow:

| Protocol | Traffic to allow |
| --- | --- |
| BGP | TCP port 179 between the peer addresses (both directions; either side may connect) |
| OSPF | IP protocol 89 (OSPF) from the neighbors, including the multicast groups `224.0.0.5` and `224.0.0.6` |
| OSPF6 | IP protocol 89 over IPv6, including `ff02::5` and `ff02::6` |
| RIP | UDP port 520 (RIPv2 multicast `224.0.0.9`) |
| BFD | UDP ports 3784 (single hop) and 4784 (multihop) |

Routes learned by FRR change where traffic goes, but the firewall rules still decide what is
allowed. Add rules for the routed traffic, and check that outbound NAT does not translate traffic
that should stay routed between sites.

Interface types FRR can run on include physical interfaces, VLANs, bridges, LAGGs, VXLAN
interfaces (see [VXLAN](/configure/interfaces-vlans-bridges/#vxlan)), and assigned tunnel
interfaces such as IPsec VTI, OpenVPN, GRE and WireGuard.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Services | `FRR zebra`, `FRR staticd`, `FRR mgmtd`, `FRR bfdd`, `FRR bgpd`, `FRR ospfd`, `FRR ospf6d`, `FRR ripd`, `FRR watchfrr` in **Status → Services**; only the enabled daemons run |
| rc script | `/usr/local/etc/rc.d/frr.sh` (one script controls all daemons) |
| Configuration | `/var/etc/frr/frr.conf` (integrated configuration) and `/var/etc/frr/vtysh.conf` |
| Command line | `vtysh` for the FRR shell; `frrctl` for shortcuts such as `frrctl zebra route`, `frrctl bgp sum`, `frrctl ospf neighbor` |
| Logs | With **Syslog Logging** on, zebra, bgpd, ospfd, ospf6d and watchfrr log to **Status → System Logs → System → Routing**; other daemons log to the general system log |
| Status page | **Status → FRR** |
| Diagnostics | FRR adds its configuration and route, neighbor and database output to the system status report (`/status.php`) |

### Status → FRR

The status page was rebuilt for FreeSense 1.1:

- Tabs **Overview**, **Zebra**, **BGP**, **OSPF**, **OSPF6**, **RIP**, **BFD** and
  **Configuration**. A protocol tab is available only when that protocol is enabled; otherwise it
  says, for example, *BGP is not enabled*.
- Summary tiles show daemons running (for example `3 / 3`), route counts, BGP neighbors
  established versus configured, prefixes received, local AS and router ID, OSPF neighbors in
  *Full* state versus all, and BFD peers.
- Each command output (routes, summary, neighbors, database, interfaces, CPU and memory) is in its
  own panel. Route tables have a **filter** box (plain text match, any characters) and a line
  limit; the route table header is kept above the filtered lines.
- **Configuration** shows the generated `.conf` files.

## Upgrade, backup, and removal

- All settings live in `config.xml` (`installedpackages/frr*`) and are part of configuration
  backups, including the raw configuration.
- Plan package updates in a maintenance window: if the daemons restart, every protocol
  reconverges. <!-- needs verification: whether a FreeSense-pkg-frr update restarts the FRR daemons -->
- Removing the package stops all FRR daemons; in FreeSense 1.1 the Package Manager stops a
  package's services before deleting them. The `kern.ipc.maxsockbuf` tunable stays in place. The
  FRR settings stay in `config.xml` for a reinstall.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| No FRR daemons run | The global **Enable** on **FRR Global/Zebra** is off, or the protocol's own **Enable** is off. Both are needed. |
| Save fails on **Global Settings** | **Master Password** is required. |
| FRR does not start on the HA secondary | Expected when **CARP Status IP** is set and the VIP is BACKUP. |
| OSPF neighbors stuck in *ExStart* / *Exchange* | MTU mismatch. Fix the MTU or check **Ignore MTU** on the interface. |
| OSPF neighbors never appear | OSPF (protocol 89) is blocked, the area or network type differs, or authentication does not match. Check **Status → FRR → OSPF** and the routing log. |
| BGP session *Established* but no routes exchanged | FRR 10's eBGP policy requirement. Apply inbound and outbound route maps or prefix lists, or check **Disable eBGP Require Policy**. |
| BGP session stays *Active* / *Connect* | TCP 179 is blocked, the peer address or AS is wrong, or MD5 passwords differ. With setkey password types, both sides must use matching settings. |
| The GUI changes have no effect | **Raw Config → SAVED frr.conf** is not empty and overrides the GUI. Clear it and save. |
| Route filter on the status page returned nothing | The filter is a plain substring match on the lines after the table header; check the text. |

:::note[Changes in FreeSense 1.1]
- **Status → FRR** was rebuilt in the FreeSense 1.1 style, with summary tiles, a daemon tile,
  protocol tabs and non-wrapping console output (freesense-packages f49e6b8).
- Route filtering and line limits on the status page are done in PHP instead of a shell
  pipeline, so any filter text (including `/`) works, and the table header follows the FRR 10
  legend (5768939).
- **Raw Config**: the page script no longer throws on load, both configuration boxes follow the
  light and dark themes, and a status line shows whether SAVED and RUNNING match (f49e6b8).
- The FRR configuration pages are in the *Routing* group of the Services menu and **FRR** in the
  *Network* group of the Status menu (4ae11df).
- Removing the package stops the FRR daemons (freesense c767de3).
:::
