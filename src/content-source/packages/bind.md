---
title: BIND DNS Server
description: Host authoritative DNS zones on FreeSense with the BIND package, including views, ACLs, DNSSEC inline signing on BIND 9.20, secondary zones and HA sync.
---

The **BIND Authoritative DNS** package (`FreeSense-pkg-bind` 9.20) runs ISC BIND 9.20 (`named`;
the package requires `bind920` 9.20.2 or later, and the 1.1.0 Stable repository ships 9.20.29)
and manages it from the WebUI. Use it to host zones you own: primary (master) zones with records
edited in the WebUI, secondary (slave) zones transferred from another server, forward zones,
reverse zones, response policy zones (RPZ), split-horizon answers with views, and DNSSEC signing.

BIND is not a replacement for the firewall's own resolver. The built-in **DNS Resolver**
(Unbound) remains the recursive resolver for your clients; see
[Core services](/configure/core-services/). Run BIND only when you need authoritative DNS on the
firewall, and plan how the two share port 53.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **BIND Authoritative DNS** (package `FreeSense-pkg-bind`) and click **Install**.

On Stable 1.1 the package is available for amd64. See
[Installing packages](/packages/installing-packages/).

## Where to find it

**Services → BIND DNS Server** (in the *Network* group of the Services menu). The tabs are:

| Tab | Page | Purpose |
| --- | --- | --- |
| **Settings** | `pkg_edit.php?xml=bind.xml` | Enable, listen addresses, logging, rate limiting, forwarding, ports, custom options |
| **ACLs** | `pkg.php?xml=bind_acls.xml` | Named address lists used by views and zones |
| **Views** | `pkg.php?xml=bind_views.xml` | Which clients see which zones, and whether recursion is allowed |
| **Zones** | `pkg.php?xml=bind_zones.xml` | The zones, their SOA values, records and DNSSEC |
| **Sync** | `pkg_edit.php?xml=bind_sync.xml` | XMLRPC sync to HA peers |

A **BIND** dashboard widget shows the output of `rndc status`.

## First-time setup

This example publishes the zone `example.com` to everyone on the address `203.0.113.10`.

1. **Port plan.** If the DNS Resolver listens on all interfaces on port 53, BIND cannot bind to
   the same address. Either limit the resolver's **Network Interfaces** so it does not use the
   address BIND needs, or give BIND a different **Listen port**.
2. **Settings.** Open **Settings**, check **Enable BIND**, select the interface or virtual IP in
   **Listen on** (for example the WAN virtual IP `203.0.113.10`), check **Hide Version**, and
   **Save**. On the first save the package creates the built-in ACLs `none`, `any`,
   `localhost` and `localnets`.
3. **View.** Open **Views** and add a view named `public`. Set **Recursion** to **No**, select
   `any` in **match-clients**, and leave **allow-recursion** empty. Save.
   Zones are written only inside views, and a view with no **match-clients** matches nobody, so
   at least one view is required.
4. **Zone.** Open **Zones** and add a zone:
   - **Zone Name** `example.com`, **Zone Type** *Master*, **View** `public`.
   - **Name Server** `ns1.example.com`, **Mail Admin Zone** `hostmaster.example.com` (no
     trailing dot; the zone file adds it).
   - Add records: `ns1` type **A** to `203.0.113.10`, `@` or blank for the zone apex as needed,
     `www` type **A**, an **MX** with its priority, and so on.
   - Set **allow-query** to `any` and **allow-transfer** to an ACL with your secondary servers
     only (or `none`).
5. **Save** the zone. Every save regenerates `named.conf`, checks each primary zone with
   `named-checkzone`, and reloads BIND.
6. Add a firewall rule on WAN that allows **UDP and TCP port 53** to `203.0.113.10`.
7. Test from outside: `dig @203.0.113.10 www.example.com A`. Then update the delegation at your
   registrar.

## Settings reference

### Settings tab

