import { evaluateStroke, StrokePoint } from './stroke-evaluator';

describe('Hiragana stroke evaluator', () => {
  const reference: StrokePoint[] = Array.from({ length: 20 }, (_, index) => ({
    x: 100 + index * 35,
    y: 200 + index * 10,
  }));

  it('should accept a close stroke in the correct direction', () => {
    const user = reference.map((point, index) => ({
      x: point.x + (index % 2 ? 8 : -6),
      y: point.y + (index % 3 ? 5 : -4),
    }));

    expect(evaluateStroke(user, reference).passed).toBeTrue();
  });

  it('should reject the same stroke in reverse', () => {
    const result = evaluateStroke([...reference].reverse(), reference);

    expect(result.passed).toBeFalse();
    expect(result.reason).toBe('wrong-direction');
  });

  it('should reject a stroke far away from the guide', () => {
    const user = reference.map((point) => ({ x: point.x, y: point.y + 420 }));

    expect(evaluateStroke(user, reference).passed).toBeFalse();
  });
});
