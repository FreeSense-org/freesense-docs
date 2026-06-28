---
title: Installation
description: Download, verify, write to USB, and install FreeSense.
---

This guide takes you from a downloaded image to a freshly installed FreeSense system.

## Requirements

- A 64-bit (amd64) machine, dedicated to FreeSense
- At least **1 GB RAM** and **8 GB disk**
- **Two network interfaces** (WAN + LAN), or one interface with VLANs
- A USB stick (≥ 2 GB) to write the installer

## 1. Download

Grab the latest installer image from the [download page](https://freesense.org/download). Choose:

- **Stable** for production use, or
- **Development** to try the newest builds.

Each download includes a `SHA256SUMS.txt` checksum file.

## 2. Verify the download

Always verify the image before writing it.

```sh
# from the folder containing the .iso.gz and SHA256SUMS.txt
sha256sum -c SHA256SUMS.txt
```

You should see `OK` next to the image filename. Then decompress it:

```sh
gunzip FreeSense-*-amd64.iso.gz
```

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

Boot the target machine from the USB stick (you may need to enable USB boot / disable Secure Boot in
the firmware). The FreeSense installer supports both **UEFI** and **BIOS**.

Follow the prompts to install to the internal disk. When it finishes, remove the USB stick and
reboot.

## Next

Continue to [First boot & setup](/getting-started/first-boot/) to assign interfaces and reach the
web interface.
