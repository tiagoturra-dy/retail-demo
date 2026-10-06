# Exposed Global Functions

This document describes the global functions exposed by the retail demo application for external use (e.g., in banners, external scripts, or third-party integrations).

---

## `window.__openMuse(options)`

Opens the Shopping Muse panel with optional configuration.

### Parameters

`options` (Object) - Configuration object with the following properties:

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `query` | String | Initial search query to send to Muse | `"summer dresses"` |
| `live` | Boolean | Enable live microphone mode (captures audio input) | `true` |
| `version` | String | Force specific Muse version (`'v1'` or `'v2'`) | `'v2'` |
| `museName` | String | Custom title for the Muse panel | `"Personal Shopper"` |
| `trendingQueries` | Array<String> | List of suggested search queries to show | `["wedding dresses", "summer outfits"]` |
| `disclaimer` | Object | Custom disclaimer text and links | See example below |

### Examples

**Basic - Open Muse with a query:**
```javascript
window.__openMuse({ query: 'wedding dresses' });
```

**Open Muse with live mic enabled:**
```javascript
window.__openMuse({ 
  query: 'show me summer outfits',
  live: true 
});
```

**Force V2 version:**
```javascript
window.__openMuse({ 
  query: 'blue wedding dress',
  version: 'v2'
});
```

**Open with custom branding:**
```javascript
window.__openMuse({
  query: 'dresses',
  museName: 'AI Shopping Assistant',
  trendingQueries: ['wedding dresses', 'casual wear', 'formal gowns'],
  disclaimer: {
    text: 'Our AI assistant can make mistakes. Check product details carefully.',
    links: [
      { label: 'Terms', url: 'https://example.com/terms' },
      { label: 'Privacy', url: 'https://example.com/privacy' }
    ]
  }
});
```

**Full example (all options):**
```javascript
window.__openMuse({
  query: 'elegant dresses',
  live: true,
  version: 'v2',
  museName: 'Style Guide',
  trendingQueries: ['wedding dresses', 'cocktail wear', 'evening gowns'],
  disclaimer: {
    text: 'AI recommendations may vary. Always verify product details.',
    links: [
      { label: 'Terms of Use', url: 'https://example.com/terms' },
      { label: 'Privacy Policy', url: 'https://example.com/privacy' }
    ]
  }
});
```

**Skip welcome screen - open directly to chat:**
```javascript
// Pass any non-empty query to bypass the welcome/home screen
window.__openMuse({ query: ' ' });  // Even a space works

// Or with a greeting
window.__openMuse({ query: 'Hello' });
```

> **Note:** The welcome screen shows only when no query is provided. Pass any query string to go directly to the chat interface.

---

## `window.__addToCart(product, quantity)`

Programmatically add a product to the shopping cart.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `product` | Object | Product object with `id`, `name`, `price`, etc. |
| `quantity` | Number | Quantity to add (default: `1`) |

### Examples

**Add single product:**
```javascript
window.__addToCart({
  id: '123',
  name: 'Blue Wedding Dress',
  price: 299.99,
  sku: '0400002564079',
  image: 'https://example.com/dress.jpg'
});
```

**Add multiple quantities:**
```javascript
window.__addToCart({
  id: '456',
  name: 'Wedding Veil',
  price: 89.99,
  sku: '0400001293531'
}, 3);
```

**From a Muse product recommendation (automatically handled):**
```javascript
// When a user clicks "Add to Bag" in Muse, this is called internally
// You typically don't need to call this manually for Muse products
```

---

## `window.__openSearch(query)`

Opens the search overlay with an optional query.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | String | Search query (default: `''`) |

### Examples

**Open search overlay empty:**
```javascript
window.__openSearch();
```

**Open search with a query:**
```javascript
window.__openSearch('wedding accessories');
```

**Open search from a link or button:**
```html
<button onclick="window.__openSearch('bridal collection')">
  Search Bridal Collection
</button>
```

---

## Integration Examples

### Example 1: Banner Call-to-Action

```html
<button onclick="window.__openMuse({ query: 'Discover our wedding collection' })">
  🎀 Find Your Perfect Wedding Dress
</button>
```

### Example 2: Search Suggestion

```html
<div class="search-suggestions">
  <button onclick="window.__openSearch('summer dresses')">
    Summer Dresses
  </button>
  <button onclick="window.__openSearch('formal wear')">
    Formal Wear
  </button>
</div>
```

### Example 3: Product Page Integration

```javascript
// When user clicks "Ask AI" on product page
document.getElementById('ask-ai-btn').addEventListener('click', () => {
  const productName = document.querySelector('[data-product-name]').textContent;
  window.__openMuse({ 
    query: `Tell me more about ${productName}` 
  });
});
```

### Example 4: Checkout Upsell

```javascript
// Offer Muse assistance during checkout
window.__openMuse({
  query: 'What accessories would match this dress?',
  museName: 'Styling Assistant',
  live: false,
  trendingQueries: ['Accessories', 'Matching Shoes', 'Jewelry']
});
```

### Example 5: Mobile Voice Search

```javascript
// Mobile-optimized with live mic
if (isMobileDevice()) {
  window.__openMuse({
    live: true,
    query: '',
    museName: 'Voice Shopping'
  });
}
```

---

## Notes

- All functions are available globally on the `window` object
- Functions work regardless of page route
- URL parameters for Muse version (`?museVersion=v1` or `?museVersion=v2`) override the `version` option
- The Muse panel respects the global `REACT_APP_MUSE_VERSION` environment variable when no version is explicitly set
- Live microphone mode requires user permission and works best in modern browsers
