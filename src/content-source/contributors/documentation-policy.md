---
title: Documentation policy
description: How to contribute original, edition-aware FreeSense documentation - sources, evidence, editions, style, and review.
---

FreeSense documentation is original project work. Do not copy vendor documentation prose,
screenshots, diagrams, tables, branding, or navigation wording. External documentation can show that
a topic needs coverage, but it is never a source to copy from.

## No screenshots or images

Pages contain no screenshots or other images of the product. Describe the interface in text instead:
menu paths in bold with arrows, such as **System → Package Manager → Available Packages**, and field
labels exactly as the WebUI shows them. Text stays accurate across theme changes, can be searched and
translated, and cannot leak addresses, keys, or other secrets the way a screenshot can.

## Evidence standard

Every technical claim must be supported by at least one of:

- FreeSense source code, package metadata, or a release lock or manifest;
- a reproducible test on the documented edition and release; or
- a primary upstream protocol or project document, when FreeSense behavior depends on it.

When a claim cannot be verified from source, mark it in the page source with an HTML comment
(`<!-- needs verification: ... -->`) and list it in the pull request, rather than guessing.

## Documentation editions

The site publishes three editions from one repository:

| Edition | Path | Built from | Describes |
| --- | --- | --- | --- |
| Stable 1.1 | `/` | `src/content-source/` plus `src/content-overrides/stable/` | The supported 1.1.x line |
| Development 1.2 | `/1.2/` | `src/content-source/` plus `src/content-overrides/devel/` | The rolling 1.2 line, experimental and unsupported |
| 1.0 (frozen) | `/1.0/` | `src/content-frozen/1.0/` | The 1.0.x line, kept as it was when 1.1 was released |

Rules:

- Write shared pages in `src/content-source/`. Most corrections belong there, so both live editions
  inherit them.
- When Development behaves differently, copy the whole page to `src/content-overrides/devel/` at the
  same relative path and change it there. An override is a complete page; do not put edition
  conditions inside prose.
- Development-only pages must say that the line is experimental and unsupported.
- Never edit the frozen 1.0 edition except to fix a factual error that could harm an operator.
- Never edit `src/content/docs/`; it is generated before every preview and build.
- Write internal links root-relative with a trailing slash (`/packages/wireguard/`). The generator adds
  the edition prefix. Link explicitly to `/1.2/…` only for Development-only pages, and to `/1.0/…` only
  for the frozen edition.

The WebUI opens the edition that matches the installed release (1.0.x → `/1.0/`, 1.1.x → `/`,
1.2.x → `/1.2/`); see the [context-help map](/reference/context-help/). When a release line moves, add
redirects for retired paths so links from installed systems keep working.

## Page format

- Frontmatter has `title` and `description`, plus optional `sidebar` keys. Do not add other keys.
- Use task-first headings, short paragraphs, numbered steps for procedures, and tables for settings.
- Use real field names, defaults, file paths, commands, and service names from the code.
- Base OS pages explain concepts and where things are; configure pages are task guides. Cross-link
  them instead of repeating content.
- Starlight components work only in `.mdx` files; in `.md` use the `:::note`, `:::tip`, `:::caution`,
  and `:::danger` asides.
- Use example values such as `192.168.1.1`, `admin`, and `example.com`. Never publish real credentials,
  customer addresses, private keys, personal names, or personal email addresses.

## Naming and trademarks

FreeSense is a single-edition product. Name third-party products only to identify them, for example
pfSense CE as the upstream project FreeSense is derived from or as a source for configuration import.

## Recipe standard

A recipe needs prerequisites, a topology, ordered actions, verification, rollback, and a maintenance
owner, and it must link to the task guides it relies on.

## Review

Changes to firewall, routing, VPN, authentication, release, and security guidance need a technical
reviewer who can verify the behavior. Documentation CI checks the edition registry against the sealed
release locks, package documentation coverage, and the build output; human review remains responsible
for accuracy and safety.

## Release history

Stable documentation describes the tagged 1.1.x line and its sealed provenance. Never silently rewrite
the record of a published release; publish an erratum or document the change in the next patch
release, such as 1.1.2.
