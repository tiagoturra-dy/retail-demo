---
schema: "design-tokens/v1"
name: "Blueberry Retail Demo Design System"
description: "Implementation rules and verified design tokens from the Blueberry sales-demo Figma file and React codebase."

design_tokens:
	source:
		figma_file: "6UiGrOy0icgckJaCtBqFMN"
		figma_page: "Design"
		inspected_nodes:
			- "12:1860"
			- "119:5804"
			- "12:602"
			- "112:2464"
	colors:
		background_primary: "#FFFFFF"
		background_subtle: "#F2EDEE"
		surface_muted: "#DED9DA"
		text_primary: "#161616"
		text_secondary: "#847F80"
		border_default: "#DED9DA"
		brand_primary: "#501122"
		brand_secondary: "#154130"
		success: "#26A148"
		warning: "#FDB022"
		error: "#D1AE28"
		disabled: "#9D9EA1"
	typography:
		family_primary: "Montserrat"
		weights: [300, 400, 500, 600, 700, 800, 900]
		page_heading:
			font_size: "2.25rem"
			line_height: "2.5rem"
			font_weight: 700
		product_text:
			font_size: "16px"
			line_height: "1.3"
		utility_label:
			font_size: "12px"
			line_height: "16px"
			font_weight: 500
			text_transform: "uppercase"
	spacing:
		base: "4px"
		scale: ["4px", "8px", "16px", "32px", "64px"]
		implementation_page_gutters:
			desktop: "40px"
			tablet: "24px"
			mobile: "16px"
	radius:
		primary_button: "8px"
		icon_button: "9999px"
		swatch: "32px"
	layout:
		desktop_canvas: "1280px"
		home_content_width: "1216px"
		home_gutter: "32px"
		footer_content_width: "1152px"
		footer_gutter: "64px"
		offer_bar_height: "44px"
		main_menu_height: "104px"
		category_tabs_height: "56px"
		listing_card_width: "298px"
		listing_card_gap: "8px"
	components:
		product_card:
			image_ratio: "240:336"
			image_fit: "cover"
			detail_gap: "16px"
			swatch_size: "24px"
			wishlist_size: "32px"
			add_to_bag_height: "40px"
		primary_button:
			background: "#161616"
			foreground: "#FFFFFF"
			border: "1px solid #161616"
			horizontal_padding: "24px"
			vertical_padding: "8px"
---

# Design System

Use the Figma retail UI language: white surfaces, black primary text and controls, crimson purchase labels, image-led product content, and compact uppercase utility labels. Reuse `src/index.css` tokens and CSS Modules where they match the design.

# Design source

