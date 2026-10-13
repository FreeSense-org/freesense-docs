---
title: HAProxy
description: Publish internal services through FreeSense with the HAProxy package - frontends, backends, TLS offloading, health checks, ACL routing, stats and HA sync.
---

The **HAProxy** package (`FreeSense-pkg-haproxy` 0.65.7) runs HAProxy 3.4 (FreeSense builds its
own `net/haproxy` port at 3.4.2) as an inbound reverse proxy and load balancer. Use it to publish
web applications and TCP services that live behind the firewall: terminate TLS with certificates
from the Certificate Manager or [ACME](/packages/acme/), route requests to different backends by
host name or path, balance across several servers, health-check them, and fail over to backup
servers.

HAProxy is for **inbound** publishing. For outbound web filtering and explicit or transparent
proxying of client traffic, use the [Secure Web Gateway](/packages/web-gateway/).

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **HAProxy** (package `FreeSense-pkg-haproxy`) and click **Install**.

On Stable 1.1 the package is available for amd64. See
[Installing packages](/packages/installing-packages/).

## Where to find it

- **Services → HAProxy** (in the *Proxy* group of the Services menu) opens the **Frontend** tab.
- **Status → HAProxy Stats** (in the *Traffic* group of the Status menu) opens the full-screen
  stats page.
- A **HAProxy** dashboard widget shows frontends, backends and server states.

The package tabs are:

| Tab | Page | Purpose |
| --- | --- | --- |
| **Settings** | `haproxy/haproxy_global.php` | Global enable, limits, logging, DNS resolvers, mail alerts, TLS tuning, sync |
| **Frontend** | `haproxy/haproxy_listeners.php` | Listeners: addresses, ports, TLS, ACLs and actions |
| **Backend** | `haproxy/haproxy_pools.php` | Server pools, balancing, health checks, persistence |
| **Files** | `haproxy/haproxy_files.php` | Named files (for example error pages) referenced from frontends and backends |
| **Stats** | `haproxy/haproxy_stats.php` | HAProxy statistics inside the WebUI |
| **Stats FS** | `haproxy/haproxy_stats.php?haproxystats=1` | The same statistics full screen |
| **Templates** | `haproxy/haproxy_templates.php` | Example configurations to add with one click |

## First-time setup

This example publishes `https://app.example.com` on the WAN address to an internal web server
`192.168.1.50:8080`.

1. **Certificate.** Issue or import a certificate for `app.example.com` in **System → Cert.
   Manager**, or with the [ACME](/packages/acme/) package.
2. **Free port 443.** If the WebUI listens on 443 on the same address, move the WebUI to another
   port in **System → Advanced → Admin Access**, or listen on a virtual IP.
3. **Settings.** Open **Services → HAProxy → Settings**, check **Enable HAProxy**, set
   **Maximum connections** (for example `1000`), set **Internal stats port** (for example
   `2200`) so the Stats tab works, and **Save**.
4. **Backend.** Open **Backend**, click **Add**:
   - **Name** `app_servers`.
   - In the server list add a row: **Mode** *active*, **Name** `app1`, **Address**
     `192.168.1.50`, **Port** `8080`.
   - Under **Health checking**, set the check type to **HTTP** and the check URL to a page that
     returns 200, for example `/health`.
   - **Save**.
5. **Frontend.** Open **Frontend**, click **Add**:
   - **Name** `https_in`, **Status** *Active*.
   - **External address**: **Listen address** *WAN address*, **Port** `443`, check **SSL
     Offloading**.
   - **Type**: *http / https(offloading)*.
   - **Default backend**: `app_servers`.
   - Under **SSL Offloading**, select the certificate from step 1.
   - **Save**.
6. Click **Apply Changes**. The configuration is tested with `haproxy -c` before it is used.
7. Add a WAN firewall rule that allows TCP 443 to **This Firewall** (or the WAN address).
8. Test from outside, then check **Stats** for the server state.

To publish more sites on the same address and port, either add ACLs and actions to the frontend
(for example *Host matches* `app2.example.com` → backend `app2_servers`), or add a second frontend
with **Shared Frontend** checked and pick the first one as **Primary frontend**.

## Settings reference

### Settings tab

