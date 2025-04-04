import { deepStrictEqual, throws } from 'node:assert';
import { should } from 'micro-should';
import * as btc from '../esm/index.js';

should('Packed CompactSize', () => {
  const CASES = [
    [20n, 1, [0x14]],
    [32n, 1, [0x20]],
    [200n, 1, [0xc8]],
    [252n, 1, [0xfc]],
    [253n, 3, [0xfd, 0xfd, 0x00]],
    [40000n, 3, [0xfd, 0x40, 0x9c]],
    [65535n, 3, [0xfd, 0xff, 0xff]],
    [65536n, 5, [0xfe, 0x00, 0x00, 0x01, 0x00]],
    [2000000000n, 5, [0xfe, 0x00, 0x94, 0x35, 0x77]],
    [2000000000n, 5, [0xfe, 0x00, 0x94, 0x35, 0x77]],
    [4294967295n, 5, [0xfe, 0xff, 0xff, 0xff, 0xff]],
    [4294967296n, 9, [0xff, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]],
    [500000000000000000n, 9, [0xff, 0x00, 0x00, 0xb2, 0xd3, 0x59, 0x5b, 0xf0, 0x06]],
    [18446744073709551615n, 9, [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]],
  ];
  for (const [num, sz, arr] of CASES) {
    const bytes = Uint8Array.from(arr);
    const p = btc.CompactSize.encode(num);
    deepStrictEqual(p.length, sz);
    const unpacked = btc.CompactSize.decode(bytes);
    deepStrictEqual(unpacked, num);
    deepStrictEqual(unpacked, btc.CompactSize.decode(p));
  }
  throws(() => CompactSize.decode([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]));
});

should('cmp', () => {
  // From python
  const CASES = [
    [[0], [0], 0],
    [[0], [1], -1],
    [[1], [0], 1],
    [[0, 1], [0, 1], 0],
    [[0, 1], [0, 2], -1],
    [[0, 2], [0, 1], 1],
    [[0, 1], [0], 1],
    [[0], [0, 1], -1],
    [[1, 2, 3], [4, 5, 6], -1],
  ];
  for (let [l, r, ret] of CASES)
    deepStrictEqual(
      btc.utils.compareBytes(new Uint8Array(l), new Uint8Array(r)),
      ret,
      `l=${l} r=${r} ret=${ret}`
    );
});

should('cmpBig', () => {
  const CASES = [
    [0n, 0n, 0],
    [0n, 1n, -1],
    [1n, 0n, 1],
  ];
  for (let [l, r, ret] of CASES)
    deepStrictEqual(btc._cmpBig(l, r), ret, `l=${l} r=${r} ret=${ret}`);
});

