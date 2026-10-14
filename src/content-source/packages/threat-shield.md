---
title: Threat Shield & DNS Protection
description: Install and operate Threat Shield, the AdGuard Home-based DNS filtering package that replaces pfBlockerNG in FreeSense 1.1.
---

Threat Shield is the FreeSense DNS protection package. It runs a pinned build of
**AdGuard Home 0.107.79** (port `www/adguardhome-bin`, official FreeBSD binary, checksum-pinned) as
the DNS server for your networks and manages it entirely from the FreeSense WebUI: encrypted
upstream DNS (DoH, DoT, DoQ), downloaded domain blocklists, custom allow and block rules,
per-client profiles, blocked-service switches, DNS rewrites, a query log and statistics. It also
contains a GeoIP country policy that is meant to be enforced with firewall tables.

Threat Shield is new in FreeSense 1.1 and replaces **pfBlockerNG**, which is no longer in the
package catalog. It covers the DNS-blocklist half of what pfBlockerNG did. It does not download
IP reputation lists. For IP-based blocking, use [Suricata](/packages/suricata/) IP reputation or
[CrowdSec](/packages/crowdsec/). See [Security and filtering packages](/packages/security-and-filtering/)
to compare the options.

Use Threat Shield when you want network-wide ad, tracker, phishing and malware domain blocking
for every client that uses the firewall for DNS, with logs you can search per client.

:::caution[Known issue in 1.1.0: GeoIP and DNS redirection rules]
The package hands its firewall rules to FreeSense only when asked for a rule type that the 1.1.0
firewall never asks for. As a result the **GeoIP country policy** and **DNS redirection** NAT rules
are generated but never loaded into the firewall. DNS filtering itself is not affected. Until a
fixed package is published, do not depend on Threat Shield for country blocking. Check whether the
rules are loaded with `pfctl -sr | grep ThreatShield` and `pfctl -sn | grep 'port 53'` from
**Diagnostics → Command Prompt** or the console.
<!-- needs verification: confirm on a 1.1.0 system that no "ThreatShield GeoIP" rules appear in pfctl -sr after saving an enabled GeoIP policy, and that no rdr for port 53 appears with DNS redirection on. -->
:::

:::note[Fixed in Threat Shield 1.0.0_6 (FreeSense 1.1.3)]
Before package version 1.0.0_6, saving **Settings** from a browser failed with "Settings could not
be saved to config.xml; the previous settings were restored.", and the **Query log** never marked a
query as **Blocked**, so **Allow** did not appear. Update the package under
**System → Package Manager → Installed Packages**. If you changed settings from the console or the
API on an older version, check that **Upstream servers**, **Bootstrap DNS** and **Fallback DNS**
still have one entry per line.
:::

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **Threat Shield & DNS Protection** (category Security, resource profile Moderate). The
   underlying package is `FreeSense-pkg-ThreatShield`; it pulls in `adguardhome-bin`.
3. Select **Install** and confirm.

The package is installed **disabled**. Nothing changes in DNS until you enable it under
**Settings**.

Architecture: amd64 and arm64. The AdGuard Home port provides an arm64 binary, used on Stable
arm64 (starting with [1.1.1](/releases/1.1.1/)) and on the Development (1.2) arm64 images.

## Where to find it

| Menu path | Page |
| --- | --- |
| **Services → Threat Shield** | Settings (with tabs for every other page) |
| **Status → Threat Shield Status** | Overview: service state, 24-hour counters, top domains and clients |

Both entries sit in the **Security** group of their menu. The package pages share one tab bar:
**Overview**, **Settings**, **Query log**, **Feeds**, **GeoIP**, **Custom rules**, **Clients**,
**Rewrites**. A **Threat Shield** dashboard widget shows the service state, 24-hour query and block
counts, average latency and the number of filtered countries.

## First-time setup

The common case is Threat Shield as the DNS server for LAN clients, with the built-in DNS Resolver
kept for local host names.

1. Open **Services → Threat Shield** (the **Settings** tab).
2. Tick **Enable**.
3. Leave **DNS mode** on **Primary DNS (recommended)**. Threat Shield answers on port 53 and the
   DNS Resolver is moved to `127.0.0.1:5335`, where it still answers local domain names, DHCP
   host names and reverse lookups.
