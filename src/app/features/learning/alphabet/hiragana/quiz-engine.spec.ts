import { HIRAGANA_ITEMS } from './hiragana-data';
import { createQuiz } from './quiz-engine';

describe('Hiragana quiz engine', () => {
  it('should create ten unique questions with four unique answers', () => {
    const quiz = createQuiz(HIRAGANA_ITEMS, HIRAGANA_ITEMS, 10);

    expect(quiz.length).toBe(10);
    expect(new Set(quiz.map((question) => question.item.id)).size).toBe(10);
    for (const question of quiz) {
      expect(question.options.length).toBe(4);
      expect(new Set(question.options).size).toBe(4);
      expect(question.options).toContain(question.correctAnswer);
    }
  });

  it('should only ask di and du from kana to romaji', () => {
    const pool = HIRAGANA_ITEMS.filter((item) => item.id === 'di' || item.id === 'du');
    const quiz = createQuiz(pool, HIRAGANA_ITEMS, 2);

    expect(quiz.every((question) => question.direction === 'kana-to-romaji')).toBeTrue();
  });

  it('should not offer alternate ji or zu kana as ambiguous distractors', () => {
    const ji = HIRAGANA_ITEMS.find((item) => item.id === 'ji')!;
    const zu = HIRAGANA_ITEMS.find((item) => item.id === 'zu')!;
    const alwaysRomajiToKana = () => 0.99;
    const quiz = createQuiz([ji, zu], HIRAGANA_ITEMS, 2, alwaysRomajiToKana);

    const jiQuestion = quiz.find((question) => question.item.id === 'ji')!;
    const zuQuestion = quiz.find((question) => question.item.id === 'zu')!;
    expect(jiQuestion.options).not.toContain('ぢ');
    expect(zuQuestion.options).not.toContain('づ');
  });
});
