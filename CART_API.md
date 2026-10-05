# Cart Management API

This document describes the cart management API implementation for Dynamic Yield Shopping Muse integration.

## Overview

The cart management API provides endpoints to externally manage shopping carts in compliance with Dynamic Yield's Shopping Muse specification. The API supports cart retrieval, updates, and automatic synchronization from the React frontend.

## API Endpoints

### Health Check

**Endpoint:** `GET /api/health`

**Purpose:** Verify service connectivity

**Response:**
```json
{
  "status": "ok"
}
```

**HTTP Status:** `200 OK`

---

### Get Cart

**Endpoint:** `GET /api/carts/{id}`

**Purpose:** Retrieve a cart by ID

**Parameters:**
- `id` (path parameter): The cart ID

**Headers:**
- `x-api-key` (optional): API key for authentication

**Response:**
```json
{
  "cart_id": "cart_12345",
  "line_items": [
    {
      "id": "line_123",
      "item": {
        "id": "SKU_123"
      },
      "quantity": 1,
      "price": {
        "amount": "129.00",
        "currency": "USD"
      }
    }
  ],
  "total_estimate": {
    "amount": "129.00",
    "currency": "USD"
  }
}
```

**HTTP Status:**
- `200 OK` - Cart found
- `401 Unauthorized` - Invalid API key
- `404 Not Found` - Cart does not exist
- `500 Internal Server Error` - Server error

---

### Update Cart

**Endpoint:** `PUT /api/carts/{id}`

**Purpose:** Update cart contents

**Parameters:**
- `id` (path parameter): The cart ID

**Headers:**
- `x-api-key` (optional): API key for authentication
- `Content-Type: application/json`

**Request Body:**
```json
{
  "line_items": [
    {
      "item": {
        "id": "SKU_123"
      },
      "quantity": 1,
      "price": {
        "amount": "129.00",
        "currency": "USD"
      }
    }
  ]
}
```

**Response:**
Same structure as Get Cart endpoint - returns the updated cart state.

**HTTP Status:**
- `200 OK` - Cart updated successfully
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Invalid API key
- `500 Internal Server Error` - Server error

---

## Environment Configuration

### Optional Environment Variables

Add the following to your `.env` file for API key authentication:

```env
CART_API_KEY=your-secure-api-key-here
```

### Client Configuration

Add the following to your `.env` file (or `.env.local` for development):

```env
REACT_APP_CART_API_KEY=your-secure-api-key-here
```

**Note:** Ensure the same API key is used on both client and server for authenticated requests.

---

## Client-Side Integration

### Window Functions Exposed

#### `__getCartApi()`
Returns cart data in the Dynamic Yield Shopping Muse format.

```javascript
const cartData = window.__getCartApi();
// Returns:
// {
//   cart_id: "unique-cart-id",
//   line_items: [...],
//   total_estimate: { amount: "...", currency: "USD" }
// }
```

#### `__syncCartToApi()`
Manually sync cart to the API. Automatically called when cart changes.

```javascript
await window.__syncCartToApi();
```

#### `__getCartInfo()`
Returns React app's internal cart format (with item names).

```javascript
const cartInfo = window.__getCartInfo();
// Returns:
// {
//   cartId: "...",
//   items: [...],
//   quantity: number,
//   price: number,
//   subtotal: number,
//   total: number
// }
```

### Session Storage

The cart ID is automatically stored in `sessionStorage`:

```javascript
const cartId = sessionStorage.getItem('cart_id');
```

---

## Cart Synchronization Flow

1. **Initialization:** Cart ID is generated (nanoid) and stored in both localStorage and sessionStorage
2. **Local Updates:** When user adds/removes items or updates quantities in the React app:
   - Cart is updated in React state
   - Saved to localStorage
   - Auto-synced to API via `PUT /api/carts/{id}`
3. **Cart ID Reset:** When user clears session data in Configuration overlay:
   - New cart ID is generated
   - Both storage locations updated
   - Session effectively reset

