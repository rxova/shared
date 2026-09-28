/**
 * A `package.json#files` entry as an anchored regular expression over a path
 * inside the package: `**` crosses directories, `*` and `?` stay within one,
 * `{a,b}` picks either. A leading `./` or `/` and a trailing `/` are dropped,
 * the way npm reads them.
 */
export const globRegExp = (pattern: string): RegExp => {
  const glob = pattern.replace(/^\.?\/+/, '').replace(/\/+$/, '');
  let source = '';
  for (let at = 0; at < glob.length; at += 1) {
    const char = glob.charAt(at);
    if (glob.startsWith('**/', at)) {
      source += '(?:.*/)?';
      at += 2;
    } else if (glob.startsWith('**', at)) {
      source += '.*';
      at += 1;
    } else if (char === '*') source += '[^/]*';
    else if (char === '?') source += '[^/]';
    else if (char === '{') source += '(?:';
    else if (char === '}') source += ')';
    else if (char === ',') source += '|';
    else source += char.replace(/[.+^$()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${source}$`);
};
