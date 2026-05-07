import { performance } from "node:perf_hooks";
import { sortTransactions, type SortAlgorithm, type SortKey } from "../src/lib/utils/sorting";

type MockTransaction = {
  id: string;
  date: string;
  value: number;
  description: string;
};

function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function randomInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomChoice<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)];
}

function generateMockTransactions(count: number, seed: number): MockTransaction[] {
  const rng = createRng(seed);
  const descriptions = [
    "Pagamento fornecedor",
    "Recebimento cliente",
    "Assinatura servico",
    "Compra material",
    "Transferencia interna",
  ];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const data: MockTransaction[] = [];
  for (let i = 0; i < count; i += 1) {
    const daysAgo = randomInt(rng, 0, 365);
    const value = Math.round((rng() * 5000 + 10) * 100) / 100;
    data.push({
      id: `tx-${seed}-${i}`,
      date: new Date(now - daysAgo * dayMs).toISOString(),
      value,
      description: randomChoice(rng, descriptions),
    });
  }

  return data;
}

function keyFor(tx: MockTransaction, key: SortKey) {
  if (key === "value") return Math.round(tx.value * 100);
  return new Date(tx.date).getTime();
}

function isSorted(items: MockTransaction[], key: SortKey, order: "asc" | "desc") {
  for (let i = 1; i < items.length; i += 1) {
    const prev = keyFor(items[i - 1], key);
    const curr = keyFor(items[i], key);
    if (order === "asc" && prev > curr) return false;
    if (order === "desc" && prev < curr) return false;
  }
  return true;
}

function measure(fn: () => void, runs: number) {
  const times: number[] = [];
  for (let i = 0; i < runs; i += 1) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }
  const total = times.reduce((sum, t) => sum + t, 0);
  return {
    avg: total / runs,
    min: Math.min(...times),
  };
}

function formatMs(value: number) {
  return `${value.toFixed(2)}ms`;
}

function runBenchmark(key: SortKey, order: "asc" | "desc") {
  const sizes = [1000, 5000, 10000, 25000];
  const algorithms: SortAlgorithm[] = ["quicksort", "mergesort", "radix"];

  console.log(`\nSorting benchmark (key=${key}, order=${order})`);

  for (const size of sizes) {
    const data = generateMockTransactions(size, size + 42);
    const results = algorithms.map((algorithm) => {
      const result = measure(() => {
        const sorted = sortTransactions(data, { algorithm, key, order });
        if (!isSorted(sorted, key, order)) {
          throw new Error(`Invalid sort for ${algorithm} (size=${size})`);
        }
      }, 5);

      return { algorithm, avg: result.avg, min: result.min };
    });

    const winner = results.reduce((best, cur) => (cur.avg < best.avg ? cur : best));

    console.log(`size=${size}`);
    for (const result of results) {
      console.log(
        `  ${result.algorithm.padEnd(9)} avg=${formatMs(result.avg)} min=${formatMs(result.min)}`
      );
    }
    console.log(`  winner=${winner.algorithm}`);
  }
}

console.log("Sorting benchmark - lancamentos (mock data)");
runBenchmark("date", "desc");
runBenchmark("value", "desc");
