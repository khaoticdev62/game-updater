# Design System Prompts for Google Stitch AI
## Vision Pro UX - The Sims 4 Updater

---

## PROMPT 1: Overall Design Theme

```
PROMPT: Apple Vision Pro Desktop Application Theme

Design a complete visual identity for a desktop application (The Sims 4 Updater)
inspired by Apple Vision Pro and tvOS 18 design language.

Requirements:
- Color Palette:
  * Primary Glass: Semi-transparent white/glass morphism (#ffffff with 10-20% opacity over blurred background)
  * Background Gradient: Deep midnight blue to dark navy gradient (smooth, subtle)
  * Text Primary: Bright white (#ffffff) for maximum contrast
  * Text Secondary: Light gray (#b0b0b0) for secondary information
  * Accent Color: Vibrant cyan/blue (#00d4ff) for interactive elements and focus states
  * Success: Vibrant green (#00ff88)
  * Warning: Bright yellow (#ffcc00)
  * Error: Bright red (#ff4444)
  * Surface: Glass panels with 15% opacity white over blurred dark background

- Visual Style:
  * Heavy use of glassmorphism (backdrop blur 12-20px)
  * Depth layers with subtle shadows and glow effects
  * Smooth rounded corners (12-16px for cards, 8px for buttons)
  * Micro-animations on every interactive element
  * Precise typography with wide letter spacing for readability
  * High contrast between elements for accessibility
  * Subtle grain texture overlay (optional, <2% opacity)

- Material Design Approach:
  * Multi-layered depth using blur, opacity, and elevation
  * Glass surfaces for primary content
  * Mesh gradient backgrounds for environments
  * Soft shadows (0 0 30px rgba(0,0,0,0.4))
  * Glow effects on accent elements (#00d4ff glow)

Generate a visual reference image showing:
1. Color swatches with their usage context
2. Glass effect layers (3-4 examples with different opacity levels)
3. Typography hierarchy (5-6 font sizes with weights)
4. Component examples: card, button, input, toggle
5. Background environment with gradient and effects
```

---

## PROMPT 2: Advanced Glassmorphism Effects

```
PROMPT: Advanced Glassmorphism Effects for Premium Desktop App

Create high-fidelity glassmorphism effect specifications for a modern desktop application
with Apple Vision Pro aesthetics.

Technical Specifications:
- Backdrop Blur Layers:
  * Ultra-blur (20px): Deep environment backgrounds
  * High-blur (16px): Modal backgrounds and overlays
  * Medium-blur (12px): Card backgrounds and panels
  * Subtle-blur (8px): Secondary panels and widgets

- Glass Panel Specifications:
  * Base opacity: 10-15% white
  * Border: 1px solid rgba(255,255,255,0.3)
  * Box-shadow: 0 0 30px rgba(0,0,0,0.4) (soft outer glow)
  * Backdrop-filter: blur(12px) saturate(180%)
  * Transform: translateZ(0) for GPU acceleration

- Lighting Model:
  * Top-left directional highlight (1px, white, 20% opacity)
  * Bottom-right shadow gradient (2px, black, 10% opacity)
  * Optional: Subtle inner glow effect (#00d4ff at 5% opacity when focused)

- Depth Perception:
  * Layer 1 (Background): Full blur, dark gradient
  * Layer 2 (Panels): Medium blur, glass effect
  * Layer 3 (Content): Slight blur, near-white glass
  * Layer 4 (Focus): Sharp, glowing accent border

Generate visual examples of:
1. Glass card on dark background (standard state)
2. Glass card with focus/hover state
3. Nested glass panels showing depth
4. Glass effect on dark vs. light content backgrounds
5. Corner radius variations (8px, 12px, 16px, 24px)
```

---

## PROMPT 3: Color Accessibility & Contrast System

```
PROMPT: High-Contrast Color System for Vision Pro Desktop App

Design a color system ensuring WCAG AAA compliance (7:1 contrast ratio) while
maintaining Apple Vision Pro aesthetic.

Specifications:
- Primary Colors:
  * Accent (Interactive): #00d4ff (Cyan) on dark background = 11:1 contrast
  * Success: #00ff88 (Bright Green) = 13:1 contrast
  * Warning: #ffcc00 (Bright Yellow) = 5.5:1 contrast (needs dark background)
  * Error: #ff4444 (Bright Red) = 8.5:1 contrast

- Text Colors:
  * Primary: #ffffff (Pure white) - 21:1 contrast on dark
  * Secondary: #b0b0b0 (Light gray) - 8.5:1 contrast on dark
  * Tertiary: #808080 (Medium gray) - 5:1 contrast (disabled states)

- Background Colors:
  * Dark Base: #0a0e27 (Very dark blue)
  * Surface Glass: rgba(255,255,255,0.08) over blur
  * Hover State: rgba(255,255,255,0.12)
  * Active State: rgba(0,212,255,0.15)

- Interactive State Colors:
  * Default: Glass surface with cyan border
  * Hover: Increased glass opacity (15%), subtle glow
  * Active/Focus: Bright cyan border (2px), inner glow
  * Disabled: Reduced opacity (8%), no glow

Generate:
1. WCAG compliance checklist for all color combinations
2. Color palette with contrast ratios labeled
3. Examples of good vs. bad contrast in UI components
4. Dark mode (primary) and light mode alternatives
5. Color-blind safe alternatives (deuteranopia, protanopia)
```

---

## Usage Notes

These three foundational prompts should be your starting point for generating:
1. **Color palette and design token reference**
2. **Glassmorphism effect samples** with different blur values
3. **Typography specimens** showing the hierarchy
4. **Component library examples** demonstrating the design language

### Recommended Generation Order
1. Run Prompt 1 (Overall Theme) first - generates comprehensive reference
2. Run Prompt 2 (Glassmorphism) - refines glass effects
3. Run Prompt 3 (Accessibility) - creates color guides and contrast documentation

### Output to Request
- PNG/SVG design token sheets
- Color palette swatches
- Glass effect reference samples
- Typography scales
- Component style guide
- Accessibility compliance documentation

---

**Next Section:** Move to `02_FOUNDATION_COMPONENTS.md` for individual component prompts
