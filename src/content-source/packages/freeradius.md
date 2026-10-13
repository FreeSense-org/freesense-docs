---
title: FreeRADIUS
description: Run a RADIUS server on FreeSense with the freeradius3 package for Wi-Fi (WPA2/WPA3-Enterprise), switch, VPN and captive portal authentication.
---

The **FreeRADIUS** package (`FreeSense-pkg-freeradius3` 0.16.4) runs FreeRADIUS 3.x (`radiusd`;
the 1.1.0 Stable repository ships FreeRADIUS 3.2.10) on the firewall and manages it from the
WebUI. Use it when access points, switches, VPN servers or the captive portal need a RADIUS
server: 802.1X / WPA-Enterprise with EAP (PEAP, TTLS, TLS), MAC authentication, accounting, and
per-user attributes such as VLAN assignment, session limits, bandwidth limits and one-time
passwords. Users can be defined locally, or looked up in SQL databases or LDAP directories.

RADIUS carries credentials. Run it only on trusted networks, restrict clients by address and
shared secret, and treat the package settings as sensitive.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **FreeRADIUS** (package `FreeSense-pkg-freeradius3`) and click **Install**.

FreeRADIUS 3 and bash are installed as dependencies. On Stable 1.1 the package is available for
amd64. See [Installing packages](/packages/installing-packages/).

After install the package reminds you that EAP needs certificates: create a CA and a server
certificate in **System → Cert. Manager** (or let the package create temporary ones, see below).

## Where to find it

**Services → FreeRADIUS** (in the *Security* group of the Services menu). All pages share these
tabs:

| Tab | Page | Purpose |
| --- | --- | --- |
| **Users** | `pkg.php?xml=freeradius.xml` | Local users, passwords, OTP and per-user attributes |
| **MACs** | `pkg.php?xml=freeradiusauthorizedmacs.xml` | MAC addresses for MAC authentication, with the same attribute options |
| **NAS / Clients** | `pkg.php?xml=freeradiusclients.xml` | Devices allowed to send requests, with their shared secrets |
| **Interfaces** | `pkg.php?xml=freeradiusinterfaces.xml` | Addresses and ports `radiusd` listens on |
| **Settings** | `pkg_edit.php?xml=freeradiussettings.xml` | Server, logging, thread, OTP and MAC-auth options |
| **EAP** | `pkg_edit.php?xml=freeradiuseapconf.xml` | EAP types, TLS certificates, caching, OCSP |
| **SQL** | `pkg_edit.php?xml=freeradiussqlconf.xml` | Up to two SQL servers for users, accounting and clients |
| **LDAP** | `pkg_edit.php?xml=freeradiusmodulesldap.xml` | Up to two LDAP servers for authorization and authentication |
| **View Config** | `freeradius_view_config.php` | Read-only view of the generated files |
| **XMLRPC Sync** | `pkg_edit.php?xml=freeradiussync.xml` | Copy the configuration to HA peers |

## First-time setup

This example authenticates Wi-Fi users with PEAP/MSCHAPv2 against local users.

1. **Listen address.** Open **Interfaces** and add two entries:
   - **Interface IP Address** `192.168.1.1` (or `*` for all), **Port** `1812`, **Interface Type**
     *Authentication*.
   - The same address, **Port** `1813`, **Interface Type** *Accounting*.
2. **Client.** Open **NAS / Clients** and add the access point:
   - **Client IP Address**: the AP address, for example `192.168.1.20`.
   - **Client Shortname**: `ap-office`.
   - **Client Shared Secret**: a long random string. Enter the same secret on the AP.
   - Set **Require Message Authenticator** to **Yes** if the AP supports it.
3. **Certificates.** Open **EAP** and select the **SSL CA Certificate** and **SSL Server
   Certificate** from the Certificate Manager. Raise **Minimum TLS version** to `1.2`. Set
   **Default EAP Type** (under the PEAP section) to MSCHAPv2 if needed; it is the default.
4. **Users.** Open **Users** and add a user with **Username** and **Password**. Keep
   **Password Encryption** on Cleartext-Password for MSCHAPv2 (it needs the clear or NT form).
5. Save each page. Every save regenerates the configuration and restarts `radiusd`.
6. Add a firewall rule that allows UDP 1812 and 1813 from the AP to the firewall address.
7. Point the AP at `192.168.1.1` with the shared secret and test a login. Watch the log (see
   below) while testing.

If you do not select a CA and server certificate on the **EAP** tab, the package creates a
temporary CA named *FreeRADIUS CA* (CN `freeradius-temp-ca`) and a server certificate
*FreeRADIUS Server Certificate* (CN `freeradius-temp-server`) in the Certificate Manager and uses
them. Replace them with your own certificates before production use, and distribute your CA to
the clients so they can validate the server.

## Settings reference

The package has several hundred fields. The tables list the ones most deployments touch, with the
package defaults.

### Users

