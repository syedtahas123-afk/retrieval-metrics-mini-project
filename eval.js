// Evaluate keyword and semantic retrieval using Reciprocal Rank and Recall@10.
// Run with: node eval.js

const fs = require('fs');

function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split(/\r?\n/).slice(1);
  return lines.filter(Boolean).map((line) => {
    const [query, ids] = line.split(',');
    return {
      query,
      correctIds: ids.split(';').map((id) => Number(id.trim())),
    };
  });
}

const testSet = loadTestSet('test-set.csv');
const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

// Return 1 / the 1-based rank of the first relevant result, or 0 for a miss.
function reciprocalRank(rankedIds, correctIds) {
  const rank = rankOf(rankedIds, correctIds);
  return rank === null ? 0 : 1 / rank;
}

// Return the 1-based rank of the first relevant result, or null if not found.
function rankOf(rankedIds, correctIds) {
  const correctIdSet = new Set(correctIds);
  const index = rankedIds.findIndex((id) => correctIdSet.has(Number(id)));
  return index === -1 ? null : index + 1;
}

const keywordRRs = [];
const semanticRRs = [];
let keywordHits = 0;
let semanticHits = 0;
const rows = [];

for (const { query, correctIds } of testSet) {
  const queryResults = results[query];

  if (!queryResults) {
    throw new Error(`Missing search results for query: "${query}"`);
  }

  const keywordRank = rankOf(queryResults.keyword ?? [], correctIds);
  const semanticRank = rankOf(queryResults.semantic ?? [], correctIds);
  const keywordRR = reciprocalRank(queryResults.keyword ?? [], correctIds);
  const semanticRR = reciprocalRank(queryResults.semantic ?? [], correctIds);

  keywordRRs.push(keywordRR);
  semanticRRs.push(semanticRR);

  if (keywordRR > 0) keywordHits += 1;
  if (semanticRR > 0) semanticHits += 1;

  rows.push({
    query,
    keywordRank: keywordRank ?? 'miss',
    semanticRank: semanticRank ?? 'miss',
  });
}

const mean = (values) =>
  values.reduce((total, value) => total + value, 0) / values.length;

const keywordMRR = mean(keywordRRs);
const semanticMRR = mean(semanticRRs);
const keywordRecall = keywordHits / testSet.length;
const semanticRecall = semanticHits / testSet.length;

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');

for (const row of rows) {
  console.log(
    `| ${row.query} | ${row.keywordRank} | ${row.semanticRank} |`
  );
}

console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);