| Field | What it does | Default |
| --- | --- | --- |
| **Enable BIND** | Runs `named`. | Off |
| **IP Version** | IPv4+IPv6, IPv4 only (`-4`) or IPv6 only (`-6`). | IPv4+IPv6 |
| **Listen on** | Interfaces, virtual IPs or **All** that BIND listens on. | None (listens nowhere) |
| **Enable Notify** | Send NOTIFY messages to secondaries when a zone changes. | Off |
| **Hide Version** | Do not answer `version.bind` queries with the real version. | Off |
| **Limit Memory Use** | `max-cache-size` for named. | `256M` |
| **Enable Logging** | Log to syslog. When off, all BIND logging is discarded. | Off |
| **Logging Severity** | Critical, Error, Warning, Notice, Info, Debug level 1/3/5 or Dynamic. | Critical (first option) |
| **Logging Options** | Log categories (Default, General, Database, Security, Config, Resolver, Xfer-in, Xfer-out, Notify, Client and more). | None |
| **Rate Limit** | Enable response rate limiting. | Off |
| **Limit Action** | **Deny query** or **Log only** when a client exceeds the limit. | Deny query (first option) |
| **Limit** | Responses per second. | 15 |
| **Enable Forwarding** | Forward recursive queries to **Forwarder IPs**. | Off |
| **DNSSEC Validation** | Auto, On or Off, for recursive answers. | Auto |
| **Forwarder IPs** | Upstream servers for forwarding, separated by `;`. | Empty |
| **Listen port** | DNS port. | 53 |
| **Control port** | `rndc` control port (localhost). | 8953 |
| **Custom Options** / **Global Settings** | Extra statements for the `options` block or the top of `named.conf`. | Empty |

### ACLs tab

| Field | What it does |
| --- | --- |
| **ACL Name** | Name used by views and zones. |
| **Description** | Free text. |
| Rows: **Value** / **Description** | Networks or addresses in the ACL, for example `198.51.100.0/24`. |

### Views tab

| Field | What it does | Default |
| --- | --- | --- |
| **View Name** | Name of the view. | Empty |
| **Recursion** | Whether the view answers recursive queries. Use **No** for public authoritative views. | No |
| **match-clients** | ACLs whose clients use this view. Empty means no client matches. | Empty |
| **allow-recursion** | ACLs allowed to recurse. Empty means none. | Empty |
| **Custom Options** | Extra statements inside the view. | Empty |

### Zones tab

| Field | What it does | Default |
| --- | --- | --- |
| **Disable This Zone** | Keep the zone but do not serve it. | Off |
| **Zone Name** | Domain name, or the network for reverse zones. | Empty |
| **Zone Type** | Master, Slave, Forward or Redirect. | Master |
| **View** | Views the zone belongs to. | None |
| **Reverse Zone** / **IPv6 Reverse Zone** | Build an `in-addr.arpa` / `ip6.arpa` zone; only NS and PTR records are allowed. | Off |
| **Response Policy Zone** | Use the zone as an RPZ (master or slave only). | Off |
| **Custom Option** | Extra statements in the zone block. | Empty |
| **Inline Signing** | Sign the zone with DNSSEC (master zones). | Off |
| **Backup Keys** | Store the DNSSEC key files in `config.xml` so they survive a reinstall and are restored automatically. | Off |
| **DSSET** | Read-only: the DS records to give to the parent zone. | |
| **Master Zone IP** | Primary server for a slave zone. Required for slaves. | Empty |
| **Forwarders** | Servers for a forward zone. Required for forward zones. | Empty |
| **TTL** | Default TTL of the zone. | Empty |
| **Name Server** | SOA primary name server. Required for master zones. A trailing dot is removed. | Empty |
| **Base Domain IP** | Address of the zone apex. | Empty |
| **Mail Admin Zone** | SOA contact, for example `hostmaster.example.com` (an `@` is converted to `.`). | Empty |
| **Serial** | SOA serial. | Empty |
| **Refresh** / **Retry** / **Expire** / **Minimum** | SOA timers. | `1d` / `2h` / `4w` / `1h` |
| **allow-update** / **Enable update-policy** / **update-policy** | Dynamic update control. | Empty |
| **allow-query** / **allow-transfer** | ACLs that may query or transfer the zone. | Empty |
| Records: **Record**, **Type**, **Priority**, **Alias or IP address** | Resource records. Types: A, AAAA, DNAME, MX, CNAME, NS, LOC, SRV, PTR, TXT, SPF. | |
| **Register DHCP Static Mappings** | Add DHCP static mappings whose domain matches the zone. | Off |
| Custom zone records | Free-form records appended to the zone. | Empty |
| Result | Read-only view of the generated zone file. | |

### Sync tab

| Field | What it does | Default |
| --- | --- | --- |
| **Automatically Sync BIND Configuration Changes** | Push the BIND configuration to peers on every change. | disabled |
| **Sync Timeout** | XMLRPC timeout in seconds. | 30 |
| **Zone Master IP** | The primary address peers use for their zones. | Empty |
| Targets | Peer address, port, protocol and credentials. | |

## DNSSEC on BIND 9.20

When **Inline Signing** is checked on a master zone:

1. The package creates a key-signing key and a zone-signing key with `dnssec-keygen`
   (ECDSAP256SHA256) in the chroot key directory `/etc/namedb/keys`.
