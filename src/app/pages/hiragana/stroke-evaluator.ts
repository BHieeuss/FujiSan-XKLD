export interface StrokePoint {
  x: number;
  y: number;
}

export interface StrokeEvaluation {
  passed: boolean;
  startDistance: number;
  endDistance: number;
  averageDistance: number;
  coverage: number;
  lengthRatio: number;
  reason: 'ok' | 'too-short' | 'wrong-direction' | 'too-far';
}

function distance(a: StrokePoint, b: StrokePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathLength(points: readonly StrokePoint[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += distance(points[index - 1], points[index]);
  }
  return total;
}

export function resampleStroke(
  points: readonly StrokePoint[],
  sampleCount = 64,
): StrokePoint[] {
  if (points.length < 2) {
    return [...points];
  }

  const totalLength = pathLength(points);
  if (!totalLength) {
    return Array.from({ length: sampleCount }, () => ({ ...points[0] }));
  }

  const result: StrokePoint[] = [{ ...points[0] }];
  const interval = totalLength / (sampleCount - 1);
  let accumulated = 0;
  let segmentIndex = 1;
  let segmentStart = points[0];

  while (result.length < sampleCount - 1 && segmentIndex < points.length) {
    const segmentEnd = points[segmentIndex];
    const segmentLength = distance(segmentStart, segmentEnd);
    if (!segmentLength) {
      segmentStart = segmentEnd;
      segmentIndex += 1;
      continue;
    }

    if (accumulated + segmentLength >= interval) {
      const ratio = (interval - accumulated) / segmentLength;
      const point = {
        x: segmentStart.x + (segmentEnd.x - segmentStart.x) * ratio,
        y: segmentStart.y + (segmentEnd.y - segmentStart.y) * ratio,
      };
      result.push(point);
      segmentStart = point;
      accumulated = 0;
    } else {
      accumulated += segmentLength;
      segmentStart = segmentEnd;
      segmentIndex += 1;
    }
  }

  result.push({ ...points[points.length - 1] });
  return result;
}

export function sampleSvgPath(pathData: string, sampleCount = 64): StrokePoint[] {
  if (typeof document === 'undefined') {
    return [];
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  const length = path.getTotalLength();
  return Array.from({ length: sampleCount }, (_, index) => {
    const point = path.getPointAtLength((length * index) / (sampleCount - 1));
    return { x: point.x, y: point.y };
  });
}

function averageNearestDistance(
  source: readonly StrokePoint[],
  target: readonly StrokePoint[],
): number {
  if (!source.length || !target.length) {
    return Number.POSITIVE_INFINITY;
  }
  return (
    source.reduce((sum, point) => {
      const nearest = Math.min(...target.map((candidate) => distance(point, candidate)));
      return sum + nearest;
    }, 0) / source.length
  );
}

export function evaluateStroke(
  userPoints: readonly StrokePoint[],
  referencePoints: readonly StrokePoint[],
  lenient = false,
): StrokeEvaluation {
  if (userPoints.length < 4 || referencePoints.length < 4) {
    return {
      passed: false,
      startDistance: Number.POSITIVE_INFINITY,
      endDistance: Number.POSITIVE_INFINITY,
      averageDistance: Number.POSITIVE_INFINITY,
      coverage: 0,
      lengthRatio: 0,
      reason: 'too-short',
    };
  }

  const user = resampleStroke(userPoints);
  const reference = resampleStroke(referencePoints);
  const startDistance = distance(user[0], reference[0]);
  const endDistance = distance(user[user.length - 1], reference[reference.length - 1]);
  const forwardDistance = averageNearestDistance(user, reference);
  const reverseDistance = averageNearestDistance(reference, user);
  const averageDistance = (forwardDistance + reverseDistance) / 2;
  const coverageThreshold = lenient ? 150 : 125;
  const coverage =
    reference.filter(
      (point) => Math.min(...user.map((candidate) => distance(point, candidate))) <= coverageThreshold,
    ).length / reference.length;
  const lengthRatio = pathLength(userPoints) / Math.max(pathLength(referencePoints), 1);

  const directionOk =
    startDistance <= (lenient ? 230 : 190) && endDistance <= (lenient ? 250 : 210);
  const shapeOk =
    averageDistance <= (lenient ? 150 : 120) &&
    coverage >= (lenient ? 0.56 : 0.64) &&
    lengthRatio >= 0.42 &&
    lengthRatio <= 2.35;

  return {
    passed: directionOk && shapeOk,
    startDistance,
    endDistance,
    averageDistance,
    coverage,
    lengthRatio,
    reason: !directionOk ? 'wrong-direction' : shapeOk ? 'ok' : 'too-far',
  };
}
