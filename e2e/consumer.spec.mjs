import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const byGroup = (page, label) => page.locator(`[data-slw-group="${label}"]`);
const details = (page, label) => byGroup(page, label).locator(':scope > details');
const disclosure = (page, label) => details(page, label).locator(':scope > summary');
const reference = 'Reference with a deliberately long category label';
async function menu(page) {
  if (await page.locator('[data-slw-sidebar]').isVisible()) return;
  await page.getByRole('button', { name: /menu|menü/i }).click();
  await expect(page.locator('[data-slw-sidebar]')).toBeVisible();
}
async function open(page, path = './') { await page.goto(path); await menu(page); }
async function expectOpen(page, label, value) {
  await expect.poll(() => details(page, label).evaluate((element) => element.open)).toBe(value);
}

// Playwright's ARIA-only snapshot does not include Chromium's native DisclosureTriangle.
// Read the actual accessibility node rather than changing production semantics to fit a test.
function accessibilityNode(node) {
  return {
    role: node.role?.value,
    name: node.name?.value,
    properties: Object.fromEntries((node.properties ?? []).map((property) => [property.name, property.value.value])),
  };
}

async function nativeDisclosure(page, label) {
  const session = await page.context().newCDPSession(page);
  try {
    const { root } = await session.send('DOM.getDocument');
    const { nodeId } = await session.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: `[data-slw-group="${label}"] > details > summary`,
    });
    expect(nodeId).not.toBe(0);
    const { nodes } = await session.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
    const node = nodes.find((value) => !value.ignored);
    expect(node).toBeDefined();
    return accessibilityNode(node);
  } finally { await session.detach(); }
}

async function nativeAccessibilitySubtree(page, selector) {
  const session = await page.context().newCDPSession(page);
  try {
    const { root } = await session.send('DOM.getDocument');
    const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    expect(nodeId).not.toBe(0);
    const { node } = await session.send('DOM.describeNode', { nodeId });
    const { nodes } = await session.send('Accessibility.getFullAXTree');
    const byId = new Map(nodes.map((value) => [value.nodeId, value]));
    const target = nodes.find((value) => !value.ignored && value.backendDOMNodeId === node.backendNodeId);
    expect(target).toBeDefined();
    const result = [];
    const visit = (id) => {
      const current = byId.get(id);
      if (!current) return;
      if (!current.ignored) result.push(accessibilityNode(current));
      for (const childId of current.childIds ?? []) visit(childId);
    };
    visit(target.nodeId);
    return result;
  } finally { await session.detach(); }
}

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (error) => { throw error; });
});

test('first-render defaults, independent toggles and native link attributes', async ({ page }) => {
  await open(page);
  await expectOpen(page, 'Guide', true);
  await expectOpen(page, 'Advanced', false);
  await expectOpen(page, reference, false);
  const initial = page.url();
  await disclosure(page, reference).click();
  await expectOpen(page, reference, true);
  await expectOpen(page, 'Guide', true);
  expect(page.url()).toBe(initial);
  await disclosure(page, 'Guide').click();
  await expectOpen(page, 'Guide', false);
  await expect(byGroup(page, 'Guide').locator(':scope > .slw-group-heading a')).toBeVisible();
  await expect(page.locator('[data-fixture-external]')).toHaveAttribute('target', '_blank');
  await expect(page.locator('[data-slw-sidebar]').getByRole('link', { name: 'Generated example' })).toBeVisible();
});

test('category navigation opens its own group and retains native current-page state', async ({ page }) => {
  await open(page);
  await disclosure(page, 'Guide').click();
  await byGroup(page, 'Guide').locator(':scope > .slw-group-heading a').click();
  await expect(page).toHaveURL(/\/guide\/$/);
  await menu(page);
  await expectOpen(page, 'Guide', true);
  await expect(byGroup(page, 'Guide').locator(':scope > .slw-group-heading a')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('[data-slw-sidebar] [aria-current="page"]')).toHaveCount(1);
});

