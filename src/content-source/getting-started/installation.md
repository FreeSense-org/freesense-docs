---
title: Installation
description: Download, verify, write to USB, and install FreeSense.
---

This guide takes you from a downloaded image to a freshly installed FreeSense system.

## Requirements

- A 64-bit amd64 machine, or an experimental standards-compliant ARM64 UEFI machine, dedicated to FreeSense
- At least **1 GB RAM** and **8 GB disk**
- **Two network interfaces** (WAN + LAN), or one interface with VLANs
- A USB stick (at least 2 GB) to write the installer

## 1. Download

Open the [download page](https://freesense.org/download) and choose:

- **Stable 1.0.x** for supported production and normal use, or
- **Development 1.1** only for experimental testing in a lab.

:::danger[Development is unsupported]
Development builds are experimental and receive no support. Do not install one on a production or
support-dependent firewall. Upgrading from 1.0.x to 1.1 cannot be reversed through the updater.
:::

The guided picker displays the exact SHA-256 checksum, size, publication date, and build provenance
read from the live architecture-specific channel document. The amd64 ISO, ARM64 installer IMG,
QCOW2, and raw images are served from immutable URLs
on `downloads.freesense.org`. For a preinstalled KVM-compatible disk, follow the
[cloud-image guide](/getting-started/cloud-images/) instead of writing the installer.

## 2. Verify the download

Always verify the image before writing it.

```sh
# compare this output with the SHA-256 value on the download page
sha256sum FreeSense-*-amd64.iso
```

For ARM64, verify the compressed installer before decompressing it:

```sh
sha256sum FreeSense-*-arm64-installer.img.xz
xz -dk FreeSense-*-arm64-installer.img.xz
```

ARM64 is experimental and UEFI-only. The generic image expects standard UEFI plus virtio storage
and networking. It does not include Raspberry Pi firmware, U-Boot, DTBs, or support for any
particular single-board computer.

The complete 64-character value must match before you write the image.

## 3. Write to USB

:::caution
Writing to the wrong device will erase it. Double-check the target disk name.
:::

**macOS / Linux:**

```sh
# find your USB device first (diskutil list / lsblk)
dd if=FreeSense-*-amd64.iso of=/dev/diskN bs=4m
```

Use the decompressed `.img` file instead of the ISO when installing ARM64.

**Windows:** use [balenaEtcher](https://etcher.balena.io/) and select the `.iso`.

## 4. Boot the installer

Boot the target machine from the USB stick. You may need to enable USB boot or disable Secure Boot
in the firmware. The FreeSense installer supports both **UEFI** and **BIOS**.

Follow the prompts to install to the internal disk. When it finishes, remove the USB stick and
reboot.

## Installation decisions

The installer writes the selected target disk. Identify that disk by capacity and model before
confirming—especially on a system that also contains data disks, a hypervisor boot disk, or mirrored
storage. Do not rely only on device names, which can change between hardware and virtual platforms.

Choose the filesystem and disk layout for the appliance's recovery and retention needs. ZFS boot
environments are valuable when you need a rollback point for operating-system changes; they do not
replace configuration backups or an external copy of essential logs. Use storage that can sustain
the enabled package set rather than sizing only for the base ISO.

Record the selected boot mode, target disk, storage layout, and physical or virtual console path.
That information is essential if a later interface, update, or disk change makes the WebUI
unreachable.

## Before connecting production networks

Boot the appliance with console access and identify which physical port is which. Keep the WAN
disconnected or connected only to a controlled test uplink until WAN and LAN assignment is confirmed.
On virtual machines, keep WAN and LAN on distinct virtual networks and make sure a virtual console
is available even if the management network configuration is wrong.

## Next

Continue to [First boot & setup](/getting-started/first-boot/) to assign interfaces and reach the
web interface.
