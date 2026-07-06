/**
 * Parses `f.field=value` URL params into a selectedFilters object.
 * Price ranges are encoded as "min:max" and decoded to { min, max }.
 */
export const parseFiltersFromParams = (searchParams) => {
  const filters = {};
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('f.')) {
      const field = key.slice(2);
      if (!filters[field]) filters[field] = [];
      if (/^-?\d+(\.\d+)?:-?\d+(\.\d+)?$/.test(value)) {
        const [min, max] = value.split(':').map(Number);
        filters[field].push({ min, max });
      } else {
        filters[field].push(value);
      }
    }
  }
  return filters;
};

/**
 * Serializes filters and sort into a new URLSearchParams, preserving all
 * existing params that are not filter/sort related.
 */
export const buildParamsWithFilters = (currentParams, filters, sortBy) => {
  const newParams = new URLSearchParams();
  for (const [key, value] of currentParams.entries()) {
    if (!key.startsWith('f.') && key !== 'sort') {
      newParams.append(key, value);
    }
  }
  if (sortBy) {
    newParams.set('sort', sortBy);
  }
  for (const [field, values] of Object.entries(filters)) {
    for (const value of values) {
      if (value !== null && typeof value === 'object' && value.min !== undefined) {
        newParams.append(`f.${field}`, `${value.min}:${value.max}`);
      } else {
        newParams.append(`f.${field}`, value);
      }
    }
  }
  return newParams;
};
