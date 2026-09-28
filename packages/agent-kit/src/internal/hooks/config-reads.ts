// `git config` options that only read, so naming core.hooksPath with them changes nothing.
export const CONFIG_READS = new Set(['--get', '--get-all', '--get-regexp', '--list', '-l']);
