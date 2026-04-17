/**
 * @jest-environment node
 */
const { createMouseAdapter } = require('../lib/mouse-adapter');

function fakeNut() {
  const state = { x: 10, y: 20 };
  return {
    mouse: {
      getPosition: async () => ({ x: state.x, y: state.y }),
      move: async (path) => {
        const last = path[path.length - 1];
        state.x = last.x;
        state.y = last.y;
      },
    },
    straightTo: (point) => [point],
    Point: function Point(x, y) {
      return { x, y };
    },
    _state: state,
  };
}

describe('mouse-adapter', () => {
  test('getPosition returns a sync snapshot after poll', async () => {
    const nut = fakeNut();
    const adapter = createMouseAdapter(nut);
    await adapter.poll();
    expect(adapter.getPosition()).toEqual({ x: 10, y: 20 });
  });

  test('moveBy updates cached position and returns new position', async () => {
    const nut = fakeNut();
    const adapter = createMouseAdapter(nut);
    await adapter.poll();
    const after = await adapter.moveByAsync(5, -3);
    expect(after).toEqual({ x: 15, y: 17 });
    expect(adapter.getPosition()).toEqual({ x: 15, y: 17 });
  });
});