- Figma reference: [CD-446 | New "Blueberry" sales-demo-site-design](https://www.figma.com/design/6UiGrOy0icgckJaCtBqFMN/CD-446-%7C-New-%22Blueberry%22-sales-demo-site-design?node-id=0-1&p=f&t=EvxmHajNxnUd0kYy-0), `Design` page (`0:1`).
- Inspected Figma frames: desktop home (`12:1860`), desktop category listing (`119:5804`), desktop menu (`12:602`), and product card (`112:2464`).
- Implementation reference: `src/index.css`, `src/components/`, and component-local `*.module.css` files.
- Shared UI: `Navbar`, `Footer`, `ProductCard`, `AddToCartButton`, `CustomSelect`, `ListingPage`, filter components, pagination, overlays, and icons under `src/icons/`.

Figma is the visual authority for frames it defines. Existing components remain the behavior and integration authority. Preserve their behavior, then make the smallest visual change needed to match the relevant frame.

Verified differences: the Figma desktop header has a 44px offer bar, 104px main menu, and 56px category tab row; current `Navbar` is a single 5rem sticky bar. Figma product imagery uses `object-fit: cover` at a 240:336 ratio; current `ProductCard` uses `object-fit: contain`, `mix-blend-mode: multiply`, and a 3:4 ratio. Figma product cards include swatches, demand text, and a crimson `Popular` label; current cards instead include brand, rating, and cart controls. Do not change these existing behaviors without a task that calls for Figma alignment.

# Foundations

## Colors

Use these existing semantic tokens from `src/index.css`:

- `background-primary`: `--color-white` (`#FFFFFF`).
- `background-subtle`: `--color-snow` (`#F2EDEE`) or `--color-grey-100` (`#FCF7F8`).
- `surface-muted`: `--color-grey-200` (`#DED9DA`).
- `text-primary`: `--color-black` / `--color-grey-800` (`#161616`).
- `text-secondary`: `--color-grey-500` (`#847F80`).
- `border-default`: `--color-grey-200`.
- `brand-primary`: `--color-crimson` (`#501122`).
- `brand-secondary`: `--color-emerald` (`#154130`).
- `success`: `--color-success` (`#26A148`).
- `warning`: `--color-warning` (`#FDB022`).
- `error`: `--color-error` (`#D1AE28`).
- Figma disabled text: `#9D9EA1`.
- Figma product-label surface: `#F2EDEE`; Figma demand surface: `#FCF7F8`.

Use white text on black or crimson action surfaces. Figma does not define an emerald visual role in the inspected frames; use emerald only for existing behavior until a Figma frame supports it. Reuse existing opacity overlays for image text. Avoid adding equivalent raw hex values.

## Typography

- Main family: `Montserrat`, exposed as `--font-master`, `--font-display`, `--font-logo`, `--font-sans`, and `--font-body`.
- Display styles use `--font-display`; product and navigation text use the main family.
- Existing weights: 300, 500, 700, 800, and 900. Existing components also use 400 and 600 where needed.
- Page headings: 2.25rem / 2.5rem, weight 700. Large promotional headings reach 3rem.
- Section titles: 1.875rem to 2.5rem, weight 700.
- Product names and body: 1rem / 1.25rem. Supporting text: 0.875rem / 1.25rem. Utility labels: 0.625rem to 0.75rem, usually uppercase.
- Use normal tracking unless an existing uppercase label uses 0.03em to 0.05em. Existing social headings use -0.03em; do not extend this value as a general rule.

## Spacing

Use a 4px base. Figma variables and components verify 4px, 8px, 16px, 32px, and 64px steps. Existing implementation also uses 12px, 24px, 40px, and larger page-section gaps.

- Control internals: 0.25rem to 0.75rem gaps and padding.
- Component groups: 0.5rem to 1.5rem gaps.
- Section groups: 3rem to 5rem vertical gaps.
- Page gutters: `--app-page-padding-x`: 40px desktop, 24px at 1024px and below, 16px at 640px and below.

## Radius

- Square editorial controls and dropdowns: 0.
- Small controls and payment badges: 0.25rem to 0.5rem.
- Standard controls: 0.5rem.
- Image cards: 1rem to 1.5rem where the existing component uses them.
- Large promotional media: 3rem.
- Pills, icon buttons, badges, and avatar-like controls: `9999px`.

Do not normalize these contexts into one radius value.

## Borders

- Default dividers and menu borders: 1px solid `--color-grey-200`.
- Bordered select controls: 1px solid `--color-grey-400` or the existing local neutral value.
- Footer separators: 1px solid low-opacity white.
- No shared focus token is implemented. New controls MUST retain a visible keyboard focus state without removing browser focus unless a replacement is supplied.

## Shadows and elevation

- Menus and dropdowns use moderate black shadows.
- Product cards do not use a default outer shadow.
- Use shadows only for floating menus, overlays, and temporary elevated controls. No shared elevation scale exists.

# Layout

- The Figma desktop canvas is 1280px wide. Home content uses 32px gutters and a 1216px inner width; footer content uses 64px gutters and a 1152px inner width.
- The document root owns current implementation gutters through `--app-page-padding-x`.
- Header and footer extend through the gutters with negative horizontal margins.
- Shared content containers commonly center with auto margins. Use the Figma 1216px desktop content width for matching home and listing frames; do not make it a global constraint without confirming a target frame.
- Figma desktop chrome is 44px offer bar, 104px main menu, and 56px category tabs. Current sticky header is 5rem high.
- Figma listing grids use four 298px cards with 8px gaps inside a 1216px row. Current listing grids use two columns by default and five columns at 1280px and above, with a 2rem gap.
- Desktop mega menus use a 12-column grid; primary links span eight columns and featured content spans four.
- Search overlay content caps at 1282px; wide screens can use 70% width. This rule belongs to the search overlay, not general page content.
- Product imagery uses a 3:4 aspect ratio. Feature tiles use 4:5 or 3:4. Promotional media is a fixed-height 25rem component.

# Responsive behavior

- Base mobile behavior is generally a single-column stack.
- At 640px, gutters often increase from 1rem to 1.5rem and footer link columns may become rows.
- At 768px, listing image-filter headers stack below this width; search changes from one column to a 220px-345px side column plus results; home tiles change to three columns; social tiles change from two to three columns.
- At 1024px, desktop navigation appears; footer becomes horizontal; feature tiles use four columns; page gutters become 2rem inside local containers.
- At 1280px, listing grids use five columns. At 1440px, the search overlay can use its constrained wide layout.
- Mobile navigation is an animated off-canvas panel. Do not infer other mobile behavior not implemented in the source.

# Components

## ProductCard

Purpose: show a product in listings, search, recommendations, and compact carousels.

Variants: current implementation has default and `compact`; Figma defines desktop, label visibility, and state variants.

Figma anatomy: 240:336 image region, 16px gap to 16px product name and price, 24px color swatches, optional 32px circular wishlist action, demand label, optional 40px add-to-bag action, and a crimson 12px `Popular` label. Current anatomy uses 3:4 imagery, optional brand and rating, wishlist, price, and cart action.

States: default, hover image zoom, hover product-name underline, compact, and add-to-cart feedback. Figma also specifies visible or hidden label and add-to-bag states. Use Figma `object-fit: cover` only when implementing a Figma-matched card; otherwise preserve current product-image behavior.

Reuse: `src/components/ProductCard/ProductCard.jsx`.

## CustomSelect

Purpose: styled selection controls for sort and similar bounded option lists.

Variants: `default`, `pill`, `ghost`, and `bordered`.

Anatomy: optional label and icon, selected value, optional chevron, listbox dropdown, and selected option.

States: closed, open, option hover, selected option. Existing implementation does not define keyboard option navigation; do not copy this omission into new controls.

Sizing: default control padding is 0.5rem by 0.75rem. Pill height is 40px. Bordered height is 2.25rem.

Reuse: `src/components/CustomSelect/CustomSelect.jsx`.

## Global navigation

Purpose: persistent route and utility navigation.

Anatomy: sticky 5rem header, centered logo on mobile, desktop utility icons, cart badge, search overlay trigger, and off-canvas mobile menu.

States: sticky base, hover icon surface, open mobile menu, open mini-cart, and preview notification. Icons are compact 1.25rem controls with pill hover backgrounds.

Reuse: `src/components/Navbar/Navbar.jsx`.

## Search overlay

Purpose: full-screen search and recommendation surface.

Anatomy: fixed dimming layer, white content panel, query area, suggestions, and product results.

Behavior: desktop uses a constrained panel with a two-column search layout; mobile fills available viewport space. Preserve its 5rem header offset.

Reuse: `src/components/SearchOverlay/`.

## Footer

Purpose: global informational links, newsletter form, payment marks, and currency controls.

Anatomy: black full-width surface, logo and payment row, link groups, newsletter form, and separated bottom region.

Behavior: stack on mobile; arrange primary groups horizontally at 1024px and above.

Reuse: `src/components/Footer/`.

# Buttons

- Icon button: black icon, 0.5rem padding, pill radius, light-gray hover surface. Use for header utility actions.
- Figma primary button: black `#161616` background and 1px border, white uppercase 16px medium text, 24px horizontal and 8px vertical padding, 8px radius, and 40px height. Current product-card purchase action is crimson with a smaller label; use the matching target-frame rule.
- Crimson labels: `#501122` background, white 12px uppercase text, 2px vertical padding, 6px left and 8px right padding.
- Dark icon cart action: black surface, white icon, pill radius; its hover changes to emerald and raises by 1px.
- Inverse promotion action: white surface with dark text, bold weight, pill radius, 1rem by 2rem padding.
- Text action: no background, often underline with offset, for low-emphasis actions.

Reuse `AddToCartButton` for cart actions. Use Lucide or existing local icons. Preserve button labels or `aria-label` values.

# Forms

- Use visible labels where space permits. `CustomSelect` keeps its label outside non-bordered variants.
- Inputs use the main font and 0.5rem by 0.75rem padding in the footer pattern.
- Default form borders vary by component; reuse the closest existing control instead of creating a new baseline.
- Selected dropdown options use a dark surface with white text.
- Validation, error display, textarea, checkbox, radio, and switch design treatments are not defined consistently. Do not invent a shared pattern without a design source.

# Navigation

- Use `Navbar` for global navigation and `Footer` for global lower navigation.
- Use semantic `<nav>` and `aria-label` for breadcrumbs.
- Breadcrumbs are 0.75rem uppercase text. Current location is black; route links use secondary gray and underline on hover.
- Use the existing `Pagination` component for paginated lists. Its full visual specification is not documented here because its CSS was not inspected.

# Cards and content containers

- Product cards are unframed; image regions, text blocks, and actions form the visual grouping.
- Image-led tiles use overflow clipping, cover images, a dark bottom gradient, and text over the image.
- Muted editorial blocks use a near-white or light-gray surface rather than a standard card shadow.
- Floating menus and dropdowns use white surfaces, fine borders, and shadows.

# Icons

- Primary icon library: `lucide-react`.
- Local domain icons live in `src/icons/`, including brand, bag, Muse, camera, comparison, and payment icons.
- Common utility icon size is 1.25rem. Product rating and compact actions use 0.875rem to 1rem.
- Use current color for Lucide icons. Preserve local icon components for branded or domain-specific symbols.
- Do not add a second icon library or hand-draw an icon that Lucide or a local icon already provides.

# Imagery

- Figma product images: 240:336 container with `object-fit: cover`. Current product images: 3:4 container with `object-fit: contain`, pale neutral background, and `mix-blend-mode: multiply`. Select the rule from the component and target Figma frame; do not merge both treatments into one image style.
- Editorial and feature images: use `object-fit: cover`, overflow clipping, and hover scale around 1.05 where existing tiles use it.
- Image overlays use a black-to-transparent bottom gradient only when text sits over media.
- No global placeholder pattern is established. Use existing skeleton or empty-state patterns where available.

# Interaction states

- Hover: text links darken or underline; image tiles scale images; icon buttons gain a subtle muted surface; menus and options change background or foreground color.
- Active: the search view-all control scales down to 0.98. Other active states are unspecified.
- Selected: selected select options are dark with white text; cart count is a compact dark badge.
- Disabled: `AddToCartButton` disables during its temporary added feedback state. Other disabled treatments are unspecified.
- Loading: listing uses centered text; navbar menus include simple pulse skeletons.
- Empty: listings use a pale neutral panel, secondary text, and an underlined reset action.
- Success, warning, and error token values exist, but no shared presentation component is established.

# Accessibility

- Use semantic elements before ARIA. Buttons, links, lists, navigation, and headings must keep their native semantics.
- Every icon-only control MUST have an accessible name.
- Interactive controls MUST support keyboard use and show visible focus.
- Do not rely on color alone for selected, error, or availability state.
- Image alt text must identify useful product or editorial content. Decorative images must use an empty alt value.
- Accessibility takes priority when existing visual code lacks a state.

# Design implementation rules

1. Reuse existing components in `src/components/` before creating a new primitive.
2. Reuse `src/index.css` tokens and CSS Module patterns before hard-coding values.
3. Use native CSS nesting in CSS Modules. Keep component variables on the top-level selector.
4. Preserve established spacing, typography, and breakpoint behavior.
5. Keep normal layout in flexbox or grid. Use absolute positioning only for established overlays, badges, and media text.
6. Keep page-only styles local to the page or feature.
7. Promote a pattern only when it is reused or clearly belongs in `src/components/`.
8. Do not add a component library, icon library, font, color, radius, or shadow without design evidence.
9. Do not copy Figma-generated code blindly when a Figma source becomes available.
10. Do not sacrifice accessibility for visual matching.

# Visual validation

For UI work, inspect the closest existing component and compare against the relevant Figma frame: layout, spacing, typography, colors, alignment, dimensions, radius, states, and breakpoint behavior. Build success alone does not validate visuals. Report remaining differences, especially documented implementation/Figma differences.

# Anti-patterns

Agents MUST NOT:

- create near-duplicate shared components;
- hard-code a value when an existing token or local component rule fits;
- use inline styles for reusable visual rules when CSS Modules fit;
- introduce another UI or icon library without an explicit request;
- assume a design state or responsive behavior missing from both Figma and source;
- replace branded local icons with generic SVGs;
- remove focus or accessible names for visual reasons.

# Page composition

1. Find the closest page in `src/pages/` and component in `src/components/`.
2. Compose existing navigation, listing, product, filter, overlay, and footer primitives first.
3. Add a local page component only when no reusable component fits.
4. Promote repeated page patterns to `src/components/` only after a real second use or clear shared need.
5. Validate at the breakpoints used by the closest existing pattern.

# Unresolved design decisions

- Mobile Figma frames were not inspected. Do not infer Figma mobile measurements beyond existing source behavior.
- Color, typography, and spacing variables were inspected only where referenced by the menu and product-card contexts. Do not claim a complete Figma token inventory.
- Do not introduce a site-wide maximum width. Figma uses different desktop inner widths for home/listing (1216px) and footer (1152px).
- Focus, disabled, error, validation, checkbox, radio, switch, dialog, table, notification, and toast treatments are not consistently defined. Do not invent a shared visual system for them.
- Only source-defined responsive behavior is documented. Do not assume variants absent from the source.