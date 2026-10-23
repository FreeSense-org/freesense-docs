---
title: Cloud images
description: Deploy a preinstalled FreeSense UFS or ZFS disk image on KVM-compatible platforms or bhyve and provision it with cloud-init.
---

Cloud images are preinstalled FreeSense disks. Import one into your hypervisor or cloud platform
instead of running the installer. Each image is published in two formats:

- **QCOW2, compressed with xz**, for Proxmox, OpenStack, QEMU/KVM, and other importers that accept
  QCOW2.
- **Raw GPT disk, compressed with xz**, for bhyve and platforms that import raw disks.

Stable 1.1 cloud images are published for **amd64**. Each format comes with a UFS root or a ZFS root.

:::note[arm64]
There are no arm64 cloud images on Stable. Stable arm64 starts with [1.1.1](/releases/previous-1.1/#freesense-111) and
ships only the generic arm64 UEFI installer image, not QCOW2 or raw cloud disks. The generic arm64
target in Development also provides an installer image instead of cloud disks. To run FreeSense on
arm64, follow [Installation](/getting-started/installation/#install-on-arm64).
:::

<!-- needs verification: freesense-os-base config/build-policy.json (generic-arm64-uefi has empty
filesystems/formats) means no arm64 QCOW2/raw images are built. Confirm against the live download
picker. -->

Cloud images are a separate release artifact. They are built only from a System repository and an
Optional Packages repository that have been verified together. Support follows the release line,
not the disk format. Stable 1.1 images are supported. Development 1.2 images are experimental and
unsupported.

## Image variants

| | UFS image | ZFS image |
| --- | --- | --- |
| Virtual disk size | 16 GiB, sparse | 32 GiB, sparse |
| Recommended memory | 2 GiB or more | 4 GiB or more |
| Boot environments | No; upgrades run in place | Yes; pool `FreeSense`, root `FreeSense/ROOT/default` |
| Firmware | BIOS or UEFI | BIOS or UEFI |
| Root grows when the virtual disk is enlarged | Yes | Yes |
| QEMU guest agent | Included | Included |
| VMware tools (open-vm-tools), started on VMware | Included | Included |

<!-- needs verification: the 2 GiB recommendation for the UFS image is a sizing estimate. The 16/32
GiB sizes, the pool and dataset names, BIOS+UEFI and root growth come from
freesense-os-base config/build-policy.json (generic-amd64 variants). The release smoke test boots
cloud images with 4096 MiB (scripts/runner/smoke-cloud.sh). -->

The download page shows a separate SHA-256 value for each filesystem and format. Verify the
compressed file before you decompress it.

### Choose UFS or ZFS

For cloud deployments, **UFS** is the default choice. It is smaller, simpler, and needs less memory.
Choose **ZFS** when [boot environments](/operations/zfs-boot-environments/) are worth the extra
memory and disk space: upgrades then run in a cloned environment with a health check after the
first boot.

The ZFS image uses a single, non-redundant virtual disk. ZFS doesn't make that disk redundant. Use
provider snapshots or backups, keep the virtual disk at 32 GiB or larger, and use provider-level
disk encryption if you need it.

Configuration and the package database are stored in each boot environment, so an environment
always holds a consistent system state. Cloud provisioning is tied to the instance ID and is
applied again if you boot an environment that was created before the first provisioning.

## Network and management safety

Use **two virtual NICs** whenever you can. The cloud-init adapter makes the interface that carries
the metadata default route WAN and the next interface LAN, unless the `freesense:` section of the
user data assigns roles explicitly. With two or more NICs, SSH and WebUI management stay on LAN.
FreeSense never adds a WAN management rule in this case.

:::danger[One-NIC cloud instances]
A one-NIC instance runs DHCP on WAN, and the WebUI anti-lockout rule is turned off so that the WebUI
isn't exposed to the internet. If the metadata contains a valid SSH public key, FreeSense adds a
WAN pass rule for TCP port 22, described as **FreeSense cloud temporary SSH**. Without
`freesense.management_cidrs`, that rule allows **any source**. Always set `management_cidrs` and
restrict access with a provider security group as well. Without an SSH key, there is no WAN
management access at all.
:::

The image's default administrator password is locked during provisioning, so you can't log in with
a password. SSH uses the `admin` account with the keys from the metadata and accepts key
authentication only. Signing in as `admin` over SSH opens the FreeSense console menu. To use the
WebUI, set an administrator password from there (option 3, **Reset admin account and password**),
then connect to the WebUI from the LAN.

<!-- needs verification: setting a WebUI password from the console menu after cloud provisioning has
not been tested on 1.1.0. Provisioning sets the admin password to *LOCKED* and enables key-only SSH
(freesense-system-ports sysutils/FreeSense-cloud-init/files/freesense_cloud_init.py). -->

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
      addresses: [192.0.2.53, "2001:db8::53"]
```

Then create the seed image and attach it to the virtual machine:

```sh
cloud-localds --network-config=network-config cidata.iso user-data meta-data
```

The adapter supports the **NoCloud**, **ConfigDrive**, and **OpenStack** datasources. It
translates the hostname and domain, timezone, DHCPv4, DHCPv6 and SLAAC, static IPv4 and IPv6
addresses, gateways, MTU, DNS servers, SSH keys, interface roles, and management CIDRs into the
native `config.xml`. cloud-init doesn't keep a separate network configuration in `rc.conf`.

## Import examples

**Proxmox** (replace `ufs` with `zfs` for the ZFS image):

```sh
unxz FreeSense-1.1.0-amd64-ufs.qcow2.xz
qm importdisk 120 FreeSense-1.1.0-amd64-ufs.qcow2 local-lvm
```

**QEMU/KVM:**

```sh
qemu-system-x86_64 -enable-kvm -m 4096 \
  -drive file=FreeSense-1.1.0-amd64-ufs.qcow2,if=virtio \
  -drive file=cidata.iso,if=virtio,readonly=on \
  -nic user,model=virtio -nic tap,model=virtio
```

**bhyve:**

```sh
unxz FreeSense-1.1.0-amd64-ufs.raw.xz
bhyve -c 2 -m 4G -H -w -s 3,virtio-blk,FreeSense-1.1.0-amd64-ufs.raw freesense
```

**OpenStack:** upload the decompressed QCOW2 as a `qcow2` image and supply network data through the
instance's ConfigDrive or the metadata service.

## Reprovisioning

Provisioning is applied atomically and keyed to the cloud instance ID. Rebooting the same instance
doesn't duplicate interfaces, users, or firewall rules. A clone with a new instance ID is
provisioned from scratch: the hostname, domain, interfaces and keys from the new metadata replace
the old ones, and cloud-init generates new SSH host keys for the new instance.

## Next

- [First boot and setup](/getting-started/first-boot/)
- [Updates and release channels](/guides/updates-and-channels/)
