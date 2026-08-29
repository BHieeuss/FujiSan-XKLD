import {
  formatNumber,
  JapaneseNumber,
  NumberGroupDefinition,
  NumberQuizDirection,
  toJapaneseNumber,
} from './japanese-number';

export interface NumberQuizQuestion {
  id: string;
  value: number;
  result: JapaneseNumber;
  direction: NumberQuizDirection;
  prompt: string;
  correctAnswer: string;
  options: string[];
}

const DIRECTIONS: NumberQuizDirection[] = [
  'number-to-reading',
  'reading-to-number',
];

export function createNumberQuiz(
  groups: readonly NumberGroupDefinition[],
  count = 10,
  random: () => number = Math.random,
  excludedValue?: number,
): NumberQuizQuestion[] {
  const questions: NumberQuizQuestion[] = [];
  const used = new Set<number>();

  while (questions.length < count && used.size < count * 20) {
    const group = groups[Math.floor(random() * groups.length)];
    const value = randomValue(group, random);
    if (used.has(value) || value === excludedValue) {
      continue;
    }
    used.add(value);
    questions.push(createQuestion(value, group, questions.length, random));
  }

  return questions;
}

function createQuestion(
  value: number,
  group: NumberGroupDefinition,
  index: number,
  random: () => number,
): NumberQuizQuestion {
  const result = toJapaneseNumber(value);
  const direction = DIRECTIONS[Math.floor(random() * DIRECTIONS.length)];
  const numberAnswer = formatNumber(value);
  const correctAnswer = direction === 'number-to-reading' ? result.kana : numberAnswer;
  const prompt = direction === 'number-to-reading' ? numberAnswer : result.kana;
  const distractors = new Set<string>();

  while (distractors.size < 3) {
    const candidate = randomValue(group, random);
    if (candidate === value) {
      continue;
    }
    const candidateResult = toJapaneseNumber(candidate);
    const answer =
      direction === 'number-to-reading' ? candidateResult.kana : formatNumber(candidate);
    if (answer !== correctAnswer) {
      distractors.add(answer);
    }
  }

  return {
    id: `${group.id}-${value}-${index}-${direction}`,
    value,
    result,
    direction,
    prompt,
    correctAnswer,
    options: shuffle([correctAnswer, ...distractors], random),
  };
}

function randomValue(group: NumberGroupDefinition, random: () => number): number {
  return group.min + Math.floor(random() * (group.max - group.min + 1));
}

function shuffle<T>(values: Iterable<T>, random: () => number): T[] {
  const result = Array.from(values);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}
