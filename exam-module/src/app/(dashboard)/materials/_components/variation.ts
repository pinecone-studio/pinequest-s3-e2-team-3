/** First unused label starting at B (for copying a whole variation set: A→B, or B→C if B exists). */
export function nextBatchVariationLabel(existingLabels: string[]): string {
  const used = new Set(
    existingLabels
      .filter((v): v is string => Boolean(v?.trim()))
      .map((v) => v.trim().toUpperCase()),
  );
  for (let i = 1; i < 26; i++) {
    const c = String.fromCharCode(65 + i);
    if (!used.has(c)) return c;
  }
  let n = 1;
  while (used.has(`X${n}`)) n++;
  return `X${n}`;
}

export function normalizeVariationLabel(v: string): string {
  return v.trim().toUpperCase();
}

/** Single-letter labels A–Z; if the alphabet is exhausted, use X1, X2, … */
export function nextVariationAfterDuplicate(
  sourceVariation: string | undefined,
  allVariations: (string | undefined)[],
): string {
  const used = new Set(
    allVariations
      .filter((v): v is string => Boolean(v?.trim()))
      .map((v) => v.trim().toUpperCase()),
  );

  let candidate = incrementLetter((sourceVariation?.trim() || "A").toUpperCase());
  let guard = 0;
  while (used.has(candidate) && guard++ < 64) {
    candidate = incrementLetter(candidate);
  }
  if (!used.has(candidate)) return candidate;

  let n = 1;
  while (used.has(`X${n}`)) n++;
  return `X${n}`;
}

function incrementLetter(s: string): string {
  const letter = s.match(/^[A-Z]$/)?.[0];
  if (letter) {
    const code = letter.charCodeAt(0);
    if (code < 90) return String.fromCharCode(code + 1);
    return "A";
  }
  return "A";
}

export function firstUnusedVariation(allVariations: (string | undefined)[]): string {
  const used = new Set(
    allVariations
      .filter((v): v is string => Boolean(v?.trim()))
      .map((v) => v.trim().toUpperCase()),
  );
  for (let i = 0; i < 26; i++) {
    const c = String.fromCharCode(65 + i);
    if (!used.has(c)) return c;
  }
  let n = 1;
  while (used.has(`X${n}`)) n++;
  return `X${n}`;
}