4. Under **Listen on**, select the internal interfaces your clients use (for example LAN) instead of
   **All assigned addresses**.
5. Review **Upstream servers**. The defaults are Quad9 and Cloudflare over DNS-over-HTTPS.
6. Select **Save**. FreeSense writes the configuration, downloads the enabled feeds the first time,
   starts AdGuard Home and waits until the daemon is running before it reports success.
7. Open the **Overview** tab and confirm the badge says **Running**. Make a few lookups from a
   client, then check the **Query log** tab.
8. On **Feeds**, review the four default blocklists and the **Download** interval.

![Threat Shield settings in Primary DNS mode, listening on LAN, GUEST and IOT, with encrypted upstreams](__ASSET_ROOT__/screenshots/packages/threat-shield-settings.png)

![Threat Shield overview with query and block counters, top queried domains and top blocked domains](__ASSET_ROOT__/screenshots/packages/threat-shield-overview.png)

Clients that already receive the firewall's interface address as their DNS server (the DHCP
default) start using Threat Shield immediately in primary mode. No DHCP change is needed.

:::tip[Test before you rely on it]
Look up a domain that a default list blocks (the query log marks it **Blocked**) and a domain that
your business needs. If something legitimate is blocked, use **Allow** next to the entry in the
query log. That adds an allow rule for the domain and its subdomains to **Custom rules**.
:::

## Settings reference

### Settings tab

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Runs the DNS filtering engine and applies the GeoIP policy. | Off |
| **DNS mode** | **Primary DNS**: Threat Shield on port 53, DNS Resolver moved to `127.0.0.1:5335`. **Proxy**: the DNS Resolver stays on port 53 and forwards everything to Threat Shield on `127.0.0.1:5354`. **Standalone**: Threat Shield answers on port 53 and the DNS Resolver is turned off. | Primary DNS |
| **DNS port** | Listening port. Primary mode requires 53; proxy mode always uses 5354 on loopback. | 53 |
| **Listen on** | **All assigned addresses** (binds every address) or selected interfaces. Proxy mode always listens on loopback only. | All assigned addresses |
| **Management API port** | AdGuard Home's control API, bound to `127.0.0.1` only. Used by the WebUI and the updater. | 3000 |
| **Query strategy** | **Parallel** (fastest answer of all upstreams), **Fastest IP**, or **Load balancing**. | Parallel |
| **Upstream servers** | One per line: `https://` (DoH), `tls://` (DoT), `quic://` (DoQ) or a plain IP. | Quad9 and Cloudflare DoH |
| **Bootstrap DNS** | Plain IP addresses used only to resolve upstream host names. | `9.9.9.9`, `1.1.1.1` |
| **Fallback DNS** | Used only when no upstream answers. | `9.9.9.9`, `1.1.1.1` |
| **DNSSEC** | Validate DNSSEC signatures. | On |
| **Safe browsing** | Block malware, phishing and command-and-control domains using AdGuard's lookup service. | On |
| **SafeSearch** | Enforce SafeSearch on search engines and YouTube. | Off |
| **Parental control** | Block adult and gambling domains using AdGuard's lookup service. | Off |
| **Blocked answer** | What clients receive for a blocked name: Default (`0.0.0.0`/`::`), NXDOMAIN, REFUSED, Null IP, or Custom sinkhole IP. | Default |
| **Sinkhole addresses** | IPv4 (required) and IPv6 (optional) answers for **Custom sinkhole IP**. | Empty |
| **Browser DoH** | Answers the canary domain `use-application-dns.net` so browsers keep using filtered DNS. | On |
| **iCloud Private Relay** | Blocks `mask.icloud.com` and `mask-h2.icloud.com`. | On |
| **DNS redirection** | NAT rule that sends DNS queries for other servers to Threat Shield, on the interfaces in **Redirect on**. Affected by the known issue above. | Off |
| **Query log** | Log DNS queries. Needed for the query log and the top lists. | On |
| **Keep log for** | 6 hours, 1 day, 7 days, 30 days or 90 days. | 90 days |
| **Anonymize clients** | Hides the last part of client IP addresses in the log and statistics. | Off |
| **Ignored domains** | Names that are never logged, one per line. | Empty |
| **Cache size (MB)** | Memory for cached answers (1–1024). | 4 |
| **TTL limits (s)** | Minimum and maximum TTL; 0 means as received / no cap. | 0 / 0 |
| **Optimistic cache** | Answer from expired entries while refreshing them. | On |
| **Rate limit (queries/s)** | Per client subnet; 0 turns rate limiting off. | 0 |
| **Subnet prefix length** | Subnet size used for rate limiting. | IPv4 24, IPv6 56 |
| **Not rate limited** | Addresses exempt from rate limiting. | Empty |
| **Client subnet (ECS)** | Send part of the client address to upstreams. | Off |

