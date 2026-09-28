import type { HastNode } from '@/links/links.types';

/** Every element in the tree, depth first: `unist-util-visit` for one node type. */
export const walkElements = (node: HastNode, fn: (element: HastNode) => void): void => {
  if (node.type === 'element') fn(node);
  for (const child of node.children ?? []) walkElements(child, fn);
};
