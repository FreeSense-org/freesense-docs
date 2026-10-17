---
title: Hardware and virtualization
description: Hardware and virtual machine requirements for FreeSense, and how to size an appliance for the services it runs.
---

FreeSense runs on 64-bit hardware and in virtual machines. Treat the firewall as an appliance:
choose hardware for the traffic, encryption, inspection, and log retention you actually plan to
enable, not just for the base install.

## Supported architectures

| Architecture | Stable 1.1 | Development 1.2 |
| --- | --- | --- |
| **amd64** (x86-64), UEFI or legacy BIOS | Supported | Experimental |
| **arm64**, generic UEFI machines with virtio storage and networking | Supported from 1.1.1 (installer image only) | Experimental preview |
| **Raspberry Pi** 4 Model B and Pi 5 (D0) appliance images | Not part of 1.1 | Experimental preview |

Stable 1.1.0 was published for **amd64 only**. Starting with [1.1.1](/releases/previous-1.1/#freesense-111), Stable
also ships generic arm64 (UEFI): signed System and Optional Packages for aarch64 and an installer
image. There are no arm64 cloud images on Stable, and the Raspberry Pi appliance images stay on
the Development line. See [arm64 systems](#arm64-systems) below.

## Requirements

| | Minimum | Recommended |
| --- | --- | --- |
| CPU | 64-bit amd64 processor | 64-bit multi-core processor with AES-NI |
| Memory | 1 GB | 4 GB, or more for the services you run |
| Storage | 8 GB | 16 GB SSD, or more for logs and packages |
| Network | 2 interfaces (WAN and LAN), or 1 VLAN-capable interface | 2 or more well-supported interfaces |
| Firmware | UEFI or legacy BIOS | UEFI |
| Installer media | USB stick of 2 GB or more | |

<!-- needs verification: the 1 GB RAM / 8 GB disk minimum comes from earlier documentation and has
not been re-tested on 1.1.0. The only hard memory check in the 1.1.0 code is a console warning
below 128 MB (minimum_ram_warning in src/etc/inc/globals.inc). The recommended column matches the
download page. The release automation boots the amd64 ISO installer with 4096 MiB and 2 vCPUs
(freesense-os-base scripts/runner/smoke-iso.sh). The AES-NI recommendation is general VPN sizing
advice, not a tested requirement. -->

The minimum is enough to install FreeSense and route traffic in a lab. For anything you depend on,
start from the recommended column. Release automation boot-tests the installer in a virtual
machine with 4 GiB of memory.

ZFS needs more memory than UFS. For ZFS installations, and for the ZFS cloud image, allocate at
least 4 GB of RAM. For filesystem choice, see [Installation](/getting-started/installation/#choose-zfs-or-ufs).

## Size for the services you enable

| Profile | CPU | Memory | Storage | Network |
| --- | --- | --- | --- | --- |
| Lab or light edge | 2 cores | 4 GB | 16 GB SSD | 2 interfaces, or 1 VLAN-capable NIC |
| VPN and services | 4 cores | 8 GB | 32 GB SSD | Intel or other well-supported multi-port NIC |
| Inspection and retention | 4+ cores | 16 GB+ | 64 GB+ SSD | NICs sized for sustained traffic |

These profiles are planning guidance, not tested limits. Some services can move a system from the
first profile to the third. Suricata IDS/IPS, ntopng traffic analysis, and the Secure Web Gateway
are rated **intensive** in the package catalog. Threat Shield feed processing, long log retention,
and high encrypted VPN throughput also add load. **System → Package Manager** shows each package's
resource profile (lightweight, moderate, or intensive) before you install it. See the
[package catalog](/packages/catalog/).

## Network interfaces

An appliance normally has a dedicated WAN interface and a dedicated LAN interface. You can run a
lab or trunk design on one physical interface if the upstream switch carries VLANs. That design
needs a reliable management VLAN and a tested recovery path, because one wrong change can lock you
out of both networks.

Use well-supported NICs. Before you deploy a system remotely, test link state, VLAN tagging,
offload behaviour, and console access on the actual hardware.

## Virtual machines

FreeSense runs as a virtual appliance on any hypervisor that provides stable virtual NICs and a
serial or virtual console.

- Put WAN and LAN on separate virtual networks or port groups.
- Keep a virtual console available so you can recover if the management network configuration is
  wrong.
- Reserve CPU and memory for inspection workloads. Don't overcommit them.
- Take a configuration backup before you change virtual switches or NIC order.

For KVM-compatible platforms and bhyve, official amd64 QCOW2 and raw disk images are available with
a UFS or ZFS root. They are provisioned with cloud-init and include the QEMU guest agent. See
[Cloud images](/getting-started/cloud-images/).

On VMware, install the **Open VM Tools** package for guest integration (**System → Package
Manager**). It adds integration with the hypervisor, not firewall features. See
[Open VM Tools](/packages/open-vm-tools/).

## arm64 systems

- **Generic arm64 (UEFI)**, Stable from 1.1.1 and Development: an installer image for machines with
  standard UEFI firmware and virtio storage and networking, such as QEMU `virt`. It doesn't include
  board firmware, U-Boot, or device trees, and it doesn't make single-board computers compatible.
  See [Install on arm64](/getting-started/installation/#install-on-arm64).
- **Raspberry Pi 4 Model B and Raspberry Pi 5 (D0)**, Development only: preinstalled appliance
  images, not installers. See [Raspberry Pi appliance images](/1.2/getting-started/raspberry-pi/).

The Optional Packages policy does not build Suricata or Web Gateway Local Antivirus for arm64.

:::caution[Development builds]
Development builds, including the Raspberry Pi images, are experimental and unsupported. Don't use
them in production. A system that moves to Development can't return to Stable through the updater.
:::

Next: [install FreeSense](/getting-started/installation/).
