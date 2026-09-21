# Architecture

## Meaning

starlight-works extends Starlight at configuration, parsed-Markdown and Sidebar-rendering boundaries while leaving the documentation host in charge. This document owns the current component relationships, data flow and invariants that cross source files; it does not describe a second framework or service.

## Components

| Component | Responsibility | Integration |
| --- | --- | --- |
| `index.ts` | Validate options and register the selected features | Public Starlight plugin hooks and Astro Markdown processors |
| `sidebar.ts` | Compile linked groups and derive visible group state | Public sidebar configuration and `StarlightRouteData` |
| `Sidebar.astro` | Render the host sidebar and preserve the mobile footer | Starlight's Sidebar override and MobileMenuFooter component |
| `SidebarList.astro` / `SidebarLink.astro` | Recursive native disclosure, real anchors, current state and badges | Public route entries and Badge component |
| `alerts.ts` | Preserve five meanings, optional titles and parsed body content | mdast nodes supplied by the host |
| `styles.css` | Structural layout and theme-aware accents | Starlight variables and documented consumer tokens |

## Category navigation end to end

The consumer passes a sidebar with ordinary native items and extended groups. Compilation recursively removes `defaultOpen` and category destination fields, emits native groups with `collapsed`, and inserts a marked native link for each category. No input object is mutated.

Starlight resolves those items against its content collection. The rendered route data supplies links, badges, labels, translations and `isCurrent`. The Sidebar override lifts each category's marked link out of the visible child list, but leaves the native route data intact. It renders that anchor beside a native disclosure. The disclosure starts open when the group defaults open or any descendant—including its category link—is current.

Anchor activation follows ordinary navigation. Disclosure activation changes only its native `open` state. On the next rendered page, current ancestry and declared defaults apply again. No persistence key, browser storage or client-side state manager exists.

## Alert rendering end to end

Astro owns Markdown/MDX parsing. The plugin registers a blockquote visitor for Satteri or a tree transformer for Unified. Both call the same pure transformation. A supported marker must be the first content of the first paragraph on its own line.

The transform removes the marker, optionally lifts a first standalone bold title, and preserves the remaining parsed children. It adds a visible semantic caption and an `aside` rendering instruction with an uppercase type data attribute, a type-specific class and an accessible label. It does not create an ARIA live alert. Ordinary quotations remain quotations; another plugin and the host still own their unrelated syntax and rendering.

## Data, trust and storage

The package stores no reader data and adds no browser network requests. Its state is configuration and build-time syntax trees. Markdown, MDX, raw HTML, links and configuration remain trusted author inputs under the consumer's host configuration; this plugin is not a sanitizer or untrusted-content execution boundary.

Development commands install dependencies from the registry and create an isolated fixture in the operating system's temporary directory. A checkout-specific ownership marker protects cleanup from deleting another directory. CI uploads only source and qualification artifacts; it has read-only repository permissions and no publishing path.

## Invariants and compromises

Category navigation and disclosure remain separate controls. Current ancestry overrides defaults, while unrelated groups preserve theirs. All five alert meanings remain separately labeled even when a consumer gives them identical colors. A title never erases the alert type. Public package exports must work from the tarball, not just inside this workspace.

Only the Sidebar override is owned when linked navigation is enabled. A competing override is an explicit conflict, not something to silently replace. Satteri and Unified are deliberately supported; another processor must disable alerts. The native disclosure's accessible state is provided by the browser, rather than a static `aria-expanded` attribute that could become false after interaction.
