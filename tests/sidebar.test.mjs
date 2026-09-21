import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileSidebar, groupView, hasCurrent, CATEGORY_MARKER } from '../packages/starlight-works/dist/sidebar.js';

const link = (label, current = false, marker = false) => ({ type: 'link', label, href: `/${label}/`, isCurrent: current, badge: undefined, attrs: marker ? { [CATEGORY_MARKER]: true } : {} });
const group = (label, entries, collapsed = true) => ({ type: 'group', label, entries, collapsed, badge: undefined });

test('linked nested groups compile to ordinary Starlight configuration without mutating their source', () => {
  const source = [{ label: 'Guide', slug: 'guide', defaultOpen: false, translations: { de: 'Handbuch' }, items: [{ label: 'Deep', link: '/deep/', defaultOpen: true, items: ['deep/start'] }] }];
  const original = structuredClone(source);
  const compiled = compileSidebar(source);
  assert.deepEqual(source, original);
  assert.equal(compiled[0].collapsed, true);
  assert.equal(compiled[0].items[0].slug, 'guide');
  assert.equal(compiled[0].items[0].attrs[CATEGORY_MARKER], true);
  assert.deepEqual(compiled[0].items[0].translations, { de: 'Handbuch' });
  assert.equal(compiled[0].items[1].collapsed, false);
  assert.equal(compiled[0].items[1].items[0].link, '/deep/');
});

test('native links, badges, slugs and autogeneration are preserved', () => {
  const items = ['index', { slug: 'api', badge: 'New' }, { label: 'External', link: 'https://example.com', attrs: { target: '_blank' } }, { autogenerate: { directory: 'reference' } }];
  assert.deepEqual(compileSidebar(items), items);
  const [plain] = compileSidebar([{ label: 'Reference', items }]);
  assert.equal(plain.collapsed, false);
  assert.deepEqual(plain.items, items);
});

test('only the marked category is lifted; its real route remains current and in the native sidebar', () => {
  const category = link('guide', true, true);
  const child = link('start');
  const original = group('Guide', [child, category]);
  const view = groupView(original);
  assert.equal(view.category, category);
  assert.deepEqual(view.entries, [child]);
  assert.equal(view.open, true);
  assert.deepEqual(original.entries, [child, category]);
});

test('current descendants open every ancestor while unrelated groups keep their declared defaults', () => {
  const nested = group('Nested', [link('deep', true)]);
  assert.equal(groupView(nested).open, true);
  assert.equal(groupView(group('Parent', [nested])).open, true);
  assert.equal(groupView(group('Unrelated', [link('other')])).open, false);
  assert.equal(groupView(group('Default open', [link('other')], false)).open, true);
  assert.equal(hasCurrent([link('other')]), false);
});

test('configuration failures are actionable rather than silently discarding intent', () => {
  for (const input of [null, {}, [null], [{ label: 'X', items: [], collapsed: false }], [{ label: '', items: [] }], [{ label: 'X', items: [], defaultOpen: 'yes' }], [{ label: 'X', items: [], link: '/x/', slug: 'x' }], [{ label: 'X', items: [], link: '/x/' }], [{ label: 'X', items: ['x'], slug: 2 }]]) {
    assert.throws(() => compileSidebar(input), TypeError);
  }
  const circular = { label: 'Loop', items: [] };
  circular.items.push(circular);
  assert.throws(() => compileSidebar([circular]), /circular/);
});
