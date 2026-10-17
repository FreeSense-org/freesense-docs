---
title: Fleet HA pairs
description: Set up two FreeSense firewalls as a CARP high-availability pair from the Fleet controller, and how Fleet keeps a pair safe during updates and reboots.
---

FreeSense Fleet finds firewalls that share CARP addresses and shows them as **HA pairs**. It can
also set up a new pair from two managed firewalls: the shared addresses, state sync (pfsync) and
configuration sync on both, in one wizard.

:::caution[Development only]
Fleet is part of the Development line (FreeSense 1.2). See [FreeSense Fleet](/packages/fleet/).
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

1. Open **Firewalls → HA pairs** and select **Set up a pair**.
2. Choose the **Primary (MASTER)** and the **Secondary (BACKUP)**, then select **Read their
   interfaces**.
3. Under **Shared addresses and sync**, tick **Share** for each network that gets a shared (CARP)
   address. Fleet fills in the first free address; check that nothing else on the network uses
   it. Leave **VHID** on *auto* unless you need a fixed one.
4. Choose the **Sync interface**. States (pfsync) and the configuration go over it.
5. Under **The primary pushes to the secondary**, choose what configuration sync copies:
   firewall rules, aliases and NAT are on by default; schedules, static routes, DHCP server, DNS
   forwarder, traffic shaper and Wake-on-LAN are optional. Users and certificates are not offered:
   syncing them would replace the secondary's Fleet access.
6. Select **Review**. The **Review** section below the form lists what Fleet will do.

![The review: shared address, state sync, configuration sync user and new passwords](__ASSET_ROOT__/screenshots/packages/fleet-ha-review.png)

7. Select **Set up ... as a pair**.

Fleet creates a user `fleet-hasync` on the secondary with only the HA sync privilege, and new
random CARP and sync passwords that it does not keep. Each firewall is changed under
commit-confirm: if anything fails, Fleet undoes the setup on both.

The setup runs as an operation in **Activity**. It takes about a minute:

![The finished setup: DC1 edge A is MASTER and DC1 edge B BACKUP](__ASSET_ROOT__/screenshots/packages/fleet-ha-activity.png)

:::note[Known issue]
When one firewall of a pair loses power, Fleet can briefly report a split-brain and then
"healthy again" while that firewall is still down. See
[Fleet status and known issues](/packages/fleet-status/).
:::

## The pair list

**Firewalls → HA pairs** shows each pair with the role of each firewall, its state, the shared
addresses with their VHID, and where configuration sync comes from.

![An HA pair in the Healthy state](__ASSET_ROOT__/screenshots/packages/fleet-ha-pairs.png)

**Pair a group** sets up several pairs from one group.

## Related pages

- [FreeSense Fleet](/packages/fleet/)
- [Fleet policies](/packages/fleet-policies/)
