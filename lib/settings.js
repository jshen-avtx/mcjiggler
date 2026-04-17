'use strict';

const DEFAULT_SETTINGS = Object.freeze({
  intervalSeconds: 60,
  enabled: false,
  pauseOnUserInput: true,
  movementPixels: 2,
});

function normalizeSettings(input) {
  const src = input && typeof input === 'object' ? input : {};
  return {
    intervalSeconds: clampInterval(src.intervalSeconds),
    enabled:
      typeof src.enabled === 'boolean'
        ? src.enabled
        : DEFAULT_SETTINGS.enabled,
    pauseOnUserInput:
      typeof src.pauseOnUserInput === 'boolean'
        ? src.pauseOnUserInput
        : DEFAULT_SETTINGS.pauseOnUserInput,
    movementPixels: clampMovement(src.movementPixels),
  };
}

function clampInterval(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_SETTINGS.intervalSeconds;
  }
  if (value < 1) return 1;
  if (value > 3600) return 3600;
  return Math.round(value);
}

function clampMovement(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_SETTINGS.movementPixels;
  }
  if (value < 1) return 1;
  if (value > 50) return 50;
  return Math.round(value);
}

module.exports = {
  DEFAULT_SETTINGS,
  normalizeSettings,
};
