// Fixed vectors, no database
const { cosineSimilarity, findMatches } = require('../src/services/matcher.service');
const { embed } = require('../src/services/embedding.service');

describe('cosineSimilarity', () => {
  test('same vectors give 1', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });

  test('unrelated (perpendicular) vectors give 0', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  test('bad input gives 0 instead of crashing', () => {
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
    expect(cosineSimilarity([], [])).toBe(0);
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
    expect(cosineSimilarity(null, [1])).toBe(0);
  });
});

describe('findMatches', () => {
  const entries = [
    { id: 1, question: 'GPA requirement', embedding: [1, 0, 0], isActive: true },
    { id: 2, question: 'Application fee', embedding: [0, 1, 0], isActive: true },
    { id: 3, question: 'Exam format', embedding: [0, 0, 1], isActive: true },
    { id: 4, question: 'Old inactive entry', embedding: [0.9, 0.1, 0], isActive: false },
  ];

  test('known question returns the correct entry above the threshold', () => {
    const result = findMatches([0.9, 0.1, 0.05], entries, 0.75);
    expect(result.top[0].entry.id).toBe(1);
    expect(result.bestScore).toBeGreaterThan(0.75);
    expect(result.shouldAnswer).toBe(true);
  });

  test('unrelated question scores below the threshold and is forwarded', () => {
    const result = findMatches([0.5, 0.5, 0.5], entries, 0.75);
    expect(result.bestScore).toBeLessThan(0.75);
    expect(result.shouldAnswer).toBe(false);
  });

  test('returns at most the top 3 entries, best first', () => {
    const result = findMatches([0.6, 0.3, 0.1], entries, 0.75);
    expect(result.top).toHaveLength(3);
    expect(result.top.map((t) => t.entry.id)).toEqual([1, 2, 3]);
  });

  test('inactive entries are ignored', () => {
    const result = findMatches([0.9, 0.1, 0], entries, 0.75);
    expect(result.top.some((t) => t.entry.id === 4)).toBe(false);
  });

  test('empty knowledge base means forward', () => {
    const result = findMatches([1, 0, 0], [], 0.75);
    expect(result).toEqual({ top: [], bestScore: 0, shouldAnswer: false });
  });
});

describe('built-in embeddings', () => {
  const kb = [
    { id: 1, question: 'fee', embedding: embed('How much is the application fee? The fee is 1200 BDT.') },
    { id: 2, question: 'exam', embedding: embed('What is the exam format? 100 multiple choice questions.') },
  ];

  test('a reworded question matches the right entry', () => {
    const result = findMatches(embed('What does the application fee cost?'), kb, 0.35);
    expect(result.top[0].entry.id).toBe(1);
    expect(result.shouldAnswer).toBe(true);
  });

  test('an unrelated question is forwarded', () => {
    const result = findMatches(embed('Is there a swimming pool on campus?'), kb, 0.35);
    expect(result.shouldAnswer).toBe(false);
  });
});

describe('Banglish questions', () => {
  const kb = [
    { id: 1, embedding: embed('Application fee koto? Application fee 1,200 taka.') },
    { id: 2, embedding: embed('A unit er exam kobe? A unit er admission exam 20 December.') },
    { id: 3, embedding: embed('B unit er exam kobe? B unit er admission exam 21 December.') },
    { id: 4, embedding: embed('Meye der jonno koyta hall ache? Meye der jonno 6 ta hall ache.') },
  ];
  const bestId = (question) => findMatches(embed(question), kb, 0.4).top[0].entry.id;

  test('different spellings mean the same word', () => {
    expect(bestId('abedon fi koto taka?')).toBe(1); // abedon = application, fi = fee
    expect(bestId('meyeder hostel koyta?')).toBe(4); // meyeder = female, hostel = hall
  });

  test('"A unit" and "B unit" are not mixed up', () => {
    expect(bestId('A unit er vorti porikkha kobe?')).toBe(2);
    expect(bestId('B unit er porikkha kobe?')).toBe(3);
  });

  test('Banglish filler words are ignored', () => {
    expect(cosineSimilarity(embed('ami ki kivabe fee dibo bhai plz bolen'), embed('fee'))).toBeCloseTo(1);
  });

  test('a question made only of filler words matches its own KB entry, nothing else', () => {
    const withWho = [...kb, { id: 5, embedding: embed('who?\nPlease ask admission related questions') }];
    const result = findMatches(embed('who'), withWho, 0.4);
    expect(result.top[0].entry.id).toBe(5);
    expect(result.shouldAnswer).toBe(true);
    expect(result.top[1].score).toBe(0);
  });

  test('an unrelated Banglish question is forwarded', () => {
    const result = findMatches(embed('aaj ki brishti hobe?'), kb, 0.4);
    expect(result.shouldAnswer).toBe(false);
  });
});
