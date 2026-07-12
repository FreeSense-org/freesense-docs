---
title: Documentation policy
description: How to contribute original, version-aware FreeSense documentation.
channels: [devel, candidate, stable]
last_verified_release: development
---

FreeSense documentation is original project work. Do not copy vendor documentation prose, screenshots, diagrams, tables, branding, or navigation wording. External documentation can identify a topic that needs coverage, but it is not a source file.

## Evidence standard

Every technical claim should be supported by one or more of:

- FreeSense source code, package metadata, or release manifest;
- a reproducible test on the documented channel and version;
- a primary upstream protocol or project document when FreeSense behavior depends on it.

## Required page metadata

New operator pages declare their supported channels and `last_verified_release`. Package pages also identify relevant packages and capabilities. Pages that describe a candidate or stable artifact must record the matching release contract.

## Recipe standard

A recipe needs prerequisites, a topology, ordered actions, verification, rollback, and a maintenance owner. Never publish real credentials, customer addresses, private keys, or screenshots containing secrets.

## Review

Changes to firewall, routing, VPN, authentication, release, and security guidance need a technical reviewer who can verify the behavior. Documentation CI checks the package catalog contract, source policy, and build output; human review remains responsible for accuracy and safety.

## Channel publication and retention

Development pages describe the moving implementation and should state the date or build context
when it materially affects behaviour. Candidate publication requires release notes that name the
sealed artifact set and four-repository provenance. Before a candidate is promoted to Stable, copy
its verified documentation into an immutable release snapshot, then change the Stable channel
pointer. Never silently rewrite a historical snapshot; publish an erratum or a new maintenance
release instead.
