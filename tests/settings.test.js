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

describe('interval clamping', () => {
  test('clamps intervalSeconds below 1 up to 1', () => {
    expect(normalizeSettings({ intervalSeconds: 0 }).intervalSeconds).toBe(1);
    expect(normalizeSettings({ intervalSeconds: -5 }).intervalSeconds).toBe(1);
  });

  test('clamps intervalSeconds above 3600 down to 3600', () => {
    expect(normalizeSettings({ intervalSeconds: 99999 }).intervalSeconds).toBe(
      3600,
    );
  });

  test('rejects non-finite intervalSeconds', () => {
    expect(normalizeSettings({ intervalSeconds: NaN }).intervalSeconds).toBe(
      60,
    );
    expect(
      normalizeSettings({ intervalSeconds: Infinity }).intervalSeconds,
    ).toBe(60);
  });
});

describe('movementPixels clamping', () => {
  test('clamps movementPixels below 1 up to 1', () => {
    expect(normalizeSettings({ movementPixels: 0 }).movementPixels).toBe(1);
  });

  test('clamps movementPixels above 50 down to 50', () => {
    expect(normalizeSettings({ movementPixels: 9999 }).movementPixels).toBe(
      50,
    );
  });
});
