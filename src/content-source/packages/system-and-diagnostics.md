---
title: System, diagnostics, and virtualization packages
description: Optional packages that add network diagnostic tools, VMware guest integration, and scheduled automation to FreeSense.
---

These Optional Packages extend how you operate and troubleshoot the firewall. They do not replace
the System's own tools: configuration backup, console recovery, the built-in **Diagnostics** pages,
and **Status → System Logs** are always there without any package.

| Package | Use it for | After install | Service |
| --- | --- | --- | --- |
| [Network Diagnostics](/packages/diagnostics/) | MTR path reports, Nmap top-ports scans, iperf3 throughput tests, ARP probes from the WebUI | **Diagnostics → Network Tools** | None |
| [Open VM Tools](/packages/open-vm-tools/) | VMware guest integration: tools status, guest IP reporting, guest power operations | No page; two entries in **Status → Services** | `vmware-guestd`, `vmware-kmod` |
| [QEMU Guest Agent](/packages/qemu-guest-agent/) | Proxmox, KVM and libvirt guest integration: clean shutdown, guest addresses, snapshot freeze | No page; one entry in **Status → Services** | `qemu-guest-agent` |
| [Automation](/packages/automation/) | Scheduled jobs and service checks | **Services → Automation** | None |

All three are lightweight packages. Install them from
**System → Package Manager → Available Packages**. Stable publishes them for amd64 and, starting with [1.1.1](/releases/previous-1.1/#freesense-111), arm64.

## Which one do you need?

- **A host is unreachable or slow and Ping or Traceroute do not explain why:** first use the
  built-in **Diagnostics → Ping**, **Traceroute**, **Test Port**, **DNS Lookup** and
  **Packet Capture**. Add [Network Diagnostics](/packages/diagnostics/) when you need loss per hop
  (MTR), a quick port overview of a host (Nmap), a throughput figure (iperf3), or an ARP check on a
  local segment.
- **FreeSense runs as a VMware virtual machine:** install [Open VM Tools](/packages/open-vm-tools/)
  so the host can see the guest and shut it down cleanly. Do not install it on other hypervisors or
  on hardware.
- **FreeSense runs on Proxmox, KVM or libvirt from the installer image:** install
  [QEMU Guest Agent](/packages/qemu-guest-agent/). The cloud image already includes it, and the
  VMware tools too.
- **Something should happen on a schedule or when a service stops:** see
  [Automation](/packages/automation/).

UPS monitoring with Network UPS Tools is covered under
[Monitoring and automation](/packages/monitoring-and-automation/).

## Operating boundaries

- **Scans and load tests are security-sensitive.** Nmap and iperf3 send traffic that other systems
  may treat as an attack or that can fill a link. Get authorisation, pick the target deliberately,
  and give the **WebCfg - Diagnostics: Network Tools** privilege only to administrators who need
  it. Results are shown once and not stored; save what you need elsewhere.
- **Guest tools are not a backup.** A VMware snapshot does not replace a FreeSense configuration
  backup or a tested restore.
- **Automation runs changes without you.** Keep each job small, named and reviewed, and do not
  make it the only way to restore connectivity.

For a general troubleshooting method and the built-in tools, see
[Diagnostics and troubleshooting](/operations/diagnostics-and-troubleshooting/) and
[Monitoring and logs](/operations/monitoring-and-logs/).
