---
title: Cloud images
description: Choose an official UFS or ZFS cloud image and provision FreeSense safely with cloud-init.
channels: [devel, stable]
---

FreeSense releases can publish official UFS and ZFS variants in two amd64 cloud-disk formats beside
the installer ISO:

- **QCOW2 + xz** for Proxmox, OpenStack, QEMU/KVM, and compatible importers.
- **Raw GPT + xz** for bhyve and platforms that import raw disks.

The recommended UFS image is a sparse 16 GiB disk. The ZFS image is a sparse 32 GiB disk and adds
boot environments for upgrade rollback. Both boot with BIOS or UEFI, grow when the virtual disk is
enlarged, and include `qemu-guest-agent`. Verify the filesystem- and format-specific SHA-256 value
shown on the [download page](https://freesense.org/download) before decompressing the image.

:::tip[Choose the filesystem for the deployment]
ZFS is the recommended filesystem for a conventional installation because it enables boot
environments. In cloud deployments, UFS is the recommended default because it is smaller and needs
less memory; choose ZFS when boot-environment rollback is worth the additional resources. Both
filesystems are supported when listed for the selected release.
:::

Support follows the release channel, not the disk format: Stable 1.0.x artifacts are supported for
production, while Development 1.1 artifacts are experimental and unsupported. The
[guided download picker](https://freesense.org/download?image=ufs&format=qcow2) shows only combinations
that are actually published.

## Choose UFS or ZFS

Choose **UFS** for the smallest, simplest, and most broadly compatible cloud appliance. Choose
**ZFS** when boot environments are worth the additional memory and disk headroom. The ZFS cloud
image uses one non-redundant virtual disk; ZFS does not make that disk redundant. Use provider
snapshots or backups, allocate at least 4 GiB of RAM, keep the virtual disk at 32 GiB or larger,
and use provider-level disk encryption when required.

The ZFS pool is named `FreeSense`, starts at `FreeSense/ROOT/default`, and keeps configuration and
the package database with each boot environment. A rollback therefore restores a coherent system
state. Cloud instance identity remains idempotent and is reapplied if a rollback predates initial
provisioning.

## Network and management safety

Use **two virtual NICs** whenever possible. The adapter makes the metadata default-route interface
WAN and the next interface LAN unless the `freesense:` extension assigns explicit roles. With two
or more NICs, SSH and WebUI management remain on LAN; FreeSense never adds an automatic WAN rule.

:::danger[One-NIC cloud instances]
A one-NIC instance uses DHCP on WAN. FreeSense adds a persistent TCP/22 WAN rule only when metadata
contains a valid SSH public key. Restrict that rule with `freesense.management_cidrs` and a provider
security group. Without a key there is no WAN management access. The WebUI is never exposed on WAN
automatically.
:::

The image's known default password is locked. SSH uses the existing `admin` account and rejects
password authentication.

## NoCloud example

Create `meta-data`:

```yaml
instance-id: edge-001
local-hostname: edge-001.example.net
```

Create `user-data`:

```yaml
#cloud-config
timezone: Europe/Copenhagen
ssh_authorized_keys:
  - ssh-ed25519 AAAA... operator@example
freesense:
  management_cidrs:
    - 203.0.113.10/32
  interfaces:
    - match: "52:54:00:12:34:56"
      role: wan
    - match: "52:54:00:12:34:57"
      role: lan
```

Create `network-config`:

```yaml
version: 2
ethernets:
  uplink:
    match:
      macaddress: "52:54:00:12:34:56"
    dhcp4: true
    dhcp6: true
  inside:
    match:
      macaddress: "52:54:00:12:34:57"
    addresses: [10.20.0.1/24, "2001:db8:20::1/64"]
    nameservers:
      addresses: [1.1.1.1, "2606:4700:4700::1111"]
```

Then create and attach the seed:

```sh
cloud-localds --network-config=network-config cidata.iso user-data meta-data
```

NoCloud, ConfigDrive, and OpenStack datasources are supported. Hostname/FQDN, timezone, DHCP4,
DHCP6/SLAAC, static IPv4/IPv6, gateways, MTU, DNS, SSH keys, roles, and management CIDRs are
translated into native `config.xml`; cloud-init does not maintain a competing `rc.conf` network.

## Import examples

Proxmox (replace `ufs` with `zfs` to import the ZFS variant):

```sh
unxz FreeSense-*-amd64-ufs.qcow2.xz
qm importdisk 120 FreeSense-*-amd64-ufs.qcow2 local-lvm
```

QEMU/KVM (replace `ufs` with `zfs` when desired):

```sh
qemu-system-x86_64 -enable-kvm -m 4096 \
  -drive file=FreeSense-*-amd64-ufs.qcow2,if=virtio \
  -drive file=cidata.iso,if=virtio,readonly=on \
  -nic user,model=virtio -nic tap,model=virtio
```

bhyve (replace `ufs` with `zfs` when desired):

```sh
unxz FreeSense-*-amd64-ufs.raw.xz
bhyve -c 2 -m 4G -H -w -s 3,virtio-blk,FreeSense-*-amd64-ufs.raw freesense
```

For OpenStack, upload the QCOW2 as a `qcow2` image and supply network data through the instance's
ConfigDrive or metadata service.

## Reprovisioning

Provisioning is atomic and keyed by cloud instance ID. Rebooting the same instance does not
duplicate interfaces, users, or firewall rules. Cloning with a new instance ID performs a new
initialization and regenerates host identity and SSH host keys.
