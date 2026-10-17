---
title: Tailscale
description: Join FreeSense to a Tailscale tailnet as a subnet router or exit node, with the settings, rules, and service details you need.
---

The **Tailscale** package joins FreeSense to a Tailscale network (a *tailnet*). It runs the upstream
`tailscaled` daemon and brings it up with the options you set in the WebUI. In FreeSense 1.1.0 the
package is `FreeSense-pkg-Tailscale` 0.1.9, which installs the FreeBSD `tailscale` package
1.102.5.

Use Tailscale when you want a managed WireGuard-based mesh: the Tailscale control server (or a
compatible server you run yourself) handles identity, device approval, keys, and peer discovery,
and NAT traversal works without opening inbound ports. FreeSense can then advertise local networks
to the tailnet (subnet router), offer itself as an exit node, or use routes advertised by other
nodes. If you want the firewall to own all keys and routes itself, use [WireGuard](/packages/wireguard/)
instead.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **Tailscale** (package `FreeSense-pkg-Tailscale`) and select **Install**.

The package creates the **Tailscale** interface group during installation. It does not start the
daemon until you enable it.

Stable packages are published for amd64 and, starting with [1.1.1](/releases/previous-1.1/#freesense-111), arm64.

## Where to find it

| Menu path | Page |
| --- | --- |
| **VPN → Tailscale** | Tabs **Authentication**, **Settings** and **Status** |
| **Status → Tailscale** | Status output (listed in the VPN group of the Status menu) |
| **Firewall → Rules → Tailscale** | Rules for the Tailscale interface group |

Every Tailscale page shows a banner with the current state: not enabled, not running, not online,
or online.

## First-time setup

1. In the Tailscale admin console (or on your own control server), create an auth key for the
   firewall. A non-reusable key is recommended. For a firewall you trust, turn off key expiry for
   the machine in the admin console after it joins.
2. Open **VPN → Tailscale → Authentication**. Leave **Login Server** at
   `https://controlplane.tailscale.com`, or enter the URL of your own control server.
3. Paste the key into **Pre-authentication Key** and select **Save**.
4. Open the **Settings** tab and tick **Enable Tailscale**.
5. Decide on DNS and routing:
   - **Accept DNS** is on by default. Turn it off unless you want the control server to supply
     DNS settings to the firewall itself.
   - To make LAN networks reachable from the tailnet, add them under **Advertised Routes**, for
     example `192.168.1.0/24`.
   - To let tailnet devices send internet traffic through FreeSense, tick
     **Advertise Exit Node**.
6. Select **Save**. The daemon starts, `tailscale0` is created and added to the **Tailscale**
   interface group, `tailscale up` runs with your options, and the firewall rules are reloaded.
7. In the Tailscale admin console, approve the advertised routes and the exit node if your tailnet
   requires approval.
8. Add pass rules on **Firewall → Rules → Tailscale** for the traffic you want to allow from the
   tailnet.
9. Check **Status → Tailscale**. **Tailscale Status** lists the peers and **Tailscale IP** shows the
   firewall's tailnet addresses.

## Settings reference

### Authentication tab

| Field | What it does | Default |
| --- | --- | --- |
| **Login Server** | Base URL of the control server. Must be a valid URL. | `https://controlplane.tailscale.com` |
| **Pre-authentication Key** | The machine auth key. Changing it stops Tailscale, clears the local state cache and starts it again if it was running. | Empty (required) |
| **Logout and Clean** | Disconnects from the control server, expires the current login, and deletes the local state cache. | Button |

### Settings tab

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Enables and starts the daemon. | Off |
| **Listen Port** | UDP port for WireGuard and peer-to-peer traffic. | 41641 |
| **State Directory** | Where the state (node key, certificates, received files) is stored. Changing it does not move the existing state and needs a new login. | `/usr/local/pkg/tailscale/state` |
| **Keep Configuration** | Keeps the package settings and the local state cache when the package is removed or reinstalled. | On |
| **Accept DNS** | Accepts DNS configuration from the control server. | On |
| **Advertise Exit Node** | Offers FreeSense as an exit node for internet traffic from the tailnet. | Off |
| **Accept Subnet Routes** | Installs routes that other nodes advertise. | Off |
| **Advertised Routes** | Subnets in CIDR notation to advertise, each with a description. Entries are rounded down to their network address before saving. | Empty |
| **Syslog Logging** | Sends daemon output to syslog. | Off |
| **Syslog Settings** | Priority and facility used for syslog output. | NOTICE, LOG_DAEMON |

Saving a change that alters the rc configuration restarts the daemon. Peer connections and access
through Tailscale drop briefly.

## Firewall rules and interfaces

- `tailscale0` is not assigned as a FreeSense interface. It is a member of the **Tailscale**
  interface group, so traffic arriving from the tailnet is filtered by the rules on
  **Firewall → Rules → Tailscale**. Without pass rules there, that traffic is blocked.
- **Inbound:** Tailscale works through NAT without an inbound rule. Passing UDP to the
  **Listen Port** (41641) on WAN can help peers connect directly instead of through relays.
- **Subnet router:** besides the advertised route, you need a pass rule on the Tailscale tab to the
  advertised networks. LAN hosts need a way back to tailnet addresses; when FreeSense is their
  default gateway this works without extra routes.
- **Exit node:** tailnet clients use addresses from `100.64.0.0/10`. Make sure outbound NAT on WAN
  covers that range.
  <!-- needs verification: whether automatic outbound NAT already translates 100.64.0.0/10 from tailscale0, or a manual/hybrid outbound NAT rule is required for exit-node traffic. -->
- **Accept Subnet Routes:** routes learned from other nodes are added to the firewall's routing
  table. Check them under **Diagnostics → Routes** and make sure they do not overlap local networks.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service | `tailscale` (shown as **Tailscale Daemon** in **Status → Services**) |
| rc script | `/usr/local/etc/rc.d/freesense_tailscaled`, which wraps the upstream `tailscaled` script |
| rc settings | `/usr/local/etc/rc.conf.d/freesense_tailscaled` and `/usr/local/etc/rc.conf.d/tailscaled` (generated; do not edit) |
| Interface | `tailscale0`, in interface group **Tailscale** |
| State file | `tailscaled.state` in the **State Directory** |

The **Status** tab runs and shows `tailscale status`, `tailscale ip`, `ifconfig tailscale0` and
`tailscale netcheck`, followed by the installed package versions.

Start-up messages are logged with the tag `tailscale` in the system log (**Status → System Logs**).
Turn on **Syslog Logging** to also send the daemon's own output to syslog.
<!-- needs verification: where tailscaled output goes when Syslog Logging is off (upstream rc default). -->

## Upgrade, backup, and removal

- Settings are stored in `config.xml` (`installedpackages/tailscale` and
  `installedpackages/tailscaleauth`) and are part of a configuration backup. The auth key is stored
  there in plain text; protect your backups.
- The node identity is in the state file, not in `config.xml`. A configuration restore onto new
  hardware does not bring the old node identity; the firewall joins again with the auth key, if
  the key is still valid.
- On first start, a state file left in `/var/db/tailscale` is moved to the **State Directory**.
- Removing the package stops the daemon and removes the **Tailscale** interface group. With
  **Keep Configuration** on (the default), settings and the state cache stay. With it off, the
  state file and both configuration sections are deleted.
- Remove the machine from the Tailscale admin console when you retire a firewall.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Banner says "Tailscale is not running" | Start it from **Status → Services** and check the system log for `tailscale` messages such as "Unable to find device tailscale0". |
| Banner says "Tailscale is not online" | The auth key is wrong, expired or already used. Enter a new key on **Authentication**; this restarts with a clean state. |
| Tailnet devices cannot reach LAN hosts | The route is not approved in the admin console, there is no pass rule on **Firewall → Rules → Tailscale**, or the LAN host has no route back. |
| Exit node works for the firewall but clients have no internet | Outbound NAT does not cover `100.64.0.0/10`, or no rule passes the traffic on the Tailscale tab. |
| Firewall's own DNS changed after enabling | **Accept DNS** is on. Turn it off if the firewall should keep its own resolver settings. |
| Need to start over | Use **Logout and Clean**, then save a new auth key. |

:::caution[Auth key in the system log before 1.1.2]
Up to FreeSense 1.1.1, the start-up script logged the full `tailscale up` command line, including
`--auth-key`, and passed the key on the command line. From [1.1.2](/releases/previous-1.1/#freesense-112) the key goes
through a root-only temporary file and is never logged. If a key was used on 1.1.0 or 1.1.1, treat
the system log and any remote syslog copy as containing it: revoke the key in the Tailscale admin
console and save a new one. Prefer non-reusable keys, so a leaked key cannot add more machines.
:::

:::note[Changes in FreeSense 1.1]
- **Status → Tailscale** is listed in the VPN group of the 1.1 Status menu (`4ae11df`).
- The filter reload helper in the start-up script and its log line now say FreeSense
  (`8d82a24`).
- Otherwise the package is unchanged from 1.0.x apart from the rebuild for the FreeBSD 16
  platform; the bundled `tailscale` is 1.102.5.
:::
