import { describe, expect, it } from 'vitest';
import { componentRules } from '@/internal/markdown/component-rules';
import { unwrapComponents } from '@/internal/markdown/unwrap-components';

const rules = componentRules();

describe('unwrapComponents', () => {
  it('turns labelled tabs into headings and drops the wrappers', () => {
    const doc = [
      '<Tabs>',
      '  <TabItem label="npm">',
      'npm i x',
      '  </TabItem>',
      '</Tabs>',
      '<Card title="Fast" icon="star">',
      'body',
      '</Card>',
    ].join('\n');
    expect(unwrapComponents(doc, rules)).toBe(
      ['', '#### npm\n', 'npm i x', '', '', '### Fast\n', 'body', ''].join('\n'),
    );
  });

  it('removes an unlabelled heading component rather than inventing a title', () => {
    expect(unwrapComponents('<TabItem>\nx\n</TabItem>', rules)).toBe('\nx\n');
  });

  it('leaves inline tags and unknown components alone', () => {
    const doc = 'Use <Card> inline.\n<Custom>\n</Custom>';
    expect(unwrapComponents(doc, rules)).toBe(doc);
  });

  it('does nothing to unwrap when the list is empty', () => {
    expect(unwrapComponents('<Tabs>', { unwrap: [], headings: {} })).toBe('<Tabs>');
  });
});
