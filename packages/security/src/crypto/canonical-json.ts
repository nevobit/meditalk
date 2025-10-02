export const canonicalJson = (obj: unknown): string => {
  const sort = (x: unknown): unknown => {
    if (Array.isArray(x)) {
      return x.map(sort);
    }

    if (x !== null && typeof x === "object") {
      return Object.keys(x as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = sort((x as Record<string, unknown>)[k]);
          return acc;
        }, {});
    }

    return x;
  };

  return JSON.stringify(sort(obj));
}
