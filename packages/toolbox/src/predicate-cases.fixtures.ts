class Point {
  x = 1;
}

/** What each of the three predicates answers for one kind of value. */
export const PREDICATE_CASES: [
  label: string,
  value: unknown,
  objectLike: boolean,
  record: boolean,
  plain: boolean,
][] = [
  ['null', null, false, false, false],
  ['undefined', undefined, false, false, false],
  ['a string', 'text', false, false, false],
  ['a number', 1, false, false, false],
  ['a function', () => 1, false, false, false],
  ['an array', [1], true, false, false],
  ['a class instance', new Point(), true, true, false],
  ['a Date', new Date(0), true, true, false],
  ['a Map', new Map(), true, true, false],
  ['an object literal', { a: 1 }, true, true, true],
  ['a JSON.parse result', JSON.parse('{"a":1}'), true, true, true],
  ['a null-prototype bag', Object.create(null), true, true, true],
];
