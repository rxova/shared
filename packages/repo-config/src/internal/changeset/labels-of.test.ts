import { describe, expect, it } from 'vitest';
import { labelsOf } from '@/internal/changeset/labels-of';

describe('labelsOf', () => {
  it('reads the comma-separated list the workflow hands over', () => {
    expect(labelsOf('dependencies,skip-changeset')).toEqual(['dependencies', 'skip-changeset']);
  });

  it('tolerates spacing, and an unlabelled pull request', () => {
    expect(labelsOf(' dependencies , skip-changeset ')).toEqual(['dependencies', 'skip-changeset']);
    expect(labelsOf('')).toEqual([]);
    expect(labelsOf(undefined)).toEqual([]);
  });
});
