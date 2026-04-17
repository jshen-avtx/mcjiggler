/**
 * @jest-environment node
 */
const { createIdleDetector } = require('../lib/idle-detector');

describe('createIdleDetector', () => {
  test('first sample never reports user movement', () => {
    const det = createIdleDetector({ toleranceSquared: 4 });
    expect(det.observe({ x: 100, y: 100 })).toBe(false);
  });

  test('sample within tolerance of last jiggle is not user movement', () => {
    const det = createIdleDetector({ toleranceSquared: 4 });
    det.observe({ x: 100, y: 100 });
    det.noteJiggleMoved({ x: 102, y: 100 });
    expect(det.observe({ x: 102, y: 100 })).toBe(false);
  });

  test('sample beyond tolerance after jiggle is user movement', () => {
    const det = createIdleDetector({ toleranceSquared: 4 });
    det.observe({ x: 100, y: 100 });
    det.noteJiggleMoved({ x: 102, y: 100 });
    expect(det.observe({ x: 150, y: 100 })).toBe(true);
  });

  test('movement without any jiggle in between is user movement', () => {
    const det = createIdleDetector({ toleranceSquared: 4 });
    det.observe({ x: 100, y: 100 });
    expect(det.observe({ x: 101, y: 101 })).toBe(true);
  });
});