The **Cache** and **Rate limiting and client subnet** sections are collapsed by default.

### Feeds tab

| Field | What it does | Default |
| --- | --- | --- |
| Feed list (**On** switch, **Name**, **Source**, **Cached copy**) | Each feed is a downloaded list. Switch a feed off to keep it without using it. **Cached copy** shows the local file's size and age. | AdGuard DNS Filter, OISD Basic Filter, Phishing Army Blocklist, Steven Black Unified Hosts (all on) |
| **Add feed** | Name, category and URL. HTTPS only; hosts files and AdGuard / Adblock Plus lists are accepted. | — |
| **Download now** | Downloads all enabled feeds in the background. | — |
| **Download** (Automatic updates) | Every 6 hours, Every 12 hours, Daily, or Weekly. | Daily |

Each feed download is limited to 32 MiB and 30 seconds, follows HTTPS redirects only, and replaces
the cached file atomically. A failed download keeps the previous copy.

### GeoIP tab

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Enforce the country policy. | Shown ticked; nothing is enforced until you save |
| **Action** | **Block selected countries** or **Allow selected countries only**. | Block selected countries |
| **Direction** | Inbound, Outbound or Both directions. | Inbound |
| **Interfaces** | Interfaces the policy applies to. | WAN |
| **Traffic** | Protocol (Any, TCP, UDP) and ports (`any`, or a list such as `22,80,443`, ranges allowed). | Any / any |
| **Update database** | How often the country network lists are downloaded again. | Weekly |
| **Countries** | Country picker with search, region filter and a **High-risk preset** (RU, CN, KP, IR, BY, SY). | RU, CN, KP, IR, BY preselected |

Country lists are downloaded over HTTPS from `ipdeny.com` and contain IPv4 networks only.
Remember the known issue above: in 1.1.0 the policy rules are not loaded into the firewall.

### Custom rules, Clients and Rewrites tabs

- **Custom rules**: one rule per line in AdGuard / Adblock Plus syntax, regular expressions or
  hosts format. `||example.com^` blocks a domain and its subdomains, `@@||example.com^` allows it.
  Lines starting with `!` or `#` are comments. Allow rules override every feed.
- **Clients**: **Blocked services for the whole network** switches block TikTok, Discord, YouTube,
  Facebook & Messenger, Instagram, Roblox, Steam, Netflix, X (Twitter), Twitch, Reddit, Epic Games,
  Snapchat and Telegram. **Add profile** creates a client profile: a name, up to 20 client IP
  addresses or host names, a **Filtering** choice (Global setting, Always on, Off) and its own
  blocked services. Clients without a profile use the global settings.
- **Rewrites**: answers a domain (wildcards such as `*.example.com` allowed) with a fixed IPv4
  address (A), IPv6 address (AAAA) or host name (CNAME).

Every save on any tab is validated, written to `config.xml`, applied, and checked. If the save
cannot be stored or the daemon does not start, the previous settings are restored and the page
says so.

## Firewall rules and interfaces

- In primary and standalone mode, clients must be allowed to reach the firewall on TCP and UDP
  port 53. The default LAN rule already allows this; add a pass rule on other internal interfaces
  that should use Threat Shield.
- **All assigned addresses** also binds the WAN address. The default WAN policy blocks inbound DNS,
  but selecting only internal interfaces under **Listen on** is safer.
- The management API (port 3000) and the proxy-mode listener (5354) are bound to `127.0.0.1` and
  need no rules.
