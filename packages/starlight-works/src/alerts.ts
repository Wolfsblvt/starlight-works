import type { Blockquote, Root, Paragraph, PhrasingContent, Strong, RootContent } from 'mdast';

export const alertTypes = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'] as const;
export type AlertType = typeof alertTypes[number];
export interface AlertOptions {
  /** Visible semantic labels, for example translations. Canonical data attributes never change. */
  labels?: Partial<Record<AlertType, string>>;
}
export type AlertLabels = Record<AlertType, string>;
const defaults: AlertLabels = { NOTE: 'Note', TIP: 'Tip', IMPORTANT: 'Important', WARNING: 'Warning', CAUTION: 'Caution' };

export function resolveAlertLabels(options: AlertOptions = {}): AlertLabels {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('alerts must be false or an options object.');
  for (const key of Object.keys(options)) {
    if (key !== 'labels') throw new TypeError(`Unknown alerts option: ${key}.`);
  }
  const labels = { ...defaults };
  if (options.labels !== undefined) {
    if (!options.labels || typeof options.labels !== 'object' || Array.isArray(options.labels)) throw new TypeError('alerts.labels must be an object.');
    for (const [type, label] of Object.entries(options.labels)) {
      if (!alertTypes.includes(type as AlertType)) throw new TypeError(`Unknown alert type: ${type}.`);
      if (typeof label !== 'string' || !label.trim()) throw new TypeError(`The ${type} alert label must be non-empty text.`);
      labels[type as AlertType] = label;
    }
  }
  return labels;
}

function plainText(node: PhrasingContent): string {
  // Raw tag syntax is not part of the title a screen reader should announce.
  if (node.type === 'html') return '';
  if ('value' in node) return typeof node.value === 'string' ? node.value : '';
  if ('children' in node) return node.children.map((child) => plainText(child as PhrasingContent)).join('');
  if (node.type === 'image' || node.type === 'imageReference') return node.alt ?? '';
  return '';
}

/** Remove a first standalone bold title, not ordinary bold text at the start of a sentence. */
function takeTitle(children: Blockquote['children']): Strong | undefined {
  const first = children[0];
  if (first?.type !== 'paragraph') return;
  const nodes = [...first.children];
  while (nodes[0]?.type === 'text' && !nodes[0].value.trim()) nodes.shift();
  const title = nodes[0];
  if (title?.type !== 'strong') return;
  const after = nodes[1];
  if (after && after.type !== 'break' && !(after.type === 'text' && /^\r?\n/.test(after.value))) return;
  nodes.shift();
  if (nodes[0]?.type === 'break') nodes.shift();
  else if (nodes[0]?.type === 'text') {
    nodes[0] = { ...nodes[0], value: nodes[0].value.replace(/^\r?\n/, '') };
    if (!nodes[0].value) nodes.shift();
  }
  if (nodes.length) children[0] = { ...first, children: nodes };
  else children.shift();
  return title;
}

/** Transform one parsed blockquote. Undefined means leave the exact original node alone. */
export function transformAlert(node: Readonly<Blockquote>, labels: AlertLabels): Blockquote | undefined {
  const first = node.children[0];
  if (first?.type !== 'paragraph' || first.children[0]?.type !== 'text') return;
  const start = first.children[0];
  const match = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\r?\n|$)/.exec(start.value);
  if (!match) return;
  // Inline continuation after the marker is not canonical GitHub alert syntax.
  const next = first.children[1];
  if (match[0] === start.value && !match[0].endsWith('\n') && next && next.type !== 'break') return;
  const type = match[1] as AlertType;
  const paragraphChildren = [...first.children];
  const remainder = start.value.slice(match[0].length);
  if (remainder) paragraphChildren[0] = { ...start, value: remainder };
  else {
    paragraphChildren.shift();
    if (paragraphChildren[0]?.type === 'break') paragraphChildren.shift();
  }
  const children = [...node.children];
  if (paragraphChildren.length) children[0] = { ...first, children: paragraphChildren };
  else children.shift();
  const title = takeTitle(children);
  const label = labels[type];
  const caption: PhrasingContent[] = [{ type: 'text', value: label }];
  if (title) caption.push({ type: 'text', value: ' — ' }, title);
  const heading: Paragraph = {
    type: 'paragraph',
    data: { hProperties: { className: ['slw-alert__title'] } },
    children: caption,
  };
  return {
    ...node,
    data: {
      ...node.data,
      hName: 'aside',
      hProperties: {
        ...node.data?.hProperties,
        className: ['slw-alert', `slw-alert--${type.toLowerCase()}`],
        'data-slw-alert': type,
        'aria-label': title ? `${label} — ${plainText(title)}` : label,
      },
    },
    children: [heading, ...children],
  };
}

/** The host owns parsing; this walk only recognizes and replaces parsed blockquotes. */
export function remarkGithubAlerts(labels: AlertLabels) {
  return (tree: Root): void => {
    const walk = (parent: { children: RootContent[] }): void => {
      parent.children = parent.children.map((child) => {
        const converted = child.type === 'blockquote' ? transformAlert(child, labels) ?? child : child;
        if ('children' in converted) walk(converted as unknown as { children: RootContent[] });
        return converted;
      });
    };
    walk(tree);
  };
}
