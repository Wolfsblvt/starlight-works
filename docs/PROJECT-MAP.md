# Project map

## Meaning

The repository separates a tiny distributable package from its qualification machinery and maintained explanations. This map owns where those responsibilities live and where a contributor should begin; it keeps tests, examples and development tooling from becoming accidental package dependencies.

## Layout

| Path | Holds | Why it is separate |
| --- | --- | --- |
| `packages/starlight-works/src/` | Plugin wiring, sidebar conversion, alert transformation, Astro components and structural CSS | The publishable product has one inspectable boundary. |
| `packages/starlight-works/dist/` | Generated JavaScript, declarations, Astro components and CSS | Consumers need build output, while contributors edit source. |
| `fixtures/consumer/` | A genuine Starlight project and public-API type examples | It must install a tarball outside the workspace so missing exports cannot be hidden. |
| `tests/` | Pure behavior, integration wiring and actual package-content tests | Fast failures isolate semantic and packaging mistakes before browser work. |
| `e2e/` | User interactions against the built consumer | Browser behavior is a separate claim from configuration and AST correctness. |
| `tools/` | Build, packing, isolated consumer and local server commands | Development execution does not ship inside the library. |
| `docs/` | API, architecture, rationale, compatibility and development truth | Maintained explanations are not a live work queue. |
| `artifacts/` | Generated tarball, fixture coordinate, logs and browser evidence | Reproducible local output is disposable rather than committed product source. |

## Entry points

Start with `packages/starlight-works/src/index.ts` for the public plugin. `sidebar.ts` compiles the small authoring extension into native Starlight configuration; `alerts.ts` transforms parsed blockquotes without owning parsing. `components/SidebarList.astro` contains the independent anchor/disclosure structure.

Use `npm test` for ordinary verification, `npm run test:consumer` for the installed boundary, and `npm run test:browser` for the browser result. The complete bootstrap and reset path is in [Development](DEVELOPMENT.md).
