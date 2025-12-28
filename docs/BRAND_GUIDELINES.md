# Sims 4 Updater - Brand Guidelines

## Overview

The Sims 4 Updater brand identity combines modern tech aesthetics with subtle gaming references. The design philosophy emphasizes clarity, sophistication, and trustworthiness—reflecting the application's role as a reliable utility for game management.

---

## Logo System

### Primary Logo: "Cyan Crystal"

The core symbol is an isometric hexagonal crystal, inspired by the geometric beauty of The Sims' iconic plumbob while abstracted into a contemporary glass-like form. The crystalline structure suggests transparency, purity, and technological precision.

**Geometric Concept:**
- 8-facet isometric crystal
- Height-to-width ratio: 1:1.2 (slightly taller)
- Faceted surfaces with gradient depth
- Central vertical axis for balance

**Design Rationale:**
- **Crystal form** = transparency, clarity, precision (tech qualities)
- **Geometric abstraction** = modern, minimalist aesthetic
- **Subtle plumbob reference** = connection to The Sims without direct copying

---

## Color Palette

All colors extracted from the application's existing Tailwind CSS theme for consistency.

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Cyan Primary** | `#0ea5e9` | rgb(14, 165, 233) | Main crystal body, primary UI elements |
| **Blue Accent** | `#3b82f6` | rgb(59, 130, 246) | Highlights, depth layers |
| **Deep Blue** | `#1d4ed8` | rgb(29, 78, 216) | Shadows, definition lines |
| **Bright Cyan** | `#06b6d4` | rgb(6, 182, 212) | Bright reflections, accents |
| **Dark Slate** | `#0f0f0f` | rgb(15, 15, 15) | Background (primary) |

### Derived Colors

| Purpose | Hex | Usage |
|---------|-----|-------|
| **Light Glass** | `rgba(255, 255, 255, 0.05)` | Frosted glass backgrounds |
| **Medium Glass** | `rgba(255, 255, 255, 0.10)` | Glass overlays |
| **Heavy Glass** | `rgba(255, 255, 255, 0.15)` | Glass surfaces |
| **Glow Effect** | `rgba(6, 182, 212, 0.4)` | Ambient glow around logo |
| **Text Primary** | `#ffffff` | Main text (white, 100% opacity) |
| **Text Secondary** | `rgba(255, 255, 255, 0.7)` | Secondary text (70% opacity) |
| **Text Tertiary** | `rgba(255, 255, 255, 0.5)` | Muted text (50% opacity) |

### Color Relationships

**Digital Color Mode (Dark):**
```
Background: #0f0f0f (slate-950)
Primary text: #ffffff
Accent: #0ea5e9 (cyan)
Highlight: #06b6d4 (bright cyan)
Error/Warning: #ef4444 (red-500)
Success: #10b981 (emerald-500)
```

**Print Color Mode (if needed):**
```
Cyan: C=100 M=40 Y=20 K=0
Blue: C=100 M=70 Y=0 K=0
White background with metal/glass effects
```

---

## Typography

### Font Family
- **Primary:** "Inter" (open-source) or "SF Pro Display" (Apple ecosystem)
- **Fallback:** "Segoe UI", Tahoma, Geneva, Verdana, sans-serif
- **Characteristics:** Geometric, clean, modern sans-serif

### Logo Wordmark: "SIMS 4 UPDATER"

