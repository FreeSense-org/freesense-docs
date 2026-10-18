---
title: QEMU Guest Agent
description: Install the QEMU guest agent on a standard FreeSense virtual machine so Proxmox, KVM and libvirt can shut it down cleanly and read its addresses.
---

The **QEMU Guest Agent** package installs the guest agent for QEMU-based hypervisors (Proxmox VE,
KVM, libvirt, plain QEMU) on a FreeSense virtual machine. With it, the host can shut down or
restart the firewall cleanly, read its IP addresses, and freeze its file systems for consistent
snapshots and backups. The package is `FreeSense-pkg-Qemu-Guest-Agent` 1.0.0, and it installs the
`qemu-guest-agent` build from the FreeSense System repository.

:::note[Not for the cloud image]
The [cloud image](/getting-started/cloud-images/) already includes the QEMU guest agent and the
VMware tools. Installing this package there is refused, with a message saying so; nothing is
installed. This package is for standard installs from the installer image or the appliance image.
:::

Development only: this package is part of FreeSense 1.2.

## Install

1. In the hypervisor, give the virtual machine the agent channel first. In Proxmox, open the VM's
   **Options**, edit **QEMU Guest Agent**, tick **Use QEMU Guest Agent**, and shut the VM down and
   start it again so the channel exists. For libvirt or plain QEMU, add a virtio-serial device with
   a port named `org.qemu.guest_agent.0`.
2. Open **System → Package Manager → Available Packages**.
3. Find **QEMU Guest Agent** (package `FreeSense-pkg-Qemu-Guest-Agent`) and select **Install**.

The installer turns the agent on (`qemu_guest_agent_enable=YES`), links its start script so that it
starts with the system, and starts it when the channel is there. If the channel is missing the
package still installs and enables the agent, and the log says what to add; start the service
from **Status → Services** once the VM has the channel.

## Where to find it

The package has no configuration page and no menu entry. Its service appears under
**Status → Services**:

| Service | Description |
| --- | --- |
| `qemu-guest-agent` | **QEMU Guest Agent** |

## First-time setup

1. Install the package on the FreeSense virtual machine, with the channel in place (see Install).
2. Open **Status → Services** and check that **QEMU Guest Agent** is running.
3. In Proxmox, open the VM's **Summary**. It shows the IP addresses reported by the agent. From the
   Proxmox host, `qm guest cmd <vmid> ping` answers without an error.
4. In a maintenance window, use **Shutdown** on the VM and confirm that FreeSense shuts down
   cleanly (it should not need the host to force it off after a timeout).

## Settings reference

There are no WebUI settings. The agent reads one variable, which you normally leave alone:

| Variable | What it does | Default after install |
| --- | --- | --- |
| `qemu_guest_agent_enable` | Starts the agent with the system. | `YES` |

## Firewall rules and interfaces

None. The agent talks to the host through the virtio-serial channel, not over the network.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Agent | `/usr/local/bin/qemu-ga`, started by `/usr/local/etc/rc.d/qemu-guest-agent` |
| Channel | `/dev/vtcon/org.qemu.guest_agent.0` |
| Log | `/var/log/qemu-ga.log` |

From a shell, `service qemu-guest-agent status` shows whether it runs. Install problems are logged
with the tag `qemu-guest-agent`.

## Upgrade, backup, and removal

- The package stores nothing in `config.xml`, so there is nothing to back up or restore.
- Removing the package deletes the `qemu-guest-agent.sh` link and the `qemu_guest_agent_enable`
  setting. The `qemu-guest-agent` build itself may stay installed until pkg removes unused packages.
- A hypervisor snapshot is not a replacement for a FreeSense configuration backup.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| The host says the agent is not running | The channel is missing. Check that the VM has the agent option in the hypervisor and was restarted after you turned it on, and that `/dev/vtcon/org.qemu.guest_agent.0` exists in FreeSense. Then start the service from **Status → Services**. |
| **QEMU Guest Agent** shows as stopped | Run `service qemu-guest-agent start` from a shell and read `/var/log/qemu-ga.log`. |
| Installing says this is the cloud image | The cloud image already includes the agent. Nothing to install. |
| Installed on a VMware or bare-metal system | It does no harm, but has no use there. Use [Open VM Tools](/packages/open-vm-tools/) on VMware. |
