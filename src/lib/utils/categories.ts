export interface CategoryLike {
  id: string;
  name: string;
}

// Normalize strings to make matching resilient to accents and separators.
function normalizeCategoryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeCategoryNameLoose(name: string): string {
  return normalizeCategoryName(name).replace(/(de|da|do|das|dos)/g, "");
}

export function matchCategoryBySuggestion(
  categories: CategoryLike[],
  suggested: string | null | undefined,
  fallbackName = "Outros"
): CategoryLike | undefined {
  if (categories.length === 0) return undefined;

  const fallback =
    categories.find(
      (cat) => normalizeCategoryName(cat.name) === normalizeCategoryName(fallbackName)
    ) || categories[0];

  if (!suggested) return fallback;

  const normalized = normalizeCategoryName(suggested);
  const normalizedLoose = normalizeCategoryNameLoose(suggested);

  const exact = categories.find(
    (cat) => normalizeCategoryName(cat.name) === normalized
  );
  if (exact) return exact;

  const exactLoose = categories.find(
    (cat) => normalizeCategoryNameLoose(cat.name) === normalizedLoose
  );
  if (exactLoose) return exactLoose;

  const partial = categories.find((cat) => {
    const catNorm = normalizeCategoryName(cat.name);
    return catNorm.includes(normalized) || normalized.includes(catNorm);
  });
  if (partial) return partial;

  const partialLoose = categories.find((cat) => {
    const catNorm = normalizeCategoryNameLoose(cat.name);
    return catNorm.includes(normalizedLoose) || normalizedLoose.includes(catNorm);
  });
  if (partialLoose) return partialLoose;

  return fallback;
}
