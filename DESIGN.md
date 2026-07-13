# DESIGN.md: X (Twitter)

## Source
- URL: https://x.com
- Capture date: 2026-07-13
- Evidence: Web search from refero.design, brand-atoms.com, design-md repos, coloracci.ai

## Design Summary
X (formerly Twitter) is a ruthlessly minimal, content-first real-time conversation surface. The UI dissolves into the background so text and media carry the experience. Dark mode (pure black `#000000`) is default. One chromatic accent (X Blue `#1D9BF0`) appears only on interactive elements. Hairline borders replace shadows. Flat surfaces, compact density, system fonts.

## Design Tokens

### Colors

#### Dark Mode (default)
| Token | Hex | Usage |
|-------|-----|-------|
| Canvas | `#000000` | Page background |
| Surface | `#16181C` | Cards, modals, widgets |
| Elevated | `#1D1F23` | Hover states, dropdowns |
| Border | `#2F3336` | Dividers, 1px hairlines |
| Text Primary | `#E7E9EA` | Body text |
| Text Secondary | `#71767B` | Handles, timestamps, metadata |
| Text Tertiary | `#536471` | Disabled labels |

#### Light Mode
| Token | Hex | Usage |
|-------|-----|-------|
| Canvas | `#FFFFFF` | Page background |
| Surface | `#F7F9F9` | Cards, sidebars |
| Elevated | `#EFF3F4` | Hover states |
| Border | `#EFF3F4` | Dividers |
| Text Primary | `#0F1419` | Body text |
| Text Secondary | `#536471` | Handles, timestamps |
| Text Tertiary | `#829AAB` | Disabled labels |

#### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| X Blue | `#1D9BF0` | Links, buttons, verified, active tab |
| Blue Hover | `#1A8CD8` | Button hover |
| Like Pink | `#F91880` | Like/heart active |
| Repost Green | `#00BA7C` | Repost active |
| Error Red | `#F4212E` | Delete, errors |
| Premium Gold | `#FFD400` | Premium indicators |

### Typography
| Role | Size | Weight | Line Height | Color |
|------|------|--------|-------------|-------|
| Body | 15px | 400 | 20px (1.33) | Text Primary |
| Display Name | 15px | 700 | 20px (1.33) | Text Primary |
| Handle/Timestamp | 15px | 400 | 20px (1.33) | Text Secondary |
| Heading Large | 23px | 700 | 28px | Text Primary |
| Heading Medium | 20px | 700 | 24px | Text Primary |
| Section Header | 17px | 700 | 22px | Text Primary |
| Action Count | 13px | 400 | 16px | Text Secondary |
| Button | 15px | 700 | 18px | White |
| Small | 12px | 400 | 16px | Text Secondary |

**Font Stack:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif

### Spacing & Layout
| Token | Value |
|-------|-------|
| Base Unit | 4px |
| Scale | 4, 8, 12, 16, 20, 24, 32, 40 |
| Max Width | 990px (3 columns) |
| Content Width | 600px |
| Card Padding | 12px 16px |
| Post Gap | 0px (1px hairline) |

### Border Radius
| Element | Value |
|---------|-------|
| Buttons | 9999px (pill) |
| Avatars | 9999px (circle) |
| Cards/Modals | 16px |
| Inputs | 4px |

### Shadows
| Token | Value |
|-------|-------|
| Subtle | rgba(0,0,0,0.03) 0px 0px 2px 0px inset |
| Floating | rgba(101,119,134,0.2) 0px 0px 8px 0px, rgba(101,119,134,0.25) 0px 1px 3px 1px |

### Key Design Rules
1. Use pure black `#000000` as default dark canvas (OLED)
2. Reserve X Blue `#1D9BF0` exclusively for interactive elements — links, buttons, verified marks, active states
3. Replace all shadows with 1px `#2F3336` (dark) / `#EFF3F4` (light) hairline borders
4. Flat card surfaces — no elevation, no shadows between posts
5. System font stack at 15px base
6. Avatar size: 40px circular, leading every post
7. Post layout: 40px avatar | 12px gap | content fills remaining width
8. Post row: flat, 1px bottom hairline, no card wrapper, no top margin
9. Action icons row: reply (blue), repost (green), like (pink), bookmark (blue)
10. No decorative gradients or purple accents — monochrome + X Blue only