should('combinations', () => {
  // Looks ok, but still have a feeling like there is off by one bug lying around.
  // 2 elms
  deepStrictEqual(btc.combinations(1, ['A', 'B']), [['A'], ['B']]);
  deepStrictEqual(btc.combinations(2, ['A', 'B']), [['A', 'B']]);
  throws(() => btc.combinations(3, ['A', 'B']));
  // 3 elms
  deepStrictEqual(btc.combinations(1, ['A', 'B', 'C']), [['A'], ['B'], ['C']]);
  deepStrictEqual(btc.combinations(2, ['A', 'B', 'C']), [
    ['A', 'B'],
    ['A', 'C'],
    ['B', 'C'],
  ]);
  deepStrictEqual(btc.combinations(3, ['A', 'B', 'C']), [['A', 'B', 'C']]);
  throws(() => btc.combinations(4, ['A', 'B', 'C']));
  // 4 elms
  deepStrictEqual(btc.combinations(1, ['A', 'B', 'C', 'D']), [['A'], ['B'], ['C'], ['D']]);
  deepStrictEqual(btc.combinations(2, ['A', 'B', 'C', 'D']), [
    ['A', 'B'],
    ['A', 'C'],
    ['A', 'D'],
    ['B', 'C'],
    ['B', 'D'],
    ['C', 'D'],
  ]);
  deepStrictEqual(btc.combinations(3, ['A', 'B', 'C', 'D']), [
    ['A', 'B', 'C'],
    ['A', 'B', 'D'],
    ['A', 'C', 'D'],
    ['B', 'C', 'D'],
  ]);
  deepStrictEqual(btc.combinations(4, ['A', 'B', 'C', 'D']), [['A', 'B', 'C', 'D']]);
  throws(() => btc.combinations(5, ['A', 'B', 'C', 'D']));
  // 5 elms
  deepStrictEqual(btc.combinations(1, ['A', 'B', 'C', 'D', 'E']), [
    ['A'],
    ['B'],
    ['C'],
    ['D'],
    ['E'],
  ]);
  deepStrictEqual(btc.combinations(2, ['A', 'B', 'C', 'D', 'E']), [
    ['A', 'B'],
    ['A', 'C'],
    ['A', 'D'],
    ['A', 'E'],
    ['B', 'C'],
    ['B', 'D'],
    ['B', 'E'],
    ['C', 'D'],
    ['C', 'E'],
    ['D', 'E'],
  ]);
  deepStrictEqual(btc.combinations(3, ['A', 'B', 'C', 'D', 'E']), [
    ['A', 'B', 'C'],
    ['A', 'B', 'D'],
    ['A', 'B', 'E'],
    ['A', 'C', 'D'],
    ['A', 'C', 'E'],
    ['A', 'D', 'E'],
    ['B', 'C', 'D'],
    ['B', 'C', 'E'],
    ['B', 'D', 'E'],
    ['C', 'D', 'E'],
  ]);
  deepStrictEqual(btc.combinations(4, ['A', 'B', 'C', 'D', 'E']), [
    ['A', 'B', 'C', 'D'],
    ['A', 'B', 'C', 'E'],
    ['A', 'B', 'D', 'E'],
    ['A', 'C', 'D', 'E'],
    ['B', 'C', 'D', 'E'],
  ]);
  deepStrictEqual(btc.combinations(5, ['A', 'B', 'C', 'D', 'E']), [['A', 'B', 'C', 'D', 'E']]);
  throws(() => btc.combinations(6, ['A', 'B', 'C', 'D', 'E']));
  // 6 elms
  deepStrictEqual(btc.combinations(1, ['A', 'B', 'C', 'D', 'E', 'F']), [
    ['A'],
    ['B'],
    ['C'],
    ['D'],
    ['E'],
    ['F'],
  ]);
  deepStrictEqual(btc.combinations(2, ['A', 'B', 'C', 'D', 'E', 'F']), [
    ['A', 'B'],
    ['A', 'C'],
    ['A', 'D'],
    ['A', 'E'],
    ['A', 'F'],
    ['B', 'C'],
    ['B', 'D'],
    ['B', 'E'],
    ['B', 'F'],
    ['C', 'D'],
    ['C', 'E'],
    ['C', 'F'],
    ['D', 'E'],
    ['D', 'F'],
    ['E', 'F'],
  ]);
  deepStrictEqual(btc.combinations(3, ['A', 'B', 'C', 'D', 'E', 'F']), [
    ['A', 'B', 'C'],
    ['A', 'B', 'D'],
    ['A', 'B', 'E'],
    ['A', 'B', 'F'],
    ['A', 'C', 'D'],
    ['A', 'C', 'E'],
    ['A', 'C', 'F'],
    ['A', 'D', 'E'],
    ['A', 'D', 'F'],
    ['A', 'E', 'F'],
    ['B', 'C', 'D'],
    ['B', 'C', 'E'],
    ['B', 'C', 'F'],
    ['B', 'D', 'E'],
    ['B', 'D', 'F'],
    ['B', 'E', 'F'],
    ['C', 'D', 'E'],
    ['C', 'D', 'F'],
    ['C', 'E', 'F'],
    ['D', 'E', 'F'],
  ]);
  deepStrictEqual(btc.combinations(4, ['A', 'B', 'C', 'D', 'E', 'F']), [
    ['A', 'B', 'C', 'D'],
    ['A', 'B', 'C', 'E'],
    ['A', 'B', 'C', 'F'],
    ['A', 'B', 'D', 'E'],
    ['A', 'B', 'D', 'F'],
    ['A', 'B', 'E', 'F'],
    ['A', 'C', 'D', 'E'],
    ['A', 'C', 'D', 'F'],
    ['A', 'C', 'E', 'F'],
    ['A', 'D', 'E', 'F'],
    ['B', 'C', 'D', 'E'],
    ['B', 'C', 'D', 'F'],
    ['B', 'C', 'E', 'F'],
    ['B', 'D', 'E', 'F'],
    ['C', 'D', 'E', 'F'],
  ]);
  deepStrictEqual(btc.combinations(5, ['A', 'B', 'C', 'D', 'E', 'F']), [
    ['A', 'B', 'C', 'D', 'E'],
    ['A', 'B', 'C', 'D', 'F'],
    ['A', 'B', 'C', 'E', 'F'],
    ['A', 'B', 'D', 'E', 'F'],
    ['A', 'C', 'D', 'E', 'F'],
    ['B', 'C', 'D', 'E', 'F'],
  ]);
  deepStrictEqual(btc.combinations(6, ['A', 'B', 'C', 'D', 'E', 'F']), [
    ['A', 'B', 'C', 'D', 'E', 'F'],
  ]);
  throws(() => btc.combinations(7, ['A', 'B', 'C', 'D', 'E', 'F']));
  // NOTE: it is exponential
  const cases = [
    [10, 210],
    [20, 38760],
    [30, 593775],
    // [40, 3838380], // too slow
  ];
  for (const [length, combLen] of cases) {
    deepStrictEqual(
      btc.combinations(
        6,
        Array.from({ length }, (_, i) => i)
      ).length,
      combLen
    );
  }
});

should.runWhen(import.meta.url);
