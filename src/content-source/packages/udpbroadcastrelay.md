---
title: UDP Broadcast Relay
description: Relay UDP broadcast and multicast discovery packets between FreeSense interfaces with the udpbroadcastrelay package.
---

The **UDP Broadcast Relay** package (`FreeSense-pkg-udpbroadcastrelay` 1.2.8) runs one
`udpbroadcastrelay` process per configured instance. Each instance listens for UDP broadcasts
(and optionally one multicast group) on a given port and retransmits them on the other selected
interfaces. Broadcasts never cross a router on their own, so this is how discovery protocols that
rely on broadcasts work across VLANs: game and media server discovery, some smart-home and
building-automation devices, and similar LAN-only protocols.

For mDNS use [mDNS Bridge](/packages/mdns-bridge/) or [Avahi](/packages/avahi/). For routed
multicast streams with IGMP/MLD use [Multicast Bridge](/packages/mcast-bridge/). DHCP has its own
relay in **Services → DHCP Relay**.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **UDP Broadcast Relay** (package `FreeSense-pkg-udpbroadcastrelay`) and click
   **Install**.

The `udpbroadcastrelay` daemon is installed as a dependency. On Stable 1.1 the package is
available for amd64. See [Installing packages](/packages/installing-packages/).

## Where to find it

**Services → UDP Broadcast Relay** (in the *Routing* group of the Services menu):

- `udpbroadcastrelay/udpbroadcastrelay.php`: **General Settings** and the instance table (Port,
  Interfaces, Description, Actions) with a select-all checkbox for deleting instances.
- `udpbroadcastrelay/udpbroadcastrelay_edit.php`: **Instance Settings** for one instance.

## First-time setup

1. Open **Services → UDP Broadcast Relay**.
2. Click **Add** below the instance table and fill in **Instance Settings**:
   1. Check **Enable**.
   2. Enter a **Description**, for example `Game discovery`.
   3. Select at least two **Network Interfaces**, for example *LAN* and *GAMES*.
   4. Enter the **UDP Port** the application broadcasts on.
   5. Leave **Spoof Source** on **Keep Original** unless the application needs replies to the
      relay address.
3. Save the instance.
4. On the main page, check **Enable** under **General Settings** and save. The service is
   reloaded with every enabled instance.
5. Add the firewall rules described below and test discovery between the two networks.

## Settings reference

### General Settings

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Enables the UDP Broadcast Relay service. | Off |
| **Track CARP Status** | Run only while the selected CARP VIP is MASTER. | `none` |

### Instance Settings

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Run this instance. | Off |
| **Description** | Free text for reference. | Empty |
| **Network Interfaces** | Interfaces to receive and retransmit on. At least two. Only assigned, enabled interfaces that exist on the system are listed. | None |
| **Spoof Source** | Source used for relayed packets: **Keep Original (default)**, **Use Interface Address and Destination Port**, or **Use Interface Address only**. | Keep Original |
| **UDP Port** | Destination UDP port to listen on, 1 to 65535. | Empty |
| **IP Address** (next to UDP Port) | Optional IPv4 multicast group to relay as well as broadcasts. | Empty |

Limits and checks:

- Up to 63 instances can be enabled.
- Two enabled instances cannot use the same port on overlapping interfaces.

## Firewall rules and interfaces

The package adds no firewall rules.

- On every interface in an instance, allow **UDP** from the interface network to the
  instance's port, with destination *any* (or the interface broadcast address and, if used, the
  multicast group).
- Add rules for the application's follow-up traffic between the networks, which is usually
  unicast and uses other ports.
- With **Keep Original**, relayed packets carry the original sender's address, so replies go
  straight to the sender and need a rule in that direction.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service name | `udpbroadcastrelay` (*UDP Broadcast Relay* in **Status → Services**) |
| rc script | `/usr/local/etc/rc.d/udpbroadcastrelay.sh` |
| Processes | `/usr/local/sbin/udpbroadcastrelay --id <n> --port <port> --dev <if> ...`, one per enabled instance |
| Logs | Daemon facility with the `udpbroadcastrelay` tag; see **Status → System Logs → System → General**. A failed instance start logs `Failed to start instance` with the error. |

## Upgrade, backup, and removal

- Settings are stored in `config.xml` and included in configuration backups.
- Removing the package stops the service, deletes the rc script and the temporary files under
  `/tmp/udpbr_tmp.*`. The settings stay in `config.xml` for a later reinstall.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| *At least two interfaces must be selected* | Select two or more interfaces in the instance. |
| *Duplicate port found on an instance with overlaping interfaces* | Another enabled instance already relays that port on one of the same interfaces. Merge them or change the interface set. |
| *Instance limit reached* | More than 63 instances are enabled. |
| The log shows *Failed to start service due to a configuration error* | The stored configuration did not validate, for example an interface was removed. Edit and save each instance. |
| The log shows *Ignoring service start - no valid instances to start* | No instance is enabled. |
| The service keeps running after you uncheck **Enable** under **General Settings** | The service is not stopped when the global switch is turned off; see the note below. Stop it from **Status → Services**. |

<!-- needs verification: udpbr_resync() returns early when the global Enable is off, so saving with
Enable unchecked appears to leave running instances and the rc script in place until a reboot or a
manual stop. Confirm on a 1.1 system. -->

:::note[Changes in FreeSense 1.1]
- **UDP Broadcast Relay** is listed in the *Routing* group of the 1.1 Services menu
  (freesense-packages 4ae11df).
- Removing the package now reliably stops the relay: the Package Manager stops a package's
  services before deleting them (freesense c767de3).
- Otherwise the package is unchanged from 1.0.x apart from the rebuild for the FreeBSD 16
  platform.
:::