| Field | What it does | Default |
| --- | --- | --- |
| **Username** / **Password** | Login credentials. | Empty |
| **Password Encryption** | Cleartext-Password, MD5-Password, MD5-Password (pre-hashed) or NT-Password (pre-hashed). | Cleartext-Password |
| **One-Time Password** | Enable OTP for this user, with **OTP Auth Method** (`motp` by default), **Init-Secret**, **PIN** and **Time Offset**. A **QR Code** is shown for the authenticator app. | Off |
| **Number of Simultaneous Connections** | Limit concurrent sessions. | Empty |
| **IPv4 Address**, **Subnet Mask**, **IPv4 Gateway**, **IPv6 Address**, **IPv6 Gateway** | Framed addresses returned to the NAS. | Empty |
| **VLAN ID** | VLAN returned for dynamic VLAN assignment. | Empty |
| **Expiration Date**, **Session Timeout**, **Possible Login Times** | Account and session time limits. | Empty |
| **Amount of Time** + **Time Period** | Online-time quota per daily, weekly, monthly or forever period. | daily |
| **Amount of Download and Upload Traffic** + **Time Period** | Traffic quota. | daily |
| **Maximum Bandwidth Down** / **Up** | Bandwidth attributes returned to the NAS. | Empty |
| **Accounting Interim Interval** | Interim accounting interval for the NAS. | Empty |
| **Additional RADIUS Attributes** | Free-form check items, reply items, or lines at the top of the entry. | Empty |

The **MACs** tab has the same attribute fields, keyed by **MAC Address** instead of a username.
Enable **Plain MAC Auth** on the **Settings** tab to authenticate by MAC address.

### NAS / Clients

| Field | What it does | Default |
| --- | --- | --- |
| **Client IP Address** / **Client IP Version** | Address of the NAS, IPv4 (`ipaddr`) or IPv6. | IPv4 |
| **Client Shortname** | Name used in logs. | Empty |
| **Client Shared Secret** | Shared secret for this client. | Empty |
| **Client Protocol** | UDP or TCP. | UDP |
| **Client Type** | NAS type hint. | other |
| **Require Message Authenticator** | Reject requests without a Message-Authenticator attribute. | No |
| **Max Connections** | Connection limit for TCP clients. | 16 |
| **NAS Login** / **NAS Password** | Credentials used by some NAS types for session checks. | Empty |

If no client is configured, the package writes a placeholder client for `127.0.0.1` so `radiusd`
can start. In FreeSense 1.1 that placeholder gets a random secret.

### Interfaces

| Field | What it does | Default |
| --- | --- | --- |
| **Interface IP Address** | Address to listen on, `*` for all. | `*` |
| **Port** | UDP or TCP port. | 1812 |
| **Interface Type** | Authentication, Accounting, Proxy, Detail, Status or CoA. | Authentication |
| **IP Version** | IPv4 or IPv6. | IPv4 |

### Settings

| Field | What it does | Default |
| --- | --- | --- |
| **Maximum Requests Tracked**, **Maximum Request Timeout**, **Cleanup Delay** | Request handling limits. | 1024, 30, 5 |
| **Save settings after deletion** | Keep the FreeRADIUS settings when the package is removed. | On |
| **RADIUS Logging Destination** | System Logs (syslog) or `/var/log/radius.log`. | System Logs |
| **RADIUS Logging** | Log authentication requests. | Yes |
| **Log Password on Authentication Failure / Success** | Writes passwords to the log. Leave off. | No |
| **Access-Reject Delay** | Seconds before sending a reject. | 1 |
| **Number of Threads After Start** / **Maximum Number of Threads** | Thread pool. | 5 / 32 |
| **Mobile-One-Time-Password** | Enables mOTP, with **OTP Lifetime**, **Number of Invalid Password Attempts**, **Hash Algorithm** and **Token Password Length**. | Off |
| **Plain MAC Auth** | Authenticate clients by MAC address (MACs tab). | Off |

### EAP

| Field | What it does | Default |
| --- | --- | --- |
| **Disable Weak EAP Types** | Turn off MD5, GTC and LEAP. | Off |
| **Default EAP Type** | Outer EAP type offered first: MD5, GTC, LEAP, TLS, TTLS, PEAP or MSCHAPv2. | MD5 |
| **Minimum TLS version** | 1.0, 1.1 or 1.2. | 1.0 |
| **SSL CA Certificate** / **SSL Revocation List** / **SSL Server Certificate** | Certificates from the Certificate Manager. | Temporary certificates if empty |
| **Check Cert Issuer** / **CA Subject** / **Check Client Certificate CN** | Extra EAP-TLS client checks. | Off |
| **Enable cache** | TLS session cache, with **Lifetime** (hours) and **Max Entries**. | No, 24, 255 |
| **Enable OCSP** | Check client certificates with OCSP. | No |
| TTLS **Default EAP Type** | Inner method for TTLS. | MD5 |
| PEAP **Default EAP Type** | Inner method for PEAP. | MSCHAPv2 |

### SQL and LDAP

Both tabs configure up to two servers. A second server is combined with the first using the
**Choose Failover/Load Balancing Mode** setting (`redundant` by default).

