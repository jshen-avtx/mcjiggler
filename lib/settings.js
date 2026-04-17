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
    intervalSeconds:
      typeof src.intervalSeconds === 'number'
        ? src.intervalSeconds
        : DEFAULT_SETTINGS.intervalSeconds,
    enabled:
      typeof src.enabled === 'boolean'
        ? src.enabled
        : DEFAULT_SETTINGS.enabled,
    pauseOnUserInput:
      typeof src.pauseOnUserInput === 'boolean'
        ? src.pauseOnUserInput
        : DEFAULT_SETTINGS.pauseOnUserInput,
    movementPixels:
      typeof src.movementPixels === 'number'
        ? src.movementPixels
        : DEFAULT_SETTINGS.movementPixels,
  };
}

module.exports = {
  DEFAULT_SETTINGS,
  normalizeSettings,
};
