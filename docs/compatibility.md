# Compatibility and qualification

## Meaning

This document separates starlight-works' declared host contract from the concrete specimens used to qualify it. It owns the supported boundaries and the interpretation of evidence, so a passing example is not silently expanded into support for every Starlight release, browser, locale or plugin combination.

## Declared contract

The source candidate declares Astro `^7.2.10`, Starlight `~0.42.2`, and Node `>=22.12.0`. Starlight's pre-1.0 minor line is deliberately narrow. The package uses its public plugin, Sidebar override, component and route-data surfaces rather than importing its internal sidebar generator.

Astro 7's default Satteri processor and the optional Unified processor from `@astrojs/markdown-remark` are supported. The optional peer is `^7.3.0`; Satteri hosts do not need to install Unified merely for this plugin. Another processor can use only the sidebar by setting `alerts: false`.

A peer range is an intended compatibility boundary, not evidence that every patch or minor version within it was individually exercised. Qualification uses exact versions and records the actually resolved dependency graph.

## CI specimens

| Specimen | Node line | Astro | Starlight | Processor | Base |
| --- | --- | --- | --- | --- | --- |
| Floor | 22 | 7.2.10 | 0.42.2 | Satteri | `/manual/` |
| Current | 24 | 7.3.3 | 0.42.2 | Satteri | `/` |
| Alternate processor | 24 | 7.3.3 | 0.42.2 | Unified | `/manual/` |

Every specimen rebuilds the package, runs ordinary tests and Astro component checks, installs the actual tarball into an independent consumer, checks that public TypeScript API, builds the site and runs Chromium browser interactions. The consumer is not a workspace symlink. Both root and non-root base paths are represented.

The workflow's required `Tests` aggregate succeeds only when every specimen succeeds. Consult the exact current-head [PR checks](https://github.com/Wolfsblvt/starlight-works/pull/1/checks) or a dated qualification record for observed standing. This table describes the exercised contract; it does not make an unfinished or failing run green.

## Evidence produced

The run records its checked-out commit, Node/npm versions, selected consumer versions/licenses, generated dependency locks, npm pack account, browser results and selected desktop/mobile light/dark screenshots. The pack test compares two tarballs byte-for-byte and asserts complete exports, the license and the absence of development files.

Browser checks cover distinct anchors and disclosures, keyboard activation and native expanded state, multiple open groups, current ancestors, native link attributes/autogeneration, all five alert meanings, authored titles, rich Markdown, MDX, theme changes and narrow-width overlap/overflow. The no-JavaScript case exercises native navigation/disclosure at a desktop viewport; Starlight's mobile shell retains its own script requirements.

Artifacts are generated evidence with finite provider retention. A screenshot documents one rendered state; the interaction test documents an exercised path. Neither is a substitute for the other.

## Material limits

Manual assistive-technology use, Firefox/WebKit, real phones, RTL/multilingual route matrices, server-rendered deployment adapters, arbitrary third-party Sidebar overrides, custom Markdown processors, altered consumer themes and future host versions are not blanket-qualified by this fixture. Build-wide alert label overrides are supported; automatic per-page locale label selection is not implemented.

No npm publication, registry installation of this package, deployed documentation site, independent review or release acceptance follows from a passing local/CI tarball. The source candidate's contribution has those retained boundaries explicitly.

## Primary contracts

The integration design was checked against the current official [Starlight plugin API](https://starlight.astro.build/reference/plugins/), [component overrides](https://starlight.astro.build/reference/overrides/), [sidebar configuration](https://starlight.astro.build/guides/sidebar/), [route data](https://starlight.astro.build/reference/route-data/) and [Astro Markdown processors](https://docs.astro.build/en/guides/markdown-content/). Exact source/package coordinates and observed results belong in the qualification record, not in an undated claim of universal compatibility.
