---
title: Security and filtering packages
description: Select and operate the official security, inspection, certificate, and web-policy packages.
---

Optional security packages extend FreeSense with certificate automation, reputation feeds,
behavioral decisions, intrusion detection and prevention, and—on Development—web proxy policy.
Install only the control that has a defined owner, data source, false-positive process, and recovery
path.

| Package | Purpose | Primary operating concern |
| --- | --- | --- |
| ACME Certificates | Certificate enrollment and renewal | Account and DNS-validation credentials; consumer deployment |
| CrowdSec | Behavioral security decisions | Managed firewall table and false-positive response |
| Threat Shield & DNS Protection | Managed DNS filtering and firewall protection | Feed health, allowlists, scheduled updates, and DNS availability |
| Suricata IDS/IPS | Detection and inline prevention | Capacity, rule tuning, pass lists, and blocking rollout |
| Secure Web Gateway | Explicit/transparent web policy | Development-only; TLS inspection and identity policy |
| Web Gateway Local Antivirus | Local ICAP malware scanning | Development-only; CPU, storage, and response handling |

## Safety baseline

Start security controls in observation mode wherever possible. Record the approved feed or rule
sources, update interval, notification owner, retention limit, and emergency-disable procedure.
Do not combine several intensive inspection packages until the appliance has demonstrated sustained
CPU, memory, storage, and packet-processing headroom.

Read [Suricata IDS/IPS](/security/suricata/) and [CrowdSec](/security/crowdsec/) before enabling
blocking. The Secure Web Gateway guide is available only in [1.1 Development](/1.1/packages/web-gateway/).
