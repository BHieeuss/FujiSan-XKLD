import { HiraganaItem, QuizDirection } from './hiragana-data';

export interface HiraganaQuizQuestion {
  id: string;
  item: HiraganaItem;
  direction: QuizDirection;
  prompt: string;
  correctAnswer: string;
  options: string[];
}

export function shuffle<T>(values: readonly T[], random: () => number = Math.random): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function createQuiz(
  pool: readonly HiraganaItem[],
  allItems: readonly HiraganaItem[],
  count = 10,
  random: () => number = Math.random,
): HiraganaQuizQuestion[] {
  return shuffle(pool, random)
    .slice(0, Math.min(count, pool.length))
    .map((item, index) => {
      const direction =
        item.quizDirections[Math.floor(random() * item.quizDirections.length)] ??
        item.quizDirections[0];
      const isKanaPrompt = direction === 'kana-to-romaji';
      const correctAnswer = isKanaPrompt ? item.romaji : item.kana;
      const distractors = Array.from(
        new Set(
          allItems
            .filter((candidate) => candidate.id !== item.id)
            .filter((candidate) => isKanaPrompt || candidate.romaji !== item.romaji)
            .map((candidate) => (isKanaPrompt ? candidate.romaji : candidate.kana))
            .filter((answer) => answer !== correctAnswer),
        ),
      );
      const options = shuffle(
        [correctAnswer, ...shuffle(distractors, random).slice(0, 3)],
        random,
      );

      return {
        id: `${item.id}-${index}-${direction}`,
        item,
        direction,
        prompt: isKanaPrompt ? item.kana : item.romaji,
        correctAnswer,
        options,
      };
    });
}
