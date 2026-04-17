/**
 * @jest-environment node
 */
const {
  DEFAULT_SETTINGS,
  normalizeSettings,
} = require('../lib/settings');

describe('settings persistence round-trip', () => {
  test('JSON round-trip through normalizeSettings is a fixed point', () => {
    const once = normalizeSettings({ intervalSeconds: 42, enabled: true });
    const serialized = JSON.parse(JSON.stringify(once));
    const twice = normalizeSettings(serialized);
    expect(twice).toEqual(once);
  });

  test('defaults survive JSON round-trip', () => {
    const serialized = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    expect(normalizeSettings(serialized)).toEqual(DEFAULT_SETTINGS);
  });

  test('unknown keys are stripped', () => {
    const result = normalizeSettings({ intervalSeconds: 5, bogus: 'x' });
    expect(result).not.toHaveProperty('bogus');
  });
});
