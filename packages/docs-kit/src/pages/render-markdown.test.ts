import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '@/pages/render-markdown';

const page = {
  title: 'TEST_SKIPPED_ADDED',
  description: 'A test stopped running.',
  htmlUrl: 'https://rxova.org/rules/test-skipped-added/',
  body: 'Body text.',
};

describe('renderMarkdown', () => {
  it('synthesizes the frontmatter and H1 Starlight keeps out of the body', () => {
    expect(renderMarkdown(page)).toBe(
      [
        '---',
        'title: "TEST_SKIPPED_ADDED"',
        'description: "A test stopped running."',
        'source: https://rxova.org/rules/test-skipped-added/',
        '---',
        '',
        '# TEST_SKIPPED_ADDED',
        '',
        'Body text.',
        '',
      ].join('\n'),
    );
  });

  it('omits an absent or empty description rather than emitting an empty key', () => {
    expect(renderMarkdown({ ...page, description: undefined })).not.toContain('description:');
    expect(renderMarkdown({ ...page, description: '' })).not.toContain('description:');
  });

  it('quotes a title containing a colon', () => {
    expect(renderMarkdown({ ...page, title: 'Grading: how' })).toContain('title: "Grading: how"');
  });
});
