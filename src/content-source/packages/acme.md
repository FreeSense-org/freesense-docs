---
title: ACME Certificates
description: Issue and renew TLS certificates from Let's Encrypt and other ACME certificate authorities with the FreeSense ACME package.
---

The ACME Certificates package (`FreeSense-pkg-acme` 1.1) requests and renews TLS certificates from
certificate authorities that speak the ACME protocol, such as Let's Encrypt, ZeroSSL, Google and
SSL.com. It bundles the **acme.sh 3.1.3** client with 162 DNS provider scripts and stores every
issued certificate in the FreeSense Certificate Manager, where the WebUI, HAProxy, OpenVPN and other
services can use it.

Use it when a service on the firewall needs a publicly trusted certificate that renews itself.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Install **ACME Certificates** (category Security, resource profile Lightweight).

It depends on `socat` and the PHP `ssh2` extension, which are installed with it. Stable packages are
published for amd64 and, starting with [1.1.1](/releases/1.1.1/), arm64.

## Where to find it

**Services → Acme Certificates** (menu group Security) opens the **Certificates** list. The package
has three tabs:

| Tab | Purpose |
| --- | --- |
| **General settings** | Scheduled renewal, writing certificate files, custom ACME servers |
| **Certificates** | Certificate list with issue/renew, enable/disable and delete actions |
| **Account keys** | ACME accounts, one per certificate authority and e-mail address |

Issued certificates appear under **System → Certificates** with the name you gave them.

## First-time setup

1. Open **Services → Acme Certificates → Account keys** and add a key.
2. Enter a **Name**, an **E-mail address**, and choose an **ACME server**. Start with
   **Let's Encrypt Staging** until validation works.
3. Select **Create new account key**, then **Register account key**. Save.
4. On **General settings**, tick **Scheduled renewal** and save.
5. On **Certificates**, select **Add certificate**. Enter a **Name**, choose the
   **ACME account key**, and add one row per domain under **SAN list**, each with a validation
   method (for example **DNS-Cloudflare** with your API token, or **Standalone HTTP server**).
6. Choose the **Private key** type and save.
7. In the certificate list, use **Issue** and read the **Issue / renew output** panel.
8. When it works on staging, create a production account key, switch the certificate to it, and
   issue again.
9. Add **Post-renew actions** so services reload the new certificate, for example the shell command
   `/etc/rc.restart_webgui` for the firewall's own WebUI.

:::tip[Prefer DNS validation]
DNS validation needs no inbound ports and works for wildcard names. HTTP and TLS-ALPN validation
need the certificate authority to reach the firewall on port 80 or 443.
:::

## Settings reference

### General settings

| Field | What it does | Default |
| --- | --- | --- |
| **Scheduled renewal** | Cron job daily at 03:16 that renews every active certificate that reached its renewal threshold, then runs its post-renew actions. | Off |
| **Write certificates** | Also write each certificate in common formats to `/conf/acme/` for scripts and daemons that do not use the Certificate Manager. | Off |
| **Custom ACME servers** | Extra servers: internal ID, name and directory URL. | None |

### Account keys

| Field | What it does |
| --- | --- |
| **Name** / **Description** | Identification. |
| **E-mail address** | Contact address the certificate authority may use. |
| **ACME server** | Built in: Let's Encrypt Staging and Production, ZeroSSL Production, SSL.com RSA and ECC Production, Google Staging and Production, Actalis, plus custom servers. |
| **Account key** | The account's private key; **Create new account key** generates one. |
| **Register account key** | Registers the key with the selected server. Registering again is harmless. |
| **EAB key ID** / **EAB HMAC key** | External account binding, only for authorities that require it (for example ZeroSSL or Google). |

### Certificates

