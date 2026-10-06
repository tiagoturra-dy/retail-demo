# Shopping Muse V2 Implementation Guide

## Overview

Shopping Muse now supports two versions controlled via environment variables:
- **V1**: Legacy chat interface (existing implementation)
- **V2**: Enhanced interface with multi-product selection, quick actions, and comparison table

## Environment Configuration

To switch between versions, set the `REACT_APP_MUSE_VERSION` environment variable in `.env`:

```bash
# Use V1 (default)
REACT_APP_MUSE_VERSION=v1

# Use V2 (new features)
REACT_APP_MUSE_VERSION=v2
```

## New Features in V2

### 1. Multi-Product Selection
- Users can click on products to select/deselect them
- Selected products show a visual badge
- Selection count displayed in the quick actions bar

### 2. Quick Actions Bar
The quick actions bar appears when products are selected:
- **Compare**: Compare 2+ selected items (opens comparison table)
- **Find Similar**: Find similar items for 1+ selected products
- **Ask Me**: Ask the AI about 1+ selected items

### 3. Product Comparison Table
- Side-by-side comparison of product attributes
- Attributes: Price, Stock, Material, Color, Size, Brand, Rating, Description
- Sticky header for easy scrolling
- Mobile-responsive design

### 4. Cart Management
- `cartId` is automatically included in API requests
- Selected products can be added to cart via checkout button
- Cart state is managed through CartContext

### 5. Quick Actions Integration
- Actions trigger AI responses about selected products
- Comparison data automatically extracted from selected products
- Cart integration for seamless checkout flow

## File Structure

### New Components
```
src/components/
├── ProductComparisonTable/
│   ├── ProductComparisonTable.jsx
│   └── ProductComparisonTable.module.css
└── QuickActionsBar/
    ├── QuickActionsBar.jsx
    └── QuickActionsBar.module.css
```

### New Page Component
```
src/pages/ShoppingMuse/
├── ShoppingMuseV2.jsx          # Main V2 component
├── ShoppingMuseV2.module.css   # V2 styles
└── ShoppingMuse.jsx            # Updated with version wrapper
```

### New Helpers
```
src/helpers/
└── comparisonHelper.js         # Comparison data generation utilities
```

### API Updates
```
api/index.js
└── /api/muse/v2 (POST)         # V2 endpoint with cart & selection metadata
```

## API Endpoints

### V1 Endpoint (Legacy)
```
POST /api/muse
Body: { bodyData: { ...muse request } }
```

### V2 Endpoint (New)
```
POST /api/muse/v2
Body: {
  bodyData: { ...muse request },
  cartId: "string",
  selectedProducts: [
    { id: "product-1", name: "Product", sku: "SKU001" },
    ...
  ]
}

Response includes:
{
  ...museResponse,
  metadata: {
    version: "v2",
    cartId: "string",
    selectedProductsCount: number,
    timestamp: "ISO8601"
  }
}
```

## Component API

### ShoppingMuseV2
Main V2 component. Handles:
- Multi-product selection state management
- Quick actions handling (compare, find similar, ask)
- Comparison table display
- Checkout redirect
- Cart integration

### QuickActionsBar
Props:
- `selectedProducts`: Array of selected product objects
- `onCompare(products)`: Callback when Compare button clicked
- `onFindSimilar(products)`: Callback when Find Similar button clicked
- `onAskAbout(products)`: Callback when Ask Me button clicked

### ProductComparisonTable
Props:
- `products`: Array of products to compare
- `onClose()`: Callback to close comparison view
- `onProductClick(product)`: Callback when product clicked

## Helpers

### comparisonHelper.js
- `generateComparisonData(products)`: Extract comparison table data
- `getProductAttributes(product)`: Get standardized product attributes
- `filterProductsByAttribute(products, attr, value)`: Filter products by attribute

## Usage Examples

### Switching to V2
1. Edit `.env` file
2. Change `REACT_APP_MUSE_VERSION=v2`
3. Restart development server

### Adding Products to Compare
```javascript
// In ShoppingMuseV2 component
handleProductSelect(product);  // Toggle selection
```

### Custom Quick Actions
Edit `ShoppingMuseV2.jsx` to add custom handlers:
```javascript
const handleCustomAction = useCallback(() => {
  const names = selectedProducts.map(p => p.name).join(', ');
  const query = `Custom action for: ${names}`;
  handleSendMessage(query);
}, [selectedProducts]);
```

## Styling

Both components use CSS Modules with:
- Nested CSS support (as per project conventions)
- Mobile-responsive design (breakpoints at 768px, 640px)
- 2-space indentation
- Consistent color scheme with project

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (iOS Safari, Chrome Mobile)
- Embla Carousel for product carousel
- Framer Motion for animations

## Future Enhancements

- Add to cart directly from comparison table
- Share comparison results
- Save comparison for later
- Advanced filtering in comparison
- Product attribute customization
- A/B testing framework

## Troubleshooting

### V2 not showing
- Check `REACT_APP_MUSE_VERSION` is set to `v2`
- Rebuild dev server: `npm run dev`
- Clear browser cache

### Comparison table not working
- Ensure products have standard attributes
- Check browser console for errors
- Verify product data structure

### Cart not syncing
- Ensure `cartId` is present in CartContext
- Check API endpoint `/api/muse/v2` is responding
- Verify `REACT_APP_CART_API_KEY` is configured

## Testing

Run tests to ensure both versions work:
```bash
# Full suite
npm test

# Watch mode
npm test -- --watch
```

## Deployment

1. Set `REACT_APP_MUSE_VERSION=v2` in production `.env`
2. Deploy backend with updated `api/index.js`
3. Deploy frontend with new components
4. Verify cart sync works in production
5. Monitor analytics for engagement metrics
