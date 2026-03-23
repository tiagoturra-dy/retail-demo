export const formatMockResponse = (products, totalNumResults) => {
  // Generate mock facets
  const categoriesFacet = {
    column: "categories",
    displayName: "Category",
    valuesType: "string",
    values: Array.from(new Set(products.flatMap(p => p.categories.split('|') || []))).map(c => ({ 
      name: c, 
      count: products.filter(p => (p.categories.split('|') || []).includes(c)).length 
    }))
  };

  return {
    choices: [
      {
        variations: [
          {
            payload: {
              data: {
                facets: [categoriesFacet],
                slots: products,
                totalNumResults: totalNumResults || products.length
              }
            }
          }
        ]
      }
    ]
  };
};