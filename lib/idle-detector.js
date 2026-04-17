'use strict';

function createIdleDetector(opts) {
  const toleranceSquared =
    opts && typeof opts.toleranceSquared === 'number'
      ? opts.toleranceSquared
      : 4;

  let expected = null;
  let jiggleOccurred = false;

  function observe(pos) {
    if (expected === null) {
      expected = { x: pos.x, y: pos.y };
      return false;
    }
    const dx = pos.x - expected.x;
    const dy = pos.y - expected.y;
    const distSq = dx * dx + dy * dy;
    const moved = distSq > 0;
    const userMoved = jiggleOccurred ? distSq > toleranceSquared : moved;
    expected = { x: pos.x, y: pos.y };
    jiggleOccurred = false;
    return userMoved;
  }

  function noteJiggleMoved(pos) {
    expected = { x: pos.x, y: pos.y };
    jiggleOccurred = true;
  }

  function reset() {
    expected = null;
    jiggleOccurred = false;
  }

  return { observe, noteJiggleMoved, reset };
}

module.exports = { createIdleDetector };
