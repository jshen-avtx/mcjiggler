/**
 * @jest-environment node
 */
const {
  DEFAULT_SETTINGS,
  normalizeSettings,
} = require('../lib/settings');

describe('settings defaults', () => {
  test('DEFAULT_SETTINGS has expected keys and values', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      intervalSeconds: 60,
      enabled: false,
      pauseOnUserInput: true,
      movementPixels: 2,
    });
  });

  test('normalizeSettings fills missing fields with defaults', () => {
    expect(normalizeSettings({})).toEqual(DEFAULT_SETTINGS);
  });

  test('normalizeSettings preserves provided fields', () => {
    const result = normalizeSettings({ intervalSeconds: 30 });
    expect(result.intervalSeconds).toBe(30);
    expect(result.enabled).toBe(false);
  });
});
