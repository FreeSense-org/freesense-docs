---
title: How Fleet is installed and works on the firewalls
description: What the Fleet controller package installs, what the Fleet agent in FreeSense does on a managed firewall, what joining changes (including Tailscale), which versions must match, and how a firewall leaves.
---

[FreeSense Fleet](/configure/fleet/) has two sides, and only one of them is a package:

- **The controller** is one firewall with the optional package `FreeSense-pkg-Fleet` installed.
- **Every managed firewall** has **no package**. The Fleet agent is part of the base FreeSense
  System (1.2 and later) and does nothing until the firewall joins a fleet.

:::caution[Development only]
Fleet is part of the Development line (FreeSense 1.2). It is not in Stable 1.1. See
[Fleet status and known issues](/configure/fleet-status/) for what was tested.
:::

```text
                 your fleet

  +----------------------------+            +---------------------------+
  | Controller                 |            | Managed firewall          |
  | FreeSense-pkg-Fleet        |            | Fleet agent (in System)   |
  |                            |   tunnel   |                           |
  |  wgfctl0 (WireGuard)  <----+------------+---- wgfleet0 (dials out)   |
  |  enrollment web server     |            |  REST API on the overlay  |
  |  poll every minute         |  (or) path |  address only             |
  |  fleet.db, keys in /fleet  +----------->|  Tailscale / direct path  |
  +----------------------------+            +---------------------------+
          ^        ^
          |        +-- standby controller (optional)
          +----------- the administrator: System > FreeSense Fleet
```

The firewall opens the connection to the controller, so a firewall behind NAT needs no inbound
port. Only the controller must be reachable.

## The controller

### Install

1. Open **System → Package Manager → Available Packages** and install **FreeSense Fleet**
   (`FreeSense-pkg-Fleet`). It comes from the Optional Packages repository, like the other
   packages, and is updated the same way.
2. The install is refused on a System older than 1.2: the package needs the Fleet agent files and
   REST API level 11, and says so ("FreeSense Fleet needs FreeSense 1.2 or later") without
   installing anything.
3. Open **Status → FreeSense Fleet → Settings → Controller** and follow the first-run guide. See
   [connection points and firewall rules](/configure/fleet-connect/).

### What it adds

Installing the package only adds files and menu entries. Nothing listens until you switch the
controller on.

| What | Where | When |
|---|---|---|
| Menu entries | **System → FreeSense Fleet** and **Status → FreeSense Fleet** | on install |
| Dashboard widget | **FreeSense Fleet** | on install |
| A privilege for the Fleet pages | in the user manager | on install |
| The controller's data | `/fleet`, its own ZFS dataset when the firewall boots from ZFS (otherwise a directory, mode 0700) | when you switch on |
| Database | `/fleet/fleet.db` (SQLite) | when you switch on |
| Keys | the controller's WireGuard key, its signing key and a master key, all in `/fleet` | when you switch on |
| Controller tunnel | the WireGuard interface `wgfctl0`, UDP 51830 by default | when you switch on |
| Enrollment web server | its own web server, TCP 8443 by default, on the connection points you chose; it serves only the join pages | when you switch on |
| Polling | a job that runs every minute and checks each firewall (every 15 seconds by default, **Settings → Monitoring**) | when you switch on |
| Nightly backup | a job at 03:17 | when you switch on |
| Firewall rules and aliases | locked rules for the enrollment and tunnel ports (`FleetEnroll`, `FleetTunnel`, `FleetBlocked`), or none if you manage them yourself | when you switch on |

Switching the controller off stops the enrollment server, removes the tunnel interface and removes
Fleet's rules. **Removing the package does the same and also removes its jobs, but it never
deletes `/fleet`**: removing the package must not delete a fleet. Delete that data yourself only
when you are sure.

### Stays out of the way

- The controller is not managed by a fleet. Its own **System → Central Management** page says so
  and links to Fleet.
- A fleet has **one controller**. You can pair a **standby controller**: a second firewall with
  the package that keeps a sealed copy of the controller, pulled over the enrollment port, and
  tells every firewall (REST API level 13) where to go if the first stops answering. A takeover is
  manual or automatic; a controller that meets a newer takeover epoch steps down. The standby
  controller has not been tested on 1.2 yet.

## What runs on a managed firewall

A firewall that has not joined runs none of this. After it joins:

| What | Details |
|---|---|
| A management user | `fleet-controller`, API only, with an API key. Nobody knows a password for it. |
| A certificate | a self-signed certificate "FreeSense Fleet node API" for the Fleet API, which the controller pins |
| The Fleet tunnel | the WireGuard interface `wgfleet0`. The firewall starts it itself: the controller is its peer, with an endpoint and a 25-second keepalive, and the firewall opens no WireGuard listen port. |
| A REST API listener | on the tunnel's overlay address only (port 8444), open only to the controller's networks |
| Membership | the `<fleet>` section of `config.xml` |
| Files | under `/cf/conf/fleet`: the tunnel key, the policy bundle, encrypted copies of other firewalls' backups (the vault, up to 5% of the free space by default), a copy of the configuration kept when it leaves, and state files |

If the REST API was off, joining turns it on **for the Fleet listener only**, not on the WebUI
port, so joining adds no exposure on the WebUI. Joining also sets the host name and domain when
the controller's naming group says so.

The tunnel is brought up on every boot. After a System update, the management user's privileges
are brought in line with what that version grants the firewall's role.

### What the controller may do

