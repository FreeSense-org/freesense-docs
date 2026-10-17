---
title: Fleet HA pairs
description: Set up two FreeSense firewalls as a CARP high-availability pair from the Fleet controller, and how Fleet keeps a pair safe during updates and reboots.
---

FreeSense Fleet finds firewalls that share CARP addresses and shows them as **HA pairs**. It can
also set up a new pair from two managed firewalls: the shared addresses, state sync (pfsync) and
configuration sync on both, in one wizard.

:::caution[Development only]
Fleet is part of the Development line (FreeSense 1.2). See [FreeSense Fleet](/configure/fleet/).
:::

Fleet never works on both firewalls of a pair at once: the BACKUP goes first, and the MASTER only
when its partner is back and the pair is healthy. Reboots and updates are held while the pair has
a problem, such as both firewalls claiming MASTER.

## Before you start

- Both firewalls are in the fleet with **Managed** access and not in another pair.
- Both have the same interfaces on the same networks.
- Both have a **sync interface** with an address, ideally a direct link between the two. In the
  examples below it is an interface called *SYNC* with `10.252.0.2/24` and `10.252.0.3/24`.

## Set up a pair

**Firewalls → HA pairs → Set up a pair** is a step-by-step guide. A bar at the top shows the
steps, and **Back** keeps everything you chose.

1. **Firewalls.** Choose the **Primary (MASTER)** and the **Secondary (BACKUP)**, then select
   **Read their interfaces**. Fleet reads both firewalls. Two interfaces that share one network
   card on a firewall are named and not offered, because their addresses cannot be told apart.
2. **Shared addresses.** Tick **Share** for each network that gets a shared (CARP) address. Fleet
   fills in the first free address; check that nothing else on the network uses it. Leave
   **VHID** on *auto* unless you need a fixed one.
3. **Sync.** Choose the **Sync interface**: states (pfsync) and the configuration go over it, so
   a direct link between the two is best. If you choose the WAN, a warning says that state sync is
   not encrypted and would cross the internet. Then choose what configuration sync copies:
   firewall rules, aliases and NAT are on by default; schedules, static routes, DHCP server, DNS
   forwarder, traffic shaper and Wake-on-LAN are optional. Users and certificates are not
   offered: syncing them would replace the secondary's Fleet access.
4. **Review.** It lists what will happen on both firewalls. Nothing has changed yet. Select
   **Set up ... as a pair**.

![The review: shared address, state sync, configuration sync user and new passwords](__ASSET_ROOT__/screenshots/packages/fleet-ha-review.png)

Fleet creates a user `fleet-hasync` on the secondary with only the HA sync privilege, and new
random CARP and sync passwords that it does not keep. Each firewall is changed under
commit-confirm: if anything fails, Fleet undoes the setup on both.

The setup runs as an operation in **Activity**. It takes about a minute:

![The finished setup: DC1 edge A is MASTER and DC1 edge B BACKUP](__ASSET_ROOT__/screenshots/packages/fleet-ha-activity.png)

When one firewall of a pair stops answering, for example after a power cut, Fleet reports the
pair as **Member down** and says which firewall carries the shared addresses. It reports
*split-brain* (both MASTER) or *no MASTER* only when the firewalls really say so, and it never
calls a pair healthy while a member does not answer. An alert (*An HA pair has two MASTERs, none,
or a member down*) is sent, and reboots and updates are held until the pair is healthy again.

## The pair list

**Firewalls → HA pairs** shows each pair with the role of each firewall, its state, the shared
addresses with their VHID, and where configuration sync comes from.

![An HA pair in the Healthy state](__ASSET_ROOT__/screenshots/packages/fleet-ha-pairs.png)

**Pair a group** sets up several pairs from one group. HA pairs also appear in the
[live view](/configure/fleet-live-view/), with the role of each member and the last change.

## Related pages

- [FreeSense Fleet](/configure/fleet/)
- [Fleet policies](/configure/fleet-policies/)
- [Fleet live view and NOC screens](/configure/fleet-live-view/)
