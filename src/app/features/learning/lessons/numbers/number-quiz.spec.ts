import { NUMBER_GROUPS } from './japanese-number';
import { createNumberQuiz } from './number-quiz';

describe('Number quiz', () => {
  it('should create ten unique questions with four unique answers', () => {
    const quiz = createNumberQuiz(NUMBER_GROUPS, 10);
    expect(quiz.length).toBe(10);
    expect(new Set(quiz.map((question) => question.value)).size).toBe(10);
    for (const question of quiz) {
      expect(question.options.length).toBe(4);
      expect(new Set(question.options).size).toBe(4);
      expect(question.options).toContain(question.correctAnswer);
    }
  });

  it('should exclude the previous value in continuous practice', () => {
    const quiz = createNumberQuiz([NUMBER_GROUPS[0]], 1, Math.random, 5);
    expect(quiz[0].value).not.toBe(5);
  });
});