---

## Product ID Mapping

The cart system preserves Dynamic Yield SKUs as product identifiers. When updating carts:

- Input: `item.id` = Dynamic Yield SKU (e.g., `"28125559226446"`)
- Stored as: `"28125559226446"`
- Returned in responses: `"28125559226446"`

If your commerce platform uses different identifiers:
- Map between Dynamic Yield SKU and platform identifier at the API layer
- Always return the Dynamic Yield SKU to Shopping Muse

Example (Shopify):
```
Dynamic Yield SKU: 28125559226446
Shopify ID: gid://shopify/ProductVariant/28125559226446
API maps and returns: 28125559226446
```

---

## Security Recommendations

✓ **HTTPS Only:** API endpoints are exposed over HTTPS in production  
✓ **API Key Validation:** Server validates `x-api-key` header on protected routes  
✓ **Server-Side Credentials:** Keep commerce platform credentials server-side only  
✓ **Cart ID Redaction:** Redact sensitive platform-specific cart ID components from logs  
✓ **Opaque Cart IDs:** Preserve complete cart IDs when passing between systems  
✓ **Source of Truth:** Commerce platform remains source of truth for cart state  

---

## Example Usage

### JavaScript/Fetch
```javascript
// Get cart
const response = await fetch('/api/carts/cart_12345', {
  method: 'GET',
  headers: {
    'x-api-key': 'your-api-key'
  }
});
const cart = await response.json();

// Update cart
const updateResponse = await fetch('/api/carts/cart_12345', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key'
  },
  body: JSON.stringify({
    line_items: [
      {
        item: { id: 'SKU_123' },
        quantity: 1,
        price: { amount: '129.00', currency: 'USD' }
      }
    ]
  })
});
const updatedCart = await updateResponse.json();
```

### cURL
```bash
# Health check
curl -X GET http://localhost:5000/api/health

# Get cart
curl -X GET http://localhost:5000/api/carts/cart_12345 \
  -H "x-api-key: your-api-key"

# Update cart
curl -X PUT http://localhost:5000/api/carts/cart_12345 \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "line_items": [
      {
        "item": {"id": "SKU_123"},
        "quantity": 1,
        "price": {"amount": "129.00", "currency": "USD"}
      }
    ]
  }'
```

---

## Implementation Notes

### Current Storage

The current implementation uses in-memory storage (`cartStore` object) suitable for development and testing. For production:

1. **Connect to your e-commerce platform:** Replace in-memory store with API calls to your commerce system
2. **Validate inventory:** Check product availability and inventory levels during updates
3. **Persist state:** Store carts in your database with proper TTL (time-to-live)
4. **Implement cart recovery:** Allow users to resume abandoned carts

### Modification Points

In `api/index.js`, modify the cart endpoints:

```javascript
// Replace in-memory storage
const cartStore = {};

// With your e-commerce platform API calls
// Example: Shopify, WooCommerce, Custom Platform
```

---

## Troubleshooting

### Cart not syncing
- Check browser console for sync errors
- Verify API endpoint is accessible
- Check `x-api-key` header if authentication is enabled
- Ensure cart has items (empty carts don't sync)

### Cart ID issues
- Cart ID persists across page reloads (stored in localStorage)
- Cart ID resets when user clears session data via Configuration overlay
- Check sessionStorage for current cart ID: `sessionStorage.getItem('cart_id')`

### API key errors
- Ensure `CART_API_KEY` environment variable is set on server
- Ensure `REACT_APP_CART_API_KEY` environment variable is set in client `.env`
- Keys must match exactly
- Restart both server and dev server after changing `.env` files

---

## References

- [Dynamic Yield Shopping Muse Documentation](https://dy.dev/docs/integrate-cart-management-and-checkout-initiation-in-shopping-muse)
- [API Response Format Specification](https://dy.dev/docs/integrate-cart-management-and-checkout-initiation-in-shopping-muse#cart-management)
