---
title: Security and filtering packages
description: Compare the FreeSense 1.1 security packages (Threat Shield, Secure Web Gateway, Suricata, CrowdSec and ACME) and choose the right one.
---

FreeSense 1.1 offers five official security packages. They work at different layers: DNS, web
proxy, packet inspection, address reputation and certificates. Install them from
**System → Package Manager → Available Packages**; each one appears in the **Security** group of
the **Services** menu (the Web Gateway under **Proxy**). Optional Packages are published
separately from the System, so installing or updating them does not change the base system.

| Package | Purpose | Guide | Notes |
| --- | --- | --- | --- |
| Threat Shield & DNS Protection | DNS filtering with blocklists, an allowlist, per-client profiles and a query log (AdGuard Home); from package 1.1.0 also IP threat lists, country blocking, inbound reputation checks and a threat map | [Threat Shield](/packages/threat-shield/) | New in 1.1; replaces pfBlockerNG. GeoIP rules load from package 1.1.0 (not in 1.0.0). Moderate. |
| Secure Web Gateway | Explicit or transparent web proxy (Squid 7) with domain policy, TLS inspection, identity, feeds and ICAP | [Secure Web Gateway](/packages/web-gateway/) | Intensive. Supported in 1.1. |
| Web Gateway Local Antivirus | ClamAV scanning for the Web Gateway through c-icap | [Secure Web Gateway](/packages/web-gateway/#threat-protection) | Intensive. Not built for arm64. |
| Suricata IDS/IPS | Signature-based intrusion detection and prevention per interface | [Suricata](/packages/suricata/) | Intensive. Not built for arm64. |
| CrowdSec | Behavior-based decisions loaded into a managed WAN block rule | [CrowdSec](/packages/crowdsec/) | Moderate. |
| ACME Certificates | Automatic certificates from Let's Encrypt and other ACME authorities | [ACME Certificates](/packages/acme/) | Lightweight. |

Stable 1.1.0 was published for amd64 only. Stable arm64 starts with [1.1.1](/releases/previous-1.1/#freesense-111);
Suricata and Web Gateway Local Antivirus are not built for arm64 on Stable or Development.

## Choosing between them

- **Block ads, trackers and malicious domains for the whole network**: Threat Shield. Every client
  that uses the firewall for DNS is covered, with no client configuration.
- **Control and log web access per user, scan downloads, or decrypt selected HTTPS sites**: Secure
  Web Gateway, optionally with Local Antivirus. Clients must use the proxy (explicit or
  transparent).
- **Detect exploits and attacks in traffic, and optionally drop them**: Suricata. It needs the most
  CPU and the most tuning.
- **Ban addresses that misbehave, automatically and temporarily**: CrowdSec.
- **Block whole countries**: Threat Shield's GeoIP policy. Its firewall rules are loaded from
  Threat Shield package 1.1.0; with package 1.0.0 they are not, so use a firewall alias of country
  networks in your own rules or Suricata's GeoIP keywords until you have 1.1.0.
- **Keep known bad sources away from services you expose**: Threat Shield
  [inbound protection](/packages/threat-shield-inbound/) (reputation checks and flood limits) or
  CrowdSec.
- **Publicly trusted certificates for services on the firewall**: ACME Certificates.

The packages combine well when each has a clear job. A common set is Threat Shield for DNS,
CrowdSec on WAN and ACME for the WebUI certificate. Add Suricata or the Web Gateway only when you
have the hardware headroom and someone to review their alerts and logs.

## Replacing pfBlockerNG

pfBlockerNG is not part of FreeSense 1.1. Its DNS blocklist function is covered by
[Threat Shield](/packages/threat-shield/). From package 1.1.0, Threat Shield also loads IP threat
lists (such as Spamhaus DROP and FireHOL) into firewall tables; with package 1.0.0, use
[Suricata IP reputation](/packages/suricata/) or [CrowdSec](/packages/crowdsec/) for
address-based blocking. pfBlockerNG settings are not converted, so recreate your feeds and
allow lists in Threat Shield after upgrading.

<!-- needs verification: what happens to an installed pfBlockerNG package and its firewall rules during the 1.0 -> 1.1 upgrade. -->

## Safety baseline

- Start in observation mode wherever the package has one: Suricata without blocking, CrowdSec while
  watching the Decisions page, the Web Gateway as an explicit proxy for a test group.
- Keep console or another management path available while you introduce blocking.
- Record who owns each feed or rule source, how often it updates and how false positives are
  handled.
- Back up the configuration before you enable a package that changes DNS or firewall rules.
