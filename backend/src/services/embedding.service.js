const { BANGLISH_STOP_WORDS, SYNONYMS } = require('./banglish');

// Text embedded for a KB entry
function entryText(question, answer) {
  return `${question}\n${answer}`;
}

// Built-in embeddings (tuned with npm run evaluate)

const VECTOR_SIZE = 4096;
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'was', 'were', 'be', 'to', 'of', 'in', 'on', 'for', 'and', 'or',
  'i', 'me', 'my', 'we', 'you', 'your', 'it', 'its', 'do', 'does', 'did', 'can', 'could', 'will', 'would',
  'what', 'when', 'where', 'which', 'who', 'how', 'why', 'there', 'this', 'that', 'these', 'those',
  'with', 'at', 'by', 'from', 'as', 'if', 'any', 'have', 'has', 'need', 'please', 'tell', 'about',
  'should', 'must', 'get', 'much', 'many', 'so', 'up', 'out', 'all', 'also', 'than', 'then', 'there',
  'u', 'ur', 'areyou',
  ...BANGLISH_STOP_WORDS,
]);

// Simple stemmer: deadlines -> deadline
function stem(word) {
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function lineWords(line) {
  // "A unit" -> "aunit", so the letter is kept
  const joined = line.toLowerCase().replace(/\b([abc])\s+unit\b/g, '$1unit');
  // Keep decimals whole (4.50 != 4.00)
  const words = joined.match(/\d+\.\d+|[a-z0-9ঀ-৿]+/g) || [];
  const important = words.filter((word) => !STOP_WORDS.has(word));
  // Only stop words? Keep them so it can still match
  return important.length > 0 ? important : words;
}

function embed(text) {
  const vector = new Array(VECTOR_SIZE).fill(0);
  // Per line, so short question lines aren't lost
  const words = text.split('\n').flatMap(lineWords);

  for (const word of words) {
    // Normalize spellings and plurals
    const root = stem(SYNONYMS[word] || SYNONYMS[stem(word)] || word);

    // Hash into a slot
    let hash = 0;
    for (const char of root) hash = (hash * 31 + char.charCodeAt(0)) % VECTOR_SIZE;
    vector[hash] += 1;
  }

  // Log-scale repeats
  return vector.map((count) => (count > 0 ? 1 + Math.log(count) : 0));
}

// Used by seed and re-embed
function embedMany(texts) {
  return texts.map(embed);
}

module.exports = { embed, embedMany, entryText };
