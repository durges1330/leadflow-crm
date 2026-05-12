# Design Brief: AI-Powered CRM

**Aesthetic**: Professional SaaS — refined minimalism inspired by HubSpot and Zoho CRM. Enterprise credibility with modern simplicity.

**Tone**: Trustworthy, sophisticated, data-focused. Clean hierarchy and visual clarity for high-cognitive-load tasks (lead management, pipeline tracking, decision-making).

## Palette (Light / Dark)

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| Primary | #4f46e5 (Indigo) | #6366f1 (Indigo-light) | CTAs, active states, primary brand |
| Secondary | #64748b (Slate) | #94a3b8 (Slate-light) | Secondary actions, muted text |
| Accent | #10b981 (Emerald) | #34d399 (Emerald-light) | Success, qualified leads, conversions |
| Destructive | #ef4444 (Red) | #f87171 (Red-light) | Warnings, errors, lost deals |
| Warning | #f59e0b (Amber) | #fbbf24 (Amber-light) | Pending, attention required |
| Background | #f8f9fb | #0f172a | Page background |
| Card | #ffffff | #1e293b | Elevated surfaces |
| Sidebar | #1e293b | #0f172a | Navigation |

## Typography

| Layer | Font | Usage |
| --- | --- | --- |
| Display | GeneralSans, 700–900 weight | Page titles, KPI labels, Kanban headers |
| Body | Inter, 400–600 weight | Body text, form labels, data values |
| Mono | GeistMono, 400–500 weight | Metrics, code blocks, timestamps |

## Structural Zones

| Zone | Light | Dark | Detail |
| --- | --- | --- | --- |
| Header | #f8f9fb + subtle bottom border | #0f172a + border | Search, notifications, user menu |
| Sidebar | #1e293b + deep hierarchy | #0f172a + deep hierarchy | Nav items, active state with indigo highlight |
| Content | #f8f9fb cards on background | #0f172a cards on background | Kanban columns, data tables, forms |
| KPI Cards | #ffffff + left border accent | #1e293b + left border accent | Metric containers with colored top-left border |
| Footer | #f1f5f9 + top border | #334155 + top border | Pagination, credits, status |

## Shape Language

- **Radius**: 8px default; 4px for compact table cells; 12px for modals; full (9999px) for pills/badges
- **Shadows**: Subtle 2-layer system — base layer 4px blur @ 5% dark, elevated @ 12% dark
- **Borders**: 1px solid on cards, 2px top accent on KPI; 1px separator lines on tables

## Component Patterns

- **Buttons**: Primary (solid indigo), Secondary (outline), Destructive (red), Ghost (transparent hover)
- **Cards**: White/card-colored with 1px border, subtle shadow; KPI variant with colored left border
- **Inputs**: Flat style, border-focus only, no background change
- **Tables**: Alternating row backgrounds (muted @ 40%), sticky headers, 4px border-radius on cells
- **Kanban**: Card-based with 8px radius, shadow on drag, drag handles, stage labels with primary color

## Motion

- **Transitions**: 200ms cubic-bezier(0.4, 0, 0.2, 1) for hover/focus/state changes
- **Drag**: 150ms ease-out for Kanban card position changes
- **Entrance**: 300ms fade-in on page load, staggered 100ms per card
- **Micro**: No gratuitous animation; purposeful emphasis only (e.g., save confirmation pulse)

## Differentiation

Sidebar-forward navigation with deep visual separation (dark sidebar, light content). Colored accent borders on KPI and Kanban cards create visual rhythm and guide attention to key data. Mono font for numeric values builds data credibility. Professional chart palette (indigo → emerald → amber → red) follows the brand system and industry conventions.

## Constraints

- No gradients on backgrounds (depth via shadows and layering only)
- No drop shadows heavier than 12% opacity
- Sidebar text always light on dark; never reverses
- All interactive elements min 44px touch target
- Forms favor flat inputs over underline style
- Data tables prioritize density and scannability over decoration
