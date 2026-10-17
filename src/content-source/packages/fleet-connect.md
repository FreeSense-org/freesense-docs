---
title: Fleet connection points and firewall rules
description: Choose where firewalls reach a FreeSense Fleet controller - interfaces, ports and addresses, Tailscale, the locked firewall rules Fleet manages for you, the first-run guide and the self-check.
---

Firewalls open the connection to the controller, so only the controller must be reachable. This
page covers how you choose **where** it is reachable, how Fleet opens and closes the ports for
you, and how to check that it works.

:::caution[Development only]
Fleet is part of the Development line (FreeSense 1.2). See [FreeSense Fleet](/packages/fleet/).
:::

## Connection points

A **connection point** is an interface the controller listens on, with the port firewalls join
on and the address they use there. Open **Status → FreeSense Fleet → Settings → Controller**,
turn on **Run this firewall as a FreeSense Fleet controller** and fill in **Where firewalls
connect**:

| Column | Meaning |
| --- | --- |
| **Interface** | WAN for firewalls on the internet, LAN or another internal interface for your own networks, or **Tailscale (tailnet)**. |
| **Port (TCP)** | The enrollment port firewalls join on. The default is 8443. |
| **Address firewalls use** | Leave it empty and Fleet finds it itself: the interface's own address, its dynamic DNS name, or the tailnet address. Enter a public address or DNS name when the controller sits behind NAT, or the address of a port forward to this firewall. |

![Settings, Controller: a WAN and a Tailscale connection point and the tunnel port](__ASSET_ROOT__/screenshots/packages/fleet-connection-points.png)

Select the empty **Add...** row to add another point, and **Remove** to delete one. A WAN address
that is private gets a hint: firewalls on the internet need the public address or DNS name of the
port forward to this firewall.

Below the table, **Tunnel port (UDP)** is the port of the Fleet tunnel (WireGuard), default 51830.
WireGuard listens on one port only, so it is set once for all connection points.

The enrollment server listens only on the addresses of the interfaces you chose. An invitation
takes its address from these points: the **Fleet tunnel** method uses the first point that is not
Tailscale, **Tailscale** uses the Tailscale point, and **Direct** an internal point. A method
without a matching point is greyed out when you make an invitation.

## Firewall rules

Fleet opens the ports itself. For every connection point it keeps real firewall rules and
aliases under **Firewall → Rules → Floating**:

- a pass rule for the enrollment port (TCP) and one for the tunnel port (UDP), on the chosen
  interfaces, from the allowed addresses (alias `FleetEnroll` and `FleetTunnel`);
- two block rules for addresses blocked after too many wrong join keys (alias `FleetBlocked`).

![The locked Fleet rules under Firewall, Rules, Floating](__ASSET_ROOT__/screenshots/packages/fleet-locked-rules.png)

The rules show a lock and *Managed by Fleet*. They cannot be edited, copied, switched, deleted or
dragged, and the REST API refuses to change them: change the connection points instead. Fleet
removes the rules again when you remove an interface from the list, switch the controller off,
or uninstall the package.

To keep full control, turn on **Let me manage the firewall rules myself**. Fleet then adds no
rules and shows a checklist: TCP to this firewall on the enrollment port, and UDP on the tunnel
port, on the same interfaces. Use **Settings → Self-check** afterwards to test them.

Who may reach the enrollment port is set under **Settings → Access**, in two views:
**Exposure** (open for joining or only an allowed list) and **Allowed list**.

## Tailscale

When the controller is in a tailnet, firewalls can join without any public port.

1. Install the Tailscale package on the controller and log it in. See
   [Tailscale](/packages/tailscale/).
2. Add a Tailscale API token under **Firewalls → Connections**. Fleet uses it to make a one-time
   key for each invitation and to turn off the key expiry of the devices it connects.
3. Add a **Tailscale (tailnet)** connection point, or tick **Firewalls may also connect over
   Tailscale** in the first-run guide.

**Settings → Self-check** shows whether the controller is in the tailnet and ready.

## How Fleet reaches a firewall

**Firewalls → Connections** shows how Fleet reaches each firewall. Every firewall joins over the
Fleet tunnel (WireGuard). Fleet can also reach a firewall directly on an internal network, or
over Tailscale; the tunnel then stays as the fallback, so a path that stops answering never cuts
a firewall off. Choose the method for the whole fleet, a group or one firewall.

![Connections: six firewalls on the Fleet tunnel](__ASSET_ROOT__/screenshots/packages/fleet-connections.png)

## First-run guide

Until the controller is switched on, **Settings → Controller** shows a step-by-step guide:

1. **Switch on.**
2. **Where firewalls connect.** The connection point table, with addresses found automatically.
3. **Firewall rules.** Fleet opens the ports for you, or you manage them yourself.
4. **Tailscale.** Optional; shows whether the controller is in a tailnet.
5. **Review.** What **Switch on** does.

The last screen links to **Add your first firewall**.

![The first-run guide: where firewalls connect](__ASSET_ROOT__/screenshots/packages/fleet-first-run-guide.png)

## Self-check

**Settings → Self-check** tests everything firewalls need to reach and trust the controller,
right now:

- the enrollment endpoint is running and which addresses it listens on;
- the public address, and that the enrollment certificate is valid (firewalls pin it, so Fleet
  never replaces it by itself);
- the ports from outside: **Test the ports from outside** asks a firewall in the fleet to try
  the enrollment port and reports what it saw;
- the firewall rules, and whether you manage them yourself;
- the tunnel, and whether any firewall has joined;
- Tailscale, when you use it.

Where Fleet can repair something safely there is a button, for example **Write them again** for
the rules and **Restart the tunnel**.

## Related pages

- [Add a firewall to a Fleet](/packages/fleet-join/)
- [FreeSense Fleet](/packages/fleet/)
- [Fleet settings](/packages/fleet-settings/)
- [Fleet status and known issues](/packages/fleet-status/)
