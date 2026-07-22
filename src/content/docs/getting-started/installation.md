---
title: Installation
description: Download, verify, write to USB, and install FreeSense.
---

This guide takes you from a downloaded image to a freshly installed FreeSense system.

## Requirements

- A 64-bit (amd64) machine, dedicated to FreeSense
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

The download card displays the exact SHA-256 checksum, size, publication date, and build provenance
read from the live channel document. The ISO itself is served from an immutable URL on
`downloads.freesense.org`.

## 2. Verify the download

Always verify the image before writing it.

```sh
# compare this output with the SHA-256 value on the download page
sha256sum FreeSense-*-amd64.iso
```

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

**Windows:** use [balenaEtcher](https://etcher.balena.io/) and select the `.iso`.

## 4. Boot the installer

Boot the target machine from the USB stick. You may need to enable USB boot or disable Secure Boot
in the firmware. The FreeSense installer supports both **UEFI** and **BIOS**.

Follow the prompts to install to the internal disk. When it finishes, remove the USB stick and
reboot.

## Next

Continue to [First boot & setup](/getting-started/first-boot/) to assign interfaces and reach the
web interface.
