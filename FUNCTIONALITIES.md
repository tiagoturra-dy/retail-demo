# Blueberry 2026 - Functionality Inventory

| Area | Functionality | Description | Notes |
| --- | --- | --- | --- |
| All pages | Muse notification | Shows a context-aware Shopping Muse notification overlay. | Adapts to product, search, and category context. |
| All pages | Exit intent | Shows a message or offer when a visitor signals intent to leave. | PDP can offer a follow-up with Shopping Muse. |
| All pages | Category reordering | Reorders navigation or page category lists by user affinity. | Personalization experience. |
| All pages | Inactive-tab title | Changes the browser tab title to re-engage an inactive visitor. | Copy varies by page. |
| All pages | AI trigger configuration | Routes natural-language triggers to Shopping Muse or Experience Search. | Runtime constants and regular expressions avoid an application deployment for configuration changes. |
| All pages | Global integration functions | Exposes global functions to open Muse, add items to cart, and open search. | `window.__openMuse`, `window.__addToCart`, and `window.__openSearch`. |
| All pages | Currency and locale selection | Formats prices and lets visitors choose a supported currency and locale. | Selection persists in browser storage. |
| All pages | Analytics | Sends e-commerce events to Google Analytics and records behavior with Microsoft Clarity. | Purchase events include order and cart data. |
| All pages | Configuration overlay | Provides runtime configuration and session controls for demo users. | Can reset the shopping session and cart identity. |
| All pages except cart | Added-to-cart search suggestions | Shows AI-generated follow-up search chips after adding a product. | Uses Muse or Groq, with fallback behavior. |
| All pages except cart | Image search | Lets a visitor search from an uploaded or selected product image. | Uses the default image-search experience. |
| All pages except cart | Top strip banner | Displays a personalized banner at the top of the page. | Used for promotions and free-shipping messaging. |
| All pages except cart | Bottom strip banner | Displays a personalized banner fixed to the bottom of the page. | Targets visitors without a completed purchase. |
| Navigation | Mega menu and category navigation | Provides category browsing from the primary navigation and category section. | Supports personalized category order. |
| Search | Search overlay | Opens a search drawer from navigation or `window.__openSearch`. | Supports query input, recommendations, voice input, and currency-aware pricing. |
| Search | Voice search | Captures speech for search and Shopping Muse input. | Requires browser microphone permission. |
| Search | Search results, filters, and sorting | Returns catalog results with facet filters, price range, image filters, sorting, and pagination. | Filter selections are represented in the URL. |
| Category | Category refinement | Shows AI-generated refinement chips from the current breadcrumb and category context. | Uses Muse or Groq, with fallback behavior. |
| Category | Browse configuration: beauty hot weather | Boosts sunscreen when the five-day forecast exceeds 25 degrees C or is clear. | Dynamic Yield browse configuration. |
| Category | Category listing controls | Provides category results with filters, sorting, pagination, and image-filter support. | Filter state is URL-addressable. |
| Home | Personalized inspirations | Provides intent choices, such as gift or upgrade, then calls Shopping Muse for tailored products. | Preloads the first option to speed up the demo. |
| Home | Muse banner | Fills a homepage banner slot with Shopping Muse content. | Personalization experience. |
| Home | Welcome notification | Greets first-time or returning visitors. | Targets the curious audience; Grok generates styles. |
| Home | Video look showcase | Shows a shoppable video look after scroll engagement. | Appears for visitors with relevant affinity. |
| Home | Recommendation slots | Displays two homepage recommendation carousels. | First slot uses affinity; second uses popular clothing. |
| Home | Personalized hero | Shows a homepage hero banner tailored to the visitor. | Includes mocked geo-based predictive targeting for first-time visitors. |
| Home | Category-tile reordering | Reorders visual category tiles by user affinity. | Personalization experience. |
| Home | Weather tile | Replaces a home tile based on local weather. | Weather-based content targeting. |
| Home | Weather recommendations | Filters or ranks recommendations using local weather. | Uses semantic recommendations for the strategy. |
| Product detail | Muse complete the look | Shows Shopping Muse recommendations that complement the viewed product. | PDP personalization experience. |
| Product detail | Social proof | Shows real-time view or purchase signals to build urgency and trust. | PDP personalization experience. |
| Product detail | Product recommendations | Shows a product-detail recommendation carousel. | Uses VisualML. |
| Product detail | Promotional banner | Shows a promotion on the product page. | Co-brand card offer. |
| Product detail | Wishlist | Saves products to the visitor wishlist. | Saved items appear in My Account. |
| Product detail | Product comparison | Lets visitors select products and compare product attributes. | Comparison state is managed from product cards and quick actions. |
| Cart | Cart management | Adds, removes, and changes item quantities; calculates subtotal, shipping, and total. | Cart persists locally and synchronizes with the cart API. |
| Cart | Cart API integration | Provides cart retrieval and update endpoints plus browser helper functions. | Supports Dynamic Yield Shopping Muse cart format. |
| Cart | Loyalty incentive message | Shows points earnings above checkout. | Calculated from cart subtotal to encourage loyalty enrollment. |
| Cart | Cart recommendations | Shows a recommendation slot on the cart page. | Cart personalization experience. |
| Cart | Free-shipping recommendations | Shows recommendations tied to the free-shipping threshold. | Appears only below the threshold. |
| Cart | Free-shipping content | Shows cart content that communicates free-shipping progress. | Dynamic Yield content experience. |
| Checkout | Checkout and order confirmation | Collects order details, displays totals, processes a demo checkout, and shows an order confirmation page. | Emits a purchase analytics event and clears the cart after success. |
| Checkout | Mastercard Click to Pay | Displays Mastercard Click to Pay as the checkout payment method. | Demo payment presentation. |
| Checkout | Promotion entry | Provides a promo-code input in checkout. | UI only; no discount calculation is implemented. |
| Authentication | Login and returning-customer flow | Supports sign-in and routes returning visitors to their personalized welcome view. | Authentication state protects My Account. |
| My Account | Wishlist and personalized content | Shows saved items, continue-shopping offers, and gift ideas. | Requires a signed-in visitor. |
| Welcome page | Search suggestions | Shows search terms based on recent views or purchases. | Displayed after login. |
| Welcome page | Next loyalty-level recommendations | Recommends products to help reach the next loyalty level. | Uses a real-time filter strategy; displayed after login. |
| Welcome page | For-you recommendations | Shows affinity-based recommendations. | Displayed after login. |
| Welcome page | Recent-purchase recommendations | Shows recently purchased products. | Displayed after login. |
| Welcome page | Recent-viewed recommendations | Shows recently viewed products. | Displayed after login. |
| Welcome page | Cross-sell recommendations | Shows products commonly purchased with recent purchases. | Displayed after login. |
| Shopping Muse | Muse home-screen recommendations | Shows recommendations on the Shopping Muse home screen. | Muse personalization experience. |
| Shopping Muse | Conversational product discovery | Provides a configurable AI shopping assistant with V1 and V2 experiences. | Supports text queries, live microphone input, suggested queries, product recommendations, comparison, and add-to-cart actions. |
| Content | Blog articles | Displays article pages from the content system. | Available at `/blog/:articleId`. |
| Administration | Demo dashboard | Provides an administrative dashboard for demo data and user inspection. | Available at `/admin`. |