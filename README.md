# Retrieval Metrics Mini Project

Build a tiny evaluation tool that measures how good a search system is.

In this mini project you will implement `eval.js` so it scores two search systems, keyword search and semantic search, on the same set of test queries, computes **MRR** and **Recall@10** for each, and prints a **markdown comparison table**. No database or API keys are needed: the two systems' ranked results are already captured for you as data, so you can focus on the metrics themselves.

## What is in this project

- `eval.js` : evaluates keyword and semantic search results using Reciprocal Rank, MRR, and Recall@10.
- `test-set.csv` : 10 `(query, correct_post_ids)` pairs. A row may list more than one correct answer, semicolon-separated (for example `1024;1025`).
- `search-results.json` : for each query, the top-10 ranked `post_id` lists each system returned. Array position 0 is rank 1.
- `posts-dataset.csv` : the 35 posts the ids refer to (for sanity-checking; not required by the core build).

## Metrics

- **Reciprocal Rank (RR):** the reciprocal of the 1-based rank of the first correct result; `0` if no correct result appears in the top 10.
- **Mean Reciprocal Rank (MRR):** the average RR across all queries.
- **Recall@10:** the fraction of queries for which at least one correct result appears in the top 10.

## Run it

Requires Node.js; no external packages, database, or API keys are needed.

```bash
node eval.js
```

## Evaluation output

The program prints this Markdown comparison table for the provided fixture data:

```text
| Query | Keyword rank | Semantic rank |
|---|---|---|
| my redis cache keeps showing old data | 8 | 1 |
| how do I add semantic search to a table I already have | miss | 2 |
| redis or memcached for caching | 1 | 2 |
| why did my query get slower after I added an index | miss | 1 |
| what does ACID actually guarantee | 2 | 1 |
| how do I keep my postgres online while changing the schema | 6 | 3 |
| my background jobs stop after every deploy | miss | 2 |
| how do I let my database accept more writes per second | 4 | 1 |
| sql or nosql for a new product | 1 | 3 |
| why does my redis memory keep climbing | miss | 2 |
| **Summary** | **MRR 0.30 · Recall@10 0.60** | **MRR 0.67 · Recall@10 1.00** |
```

## Interpretation

Semantic search is better overall on both metrics: it achieves an MRR of **0.67** versus **0.30** for keyword search, and Recall@10 of **1.00** versus **0.60**. Keyword search wins on **“redis or memcached for caching”** and **“sql or nosql for a new product,”** where the query uses the exact technical terms that appear in the relevant content. Semantic search wins on the other eight queries, especially symptom-based and paraphrased questions such as stale Redis data, slow queries after adding an index, and background jobs stopping after deployment. A team would still keep keyword search because exact-term matching can outperform semantic similarity on specific technical vocabulary, so the two approaches provide complementary strengths.

## Why both metrics matter

Recall@10 measures whether a correct result is present somewhere in the first ten results, while MRR rewards systems that place the first correct result nearer the top. Reporting both prevents a system that consistently buries correct answers at rank 10 from appearing successful based on recall alone.

## Optional extension

If you have a working PostgreSQL database with posts and embeddings, you can replace the fixture results with live PostgreSQL full-text and pgvector searches while keeping the same evaluation logic.
