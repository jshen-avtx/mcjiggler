/**
 * @jest-environment node
 */

describe('jest smoke test', () => {
  test('1 + 1 equals 2', () => {
    expect(1 + 1).toBe(2);
  });
});
