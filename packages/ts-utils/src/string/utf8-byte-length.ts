/**
 * How many bytes `text` takes as UTF-8: what `new TextEncoder().encode(text)
 * .byteLength` answers, without allocating the encoded copy, so a size limit can
 * be checked on a large body before anything else is done with it. A surrogate
 * pair is one code point of 4 bytes; a lone surrogate counts 3, the size of the
 * U+FFFD it is encoded as.
 */
export const utf8ByteLength = (text: string): number => {
  let bytes = 0;
  for (let index = 0; index < text.length; index += 1) {
    const unit = text.charCodeAt(index);
    if (unit < 0x80) bytes += 1;
    else if (unit < 0x800) bytes += 2;
    else if (unit < 0xd800 || unit >= 0xdc00) bytes += 3;
    else {
      // A high surrogate: 4 bytes with the low one after it, else a lone one.
      const next = text.charCodeAt(index + 1);
      if (next >= 0xdc00 && next < 0xe000) {
        bytes += 4;
        index += 1;
      } else bytes += 3;
    }
  }
  return bytes;
};