| Field | What it does | Default |
| --- | --- | --- |
| **Enable HAProxy** | Runs the service. | Off |
| **Installed version** | Shows the HAProxy version. | |
| **Maximum connections** | Per-process connection limit (required). The page shows memory guidance and the current `kern.maxfiles` / `kern.maxfilesperproc`; for high limits raise both to at least connections × 2 + 31 in **System → Advanced → System Tunables**. | Empty |
| **Number of threads to start per process** | Worker threads. | 1 |
| **Reload behaviour** | **Force immediate stop of old process on reload** closes existing connections on every reload. Otherwise the old process serves its connections until they end. | Off |
| **Reload stop behaviour** | `hard-stop-after`: longest time for a soft stop, for example `30s`, `15m`, `3h`. | 15m |
| **Carp monitor** | Run HAProxy only on the node where the selected CARP VIP is MASTER. | Disabled |
| **Internal stats port** | Port on `127.0.0.1` used by the Stats tabs. Empty removes the local stats listener. | Empty |
| **Internal stats refresh rate** / **Sticktable page refresh rate** | Auto-refresh in seconds. | Empty |
| **Remote syslog host** | Syslog target. Use `/var/run/log` for the local system log. | Empty (no logging) |
| **Syslog facility** / **Syslog level** | Facility and level for log lines. | local0 / info |
| **Log hostname** | Host name in the syslog header. | System host name |
| **DNS servers**, **Retries**, **Retry timeout**, **Interval** | Resolvers so servers given by name are re-resolved without a restart. | 3, 1s, 10s |
| **Mailer servers**, **Mail level**, **Mail myhostname**, **Mail from**, **Mail to** | Email alerts on server state changes. | Dont log |
| **SSL/TLS Compatibility Mode** | Auto, Modern (TLS 1.3 only), Intermediate (no TLS 1.0/1.1, no SHA1) or Old. | Auto |
| **Max SSL Diffie-Hellman size** | `tune.ssl.default-dh-param`. | Empty (1024) |
| **Custom options** | Lines added to the `global` section. | Empty |
| **HAProxy Sync** | Sync the HAProxy configuration to backup CARP members via XMLRPC. | Off |
| **Force Service Restart** | Restart now instead of a soft reload; server states are not preserved. | |

The bottom of the page shows the contents of `/var/etc/haproxy_test/haproxy.cfg` (the last tested
configuration) and `/var/etc/haproxy/haproxy.cfg` (the running configuration).

### Frontend

| Field | What it does |
| --- | --- |
| **Name** / **Description** | Identifier and free text. |
| **Status** | Active or Disabled. |
| **Shared Frontend** / **Primary frontend** | Attach this frontend's ACLs, actions and certificates to another frontend that owns the address and port. |
| **External address** | Rows of **Listen address** (interface address, virtual IP, *any* or **Custom address**), **Port** (comma-separated list allowed), **SSL Offloading** and **Advanced** bind options. |
| **Max connections** | Limit for this frontend. |
| **Type** | *http / https(offloading)*, *ssl / https(TCP mode)* or *tcp*. TLS termination with a certificate needs the http type. |
| **Access Control lists** / **Actions** | Conditions (host, path, source address, headers and more, with case-sensitive and *Not* options) and the actions to take, such as *Use Backend*, redirects, header changes and denies. |
| **Default Backend** | Backend used when no action matches. |
| **Stats options**, **Logging options**, **Error files** | Per-frontend stats, logging detail (for example *dontlognull*) and custom error pages from the **Files** tab. |
| **Advanced settings** | **Client timeout**, **Use "forwardfor" option** (adds `X-Forwarded-For`), HTTP connection handling, **Bind pass thru** and custom frontend lines. |
| **SSL Offloading** | **Certificate**, optional SNI filter, additional certificates with automatic ACLs, OCSP, and advanced TLS options. A further section configures client certificate authentication (CA and CRL). |

### Backend

