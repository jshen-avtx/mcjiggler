/**
 * @jest-environment node
 */
const { createJiggler } = require('../lib/jiggler');

function makeFakeClock() {
  let now = 0;
  const timers = [];
  return {
    now: () => now,
    setTimeout: (fn, ms) => {
      const id = timers.length;
      timers.push({ id, fireAt: now + ms, fn, cancelled: false });
      return id;
    },
    clearTimeout: (id) => {
      if (timers[id]) timers[id].cancelled = true;
    },
    tick: (ms) => {
      now += ms;
      timers
        .filter((t) => !t.cancelled && t.fireAt <= now)
        .forEach((t) => {
          t.cancelled = true;
          t.fn();
        });
    },
  };
}

function makeFakeMouse(start = { x: 500, y: 500 }) {
  const state = { pos: { ...start }, calls: [] };
  return {
    getPosition: () => ({ ...state.pos }),
    moveBy: (dx, dy) => {
      state.pos.x += dx;
      state.pos.y += dy;
      state.calls.push({ dx, dy });
      return { ...state.pos };
    },
    _state: state,
  };
}

describe('createJiggler start/stop', () => {
  test('starts disabled and reports status', () => {
    const clock = makeFakeClock();
    const mouse = makeFakeMouse();
    const j = createJiggler({
      clock,
      mouse,
      settings: { intervalSeconds: 1, movementPixels: 2 },
    });
    expect(j.isRunning()).toBe(false);
  });

  test('start() schedules a tick and isRunning becomes true', () => {
    const clock = makeFakeClock();
    const mouse = makeFakeMouse();
    const j = createJiggler({
      clock,
      mouse,
      settings: { intervalSeconds: 1, movementPixels: 2 },
    });
    j.start();
    expect(j.isRunning()).toBe(true);
    expect(mouse._state.calls.length).toBe(0);
    clock.tick(1000);
    expect(mouse._state.calls.length).toBe(1);
  });

  test('stop() cancels future ticks', () => {
    const clock = makeFakeClock();
    const mouse = makeFakeMouse();
    const j = createJiggler({
      clock,
      mouse,
      settings: { intervalSeconds: 1, movementPixels: 2 },
    });
    j.start();
    j.stop();
    clock.tick(5000);
    expect(mouse._state.calls.length).toBe(0);
    expect(j.isRunning()).toBe(false);
  });
});

describe('jiggler movement', () => {
  test('alternates direction on each tick', () => {
    const clock = makeFakeClock();
    const mouse = makeFakeMouse();
    const j = createJiggler({
      clock,
      mouse,
      settings: { intervalSeconds: 1, movementPixels: 3 },
    });
    j.start();
    clock.tick(1000);
    clock.tick(1000);
    clock.tick(1000);
    expect(mouse._state.calls).toEqual([
      { dx: 3, dy: 0 },
      { dx: -3, dy: 0 },
      { dx: 3, dy: 0 },
    ]);
  });

  test('updateSettings re-schedules with the new interval', () => {
    const clock = makeFakeClock();
    const mouse = makeFakeMouse();
    const j = createJiggler({
      clock,
      mouse,
      settings: { intervalSeconds: 10, movementPixels: 2 },
    });
    j.start();
    clock.tick(5000);
    expect(mouse._state.calls.length).toBe(0);
    j.updateSettings({ intervalSeconds: 1, movementPixels: 2 });
    clock.tick(1000);
    expect(mouse._state.calls.length).toBe(1);
  });
});

describe('auto-stop on user input', () => {
  test('stops and fires onUserInput when mouse is moved externally', () => {
    const clock = makeFakeClock();
    const mouse = makeFakeMouse();
    const events = [];
    const j = createJiggler({
      clock,
      mouse,
      settings: {
        intervalSeconds: 1,
        movementPixels: 2,
        pauseOnUserInput: true,
      },
      onUserInput: () => events.push('user'),
    });
    j.start();
    clock.tick(1000); // first tick moves jiggler
    // simulate user yanking the mouse well beyond tolerance
    mouse._state.pos = { x: 9999, y: 9999 };
    clock.tick(1000);
    expect(j.isRunning()).toBe(false);
    expect(events).toEqual(['user']);
  });

  test('does not stop when pauseOnUserInput is false', () => {
    const clock = makeFakeClock();
    const mouse = makeFakeMouse();
    const j = createJiggler({
      clock,
      mouse,
      settings: {
        intervalSeconds: 1,
        movementPixels: 2,
        pauseOnUserInput: false,
      },
    });
    j.start();
    clock.tick(1000);
    mouse._state.pos = { x: 9999, y: 9999 };
    clock.tick(1000);
    expect(j.isRunning()).toBe(true);
  });
});
