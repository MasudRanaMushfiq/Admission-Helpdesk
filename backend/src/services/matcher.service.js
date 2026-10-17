// Cosine similarity: 1 = same, 0 = unrelated
function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Top matches + answer/forward decision
function findMatches(questionVector, entries, threshold, topK = 3) {
  const top = entries
    .filter((entry) => entry.isActive !== false)
    .map((entry) => ({ entry, score: cosineSimilarity(questionVector, entry.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const bestScore = top.length > 0 ? top[0].score : 0;

  return { top, bestScore, shouldAnswer: top.length > 0 && bestScore >= threshold };
}

module.exports = { cosineSimilarity, findMatches };
