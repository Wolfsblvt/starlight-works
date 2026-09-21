# Development

## Meaning

This guide owns the complete local build, test, packed-consumer, browser and cleanup path for starlight-works. The essential distinction is that fast source tests prove semantics, while an isolated tarball installation proves the package boundary and its real Starlight behavior.

## Prerequisites

Node `>=22.12.0` matches the selected Astro host floor. CI exercises the Node 22 and 24 lines. Use the repository's installed TypeScript and Astro tools rather than global versions. Dependency installation requires registry access. Browser qualification additionally downloads Playwright Chromium; Linux may need the system packages installed by `npx playwright install --with-deps chromium`.

No credentials, database, public service, paid resource or deployment target are needed. All served fixture URLs bind to `127.0.0.1`.

## Bootstrap and ordinary verification

```sh
npm install
npm test
npm run check
```

`npm test` rebuilds from TypeScript, copies the authored Astro/CSS assets and license into the package output, then runs the Node test suite. It includes two real tarball packs and compares their bytes, asserts exported files are present, and checks that source fixtures and development machinery do not leak into the artifact. `npm run check` additionally checks the source Astro components.

## Exercise the installed boundary

```sh
npm run test:consumer
npx playwright install chromium
npm run test:browser
```

The consumer command rebuilds and packs the package, copies `fixtures/consumer` into a fresh operating-system temporary directory, installs the tarball as a normal package rather than a workspace symlink, then runs the consumer's type check and production build. The public API compile fixture includes deliberate type errors guarded by `@ts-expect-error` so accidental widening is caught.

The browser suite starts the consumer's production preview on `127.0.0.1:4321`, uses isolated contexts, and shuts that owned server down after the run. It exercises desktop and narrow Chromium layouts, real navigation/disclosure and keyboard actions, theme changes, MDX, ordinary quotes and server-rendered disclosure with JavaScript disabled. The explicit no-JavaScript scenario uses a desktop viewport in both projects; it does not claim Starlight's mobile menu works without its own script.

## Commands

| Task | Command |
| --- | --- |
| Build only | `npm run build` |
| Check authored Astro components | `npm run check` |
| Ordinary verification | `npm test` |
| One semantic test file, after build | `node --test tests/sidebar.test.mjs` |
| Create the installable tarball | `npm run pack` |
| Install, check and build the fixture | `npm run test:consumer` |
| Run production browser tests | `npm run test:browser` |
| Browse the installed fixture with development updates | `npm run dev` |
| Browse its existing production build | `npm run preview` |
| Delete only this checkout's owned temporary fixture | `npm run clean:fixture` |

The normal fixture URL is `http://127.0.0.1:4321/manual/`. `npm run dev` serves the isolated installed copy, not a live workspace link: rerun `npm run test:consumer` after changing package source or the committed fixture. Stop a manually launched server before rebuilding or deleting that fixture.

## Compatibility specimens

Environment variables select a real consumer, not mocked package versions:

```sh
WORKS_ASTRO=7.2.10 WORKS_PROCESSOR=satteri WORKS_BASE=/manual/ npm run test:consumer
WORKS_ASTRO=7.3.3 WORKS_PROCESSOR=satteri WORKS_BASE=/ npm run test:consumer
WORKS_ASTRO=7.3.3 WORKS_PROCESSOR=unified WORKS_BASE=/manual/ npm run test:consumer
```

These examples use POSIX environment assignment. In PowerShell, set `$env:WORKS_ASTRO`, `$env:WORKS_PROCESSOR` and `$env:WORKS_BASE` before the same npm command, and remove them afterwards to restore defaults. `WORKS_STARLIGHT` defaults to `0.42.2`. The fixture records its selected processor/base and the server reuses those recorded values; do not silently serve a different configuration from the one that was built.

## Generated artifacts and safe reset

`packages/starlight-works/dist/` and its local `LICENSE` copy are build output. `artifacts/package/` holds the `.tgz` and npm's pack account. `artifacts/consumer.json` records the temporary fixture path and ownership boundary; the versions report and generated consumer lock identify the exercised dependencies. Browser reports, failure traces and selected screenshots live beneath `artifacts/`.

`npm run clean:fixture` deletes only a direct temporary-directory child with the expected prefix and this checkout's marker. It refuses an unowned path. Rebuilding removes only the package's generated `dist`; a source edit should never be made there. Delete other local `artifacts` output only after keeping the evidence you actually need.

## CI and interpretation

The `Verification` workflow runs on pull requests and the durable `main` push route. It checks the exact PR head, uses read-only repository permissions and pinned Actions, and aggregates all selected specimens into the `Tests` check. A failure in any specimen fails the aggregate. There is no CI writer, automatic integration, publish, tag or deploy step.

Read the current head's terminal result, not a prior green run. Artifact retention is finite; durable conclusions belong in a dated qualification record, and actionable review belongs with the contribution rather than hidden in documentation. A passing browser test is evidence for its exact browser, viewport, route and build—not blanket accessibility, security or cross-browser certification.