test('deep current routes override closed defaults without opening unrelated groups', async ({ page }) => {
  await open(page, './guide/advanced/deep/');
  await expectOpen(page, 'Guide', true);
  await expectOpen(page, 'Advanced', true);
  await expectOpen(page, reference, false);
  await expect(page.locator('[data-slw-sidebar]').getByRole('link', { name: 'Deep page', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('keyboard disclosure and link focus are distinct, with a native expanded state', async ({ page }, testInfo) => {
  await open(page);
  const link = byGroup(page, 'Guide').locator(':scope > .slw-group-heading a');
  await link.focus();
  await page.keyboard.press('Tab');
  await expect(disclosure(page, 'Guide')).toBeFocused();
  const initial = page.url();
  await page.keyboard.press('Space');
  await expectOpen(page, 'Guide', false);
  const collapsed = await nativeDisclosure(page, 'Guide');
  expect(collapsed).toMatchObject({ role: 'DisclosureTriangle', name: 'Guide', properties: { expanded: false, focusable: true } });
  await page.keyboard.press('Enter');
  await expectOpen(page, 'Guide', true);
  const expanded = await nativeDisclosure(page, 'Guide');
  expect(expanded).toMatchObject({ role: 'DisclosureTriangle', name: 'Guide', properties: { expanded: true, focusable: true, controls: 'slw-1-children' } });
  expect(page.url()).toBe(initial);
  await testInfo.attach('native-disclosure-accessibility', { body: JSON.stringify({ collapsed, expanded }, null, 2), contentType: 'application/json' });
});

test('translated route data names linked disclosures without an English action word', async ({ page }, testInfo) => {
  await open(page, './de/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expectOpen(page, 'Handbuch', true);
  await expect(byGroup(page, 'Handbuch').locator(':scope > .slw-group-heading a')).toHaveText('Handbuch');
  const disclosureNode = await nativeDisclosure(page, 'Handbuch');
  expect(disclosureNode).toMatchObject({
    role: 'DisclosureTriangle',
    name: 'Handbuch',
    properties: { expanded: true, focusable: true },
  });
  await testInfo.attach('translated-disclosure-accessibility', {
    body: JSON.stringify(disclosureNode, null, 2),
    contentType: 'application/json',
  });
});

test('five alert types retain labels, authored titles and rich Markdown beside normal quotes', async ({ page }) => {
  await page.goto('./');
  for (const type of ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION']) {
    const alert = page.locator(`aside[data-slw-alert="${type}"]`);
    await expect(alert).toHaveCount(1);
    await expect(alert).toHaveAttribute('class', new RegExp(`slw-alert--${type.toLowerCase()}`));
    await expect(alert.locator('.slw-alert__title')).toContainText(type[0] + type.slice(1).toLowerCase());
    await expect(alert.locator('.slw-alert__title')).toHaveAttribute('aria-hidden', 'true');
  }
  const note = page.locator('[data-slw-alert="NOTE"]');
  await expect(note).toHaveAttribute('aria-label', 'Note — In development');
  await expect(note.getByRole('link', { name: 'guide' })).toHaveCount(1);
  const radiusRatio = await note.evaluate((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius) / parseFloat(getComputedStyle(document.documentElement).fontSize));
  expect(radiusRatio).toBe(0.5);
  const tip = page.locator('[data-slw-alert="TIP"]');
  await expect(tip.locator('li')).toHaveCount(2);
  await expect(tip.locator('pre')).toContainText("const meaning = 'TIP';");
  await expect(page.locator('blockquote').filter({ hasText: 'This is an ordinary quotation.' })).toHaveCount(1);
  await expect(page.locator('blockquote').filter({ hasText: '[!UNKNOWN]' })).toHaveCount(1);
  await expect(page.locator('.starlight-aside')).toContainText('The native Starlight aside still works');
  await expect(page.locator('[data-slw-alert][role="alert"]')).toHaveCount(0);
});

test('alert captions name landmarks once without duplicate accessible text', async ({ page }, testInfo) => {
  await page.goto('./');
  const evidence = {};
  for (const specimen of [
    { type: 'NOTE', name: 'Note — In development', hiddenFragments: ['Note', 'In development'] },
    { type: 'CAUTION', name: 'Caution', hiddenFragments: ['Caution'] },
  ]) {
    const tree = await nativeAccessibilitySubtree(page, `[data-slw-alert="${specimen.type}"]`);
    expect(tree[0]).toMatchObject({ role: 'complementary', name: specimen.name });
    const descendants = tree.slice(1).map((node) => node.name).filter(Boolean);
    for (const fragment of specimen.hiddenFragments) {
      expect(descendants.some((name) => name.includes(fragment))).toBe(false);
    }
    evidence[specimen.type] = tree;
  }
  await testInfo.attach('alert-accessibility-subtrees', {
    body: JSON.stringify(evidence, null, 2),
    contentType: 'application/json',
  });
});

test('MDX alerts keep the fifth meaning and embedded elements', async ({ page }) => {
  await page.goto('./guide/start/');
  const alert = page.locator('[data-slw-alert="IMPORTANT"]');
  await expect(alert).toHaveAttribute('aria-label', 'Important — MDX keeps its meaning');
  await expect(alert.locator('[data-mdx-proof="true"]')).toHaveText('an MDX element');
});

test('wrapped labels do not overlap disclosures or overflow the sidebar in either theme', async ({ page }, testInfo) => {
  await open(page);
  await disclosure(page, reference).click();
  const link = byGroup(page, reference).locator(':scope > .slw-group-heading a');
  const toggle = disclosure(page, reference);
  const linkBox = await link.boundingBox();
  const toggleBox = await toggle.boundingBox();
  expect(linkBox.x + linkBox.width).toBeLessThanOrEqual(toggleBox.x + 1);
  expect(toggleBox.width).toBeGreaterThanOrEqual(40);
  expect(toggleBox.height).toBeGreaterThanOrEqual(40);
  const overflow = await page.locator('[data-slw-sidebar]').evaluate((element) => element.scrollWidth > element.clientWidth + 1);
  expect(overflow).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  const theme = page.locator('starlight-theme-select select').filter({ visible: true }).first();
  const mobile = testInfo.project.name === 'mobile';
  await mkdir('artifacts/screenshots', { recursive: true });
  for (const value of ['light', 'dark']) {
    await theme.selectOption(value);
    await expect(page.locator('html')).toHaveAttribute('data-theme', value);
    await page.screenshot({ path: `artifacts/screenshots/${testInfo.project.name}-${value}.png`, fullPage: !mobile });
    if (mobile) {
      await page.getByRole('button', { name: /menu|menü/i }).click();
      await expect(page.locator('[data-slw-sidebar]')).not.toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
      await page.screenshot({ path: `artifacts/screenshots/mobile-content-${value}.png`, fullPage: true });
      await menu(page);
    }
  }
});

test('server-rendered navigation and disclosures work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  try {
    const page = await context.newPage();
    await page.goto(baseURL);
    await expectOpen(page, 'Guide', true);
    await disclosure(page, 'Guide').click();
    await expectOpen(page, 'Guide', false);
    await byGroup(page, 'Guide').locator(':scope > .slw-group-heading a').click();
    await expectOpen(page, 'Guide', true);
    await expect(page.locator('[data-slw-alert]')).toHaveCount(0);
  } finally { await context.close(); }
});