| Role | What the controller can do |
|---|---|
| **Monitor only** | Read: system, status, configuration, backups, packages, logs and the management status. Nothing is changed. |
| **Managed** | The same, and it may change: the system settings, aliases, firewall rules, NAT, virtual IPs, services, packages, operations (reboot, update) and configuration restore. |

Changes that could cut the controller off use **commit-confirm**: the controller asks the firewall
for a snapshot and a deadline, and if it does not confirm in time, a watchdog on the firewall
restores the snapshot (E310).

### While the controller is away

The firewall keeps running as it did. Policies in mode **Lock** keep working, because the firewall
holds the controller-signed policy bundle and checks local saves against it. A Lock only refuses
a save that introduces a violation. At the console, an administrator can suspend Lock for 1 to 24
hours with a reason (**break-glass**); that raises an alert. A firewall that knows a standby
controller moves to it by itself when the first stops answering.

### Leaving

**Leave the fleet** (WebUI or console option 17) or **Emergency detach** (works without the
controller) removes the listener, the tunnel, the management user and key, the tunnel key and the
`<fleet>` section, restores the REST API setting to what it was, and **keeps a copy of the last
configuration** under `/cf/conf/fleet/archive`. A join that fails part-way is rolled back the same
way. Tailscale, if the join installed it, stays installed.

## How a firewall joins

Three ways, all ending in the same handshake:

1. **The WebUI guide**: **System → Central Management → Add to fleet**. Paste the invitation,
   check, review, join, compare the approval code. See [Add a firewall to a Fleet](/configure/fleet-join/).
2. **The console**: option **17) Fleet central management** (the same as `freesense-join` from a
   shell).
3. **A seed**: a file `fleet-join.conf` on a USB stick, CD or second disk, or in cloud-init user
   data, as the [Deployment Factory](/configure/fleet-join/) makes it. It is attended (asks for
   the key at the console), PIN-sealed, or unattended (joins at the end of boot, in the
   background). The seed is deleted once the firewall has joined.

The invitation's link is `https://<controller>:<port>/fleet/join#<id>.<secret>.<fingerprint>.<m>`.
The part after `#` never leaves the firewall, and its fingerprint is what the firewall pins. The
**join key** (`FLT-…`) is separate and never in the link. The handshake has four steps, all over
TLS pinned to that fingerprint: begin, enroll (the firewall sends its new tunnel key with a proof),
wait for approval (both screens show a 6-digit code) and complete (the firewall's new API key).

### Tunnel, Tailscale or direct

The letter `m` in the link says how the controller reaches the firewall. **Every join builds the
Fleet tunnel**; Tailscale and direct add a second path next to it:

| Method | What it adds on the firewall |
|---|---|
| **Fleet tunnel** | only the tunnel |
| **Tailscale** | a REST API listener on the firewall's tailnet address, opened only to the controller; the join itself runs over the tailnet |
| **Direct** | the same on an internal interface (LAN, MPLS or an existing VPN), refused on a WAN interface unless the controller asks for it (FLEET-E135) |

A path that stops answering never cuts the firewall off: the controller falls back to the tunnel.

### What joining over Tailscale installs

Only the **Tailscale** method does this, and only when the firewall does not already have it:

1. The firewall installs `FreeSense-pkg-Tailscale` (it needs internet and the package
   repository; otherwise the join stops with E133 and the reason).
2. It logs in with a **one-time key** that the invitation carries, sealed with the join key.
3. It waits up to 90 seconds for a tailnet address.
4. It **removes the key** from the configuration and from the saved configuration backups.

With a Tailscale API token, the controller also turns Tailscale key expiry off for the firewall's
device, so the path does not drop months later (**Settings → Access**, on by default; without it,
do it in the Tailscale admin console).

## Versions that must match

The agent updates with System, the controller package updates as a package. Features check the
firewall's **REST API level** (this build is level 15):

| Feature | Needs |
|---|---|
| Installing the controller | level 11 on the controller itself |
| Tailscale and direct paths | level 10 on the firewall |
| Rule and NAT templates, charts and the internet monitor | level 11 |
| Standby controller (firewalls learn the standby) | level 13 |
| "Test from outside" through a firewall | level 14 |
| Encrypted HA link (WireGuard between the pair) | level 15 |

A firewall below the level a feature needs is skipped with `FLEET-E401` and a plain reason; the
rest of Fleet keeps working. Only FreeSense 1.2 has the agent, so a 1.1 firewall cannot join.

## Security in short

- The controller's certificate is **pinned** by the invitation link. Alert channels can pin a
  certificate too.
- The **join key** travels by another channel and is never logged. An invitation works once, expires
  (24 hours by default) and is burned after a number of wrong keys.
- Both screens show the **approval code**; the administrator approves it on the controller.
- The firewall's management user has no password, and its API listener is open only to the
  controller.
- Policy bundles are **signed** by the controller; a firewall only follows signed bundles.
- The firewall rules Fleet makes on the controller are **locked** in the rules pages.

## Not tested yet

- A full join through the WebUI guide on a fresh firewall in a browser. The same steps were run
  from the shell, over Tailscale, and worked.
- The standby controller and the **Direct** method on 1.2.
- What happens on a firewall with several WAN connections.

## Related pages

- [FreeSense Fleet](/configure/fleet/)
- [Add a firewall to a Fleet](/configure/fleet-join/)
- [Connection points and firewall rules](/configure/fleet-connect/)
- [Fleet settings](/configure/fleet-settings/)
- [Fleet status and known issues](/configure/fleet-status/)
