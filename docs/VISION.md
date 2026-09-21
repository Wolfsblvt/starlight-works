# Product vision

## Meaning

starlight-works makes two useful documentation behaviors reusable without making every consumer maintain a Starlight fork or adopt another product's design. This vision preserves the selected product destination: categories that are both navigable pages and independently collapsible groups, and GitHub-readable alerts whose five distinct meanings survive publication. It describes the product horizon, not a release or acceptance claim.

Status: Provisional implementation framing of the selected product.

## A small package with a complete experience

A documentation author should express the hierarchy they mean: a category has a useful landing page, a label, a default open state and children. Readers should never have to guess whether clicking a label will navigate or expand. The category link and its adjacent disclosure are separate controls; the current route reveals its ancestry. Long labels, nested sections, narrow screens and keyboard use are ordinary cases rather than exceptions delegated to each consumer.

An author should also be able to write a note, tip, important point, warning or caution in familiar GitHub Markdown. The renderer keeps the distinction, preserves an authored title and rich body, and communicates meaning in text as well as styling. A title such as “In development” enriches a Note; it does not erase its semantic type.

## Product character

The package is small, typed, understandable and product-neutral. It extends public Starlight contracts and lets Starlight remain responsible for routes, current-page data, the mobile shell, search, theme controls and ordinary documentation behavior. Its consumer installs a real package, not a shared source checkout requiring knowledge of another repository.

Styling is structural and replaceable through clear hooks. Product typography, branding, content strategy, page taxonomies, business concepts and domain choices belong to the consuming site. Reliability comes from exercising the actual artifact in a real Starlight consumer, not from claiming that a utility function test proves the browser experience.

## What this product is not

It is not a documentation framework, complete theme, route registry, publishing platform or sanitizer. It does not accumulate unrelated site features merely because it is already a plugin. Future changes should deepen or preserve the selected experience rather than turn this tiny integration boundary into a portfolio-wide abstraction layer.