- **SQL**: **SQL Support** turns the module on; then choose which stages use it (**Enable SQL
  Authorization**, **Accounting**, **Session**, **Post-Auth**), the **Database Type** (`mysql` by
  default), **Server Address**, **Server Port**, credentials, table names (`radcheck`,
  `radreply`, `radacct` and so on) and **Read Clients from Database** (table `nas`).
- **LDAP**: **LDAP Authorization Support** and **LDAP Authentication Support**, **Server
  Address**, **Server Port** (389), **Identity**, **Password**, **Base DN**, **Filter**, group
  membership options, **Active Directory Compatibility**, and **TLS Support** / **Use
  STARTTLS** with certificate selection.

The SQL and LDAP forms are pre-filled with example values (for example `radius` / `radpass`, or
`cn=admin,o=My Company Ltd,c=US`). Replace every example value before enabling a module.

### XMLRPC Sync

**Enable Sync** (disabled by default), **XMLRPC timeout** (150 seconds) and a list of target hosts
with credentials. The sync pushes the FreeRADIUS settings to the listed peers.

## Firewall rules and interfaces

- The package adds no firewall rules. Allow **UDP 1812** (authentication) and **UDP 1813**
  (accounting) from each NAS to the address in **Interfaces**. Add **UDP 3799** if you configure
  a CoA listener on that port, and TCP if a client uses TCP.
- Never allow RADIUS from WAN unless the NAS is reached over a VPN.
- If the captive portal on the same firewall uses this server, use the firewall's own address
  and add it as a client.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service name | `radiusd` (shown in **Status → Services**) |
| rc script | `/usr/local/etc/rc.d/radiusd.sh` (wraps `/usr/local/etc/rc.d/radiusd`) |
| Configuration | `/usr/local/etc/raddb/` (generated; edits are overwritten) |
| PID file | `/var/run/radiusd.pid` |
| Logs | By default via syslog: **Status → System Logs → System → General**. With **RADIUS Logging Destination** set to the file option, `/var/log/radius.log`. |
| Accounting data | `/var/log/radacct/`, including per-user time and traffic counters |
| Generated config | **View Config** shows `radiusd.conf`, `eap`, `sql`, `clients.conf`, `users`, `authorized_macs`, the default virtual server and `ldap`. |

## Upgrade, backup, and removal

- All settings are in `config.xml` (`installedpackages/freeradius*`) and part of configuration
  backups. User passwords and shared secrets are stored there too, so protect your backups.
- The certificates are in the Certificate Manager and are backed up with the configuration.
- Accounting counters under `/var/log/radacct` are not part of `config.xml`.
- On removal the package stops `radiusd`. If **Save settings after deletion** is unchecked (and
  the Settings tab was saved), it also deletes every FreeRADIUS section from `config.xml` and the
  `raddb` directory. With the default (checked) the settings are kept for a reinstall.
- Restoring a configuration backup that contains FreeRADIUS now reinstalls the package and keeps
  its settings (see the 1.1 changes).

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `radiusd` will not start after upgrading from 1.0 | In 1.0 the package referenced a dictionary file that does not exist on FreeSense, so `radiusd` never started (*Couldn't open dictionary*). Update the package; the dictionary is rewritten on install. |
| Clients get no answer | Check that an **Interfaces** entry exists for the address and port, the NAS address matches a **NAS / Clients** entry, and the firewall rule allows UDP 1812/1813. |
| Log shows *Ignoring request ... unknown client* | The request came from an address that is not in **NAS / Clients**. |
| Log shows *invalid Message-Authenticator* or rejects with a correct password | The shared secret differs between the NAS and the client entry. |
| PEAP/TTLS fails on clients | The client does not trust the CA, or the server certificate is missing or expired. Select proper certificates on the **EAP** tab and install the CA on clients. |
| Notice *Cannot create temporary FreeRADIUS certificate authority* | Certificate creation failed. Create a CA and server certificate yourself and select them on **EAP**. |
| HA peers do not receive changes | Check **XMLRPC Sync** targets and credentials. In 1.0 the sync called a function FreeSense does not have; this is fixed in 1.1. |

:::note[Changes in FreeSense 1.1]
- `radiusd` starts again. The package included `dictionary.pfsense`, but FreeSense ships
  `/usr/local/share/FreeSense/radius/dictionary.freesense`, so the server refused to start. The
  package now includes the FreeSense dictionary, and the package update fixes existing systems
  (freesense-packages 68e1ebb).
- The placeholder `127.0.0.1` client written when no clients exist used a fixed, well-known
  secret. It now gets a random secret (8312aa4).
- XMLRPC sync to HA peers works: it called `pfsense_xmlrpc_client`, which no FreeSense release
  defines, and now uses `freesense_xmlrpc_client` (8312aa4).
- A configuration restore no longer reports FreeRADIUS as missing and quarantines its settings
  (freesense 40f28ef).
- **FreeRADIUS** is listed in the *Security* group of the 1.1 Services menu (4ae11df).
:::
