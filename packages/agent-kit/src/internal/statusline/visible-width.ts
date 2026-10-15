/**
 * How many terminal cells `text` takes once colour codes (`ESC [ … m`) and hyperlink wrappers
 * (`ESC ] … BEL` or `ESC ] … ESC \\`) are removed, counting each grapheme as one cell.
 */
export const visibleWidth = (text: string): number => {
  const ESC = "\u001b";
  const BEL = "\u0007";
  let plain = "";
  let index = 0;
  while (index < text.length) {
    if (text[index] === ESC && text[index + 1] === "[") {
      const end = text.indexOf("m", index);
      index = end === -1 ? text.length : end + 1;
    } else if (text[index] === ESC && text[index + 1] === "]") {
      const bell = text.indexOf(BEL, index);
      const st = text.indexOf(`${ESC}\\`, index + 2);
      const ends = [bell === -1 ? Infinity : bell + 1, st === -1 ? Infinity : st + 2];
      index = Math.min(text.length, ...ends);
    } else {
      plain += text.charAt(index);
      index += 1;
    }
  }
  return [...new Intl.Segmenter().segment(plain)].length;
};
