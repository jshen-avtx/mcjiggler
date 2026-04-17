// The jiggler expects a synchronous `moveBy(dx, dy) -> pos`. `nut-js` is async,
// so main.js polls via `poll()` before each tick, then wraps `moveByAsync` in a
// synchronous shim that returns the optimistically-updated cached position.
'use strict';

function createMouseAdapter(nut) {
  let cached = { x: 0, y: 0 };

  async function poll() {
    const pos = await nut.mouse.getPosition();
    cached = { x: pos.x, y: pos.y };
    return { ...cached };
  }

  function getPosition() {
    return { ...cached };
  }

  async function moveByAsync(dx, dy) {
    const target = { x: cached.x + dx, y: cached.y + dy };
    await nut.mouse.move(nut.straightTo(new nut.Point(target.x, target.y)));
    cached = target;
    return { ...cached };
  }

  return { poll, getPosition, moveByAsync };
}

module.exports = { createMouseAdapter };
