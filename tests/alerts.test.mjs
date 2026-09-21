import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { alertTypes, resolveAlertLabels, remarkGithubAlerts, transformAlert } from '../packages/starlight-works/dist/alerts.js';

const labels = resolveAlertLabels();
const parse = (text) => unified().use(remarkParse).parse(text);
const render = async (text, custom = labels) => String(await unified().use(remarkParse).use(remarkGithubAlerts, custom).use(remarkRehype).use(rehypeStringify).process(text));

function assertHiddenTitle(html) {
  const titleTag = html.match(/<p\b[^>]*class="slw-alert__title"[^>]*>/)?.[0];
  assert.ok(titleTag);
  assert.match(titleTag, /aria-hidden="true"/);
}

for (const type of alertTypes) {
  test(`${type} retains its own semantic type and accessible visible label`, async () => {
    const html = await render(`> [!${type}]\n> Context.`);
    assert.match(html, new RegExp(`data-slw-alert="${type}"`));
    assert.match(html, new RegExp(`aria-label="${labels[type]}"`));
    assertHiddenTitle(html);
    assert.match(html, new RegExp(`${labels[type]}</p>`));
    assert.match(html, /<p>Context\.<\/p>/);
    assert.doesNotMatch(html, /role="alert"/);
  });
}

test('a first standalone bold title is preserved alongside—not instead of—the semantic label', async () => {
  for (const gap of ['\n> ', '\n>\n> ']) {
    const html = await render(`> [!NOTE]${gap}**In development**\n> Read [the guide](/guide/).`);
    assert.match(html, /aria-label="Note — In development"/);
    assertHiddenTitle(html);
    assert.match(html, /Note — <strong>In development<\/strong>/);
    assert.match(html, /<a href="\/guide\/">the guide<\/a>/);
  }
});

test('inline bold emphasis is not mistaken for an authored title', async () => {
  const html = await render('> [!TIP]\n> **This** is ordinary emphasis.');
  assert.match(html, /aria-label="Tip"/);
  assert.match(html, /<p><strong>This<\/strong> is ordinary emphasis\.<\/p>/);
});

test('rich Markdown, nested quotes and code survive the transformation', async () => {
  const html = await render('> [!IMPORTANT]\n> **Keep the context**\n>\n> - One\n> - Two with `code`\n>\n> ```js\n> const value = 42;\n> ```\n>\n> > A normal nested quote.');
  assert.match(html, /<ul>/);
  assert.match(html, /<code>code<\/code>/);
  assert.match(html, /const value = 42;/);
  assert.match(html, /<blockquote>\n<p>A normal nested quote\.<\/p>\n<\/blockquote>/);
});

test('unsupported markers, inline markers and ordinary quotations keep their original AST', () => {
  for (const source of ['> Ordinary quote.', '> [!UNKNOWN]\n> Text.', '> [!note]\n> Text.', '> [!NOTE] same line', '> **[!NOTE]**\n> Text.', '> Intro\n> [!NOTE]\n> Text.', '> [!NOTE]**not a new line**']) {
    const tree = parse(source);
    const copy = structuredClone(tree);
    remarkGithubAlerts(labels)(tree);
    assert.deepEqual(tree, copy, source);
  }
});

test('converting an alert does not mutate the parser node and is idempotent', () => {
  const original = parse('> [!WARNING]\n> **Careful**\n> Content.').children[0];
  const copy = structuredClone(original);
  const converted = transformAlert(original, labels);
  assert.deepEqual(original, copy);
  assert.equal(transformAlert(converted, labels), undefined);
});

test('empty alerts, hard breaks and nested canonical alerts remain valid', async () => {
  assert.match(await render('> [!CAUTION]'), /aria-label="Caution"/);
  assert.match(await render('> [!NOTE]  \n> Context.'), /<p>Context\.<\/p>/);
  const html = await render('> Ordinary quote\n>\n> > [!TIP]\n> > Nested context.');
  assert.match(html, /<blockquote>/);
  assert.match(html, /data-slw-alert="TIP"/);
});

test('translated labels do not change canonical types; unsafe-looking text is escaped by the renderer', async () => {
  const translated = resolveAlertLabels({ labels: { NOTE: 'Hinweis <test>' } });
  const html = await render('> [!NOTE]\n> **<script>bad</script>**\n> Context.', translated);
  assert.match(html, /data-slw-alert="NOTE"/);
  assert.match(html, /Hinweis &#x3C;test>/);
  assert.doesNotMatch(html, /<script>/);
  for (const bad of [{ labels: { NOTE: '' } }, { labels: { UNKNOWN: 'Unknown' } }, { label: 'Note' }, { labels: [] }, true]) {
    assert.throws(() => resolveAlertLabels(bad), TypeError);
  }
});
