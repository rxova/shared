import { describe, expect, it } from 'vitest';
import { shellSegments } from '@/internal/shell/shell-segments';

describe('shellSegments', () => {
  it('splits on ;, &, |, &&, || and newlines', () => {
    expect(shellSegments('a 1; b 2 && c | d || e & f\ng')).toEqual([
      ['a', '1'],
      ['b', '2'],
      ['c'],
      ['d'],
      ['e'],
      ['f'],
      ['g'],
    ]);
  });

  it('keeps quoted text as one word, separators and all', () => {
    expect(shellSegments(`git commit -m "a; b && --no-verify" -m 'c | d'`)).toEqual([
      ['git', 'commit', '-m', 'a; b && --no-verify', '-m', 'c | d'],
    ]);
  });

  it('unescapes inside double quotes and joins adjacent pieces', () => {
    expect(shellSegments(String.raw`echo "say \"hi\" \$x \\ \n"x'y'`)).toEqual([
      ['echo', String.raw`say "hi" $x \ \nxy`],
    ]);
  });

  it('reads a backslash as an escape, and backslash-newline as a continued line', () => {
    expect(shellSegments('echo a\\ b \\\n c')).toEqual([['echo', 'a b', 'c']]);
  });

  it('keeps an empty quoted word', () => {
    expect(shellSegments(`git commit -m ""`)).toEqual([['git', 'commit', '-m', '']]);
  });

  it('skips heredoc bodies, quoted or not, and <<- with its tabs', () => {
    const command = [
      "git commit -F - <<'EOF'",
      'git push --no-verify',
      'EOF',
      'cat <<-END && ls',
      '\tno; split',
      '\tEND',
      'echo done',
    ].join('\n');
    expect(shellSegments(command)).toEqual([
      ['git', 'commit', '-F', '-'],
      ['cat'],
      ['ls'],
      ['echo', 'done'],
    ]);
  });

  it('reads a delimiter written with quotes or a backslash', () => {
    expect(shellSegments('cat <<"E\\ND"\nbody\nEND\nls')).toEqual([['cat'], ['ls']]);
  });

  it('stops at the end of the text: an unclosed quote or heredoc', () => {
    expect(shellSegments("echo 'open")).toEqual([['echo', 'open']]);
    expect(shellSegments('echo "open')).toEqual([['echo', 'open']]);
    expect(shellSegments('cat <<EOF\nnever closed')).toEqual([['cat']]);
    expect(shellSegments('echo \\')).toEqual([['echo', '']]);
  });

  it('treats <<< as plain text, not a heredoc', () => {
    expect(shellSegments('cat <<< word')).toEqual([['cat', '<<<', 'word']]);
  });

  it('returns nothing for blank input', () => {
    expect(shellSegments('   \n ; ')).toEqual([]);
  });
});