2. The zone uses a dnssec-policy named `freesense`. It matches the package's key pair, uses
   unlimited key lifetimes (no automatic rollover), and lets `named` sign with those keys.
3. The DS records from `dnssec-dsfromkey` appear in **DSSET**. Give them to your registrar or
   the parent zone.
4. Check **Backup Keys** so the keys are stored in `config.xml`. Without it, a reinstall creates
   new keys and the published DS record no longer matches, which breaks validation for the zone.

Because the policy never rolls keys, plan any key rollover by hand.

## Firewall rules and interfaces

- The package adds no firewall rules. Allow **UDP and TCP 53** (or your **Listen port**) to the
  addresses in **Listen on**, from the networks that should query the server.
- Zone transfers and large answers use TCP; do not allow UDP only.
- Allow the NOTIFY and transfer traffic between primary and secondary servers.
- The `rndc` control port (8953) listens on localhost only; do not open it.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service name | `named` (shown in **Status → Services**) |
| rc script | `/usr/local/etc/rc.d/named.sh` |
| Process | `named -c /etc/namedb/named.conf -u bind -t /var/etc/named/` (chrooted) |
| Configuration | `/var/etc/named/etc/namedb/named.conf` (generated; header *Bind FreeSense configuration*) |
| Zone files | `/var/etc/named/etc/namedb/<type>/<view>/<zone>.DB` (signed zones add `.DB.signed`) |
| DNSSEC keys | `/var/etc/named/etc/namedb/keys` |
| rndc key | `/usr/local/etc/rndc-confgen.conf`; `rndc.conf` in the chroot |
| Statistics | `/var/log/named.stats` inside the chroot |
| Logs | With **Enable Logging** on, **Status → System Logs → System → DNS Resolver** |
| Dashboard | **BIND** widget (`rndc status`) |

## Upgrade, backup, and removal

- All settings, zones and records live in `config.xml` and are part of configuration backups.
  DNSSEC keys are included only when **Backup Keys** is checked.
- Upgrading from 1.0: the rndc key file is renamed from `rndc-confgen.pfsense` to
  `rndc-confgen.conf` automatically, so the existing key is kept.
- Restoring a configuration that contains BIND now reinstalls the package instead of reporting
  it missing.
- Removing the package stops `named`. The settings stay in `config.xml` for a reinstall.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| BIND stopped as soon as DNSSEC was enabled (1.0) | BIND 9.20 removed `auto-dnssec`, and the old package wrote it, so `named` exited. Update the package; zones now use the `freesense` dnssec-policy. |
| **DSSET** stays empty (1.0) | The key tools moved from `sbin` to `bin` in BIND 9.20, so keys and DS records were never created. Fixed in 1.1. |
| Notice *BIND zone ... has errors and is not served* | `named-checkzone` rejected the zone. The notice includes the first error lines. Fix the record and save again. |
| Save fails: *The name server ... is inside this zone, so it needs an A or AAAA record* | The SOA name server is in the zone but has no address record. Add the A or AAAA record. |
| Answers show `ns.example..` (1.0) | A trailing dot in **Name Server** or **Mail Admin Zone** was doubled. The package now strips it on save. |
| `named` does not start, log shows *address in use* | Another service (usually the DNS Resolver) uses port 53 on the same address. Change one of them. |
| Queries are refused | The client does not match any view's **match-clients**, or the zone's **allow-query** excludes it. |
| No log output | **Enable Logging** is off, which discards all BIND logs. |

:::note[Changes in FreeSense 1.1]
- DNSSEC works on BIND 9.20: zones use a `freesense` dnssec-policy instead of the removed
  `auto-dnssec`, the key tools are called from their new `bin` location, and the DS record shown
  in the WebUI stays valid (freesense-packages 32bab47).
- Every primary zone is checked with `named-checkzone`, and a zone with errors raises a notice
  instead of silently not being served (32bab47).
- Validation strips trailing dots from the name server and mail fields and rejects an in-zone
  name server without an address record (32bab47).
- The rndc key file is `rndc-confgen.conf`; an existing `rndc-confgen.pfsense` is renamed so the
  key is kept. The `named.conf` header says FreeSense (8d82a24).
- HA sync works: it called `pfsense_xmlrpc_client`, which FreeSense does not define, and now uses
  `freesense_xmlrpc_client` (8312aa4).
- A configuration restore no longer reports BIND as missing and quarantines its settings
  (freesense 40f28ef).
- **BIND DNS Server** is listed in the *Network* group of the 1.1 Services menu (4ae11df).
:::
