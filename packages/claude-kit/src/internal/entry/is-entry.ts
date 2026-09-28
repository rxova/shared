import { pathToFileURL } from 'node:url';
import { resolveLink } from '@/internal/entry/resolve-link';

/**
 * Whether the module at `moduleUrl` is the script Node was started with. A bin reached through
 * `node_modules/.bin` is a symlink, so the started path is resolved before comparing, and both
 * sides are compared as file URLs.
 */
export const isEntry = (
  moduleUrl: string,
  started: string | undefined = process.argv[1],
): boolean =>
  started !== undefined && started !== '' && pathToFileURL(resolveLink(started)).href === moduleUrl;
