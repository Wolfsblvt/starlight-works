# Dependencies and licensing

## Meaning

This account explains the dependencies that starlight-works admits, the boundary between host/runtime/type/development requirements, and how the MIT package preserves upstream rights. It is an engineering dependency account, not a claim of exhaustive legal or vulnerability certification.

## Product dependencies

| Dependency | Role | Why it is here | License |
| --- | --- | --- | --- |
| `@astrojs/markdown-satteri` `^0.4.1` | Runtime configuration integration | Detect and extend Astro's supported default processor through its public API instead of duplicating its parser or guessing its shape. | MIT |
| `@types/mdast` `^4.0.4` | Published declaration support | Keep the emitted Markdown helper declarations resolvable without relying on a consumer's accidental type hoisting. | MIT |
| `astro` `^7.2.10` | Required host peer | Owns content processing, Astro components and build/runtime integration. | MIT |
| `@astrojs/starlight` `~0.42.2` | Required host peer | Owns routes, current-page data, native sidebar schema, theme and documentation shell. | MIT |
| `@astrojs/markdown-remark` `^7.3.0` | Optional host peer | Supports hosts that explicitly choose Unified; it is not required by Satteri-only consumers. | MIT |

The package does not bundle those projects' implementation into its tarball. Its own runtime output is JavaScript, Astro source components, declarations and CSS. There is no browser framework, telemetry SDK, storage library, hosted API, icon package or second route registry.

## Development-only dependencies

TypeScript and `@astrojs/check` compile and check the authored package. `mdast-util-to-hast` is declared explicitly for its standard Markdown rendering metadata type augmentation, not used as a second production rendering pipeline. Unified, remark-parse, remark-rehype and rehype-stringify provide an independent parsed-Markdown test harness. `@types/node` supplies build-script/runtime types.

Playwright is the browser qualification harness and uses Apache-2.0 licensing; TypeScript is Apache-2.0. The listed Astro and unified ecosystem packages and DefinitelyTyped definitions use MIT. Exact installed versions and transitive package metadata are captured by dependency locks and the CI artifact account. Native Satteri binaries and the host's other transitive dependencies remain upstream dependencies, not newly authored package code.

GitHub Actions provides ordinary CI. Checkout, setup-node and upload-artifact are pinned to full revisions; they are development infrastructure, not product runtime. Their repository/source licenses remain upstream. CI has no source-writing, release or deployment path, and its artifacts have finite retention rather than an invented support archive.

## Alternatives and package size

Reusing a four-type alert mapping was rejected because it cannot preserve all five selected meanings. The replacement is a small original AST transformation shared by the two host adapters, not copied third-party plugin code. Reimplementing Markdown parsing or routing was rejected because the host already owns those responsibilities and their compatibility cost.

The deterministic pack test requires the compressed package to remain below 25 kB and verifies its real whitelist. That threshold concerns this package's own payload, not the much larger Astro/Starlight host installation. Packaging the test runner, fixture or full upstream sources would fail that boundary.

## Rights and source provenance

The new package implementation, tests and documentation are original contributions licensed under the repository's MIT license. Public upstream contracts and source were consulted for integration behavior; no upstream component implementation, icon artwork, font, product content or unrelated alert-plugin source was vendored. Standard hook names, type names and small integration expressions remain the necessary API vocabulary.

The root MIT text is copied unchanged into the generated package before packing. Consumers retain that license notice, and the package manager retains upstream dependencies' own notices. There is no separately relicensed copied third-party payload requiring an additional notices file in this package.

The source repository is public; the package is not yet published to npm. Neither npm namespace control nor a public-registry install/release has been exercised by this contribution.