- DNS redirection and GeoIP rules would be added automatically by the package; see the known issue.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service name | `threatshield` (shown in **Status → Services** as "FreeSense Threat Shield DNS & GeoIP Engine") |
| rc script | `/usr/local/etc/rc.d/threatshield`, controlled by the package with `onestart` / `onestop`; no rc.conf flag is set |
| Generated configuration | `/usr/local/etc/threatshield/AdGuardHome.yaml` (do not edit; it is rewritten on every save) |
| Working directory | `/var/db/threatshield` (feed copies in `data/userfilters/`, country lists in `geoip/`) |
| Updater | `/usr/local/sbin/freesense-threatshield-update feeds` or `geoip`, optionally followed by `force`, run by cron hourly at :17 (feeds) and :43 (GeoIP); it only downloads when the chosen interval has passed |
| Status pages | **Status → Threat Shield Status** (Overview), **Query log** tab (last 100 queries) |

The Overview has **Update feeds** and **Restart** buttons. AdGuard Home runs under `daemon(8)`
and its console output is not written to a log file; see Troubleshooting for how to see it.

## Upgrade, backup, and removal

- All settings are stored in `config.xml` under `installedpackages/threatshield`, so they are part
  of a normal configuration backup and restore. Downloaded feeds and country lists are rebuilt on
  the first save after a restore.
- When Threat Shield takes over port 53 it records the previous DNS Resolver port, interfaces,
  enable state and custom options. Disabling Threat Shield or removing the package restores them.
- Removing the package stops AdGuard Home, removes the cron jobs, restores the DNS Resolver,
  deletes the generated YAML and reloads the firewall. In 1.1 removal also deregisters the package
  in `config.xml`, so a later configuration restore no longer reinstalls it.
- Settings are not synchronized to a high-availability peer. Configure each node.
  <!-- needs verification: the XML declares XMLRPC plugins but the package defines no plugin functions; confirm HA sync does nothing. -->
- pfBlockerNG settings are not converted. After upgrading from 1.0, rebuild the DNS blocklists in
  Threat Shield.
  <!-- needs verification: what happens to an installed pfBlockerNG package during a 1.0 -> 1.1 upgrade (left installed, removed, or upgrade blocked). -->

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| **Overview** says enabled but not running | Restart from the Overview. If it stops again, stop the service and run AdGuard Home in the foreground to see its error: `/usr/local/bin/AdGuardHome --no-check-update -c /usr/local/etc/threatshield/AdGuardHome.yaml -w /var/db/threatshield`. Port 53 already in use by another service is the usual cause. |
| Feeds show **Not downloaded** | Run `freesense-threatshield-update feeds force` at the console to see each download's result. Feeds must be HTTPS and under 32 MiB. |
| Local host names stop resolving | Use **Primary** or **Proxy** mode. Standalone turns the DNS Resolver off, so DHCP host names and domain overrides are no longer answered. |
| No DNS after changing mode | Fixed in 1.1: Threat Shield is now stopped before the DNS Resolver is moved back to port 53. If DNS is still down, disable Threat Shield and save; the previous DNS Resolver settings are restored. |
| GeoIP policy has no effect | Known issue in 1.1.0 (see the caution at the top of the page). |
| The feed schedule label says "Daily at 03:00 UTC" | The daily interval is measured from the last successful download, checked hourly; it is not a fixed 03:00 run. |
| The query log is empty | **Query log** must be on and the service running. The page shows only the last 100 queries. |

:::note[Changes in FreeSense 1.1]
- New package. Threat Shield replaces pfBlockerNG, which was removed from the ports overlay and the
  package catalog (freesense-packages `b0831ff`, freesense `6a6dc4e`).
- Uses a pinned official AdGuard Home binary (`www/adguardhome-bin`, 0.107.79) for amd64 and arm64.
- Runtime hardening: `daemon(8)` supervision, strict input validation, safe YAML quoting
  (`d808d42`), configuration serialization fixes (`1d192cb`).
- Settings that never saved, proxy and standalone modes that never started, a broken DNS Resolver
  in proxy mode, and a DNS outage when disabling or switching modes were fixed (`914becc`).
- Package removal now runs the post-deinstall stage, so the package no longer comes back after a
  configuration restore (`f903b12`).
- WebUI rebuilt in the FreeSense style, with menu groups (`4b54358`, `4ae11df`).
:::
