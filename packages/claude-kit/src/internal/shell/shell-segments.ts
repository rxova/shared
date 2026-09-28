/**
 * Splits a shell command into the simple commands it runs, each as its words, with quotes
 * removed. Separators are the unquoted `;`, `&`, `|`, `&&`, `||` and newlines. A heredoc body
 * is skipped rather than read as commands, and `\` joins a continued line.
 *
 * Deliberately small: enough to tell `git commit -m "--no-verify is fine"` from
 * `git commit --no-verify`, not a shell. Command substitutions stay inside their word.
 */
export const shellSegments = (command: string): string[][] => {
  const segments: string[][] = [];
  const heredocs: { delimiter: string; strip: boolean }[] = [];
  let words: string[] = [];
  let word: string | undefined;
  let i = 0;

  const endWord = () => {
    if (word !== undefined) words.push(word);
    word = undefined;
  };
  const endSegment = () => {
    endWord();
    if (words.length > 0) segments.push(words);
    words = [];
  };
  const skipHeredocBodies = () => {
    for (const { delimiter, strip } of heredocs.splice(0)) {
      for (;;) {
        const end = command.indexOf('\n', i);
        const line = command.slice(i, end === -1 ? command.length : end);
        i = end === -1 ? command.length : end + 1;
        if ((strip ? line.replace(/^\t+/, '') : line) === delimiter || end === -1) break;
      }
    }
  };
  const readDelimiter = (): string => {
    while (command[i] === ' ' || command[i] === '\t') i += 1;
    let delimiter = '';
    while (i < command.length && !/[\s;&|<>()]/.test(command.charAt(i))) {
      const char = command.charAt(i);
      if (char !== "'" && char !== '"' && char !== '\\') delimiter += char;
      i += 1;
    }
    return delimiter;
  };

  while (i < command.length) {
    const char = command.charAt(i);
    if (char === "'") {
      const end = command.indexOf("'", i + 1);
      const stop = end === -1 ? command.length : end;
      word = (word ?? '') + command.slice(i + 1, stop);
      i = stop + 1;
    } else if (char === '"') {
      word ??= '';
      i += 1;
      while (i < command.length && command[i] !== '"') {
        if (command[i] === '\\' && '"\\$`'.includes(command.charAt(i + 1))) i += 1;
        word += command.charAt(i);
        i += 1;
      }
      i += 1;
    } else if (char === '\\') {
      if (command[i + 1] !== '\n') word = (word ?? '') + command.charAt(i + 1);
      i += 2;
    } else if (command.startsWith('<<<', i)) {
      word = (word ?? '') + '<<<';
      i += 3;
    } else if (char === '<' && command[i + 1] === '<') {
      endWord();
      i += 2;
      const strip = command[i] === '-';
      if (strip) i += 1;
      heredocs.push({ delimiter: readDelimiter(), strip });
    } else if (char === '\n') {
      endSegment();
      i += 1;
      skipHeredocBodies();
    } else if (char === ';' || char === '&' || char === '|') {
      endSegment();
      i += 1;
    } else if (char === ' ' || char === '\t') {
      endWord();
      i += 1;
    } else {
      word = (word ?? '') + char;
      i += 1;
    }
  }
  endSegment();
  return segments;
};