**Style Specifications:**
- **Weight:** Medium (500) or Semibold (600)
- **Case:** ALL CAPS
- **Letter Spacing:** +2 to +4 pixels (generous)
- **Color:** White (#ffffff)
- **Glow Effect:** 0 0 12px rgba(6, 182, 212, 0.4)
- **Typical Size:** 32-48px

**Example:**
```
SIMS 4 UPDATER
```

### Typography Hierarchy (for UI context)

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Display | 48px / 3rem | Bold (700) | Main headings |
| Headline | 32px / 2rem | Semibold (600) | Section titles |
| Title | 24px / 1.5rem | Semibold (600) | Component titles |
| Body | 16px / 1rem | Regular (400) | Body text |
| Caption | 14px / 0.875rem | Regular (400) | Helper text |

---

## Logo Variants

### Variant 1: Full Logo (Horizontal)

**Usage:** Installer headers, about screens, splash screens, marketing materials

**Composition:**
```
[Crystal Icon 64px] → Space (16px) → SIMS 4 UPDATER
```

**Dimensions:**
- Width: 420px
- Height: 64px
- Icon size: 64x64px
- Text size: 32px

**Layout:**
- Icon left-aligned (16px from left edge)
- Text vertically centered
- Total clearance: 16px on all sides

### Variant 2: Icon Only (Square)

**Usage:** Taskbar, desktop shortcut, system tray, favicons, Windows shortcuts

**Sizes:**
- 16×16 px (simplified, no gradient detail)
- 32×32 px (simplified, reduced facets)
- 48×48 px (standard detail)
- 64×64 px (full detail)
- 128×128 px (extra detail)
- 256×256 px (high quality)
- 512×512 px (very high quality)
- 1024×1024 px (print quality)

**Design Variations by Size:**

| Size | Detail Level | Special Notes |
|------|--------------|---------------|
| 16×16 | Minimal | Solid colors only, 4-facet design |
| 32×32 | Simplified | Reduce inner highlights, thicker strokes |
| 48×48 | Standard | Medium detail, full gradient core |
| 64×64+ | Full | All gradients, highlights, glows included |

### Variant 3: Monochrome (Single Color)

**Usage:** High-contrast scenarios, accessibility, fallback rendering

**White Version:**
- Use on dark backgrounds
- Color: #ffffff (white)
- Shadow: subtle, when needed

**Navy Version:**
- Use on light backgrounds (rare, but possible)
- Color: #1d4ed8 (deep blue from palette)
- Shadow: very subtle or none

### Variant 4: Simplified (Reduced Detail)

**Usage:** Small sizes (favicon, browser tab, 16/32px icons)

**Characteristics:**
- Remove inner facet lines
- Eliminate subtle gradients
- Use solid color fills
- Thicker stroke weights for clarity
- 4 main facets instead of 8 (upper and lower diamonds)
- High contrast between sections

---

## Clearspace & Spacing

The logo requires minimum clearance on all sides to maintain visual integrity.

### Minimum Clearance

**For full logo (icon + text):**
- All edges: 16px minimum
- Between icon and text: 12px minimum
- Internal padding within clearspace: none (clearspace is protected area)

**For icon only:**
- All edges: 8px minimum (half the full logo requirement)
- No other elements within clearspace radius

### Grid Alignment

Logo should align to 8px grids when possible:
```
Icon: 64px (aligns to 8px) ✓
Text size: 32px (aligns to 8px) ✓
Clearspace: 16px (aligns to 8px) ✓
```

---

## Dos and Don'ts

### ✅ Do

- Use the logo at the sizes specified above
- Maintain the aspect ratio (1:1.2 for crystal icon)
- Place on dark backgrounds (#0f0f0f or darker)
- Use adequate clearspace (16px minimum)
- Apply the cyan glow effect in digital contexts
- Use the full logo for major applications (installer, splash screen)
- Use icon-only variant for taskbar, shortcuts, favicons
- Maintain color fidelity from provided files
- Apply high-quality rendering (SVG or high-res PNG)

### ❌ Don't

- Rotate, skew, or distort the logo
- Change the color palette (exceptions only in grayscale)
- Add drop shadows beyond the specified glow effect
- Place on light backgrounds without adaptation
- Reduce size below 16×16 pixels
- Remove the cyan glow effect in digital contexts
- Modify the crystal geometry or proportions
- Use low-resolution versions (always use SVG or highest-res PNG available)
- Add text or additional elements inside the logo
- Apply effects like blur or transparency (except the glow filter)

---

## Application Examples

### Installer Header
```
┌─────────────────────────────┐
│ [Crystal Icon]  SIMS 4 UPDATER  │
└─────────────────────────────┘
Background: #0f0f0f with cyan gradient
```

### Splash Screen
```
        ✨ [Large Crystal Icon] ✨

        SIMS 4 UPDATER
        Initializing backend services...

        [████████░░] 80%
```

### Taskbar/Shortcut
```
[Crystal Icon] Sims 4 Updater
```

### Window Title Bar
- Icon: 16×16 or 32×32px version
- Text: "Sims 4 Updater" (regular case for window titles)

### About Dialog
```
┌──────────────────────────────┐
│  [64px Crystal Icon]         │
│                              │
│  SIMS 4 UPDATER              │
│  Version 1.0.0               │
│                              │
│  Modern game content updater │
│  for The Sims 4              │
└──────────────────────────────┘
```

---

## File Formats & Specifications

### SVG (Vector Source)
- **File:** `icon.svg`
- **ViewBox:** 0 0 512 512
- **Use Case:** Master file, infinitely scalable
- **Advantages:** Perfect quality at any size

### PNG (Raster Exports)
- **Files:** `icon-16.png` through `icon-1024.png`
- **Format:** 32-bit PNG with transparency
- **Background:** Transparent (RGBA)
- **Quality:** Maximum (no compression artifacts)
- **Use Cases:** UI elements, exports for standard sizes

### ICO (Windows Icon)
- **File:** `icon.ico`
- **Embedded Sizes:** 16, 32, 48, 64, 128, 256px
- **Format:** Multi-resolution Windows icon
- **Use Case:** Windows executables, shortcuts, system integration
- **Generation:** Automated from PNG sources using png-to-ico

### BMP (Installer Graphics)
- **Header:** `header.bmp` (150×57 px, 24-bit)
- **Sidebar:** `sidebar.bmp` (164×314 px, 24-bit)
- **Format:** Uncompressed BMP
- **Use Case:** NSIS installer customization
- **Background:** #0f0f0f with cyan gradient overlay

---

## Accessibility

### High Contrast Mode
- Icon maintains visibility and recognizability
- Monochrome white version recommended
- Minimum stroke weight: 1.5px

### Color Blindness Considerations
- Design does not rely on color alone for meaning
- Cyan and blue hues are distinguishable for most color-blind viewers
- Shape and geometry are primary identifiers
- Alternative text: "Sims 4 Updater logo" (simple description)

### Screen Reader Text
```html
<img src="logo.png" alt="Sims 4 Updater - Game Content Manager Logo">
```

---

## Asset Management

### Source Files Location
```
assets/branding/logo/
├── source/
│   ├── icon.svg              ← Master file (edit this)
│   ├── wordmark.svg
│   └── full-logo.svg
└── exports/
    ├── icon-16.png
    ├── icon-32.png
    ├── ... (through 1024)
    ├── icon.ico
    └── icon.icns
```

### Generation Workflow
1. Edit `icon.svg` in Figma/Illustrator/Inkscape
2. Run `scripts/generate-icons.js` to export all PNG sizes
3. Run `scripts/generate-ico.js` to create Windows icon
4. Commit all generated files to git
5. Run `scripts/generate-installer-assets.js` for BMP files

### Version Control
- ✅ Commit: SVG source, PNG exports, ICO file, BMP files
- ❌ Don't commit: Large PSD/AI working files (optional)

---

## Evolution & Updates

### When to Update the Logo
- Major version releases (1.0 → 2.0)
- Significant rebrand/repositioning
- Technical improvements to rendering

### How to Update
1. Create new variant in SVG source
2. Keep old version for version history
3. Test at all required sizes (16–1024px)
4. Update all asset files
5. Document changes in CHANGELOG.md

---

## Contact & Questions

For questions about logo usage, brand consistency, or asset requests:
- Check this guide first
- Review existing applications in `docs/BRAND_GUIDELINES.md` (Examples section)
- Refer to the source SVG file for technical specifications

---

## Summary Checklist

Before using the logo, verify:

- [ ] Using correct color values from palette
- [ ] Maintaining minimum clearspace (16px)
- [ ] Icon size appropriate for context (≥16px)
- [ ] Background contrast sufficient
- [ ] Glow effect applied (if digital context)
- [ ] File format correct for use case (SVG/PNG/ICO)
- [ ] No distortion or rotation applied
- [ ] Typography matches specified style (if using wordmark)
- [ ] Accessibility considerations addressed
- [ ] Brand consistency with other materials

---

**Last Updated:** December 2024
**Version:** 1.0
**Author:** KhaoticKodeDev62
