'use strict';

const { normalizeSettings } = require('./settings');
const { createIdleDetector } = require('./idle-detector');

function createJiggler(opts) {
  const clock = opts.clock;
  const mouse = opts.mouse;
  const onUserInput = opts.onUserInput || (() => {});
  let settings = normalizeSettings(opts.settings || {});
  const idle = createIdleDetector({ toleranceSquared: 4 });

  let timerId = null;
  let running = false;
  let direction = 1;

  function scheduleNext() {
    const ms = settings.intervalSeconds * 1000;
    timerId = clock.setTimeout(tick, ms);
  }

  function tick() {
    timerId = null;
    if (!running) return;

    const beforeJiggle = mouse.getPosition();
    const userMoved = idle.observe(beforeJiggle);
    if (userMoved && settings.pauseOnUserInput) {
      running = false;
      onUserInput();
      return;
    }

    const dx = direction * settings.movementPixels;
    const newPos = mouse.moveBy(dx, 0);
    idle.noteJiggleMoved(newPos);
    direction = -direction;
    scheduleNext();
  }

  function start() {
    if (running) return;
    running = true;
    idle.reset();
    scheduleNext();
  }

  function stop() {
    running = false;
    if (timerId !== null) {
      clock.clearTimeout(timerId);
      timerId = null;
    }
  }

  function updateSettings(next) {
    settings = normalizeSettings(next);
    if (running) {
      if (timerId !== null) {
        clock.clearTimeout(timerId);
        timerId = null;
      }
      scheduleNext();
    }
  }

  function getSettings() {
    return { ...settings };
  }

  function isRunning() {
    return running;
  }

  return {
    start,
    stop,
    updateSettings,
    getSettings,
    isRunning,
  };
}

module.exports = { createJiggler };
