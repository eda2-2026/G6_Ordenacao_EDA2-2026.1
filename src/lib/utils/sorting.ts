export type SortOrder = "asc" | "desc";
export type SortAlgorithm = "quicksort" | "mergesort" | "radix";
export type SortKey = "date" | "value";

export interface SortableTransaction {
  date: string | Date;
  value: unknown;
}

export interface SortOptions {
  algorithm: SortAlgorithm;
  key: SortKey;
  order?: SortOrder;
}

function normalizeNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof (value as { toNumber?: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  if (value && typeof (value as { toString?: () => string }).toString === "function") {
    return Number((value as { toString: () => string }).toString());
  }
  return 0;
}

function toCents(value: unknown): number {
  const num = normalizeNumber(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100);
}

function toTimestamp(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  const date = new Date(value as string);
  const time = date.getTime();
  return Number.isFinite(time) ? time : 0;
}

function normalizeInteger(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.trunc(value);
}

export function sortTransactions<T extends SortableTransaction>(items: T[], options: SortOptions): T[] {
  const order = options.order ?? "desc";
  const keyFn = options.key === "value"
    ? (item: T) => toCents(item.value)
    : (item: T) => toTimestamp(item.date);

  if (options.algorithm === "radix") {
    return radixSortByKey(items, keyFn, order);
  }

  const compare = (a: T, b: T) => {
    const diff = keyFn(a) - keyFn(b);
    if (diff === 0) return 0;
    return order === "asc" ? diff : -diff;
  };

  return options.algorithm === "quicksort"
    ? quicksort(items, compare)
    : mergesort(items, compare);
}

export function quicksort<T>(items: T[], compare: (a: T, b: T) => number): T[] {
  const arr = items.slice();
  if (arr.length < 2) return arr;

  const stack: Array<{ low: number; high: number }> = [{ low: 0, high: arr.length - 1 }];

  while (stack.length > 0) {
    const { low, high } = stack.pop() as { low: number; high: number };
    if (low >= high) continue;

    const pivotIndex = partition(arr, low, high, compare);

    if (pivotIndex - 1 > low) stack.push({ low, high: pivotIndex - 1 });
    if (pivotIndex + 1 < high) stack.push({ low: pivotIndex + 1, high });
  }

  return arr;
}

function partition<T>(arr: T[], low: number, high: number, compare: (a: T, b: T) => number): number {
  const mid = Math.floor((low + high) / 2);
  const pivotIndex = medianOfThree(arr, low, mid, high, compare);
  const pivotValue = arr[pivotIndex];
  swap(arr, pivotIndex, high);

  let i = low;
  for (let j = low; j < high; j += 1) {
    if (compare(arr[j], pivotValue) < 0) {
      swap(arr, i, j);
      i += 1;
    }
  }

  swap(arr, i, high);
  return i;
}

function medianOfThree<T>(arr: T[], a: number, b: number, c: number, compare: (x: T, y: T) => number): number {
  if (compare(arr[a], arr[b]) > 0) swap(arr, a, b);
  if (compare(arr[b], arr[c]) > 0) swap(arr, b, c);
  if (compare(arr[a], arr[b]) > 0) swap(arr, a, b);
  return b;
}

function swap<T>(arr: T[], i: number, j: number) {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

export function mergesort<T>(items: T[], compare: (a: T, b: T) => number): T[] {
  if (items.length < 2) return items.slice();

  const mid = Math.floor(items.length / 2);
  const left = mergesort(items.slice(0, mid), compare);
  const right = mergesort(items.slice(mid), compare);

  return merge(left, right, compare);
}

function merge<T>(left: T[], right: T[], compare: (a: T, b: T) => number): T[] {
  const result: T[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (compare(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i += 1;
    } else {
      result.push(right[j]);
      j += 1;
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}

export function radixSortByKey<T>(items: T[], keyFn: (item: T) => number, order: SortOrder = "asc"): T[] {
  const pairs = items.map((item) => ({ item, key: normalizeInteger(keyFn(item)) }));
  const negatives: Array<{ item: T; key: number }> = [];
  const nonNegatives: Array<{ item: T; key: number }> = [];

  for (const pair of pairs) {
    if (pair.key < 0) {
      negatives.push({ item: pair.item, key: Math.abs(pair.key) });
    } else {
      nonNegatives.push(pair);
    }
  }

  const sortedNegatives = radixSortPairs(negatives)
    .reverse()
    .map((pair) => ({ item: pair.item, key: -pair.key }));
  const sortedNonNegatives = radixSortPairs(nonNegatives);

  const combined = sortedNegatives.concat(sortedNonNegatives);
  if (order === "desc") return combined.reverse().map((pair) => pair.item);
  return combined.map((pair) => pair.item);
}

function radixSortPairs<T>(pairs: Array<{ item: T; key: number }>): Array<{ item: T; key: number }> {
  if (pairs.length < 2) return pairs.slice();

  let max = 0;
  for (const pair of pairs) {
    if (pair.key > max) max = pair.key;
  }

  let exp = 1;
  let output = pairs.slice();

  while (Math.floor(max / exp) > 0) {
    output = countingSortByDigit(output, exp);
    exp *= 10;
  }

  return output;
}

function countingSortByDigit<T>(pairs: Array<{ item: T; key: number }>, exp: number): Array<{ item: T; key: number }> {
  const output = new Array(pairs.length);
  const count = new Array(10).fill(0);

  for (const pair of pairs) {
    const digit = Math.floor(pair.key / exp) % 10;
    count[digit] += 1;
  }

  for (let i = 1; i < count.length; i += 1) {
    count[i] += count[i - 1];
  }

  for (let i = pairs.length - 1; i >= 0; i -= 1) {
    const pair = pairs[i];
    const digit = Math.floor(pair.key / exp) % 10;
    count[digit] -= 1;
    output[count[digit]] = pair;
  }

  return output as Array<{ item: T; key: number }>;
}