| Field | What it does | Default |
| --- | --- | --- |
| **Name** | Letters, digits, dot, dash and underscore. The Certificate Manager entry gets this name. | — |
| **Description** | Free text. | — |
| **Status** | Active or Disabled. Scheduled renewal only acts on active certificates. | Active |
| **ACME account key** | The account (and so the certificate authority) to use. | — |
| **SAN list** | One row per name, with its validation method and that method's settings. | — |
| **Private key** | 2048-, 3072- or 4096-bit RSA, 256- or 384-bit ECDSA, or Custom (paste a PEM key in **Custom private key**). | — |
| **Renewal threshold** | Days of remaining lifetime at which to renew. | 2/3 of lifetime, or 30 days if unknown |
| **Post-renew actions** | Shell Command, PHP Command Script, Restart Local Service, or Restart Remote Service (XMLRPC, uses the HA sync settings). | None |
| **Certificate profile** (Advanced) | Alternate profile when the CA offers several (for Let's Encrypt for example `classic`, `shortlived`, `tlsserver`). | Blank |
| **Preferred chain** (Advanced) | Alternate trust chain, substring match. | Blank |
| **Address family** (Advanced) | OS Default, Force IPv4 or Force IPv6 for requests to the ACME server where possible. | OS Default |
| **DNS sleep** (Advanced) | Seconds to wait after adding TXT records. Blank polls public DNS until the records appear. | Blank |

Validation methods include **Webroot local folder**, **Webroot FTP** (FTPS or SFTP),
**Standalone HTTP server**, **Standalone TLS-ALPN server**, **DNS-Manual**,
**DNS-NSupdate / RFC 2136** and one DNS method per bundled provider script.

## Firewall rules and interfaces

- DNS methods and webroot methods need only outbound HTTPS from the firewall.
- **Standalone HTTP server** listens on the configured port (80, or another port with WAN port 80
  forwarded to it); **Standalone TLS-ALPN server** does the same for 443. Add a WAN pass rule (and
  port forward if needed) for the validation, and make sure the WebUI or another service is not
  already using that port.

## Service, logs, and status

ACME runs no daemon.

| Item | Value |
| --- | --- |
| Renewal job | `/usr/local/pkg/acme/acme_command.sh "renewall"`, daily at 03:16 when **Scheduled renewal** is on; output goes to the system log with tag `ACME` |
| Working files | `/tmp/acme/<certificate name>/` (`acme_issuecert.log` is the most useful log) |
| Account registration log | `/tmp/acme/_registerkey/acme_issuecert.log` |
| Written certificates | `/conf/acme/` when **Write certificates** is on |
| Status | The **Certificates** tab tiles: Certificates, Issued, Expiring soon (30 days), Expired; per-row expiry and last renewal |

## Upgrade, backup, and removal

- Account keys, certificate definitions and settings are stored in `config.xml` under
  `installedpackages/acme`; issued certificates are in the Certificate Manager. Both are part of a
  configuration backup.
- Removing the package removes the renewal cron job. Certificates already in the Certificate Manager
  stay there but are no longer renewed.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Registration fails | Read `/tmp/acme/_registerkey/acme_issuecert.log`. Check the e-mail address and, for ZeroSSL or Google, the EAB values. |
| Issue fails | Read the **Issue / renew output** panel or `/tmp/acme/<name>/acme_issuecert.log`. For DNS methods, check the provider credentials; for standalone methods, check the port and firewall rules. |
| Rate-limit errors | Use a staging server while testing. |
| A service still presents the old certificate | Add a post-renew action that restarts it. |
| A failed save left the editor in a changed state | Fixed in 1.1: a rejected save no longer changes the stored entry. |

:::note[Changes in FreeSense 1.1]
- WebUI rebuilt in the FreeSense style: summary cards, collapsible Advanced and External account
  binding sections, a sticky Save bar (`393ca59`), with menu groups (`4ae11df`).
- Editing fixes: the edited entry's name is posted with the form, entries move by button value with
  strict name matching, and a failed save no longer changes the in-memory entry (`5768939`).
- The **Restart Remote Service (XMLRPC)** action uses the FreeSense XMLRPC client; it was calling a
  function that does not exist (`8312aa4`).
- The package is built only for the PHP 8.5 flavor used by FreeSense (`8fd3da9`).
:::
