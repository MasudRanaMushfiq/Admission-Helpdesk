// Matching evaluation: npm run evaluate
const prisma = require('../src/lib/prisma');
const config = require('../src/config');
const { embed } = require('../src/services/embedding.service');
const { findMatches } = require('../src/services/matcher.service');

// expect: words the answer must contain, null = should forward
const testQuestions = [
  // English, in scope
  { text: 'What GPA do I need to be eligible?', expect: ['GPA'] },
  { text: 'I am from science background, can I study business?', expect: ['business'] },
  { text: 'What is the cost of the application fee?', expect: ['1,200'] },
  { text: 'Can I pay the fee using bKash?', expect: ['bKash'] },
  { text: 'What is the last date to submit the online application?', expect: ['30 November'] },
  { text: 'From when can I download my admit card?', expect: ['10 December'] },
  { text: 'When are the results published?', expect: ['15'] },
  { text: 'Which documents do I need to apply?', expect: ['photo', 'signature'] },
  { text: 'How many questions are in the exam and is there negative marking?', expect: ['0.25'] },
  { text: 'What size should my photo be?', expect: ['300x300'] },
  // Banglish, in scope
  { text: 'cse te sit koyta?', expect: ['Computer Science', 'seat'] },
  { text: 'A unit er vorti porikkha kobe?', expect: ['A unit', '20 December'] },
  { text: 'abedon fi koto taka', expect: ['1,200'] },
  { text: 'nagad diye kivabe fee dibo', expect: ['Nagad'] },
  { text: 'ami jessore theke, porikkha kothay dibo?', expect: ['Khulna'] },
  { text: 'meyeder hall koyta ache?', expect: ['Shapla'] },
  { text: 'ssc 4.50 r hsc 4.00 hole ki apply korte parbo', expect: ['8.50'] },
  { text: 'law porle ki chakri pawa jay?', expect: ['advocate'] },
  { text: 'admit card hariye geche ki korbo', expect: ['download'] },
  { text: 'porikkhay calculator newa jabe?', expect: ['Calculator'] },
  // English, out of scope
  { text: 'Who won the football world cup?', expect: null },
  { text: 'Who is the vice chancellor of the university?', expect: null },
  { text: 'How do I cook rice?', expect: null },
  { text: 'What is the weather like in December?', expect: null },
  { text: 'What is the capital of France?', expect: null },
  // Banglish, out of scope
  { text: 'vc sir er naam ki?', expect: null },
  { text: 'dhakar sobcheye bhalo biryani kothay pabo?', expect: null },
  { text: 'aaj ki brishti hobe?', expect: null },
  { text: 'bitcoin kivabe kinbo?', expect: null },
  { text: 'iphone er dam koto?', expect: null },
];

const thresholds = [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5];

const isRightAnswer = (answer, words) => words.every((w) => answer.toLowerCase().includes(w.toLowerCase()));

async function main() {
  const entries = await prisma.kbEntry.findMany({
    where: { isActive: true },
    select: { id: true, question: true, answer: true, embedding: true },
  });
  console.log(`${entries.length} KB entries\n`);

  const results = [];
  for (const q of testQuestions) {
    const { top, bestScore } = findMatches(embed(q.text), entries, 0);
    const best = top[0] ? top[0].entry : null;
    results.push({ ...q, bestScore, best, right: Boolean(q.expect && best && isRightAnswer(best.answer, q.expect)) });
  }

  console.log('Best score per question:');
  for (const r of results) {
    const label = r.expect ? (r.right ? 'right entry' : 'WRONG entry') : 'out of scope';
    console.log(`  ${r.bestScore.toFixed(3)}  [${label}]  ${r.text}  ->  ${r.best ? r.best.question : '-'}`);
  }

  const inScope = results.filter((r) => r.expect).length;
  const outScope = results.length - inScope;
  console.log('\n| Threshold | Correctly answered | Correctly forwarded | Wrong answers | Wrongly forwarded |');
  console.log('|---|---|---|---|---|');
  for (const threshold of thresholds) {
    let correctAnswer = 0, correctForward = 0, wrongAnswer = 0, wrongForward = 0;
    for (const r of results) {
      const answered = r.bestScore >= threshold;
      if (!r.expect) answered ? wrongAnswer++ : correctForward++;
      else if (!answered) wrongForward++;
      else if (r.right) correctAnswer++;
      else wrongAnswer++;
    }
    console.log(`| ${threshold} | ${correctAnswer}/${inScope} | ${correctForward}/${outScope} | ${wrongAnswer} | ${wrongForward} |`);
  }
  console.log(`\nCurrent threshold: ${config.similarityThreshold}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
