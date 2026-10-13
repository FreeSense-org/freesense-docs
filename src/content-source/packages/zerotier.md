---
title: ZeroTier
description: Join FreeSense to ZeroTier virtual networks, control which managed routes and DNS it accepts, and assign the network as an interface.
---

The **ZeroTier** package joins FreeSense to one or more ZeroTier virtual networks. It runs the
upstream `zerotier-one` service and gives you a WebUI to join and leave networks, choose which
controller-supplied settings the firewall accepts, and see peers. In FreeSense 1.1.0 the package is
`FreeSense-pkg-ZeroTier` 1.0.0, which installs the FreeBSD `zerotier` package 1.16.2.

Use ZeroTier when you want a virtual Ethernet-style network managed by a ZeroTier controller
(hosted or self-run), and the firewall should be one member of it. Membership, addresses and routes
are decided by the controller. FreeSense accepts none of the controller's routes or DNS until you
allow them for each network.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **ZeroTier** (package `FreeSense-pkg-ZeroTier`) and select **Install**.

The installer sets `zerotier_enable=YES` and starts the `zerotier` service.
<!-- needs verification: that zerotier-one is still running after the install finishes (it is started from inside the pkg script; WireGuard's install notes say pkg stops processes its scripts leave running). If not, start it from Status → Services. -->

Stable packages are published for amd64 and, starting with [1.1.1](/releases/1.1.1/), arm64.

## Where to find it

| Menu path | Page |
| --- | --- |
| **VPN → ZeroTier** | **Networks** tab: node ID, online status, version, joined networks, join form |
| **Status → ZeroTier Peers** | **Peers** tab (listed in the VPN group of the Status menu) |

Access to both pages is controlled by the **WebCfg - VPN: ZeroTier** privilege.

## First-time setup

1. Open **VPN → ZeroTier**. Check that **Status** shows **Online** and note the **Node ID**.
2. Under **Join network**, enter the 16-character network ID and select **Join**.
3. In your ZeroTier controller, authorise the node ID as a member of the network and give it an
   address if the controller does not assign one automatically.
4. Back on **VPN → ZeroTier**, the network shows its status, the device name under **Interface**,
   and the assigned addresses.
5. Under **Route consent**, tick only what this firewall should accept (see the table below) and
   select **Apply consent**.
6. To filter or route ZeroTier traffic like any other network, select **Assign interface**
   (**Interfaces → Assignments**), add the ZeroTier device shown under **Interface**, enable the
   new interface and add rules on its tab.

## Settings reference

The package has no settings form. Each joined network has these consent options, which are passed
to `zerotier-cli set <network> <option>=0|1`:

| Option (WebUI label) | ZeroTier setting | What it allows | Default in FreeSense |
| --- | --- | --- | --- |
| **Managed** | `allowManaged` | Addresses and routes assigned by the controller | Off until you tick it |
| **Global** | `allowGlobal` | Managed routes and addresses that overlap public IP space | Off |
| **Default route** | `allowDefault` | A default route from the controller, sending all traffic through ZeroTier | Off |
| **DNS** | `allowDNS` | DNS settings pushed by the controller | Off |

The page states that managed routes, global routes, default routes and DNS stay disabled until
they are accepted. If the network does not get its address after you join, tick **Managed**.
<!-- needs verification: whether allowManaged is actually off after a fresh join (zerotier-one's own default is on); the WebUI shows the live value from zerotier-cli. -->

Other controls on the **Networks** tab:

| Control | What it does |
| --- | --- |
| **Join** | Joins the network ID you enter. The ID must be 16 hexadecimal characters. |
| **Leave** | Leaves the network at once. There is no confirmation. |

## Firewall rules and interfaces

- **Inbound:** ZeroTier works through NAT. Its default UDP port is 9993; passing it on WAN can
  help peers connect directly.
- **Tunnel traffic:** until you assign the ZeroTier device as an interface, you have no rules tab of
  its own for it. Assign it to filter traffic from ZeroTier members, use it in routes, or run
  services on it.
  <!-- needs verification: how traffic on an unassigned ZeroTier device is filtered on FreeSense 1.1. -->
- **Default route:** ticking **Default route** can move the firewall's own internet traffic onto
  ZeroTier. Leave it off unless that is the design.
- **Routes:** check **Diagnostics → Routes** after applying consent, and make sure ZeroTier routes do
  not overlap LAN or other VPN networks.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service | `zerotier` (shown as **ZeroTier Service** in **Status → Services**) |
| rc script | `/usr/local/etc/rc.d/zerotier`, enabled with `zerotier_enable` in `/etc/rc.conf` |
| Daemon | `zerotier-one` |
| CLI | `/usr/local/bin/zerotier-cli` |

The **Networks** tab shows the node ID, **Online** or **Offline**, and the ZeroTier version. The
**Peers** tab lists each peer's address, role, latency and paths, with the preferred path marked.

If the CLI fails, its error is shown at the top of the page.

## Upgrade, backup, and removal

- Network memberships and the node identity are kept by `zerotier-one` in its own data directory,
  not in `config.xml`. A FreeSense configuration backup does not include them. After a restore onto
  new hardware the firewall gets a new node ID; join the networks again and authorise the new ID.
  <!-- needs verification: zerotier-one data directory on FreeSense (FreeBSD default /var/db/zerotier-one) and whether it survives package removal. -->
- Removing the package stops the service and removes `zerotier_enable`. The package entry is also
  removed from `config.xml`, so a later configuration restore or boot-time package sync does not
  install it again.
- Unassign any ZeroTier interface before you remove the package.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| **Status** shows **Offline** or **Node ID** shows "Unavailable" | The `zerotier` service is not running. Start it from **Status → Services**. |
| Network status stays at access denied or requesting configuration | Authorise the node ID in the controller. |
| Network joined but no address | The controller has no address for the member, or **Managed** is not accepted. |
| Remote members cannot reach LAN hosts | No route for the LAN in the controller, no pass rule on the assigned ZeroTier interface, or LAN hosts have no route back. |
| Firewall lost internet access after applying consent | **Default route** was accepted. Untick it and select **Apply consent**. |
| Removed package came back after a configuration restore (1.0.x) | Fixed in 1.1: removal now unregisters the package. |

:::note[Changes in FreeSense 1.1]
- Removing the package now unregisters it from `config.xml`, so a configuration restore or the
  boot-time package sync no longer reinstalls it (`f903b12`).
- **Status → ZeroTier Peers** is listed in the VPN group of the 1.1 Status menu (`4ae11df`).
:::
