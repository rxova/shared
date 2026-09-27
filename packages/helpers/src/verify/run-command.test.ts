import { describe, expect, it } from 'vitest';
import { runCommand } from '@rxova-helpers/verify/run-command';

describe('runCommand', () => {
  it('runs a command', () => {
    expect(() => {
      runCommand(`"${process.execPath}" -e "0"`);
    }).not.toThrow();
  });

  it('throws when the command fails, which is what the gate catches', () => {
    expect(() => {
      runCommand(`"${process.execPath}" -e "process.exit(3)"`);
    }).toThrow();
  });
});
