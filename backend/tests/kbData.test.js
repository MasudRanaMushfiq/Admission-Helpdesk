const { categories, banglishKbEntries, kbEntries } = require('../prisma/seedData');

describe('seed KB data', () => {
  test('has 1000 Banglish entries', () => {
    expect(banglishKbEntries).toHaveLength(1000);
  });

  test('every question is unique', () => {
    const questions = kbEntries.map((e) => e.question.toLowerCase());
    expect(new Set(questions).size).toBe(questions.length);
  });

  test('every entry fits the database limits and has a known category', () => {
    for (const entry of kbEntries) {
      expect(categories).toContain(entry.category);
      expect(entry.question.length).toBeGreaterThanOrEqual(3);
      expect(entry.question.length).toBeLessThanOrEqual(255);
      expect(entry.answer.length).toBeGreaterThan(0);
    }
  });
});