| Field | What it does |
| --- | --- |
| **Name** | Backend identifier, referenced from frontends. |
| Server list | **Mode** (active, backup, disabled, inactive), **Name**, **Forwardto**, **Address**, **Port**, **Encrypt(SSL)**, **SSL checks**, **Weight**, plus per-server details. |
| **Balance** | None, roundrobin, static-rr, leastconn, source or uri. |
| **Access control lists and actions** | Backend-side ACLs and actions. |
| **Connection timeout**, **Server timeout**, **Retries** | Timeouts and retry count. |
| **Health checking** | Check type: none, Basic (TCP connect), HTTP, Agent, LDAP, MySQL, PostgreSQL, Redis, SMTP, ESMTP or SSL; **Check frequency**; HTTP method, URL and version; credentials for database checks. |
| **Agent checks** | Separate agent port and interval. |
| **Cookie persistence** / **Stick-table persistence** | Session stickiness by cookie or stick table. |
| **Email notifications** | Per-backend alert level and recipient. |
| **Statistics** | Optional stats page served by this backend, with URI, realm, credentials and admin access. |
| **HSTS / Cookie protection** | Adds `Strict-Transport-Security` and marks cookies secure. |
| **Advanced settings** | Per-server and backend pass-thru lines, and transparent client IP (source address preservation). |

## Firewall rules and interfaces

- The package does not create firewall rules for listeners. Add a **pass** rule for each
  frontend port, for example TCP 443 from *any* to **This Firewall** on WAN.
- Do not add a port forward (NAT) for traffic HAProxy should receive; HAProxy listens on the
  firewall itself.
- If a frontend uses the same address and port as the WebUI, one of them fails to start. Move
  the WebUI port or use a virtual IP.
- **Transparent client IP** in a backend makes HAProxy connect with the client's address. The
  package then adds the needed firewall rules (labelled `HAPROXY_transparent_rule_<backend>`) and
  loads ipfw to catch the return traffic. The backend servers must route their replies through
  the firewall.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service name | `haproxy` (*TCP/HTTP(S) Load Balancer* in **Status → Services**) |
| rc script | `/usr/local/etc/rc.d/haproxy.sh` (written at install) |
| Running configuration | `/var/etc/haproxy/haproxy.cfg` |
| Test configuration | `/var/etc/haproxy_test/haproxy.cfg` |
| Logs | Only when **Remote syslog host** is set. With `/var/run/log`, lines go to the local system log (**Status → System Logs → System → General**). |
| Statistics | **Status → HAProxy Stats**, the **Stats** tab (needs **Internal stats port**) and the dashboard widget |

HAProxy reloads gracefully when you apply changes: by default the old process keeps serving
existing connections. Server states (for example a server set to maintenance on the Stats page)
are preserved across reloads; use **Force Service Restart** on **Settings** to start clean.

## Upgrade, backup, and removal

- All settings live in `config.xml` (`installedpackages/haproxy`) and are part of configuration
  backups. Certificates are in the Certificate Manager. Files on the **Files** tab are stored in
  the configuration too.
- The package registers which certificates its frontends use, so the Certificate Manager shows
  them as in use.
- Removing the package deletes the rc script and the cron jobs. In FreeSense 1.1 the Package
  Manager also stops `haproxy`; in 1.0 a removed HAProxy kept running until reboot. The settings
  stay in `config.xml`.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| **Apply Changes** reports a configuration error | The `haproxy -c` test failed. The message shows HAProxy's output; the running configuration stays in place. Compare the two configuration views at the bottom of **Settings**. |
| Service starts but the site is unreachable | Missing WAN pass rule for the frontend port, a port forward that sends the traffic elsewhere, or the WebUI already using the port. |
| Backend shows DOWN on Stats | The health check fails. Check the check type, URL and expected status, and that the firewall allows the firewall itself to reach the server. |
| Stats tab says to configure an internal stats port | Set **Internal stats port** on **Settings** and make sure HAProxy is running. |
| No HAProxy log lines | **Remote syslog host** is empty. Set it to `/var/run/log` or a remote syslog server. |
| Client IPs show as the firewall address on servers | Enable **Use "forwardfor" option** for HTTP and read `X-Forwarded-For` on the server, or use transparent client IP. |
| Clients get an old certificate after ACME renewal | Apply or restart HAProxy after renewal, or configure the ACME action that restarts HAProxy. |

:::note[Changes in FreeSense 1.1]
- Removing the package stops `haproxy`; previously the daemon kept running after removal
  (freesense c767de3).
- The self-signed certificate created by the stats template is named `haproxy-freesense`, and
  help text refers to the FreeSense address (freesense-packages 8d82a24).
- **HAProxy** is in the *Proxy* group of the Services menu and **HAProxy Stats** in the *Traffic*
  group of the Status menu (4ae11df).
- HAProxy itself is 3.4.2 from FreeSense's own `net/haproxy` port.
:::
