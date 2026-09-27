import { describe, expect, it } from 'vitest';
import { captureCommand } from '@rxova-helpers/pack-smoke/capture-command';

describe('captureCommand', () => {
  it('runs a command and returns its output', () => {
    expect(
      captureCommand(process.execPath, ['-e', 'process.stdout.write("hi")'], process.cwd()),
    ).toBe('hi');
  });
});
