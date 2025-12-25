# Apple Vision Pro UX - Google Stitch AI Prompt Pack
## The Sims 4 Updater Desktop Application

**Project:** Sims 4 Updater (Electron + React + Python)
**Design Language:** Apple Vision Pro UI/tvOS 18 Design Principles
**Purpose:** Comprehensive AI-driven design prompts for all screens, components, and animations
**Created:** 2025-12-25

---

## TABLE OF CONTENTS
1. [Design System Prompts](#design-system-prompts)
2. [Foundation Components](#foundation-components)
3. [Interactive Components](#interactive-components)
4. [Screen-Level Designs](#screen-level-designs)
5. [Animations & Transitions](#animations--transitions)
6. [Accessibility & Polish](#accessibility--polish)

---

## DESIGN SYSTEM PROMPTS

### 1.1 Overall Design Theme
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

### 1.2 Glassmorphism Implementation
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

### 1.3 Color Accessibility & Contrast
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

## FOUNDATION COMPONENTS

### 2.1 Base Button Component
```
PROMPT: Vision Pro Style Primary Button Component

Design a primary action button following Apple Vision Pro UI principles for a desktop application.

Button Specifications:
- Default State:
  * Background: Cyan gradient (#00d4ff to #00a0ff)
  * Padding: 14px 28px (height: 48px)
  * Border-radius: 12px
  * Font: SF Pro Display, 16px, bold, white
  * Box-shadow: 0 8px 24px rgba(0,212,255,0.3)
  * Letter-spacing: 0.5px

- Hover State:
  * Background: Lighter cyan (#00e8ff)
  * Box-shadow: 0 12px 32px rgba(0,212,255,0.5)
  * Transform: scale(1.02)
  * Transition: 150ms cubic-bezier(0.34, 1.56, 0.64, 1)

- Active/Focus State:
  * Background: Darker blue (#0080ff)
  * Inner glow: inset 0 0 12px rgba(255,255,255,0.2)
  * Border: 2px solid #00d4ff
  * Box-shadow: 0 0 24px rgba(0,212,255,0.6), inset 0 0 12px rgba(255,255,255,0.1)

- Pressed State:
  * Scale: 0.98
  * Background: Saturated (#0070dd)
  * Opacity: 95%

- Disabled State:
  * Opacity: 40%
  * Cursor: not-allowed
  * Box-shadow: none

Variations to generate:
1. Large button (56px height)
2. Small button (40px height)
3. Icon button (square, 48x48px)
4. Button with icon and text
5. Loading state (spinner animation)
6. Success state (green checkmark)
7. Error state (red background)
8. Glass (transparent) button variant
```

### 2.2 Secondary Button Component
```
PROMPT: Vision Pro Style Secondary Button Component

Design secondary action buttons (less prominent than primary) following Vision Pro principles.

Button Specifications:
- Default State:
  * Background: Glass panel (rgba(255,255,255,0.08))
  * Border: 1.5px solid rgba(0,212,255,0.5)
  * Padding: 12px 24px (height: 44px)
  * Font: SF Pro Display, 15px, regular, white
  * Foreground: Cyan (#00d4ff)
  * Backdrop-filter: blur(8px)

- Hover State:
  * Background: rgba(255,255,255,0.12)
  * Border: 1.5px solid rgba(0,212,255,0.8)
  * Box-shadow: 0 0 16px rgba(0,212,255,0.2)
  * Color: #00e8ff (lighter cyan)

- Active/Focus State:
  * Background: rgba(0,212,255,0.15)
  * Border: 1.5px solid #00d4ff
  * Box-shadow: 0 0 20px rgba(0,212,255,0.4)

- Disabled State:
  * Opacity: 30%
  * Border color: rgba(255,255,255,0.2)

Generate variations:
1. Text-only secondary button (no glass background)
2. Secondary button with icon
3. Toggle button variant (selected/unselected states)
4. Destructive secondary button (red variant)
```

### 2.3 Glass Panel/Card Component
```
PROMPT: Vision Pro Glass Card Component

Design a reusable glass card/panel component for displaying content sections.

Card Specifications:
- Container:
  * Background: rgba(255,255,255,0.08)
  * Border: 1px solid rgba(255,255,255,0.2)
  * Border-radius: 16px
  * Backdrop-filter: blur(12px) saturate(180%)
  * Box-shadow: 0 0 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)
  * Padding: 24px

- Hover State (Interactive Cards):
  * Background: rgba(255,255,255,0.12)
  * Border: 1px solid rgba(255,255,255,0.3)
  * Box-shadow: 0 0 40px rgba(0,212,255,0.15)
  * Transform: translateY(-2px)
  * Transition: 200ms ease-out

- Header Area (if applicable):
  * Title: SF Pro Display, 18px, bold, white
  * Subtitle: SF Pro Display, 14px, regular, #b0b0b0
  * Divider: 1px solid rgba(255,255,255,0.1)

- Content Area:
  * Default padding: 16px
  * Text color: #ffffff (primary), #b0b0b0 (secondary)
  * Line-height: 1.6
  * Letter-spacing: 0.3px

- Variations to generate:
  1. Standard card with title and content
  2. Selectable card with checkbox
  3. Expandable/collapsible card
  4. Card with action buttons
  5. Card with progress indicator
  6. Card with status badge
  7. Nested cards (card within card)
  8. Full-width card (panel)
```

### 2.4 Input Field Component
```
PROMPT: Vision Pro Style Input Field Component

Design text input, textarea, and number input components.

Input Specifications:
- Container:
  * Background: rgba(255,255,255,0.06)
  * Border: 1.5px solid rgba(255,255,255,0.2)
  * Border-radius: 10px
  * Height: 44px
  * Padding: 12px 16px
  * Font: SF Mono, 14px, regular, white
  * Backdrop-filter: blur(8px)

- Focused State:
  * Background: rgba(255,255,255,0.1)
  * Border: 1.5px solid #00d4ff
  * Box-shadow: 0 0 0 3px rgba(0,212,255,0.2), inset 0 0 8px rgba(0,212,255,0.05)
  * Outline: none

- Hover State (non-focused):
  * Background: rgba(255,255,255,0.08)
  * Border: 1.5px solid rgba(0,212,255,0.4)

- Disabled State:
  * Background: rgba(255,255,255,0.03)
  * Border: 1.5px solid rgba(255,255,255,0.1)
  * Opacity: 50%
  * Cursor: not-allowed

- Placeholder Text:
  * Color: rgba(255,255,255,0.4)
  * Font-style: normal (no italics)

- Label (if present):
  * Font: SF Pro Display, 12px, bold, #b0b0b0
  * Margin-bottom: 8px
  * Letter-spacing: 0.5px

- Helper Text / Error:
  * Font: SF Pro Display, 12px, regular
  * Color: #b0b0b0 (helper), #ff4444 (error)
  * Margin-top: 6px

Generate variations:
1. Text input (single line)
2. Textarea (multi-line)
3. Number input with +/- buttons
4. Search input with search icon
5. Password input with show/hide toggle
6. Input with icon prefix/suffix
7. Input with dropdown suggestions
8. Disabled input state
```

### 2.5 Toggle/Switch Component
```
PROMPT: Vision Pro Style Toggle Switch Component

Design a toggle/switch component for boolean settings and preferences.

Toggle Specifications:
- Container:
  * Size: 48px (width) × 28px (height)
  * Background: rgba(255,255,255,0.08)
  * Border: 1.5px solid rgba(255,255,255,0.2)
  * Border-radius: 14px (fully rounded ends)
  * Backdrop-filter: blur(8px)
  * Cursor: pointer

- Toggle Knob (Off State):
  * Size: 24px diameter
  * Position: 2px from left edge
  * Background: rgba(255,255,255,0.3)
  * Border-radius: 50%
  * Box-shadow: 0 2px 8px rgba(0,0,0,0.2)

- Toggle Knob (On State):
  * Position: 22px from left edge (animates right)
  * Background: #ffffff
  * Box-shadow: 0 4px 12px rgba(0,212,255,0.3)

- Background (On State):
  * Background: Linear gradient to cyan (#0080ff to #00d4ff)
  * Box-shadow: 0 0 20px rgba(0,212,255,0.3)

- Animation:
  * Transition: 250ms cubic-bezier(0.34, 1.56, 0.64, 1)
  * Spring effect on toggle

- Hover State:
  * Slightly increased shadow
  * Knob size: 26px (on hover)

- Disabled State:
  * Opacity: 40%
  * Cursor: not-allowed

Generate variations:
1. Small toggle (36x20px)
2. Large toggle (56x32px)
3. Toggle with label (left/right)
4. Toggle group (multiple toggles)
5. iOS-style toggle
6. Labeled on/off toggle
```

### 2.6 Progress Bar Component
```
PROMPT: Vision Pro Style Progress Bar Component

Design progress indicators for downloads, updates, and long-running operations.

Progress Bar Specifications:
- Container:
  * Height: 4px
  * Background: rgba(255,255,255,0.1)
  * Border-radius: 2px
  * Width: 100% (or specified)
  * Border: 1px solid rgba(255,255,255,0.15)

- Progress Fill:
  * Background: Linear gradient (#00d4ff to #0088ff)
  * Border-radius: 2px
  * Height: 4px
  * Animation: smooth width transition (500ms)
  * Box-shadow: 0 0 12px rgba(0,212,255,0.4)

- Animated State (In Progress):
  * Background: Animated gradient with moving highlights
  * Glow: 0 0 16px rgba(0,212,255,0.5)
  * Animation: 2s linear loop

- Completed State:
  * Background: Bright green gradient (#00ff88 to #00cc66)
  * Box-shadow: 0 0 12px rgba(0,255,136,0.4)

- Error State:
  * Background: Bright red (#ff4444)
  * Box-shadow: 0 0 12px rgba(255,68,68,0.4)

- Label/Percentage (Optional):
  * Font: SF Mono, 12px, white
  * Positioned above/below bar
  * Real-time percentage display

Variations to generate:
1. Indeterminate progress (loading spinner style)
2. Large progress bar (8px height)
3. Circular progress indicator
4. Segmented progress (steps 1-5)
5. Progress with label and percentage
6. Nested progress bars (multi-stage)
```

### 2.7 Badge/Tag Component
```
PROMPT: Vision Pro Style Badge and Tag Components

Design badges for status indicators, tags, and labels.

Badge Specifications:
- Default Badge:
  * Background: rgba(0,212,255,0.15)
  * Border: 1px solid #00d4ff
  * Padding: 4px 12px
  * Border-radius: 6px
  * Font: SF Pro Display, 11px, bold, #00d4ff
  * Height: 24px (auto-height)

- Success Badge:
  * Background: rgba(0,255,136,0.15)
  * Border: 1px solid #00ff88
  * Color: #00ff88

- Warning Badge:
  * Background: rgba(255,204,0,0.15)
  * Border: 1px solid #ffcc00
  * Color: #ffcc00

- Error Badge:
  * Background: rgba(255,68,68,0.15)
  * Border: 1px solid #ff4444
  * Color: #ff4444

- Status Badge Variations:
  * Installed: Green checkmark badge
  * Missing: Red X badge
  * Updating: Cyan spinner badge
  * Available: Cyan arrow badge

Generate variations:
1. Small badge (compact)
2. Large badge (prominent)
3. Badge with icon
4. Badge with close button (removable)
5. Outline badge (hollow)
6. Solid badge (filled)
7. Animated badge (pulse effect)
```

### 2.8 Checkbox & Radio Button
```
PROMPT: Vision Pro Style Checkbox and Radio Button Components

Design selection controls for forms and lists.

Checkbox Specifications:
- Container:
  * Size: 20px × 20px
  * Background: rgba(255,255,255,0.08)
  * Border: 1.5px solid rgba(255,255,255,0.2)
  * Border-radius: 6px
  * Cursor: pointer

- Unchecked State:
  * Background: rgba(255,255,255,0.08)
  * Border: 1.5px solid rgba(255,255,255,0.3)

- Checked State:
  * Background: Linear gradient (#00d4ff to #0088ff)
  * Border: 1.5px solid #00d4ff
  * Box-shadow: 0 0 12px rgba(0,212,255,0.4)
  * Checkmark: White, SF Pro Display Symbol, 14px

- Hover State:
  * Border: 1.5px solid rgba(0,212,255,0.6)
  * Background: rgba(255,255,255,0.1)

- Disabled State:
  * Opacity: 40%
  * Cursor: not-allowed

- Focus State:
  * Box-shadow: 0 0 0 3px rgba(0,212,255,0.2)

Radio Button Specifications:
- Container:
  * Size: 20px × 20px
  * Border-radius: 50% (circular)
  * Similar styling to checkbox but circular

- Selected State:
  * Border: 1.5px solid #00d4ff
  * Inner circle: 8px diameter, cyan background
  * Box-shadow: 0 0 12px rgba(0,212,255,0.4)

Generate variations:
1. Checkbox in list context
2. Radio button group
3. Checkbox with label
4. Indeterminate checkbox state
5. Mixed state (checkbox group)
```

---

## INTERACTIVE COMPONENTS

### 3.1 Dropdown/Select Menu
```
PROMPT: Vision Pro Style Dropdown Menu Component

Design dropdown and select menu components.

Dropdown Specifications:
- Trigger Button:
  * Style: Glass panel button
  * Height: 44px
  * Padding: 12px 16px
  * Display: Selected item + chevron icon
  * Border: 1px solid rgba(255,255,255,0.2)
  * Border-radius: 10px

- Menu Container:
  * Background: rgba(255,255,255,0.08)
  * Border: 1px solid rgba(255,255,255,0.2)
  * Border-radius: 12px
  * Backdrop-filter: blur(12px)
  * Box-shadow: 0 8px 32px rgba(0,0,0,0.4)
  * Max-height: 300px (scrollable)
  * Margin-top: 8px (gap from trigger)

- Menu Items:
  * Padding: 12px 16px
  * Height: 40px
  * Font: SF Pro Display, 14px
  * Color: white
  * Border-bottom: 1px solid rgba(255,255,255,0.08)

- Item Hover State:
  * Background: rgba(0,212,255,0.1)
  * Color: #00e8ff
  * Left border: 3px solid #00d4ff

- Item Selected State:
  * Background: rgba(0,212,255,0.15)
  * Border-left: 3px solid #00d4ff
  * Checkmark icon: White, right-aligned

- Scrollbar (if needed):
  * Width: 6px
  * Background: rgba(255,255,255,0.1)
  * Thumb: rgba(0,212,255,0.4)
  * Rounded: 3px radius

Generate variations:
1. Single select dropdown
2. Multi-select dropdown (checkboxes)
3. Searchable dropdown
4. Dropdown with grouped items
5. Dropdown with icons
6. Color picker dropdown
7. Date picker dropdown
```

### 3.2 Modal/Dialog Component
```
PROMPT: Vision Pro Style Modal and Dialog Components

Design modal dialogs for confirmations, alerts, and user input.

Modal Specifications:
- Backdrop:
  * Background: rgba(0,0,0,0.6) (semi-transparent dark)
  * Backdrop-filter: blur(8px)
  * Z-index: 1000

- Modal Container:
  * Background: rgba(255,255,255,0.08)
  * Border: 1px solid rgba(255,255,255,0.2)
  * Border-radius: 20px
  * Backdrop-filter: blur(16px)
  * Box-shadow: 0 16px 64px rgba(0,0,0,0.6), 0 0 40px rgba(0,212,255,0.1)
  * Width: 400px (default)
  * Padding: 32px
  * Animation: Scale from center + fade in (300ms)

- Header:
  * Title: SF Pro Display, 20px, bold, white
  * Close button: Top-right, icon (X), 24px
  * Divider: 1px solid rgba(255,255,255,0.1)

- Content Area:
  * Font: SF Pro Display, 15px, white
  * Line-height: 1.6
  * Padding: 24px 0

- Footer:
  * Button group: Flex, gap 12px
  * Primary button: Cyan
  * Secondary button: Glass
  * Buttons are full-width or side-by-side depending on space

Variations to generate:
1. Alert modal (title + message + OK button)
2. Confirmation modal (title + message + Yes/No buttons)
3. Input modal (title + input field + OK/Cancel)
4. Complex modal (multiple sections)
5. Loading modal (spinner + message)
6. Error modal (red alert icon + message)
7. Success modal (green checkmark + message)
```

### 3.3 Notification Toast
```
PROMPT: Vision Pro Style Notification Toast Component

Design notification toasts for alerts and status messages.

Toast Specifications:
- Container:
  * Background: rgba(255,255,255,0.08)
  * Border: 1px solid rgba(255,255,255,0.2)
  * Border-radius: 12px
  * Backdrop-filter: blur(12px)
  * Padding: 16px 20px
  * Max-width: 350px
  * Box-shadow: 0 8px 32px rgba(0,0,0,0.4)
  * Animation: Slide in from top (300ms) + fade out (300ms)
  * Position: Top-right (default)

- Icon Area:
  * 24px × 24px icon
  * Margin-right: 12px
  * Color: Based on type (cyan, green, yellow, red)

- Text Area:
  * Title: SF Pro Display, 14px, bold, white
  * Message: SF Pro Display, 13px, regular, #b0b0b0
  * Line-height: 1.4

- Close Button (optional):
  * X icon, 16px, transparent button
  * Positioned top-right
  * Hover: opacity increase

- Type Variants:
  * Info: Cyan background tint, blue icon
  * Success: Green background tint, checkmark icon
  * Warning: Yellow background tint, warning icon
  * Error: Red background tint, X icon
  * Loading: Spinner icon, cyan tint

- Auto-dismiss:
  * Duration: 4 seconds (default)
  * Extended for errors: 6 seconds
  * Manual close available

Generate variations:
1. Simple text toast (message only)
2. Toast with icon and title
3. Toast with action button
4. Stack of toasts (multiple)
5. Long-form toast (expandable)
6. Progress toast (with progress bar)
```

### 3.4 Tooltip Component
```
PROMPT: Vision Pro Style Tooltip Component

Design tooltips for contextual help and information.

Tooltip Specifications:
- Container:
  * Background: rgba(255,255,255,0.12)
  * Border: 1px solid rgba(255,255,255,0.25)
  * Border-radius: 8px
  * Backdrop-filter: blur(10px)
  * Padding: 8px 12px
  * Box-shadow: 0 4px 16px rgba(0,0,0,0.3)
  * Font: SF Pro Display, 12px, regular, white
  * Max-width: 200px
  * Word-wrap: break-word

- Pointer/Arrow:
  * 6px triangle
  * Position: Bottom-center (default)
  * Color: Matches container background

- Positioning:
  * Default: Above element
  * Fallback: Below if space constrained
  * Margin from trigger: 8px
  * Z-index: 1001

- Animation:
  * Fade in: 150ms
  * Fade out: 100ms
  * Slight scale up effect (0.95 to 1.0)

- Variants:
  * Light tooltip (info)
  * Dark tooltip (default)
  * With icon
  * With action link

Generate variations:
1. Top tooltip
2. Bottom tooltip
3. Left tooltip
4. Right tooltip
5. Tooltip with icon
6. Tooltip with multiple lines
7. Tooltip with keyboard shortcut
```

---

## SCREEN-LEVEL DESIGNS

### 4.1 Main Dashboard Screen
```
PROMPT: Vision Pro Dashboard - Main Application Screen

Design the primary dashboard view for The Sims 4 Updater application.

Screen Layout (Full Width, Dark Background):

1. Header Area (Top, 80px):
   - Left: Application title "Sims 4 Updater"
     * Font: SF Pro Display, 28px, bold, white
     * Glow effect: Subtle cyan underline
   - Right: Health status indicator (3 dots, green/yellow/red)
     * Position: Top-right corner
     * Animated pulse if updating
     * Tooltip on hover

2. Configuration Section (Glass Panel, 200px height):
   - Title: "Configure Update"
   - Grid layout (2 columns):
     * Input: Manifest URL
       - Label: "Manifest URL" (12px, bold, gray)
       - Input field: Glass, 44px height
       - Help text: "Enter the manifest URL or use auto-discovery"
     * Dropdown: Version Selection
       - Label: "Game Version"
       - Dropdown: Glass style
       - Display: Current selected version
       - Arrow icon: Cyan, animated on hover
     * Button: "Discover Versions"
       - Primary button style
       - Icon: Magnifying glass
       - Loading state: Spinner
     * Button: "Verify"
       - Secondary button style
       - Icon: Checkmark
   - Divider line at bottom (1px, rgba(255,255,255,0.1))

3. Selection Summary Section (Glass Panel, 100px height):
   - Layout: Horizontal stats display
   - Stat 1: "DLC Selected"
     * Large number (cyan)
     * Subtitle: "25 of 40 packs"
   - Stat 2: "Estimated Size"
     * Large number (cyan)
     * Subtitle: "42.3 GB"
   - Stat 3: "Status"
     * Status badge (green/yellow/red)
     * Subtitle: "Ready to update"
   - Right side: Primary button "Start Update"

4. Content Library Section (Glass Panel Grid):
   - Title: "Content Library"
   - Subtitle: "Select which DLC to update"
   - Toggle: "Grid / List view" (right-aligned)
   - Grid of DLC cards:
     * Each card: 160px × 180px
     * Card layout:
       - Icon/Thumbnail: Top 60%
       - Title: Bottom section
       - Checkbox: Top-right corner (floating)
       - Hover effect: Scale up, glow
       - Selected state: Green border, checkmark highlighted
     * Categories: Expansion Packs, Game Packs, Stuff Packs, Kits
     * Scrollable: Vertical scroll
     * Cards per row: Responsive (4 on 1920px, 3 on 1440px)

5. Intelligence Hub Section (Glass Panel, 150px height):
   - Title: "Intelligence Hub"
   - Layout: 3-column info section
     * Mirror Status: Icon + status (Online/Offline)
     * Last Check: Timestamp
     * Auto-Discovery: Enabled/Disabled toggle
   - Action: "Scan Mirrors" button (secondary)

6. Action Buttons (Bottom Section, Sticky):
   - Layout: Horizontal, right-aligned
   - Button spacing: 12px
   - Buttons:
     * "Ping Backend" (secondary)
     * "Refresh" (secondary)
     * "Verify" (secondary)
     * "Start Update" (primary, prominent)

7. Diagnostic Console (Collapsible, 200px height when open):
   - Toggle: "Show Diagnostics" (bottom-left)
   - When expanded:
     * Black background (darker than main)
     * Live logs with color-coded levels
     * Scroll behavior: Auto-scroll to bottom
     * Font: SF Mono, 11px, monospace
     * Colors: Info (cyan), Warning (yellow), Error (red), Debug (gray)

Overall Design Notes:
- Depth: Layered glass panels on dark gradient background
- Animations: Smooth transitions on hover and state changes
- Focus: Keyboard navigation with visible focus rings
- Responsiveness: Adapts to 1440px, 1600px, 1920px, 2560px widths
- Accessibility: High contrast, large touch targets (44px minimum)
```

### 4.2 DLC Selection Grid Screen
```
PROMPT: Vision Pro DLC Grid View - Content Selection Screen

Design an enhanced DLC selection grid with filtering and search.

Screen Layout:

1. Header with Search and Filters (100px):
   - Search Box (left):
     * Placeholder: "Search DLC packs..."
     * Icon: Magnifying glass
     * Clear button: X icon (appears when text entered)
   - Filter Chips (middle):
     * "All" (default selected)
     * "Expansion Packs"
     * "Game Packs"
     * "Stuff Packs"
     * "Kits"
     * Each chip: Clickable, active state with cyan underline
   - View Toggle (right):
     * Grid icon (active) / List icon
     * Smooth transition animation

2. DLC Card Grid (Main Content Area):
   - Card Size: 160px × 200px
   - Spacing: 16px between cards
   - Border-radius: 12px
   - Card Structure:
     a. Thumbnail/Icon Area (120px height):
        - Background: Gradient based on pack type
        - Icon: 80×80px, centered
        - Expansion Pack: Purple gradient
        - Game Pack: Blue gradient
        - Stuff Pack: Orange gradient
        - Kit: Pink gradient
     b. Content Area (80px height):
        - Title: SF Pro Display, 13px, bold, white
        - Status: Small badge (Installed/Missing/Update Available)
        - Subtitle: Pack code (EP01, GP04, etc.)
     c. Checkbox: Top-right corner, floating
        - Hidden by default, visible on hover
        - Animated appearance
     d. Interactions:
        - Hover: Scale 1.02, shadow increase
        - Click: Toggle checkbox selection
        - Right-click: Show context menu (Install/Uninstall)

   - Selection Feedback:
     - Selected card: Cyan border (2px), checkmark visible
     - Animated border glow: 0 0 12px rgba(0,212,255,0.4)
     - Unselected: Standard glass appearance

3. Bulk Actions Bar (Sticky, Bottom):
   - Layout: Right-aligned buttons
   - Show when items selected: Fade in animation
   - Buttons:
     * "Select All" (secondary)
     * "Deselect All" (secondary)
     * "Install Selected" (primary, blue)
     * "Details" (secondary, shows panel)

4. Details Panel (Right Sidebar, Collapsible):
   - Width: 300px
   - Triggered by: "Details" button or card selection
   - Panel Content:
     * Title: DLC name (large, bold)
     * Icon: 80×80px
     * Status: Badge (color-coded)
     * Release Date: Text
     * Size: "12.4 GB"
     * Description: 3-4 lines of text
     * Tags: Category badges
     * Actions: Install/Remove buttons
   - Animation: Slide in from right (300ms)

5. Empty State (if no DLC found):
   - Icon: Magnifying glass or folder empty
   - Title: "No DLC Found"
   - Subtitle: "Try adjusting your search or filters"
   - Action: "Clear Filters" button

Design Notes:
- Responsive: 4 columns (1920px), 3 columns (1440px), 2 columns (1024px)
- Smooth grid animations on filter change
- Loading skeleton cards during fetch
- Infinite scroll or pagination (bottom detection)
- Keyboard navigation: Tab, arrow keys, Enter, Space
```

### 4.3 Update Progress Screen
```
PROMPT: Vision Pro Update Progress - Real-Time Progress Screen

Design a dedicated screen for monitoring update operations.

Screen Layout:

1. Status Header (120px):
   - Large title: "Updating Game" or "Verifying Files"
   - Animated icon: Spinning circle or progress indicator
   - Status description: "15 of 40 packs completed"
   - Estimated time: "2 hours 15 minutes remaining"
     * Font: SF Mono, 13px, gray
     * Right-aligned

2. Overall Progress Section (80px, Glass Panel):
   - Layout: Vertical progress display
   - Title: "Overall Progress"
   - Progress bar (large):
     * Height: 8px
     * Animated fill with glow
     * Percentage: Right-aligned (e.g., "38%")
   - Sub-progress details: "Downloaded: 45.2 GB / Total: 120 GB"
     * Font: SF Pro Display, 12px, gray

3. Active Pack Progress (100px, Glass Panel):
   - Current pack info (left):
     * Icon: 40×40px, pack type icon
     * Title: Pack name and code (e.g., "Eco Lifestyle (EP11)")
     * Status: "Downloading..." or "Patching..." or "Verifying..."
   - Progress (right):
     * Progress bar: Height 6px
     * Percentage: Cyan text, right-aligned
     * Speed: "12.4 MB/s" (for downloads)
     * Time remaining: "2m 30s"

4. Detailed Pack List (Scrollable, Main Area):
   - List of all packs with individual progress:
     * Each item: 60px height, glass panel
     * Layout:
       - Icon: 32×32px (left)
       - Title & Code: Middle (bold)
       - Status Badge: (right)
         * Queued: Gray
         * In Progress: Cyan with spinner
         * Completed: Green with checkmark
         * Error: Red with X
       - Progress bar: Beneath title (small, 4px)
     * Hover effect: Slight glow
     * Scrollable: Vertical scroll with custom scrollbar

5. Network/System Stats (Glass Panel, Bottom):
   - 3-column layout:
     * Download Speed: "12.4 MB/s"
     * Network Health: "Excellent" (green)
     * Data Used: "45.2 GB / 150 GB"
   - Mini progress bars for each stat
   - Real-time updates every 500ms

6. Action Buttons (Sticky, Bottom-Right):
   - "Pause" (secondary) - toggles to "Resume"
   - "Cancel" (destructive/secondary, red)
   - "Minimize to Tray" (secondary, icon only)
   - State handling: Disable "Resume" if not paused

7. Notifications Area (Top-Right):
   - Toast notifications for:
     * Pack completion: "✓ Expansion Pack 11 updated"
     * Errors: "✗ Failed to download Game Pack 4"
     * Auto-dismiss after 4 seconds

Design Animations:
- Progress bar fill: Smooth cubic-bezier animation
- Status badge: Spin animation for "In Progress"
- Glow effects: Pulse animation on active pack
- Completed packs: Fade/slide out animation
- Error state: Brief red flash on failed packs

Design Notes:
- No user interaction during update (read-only view)
- Real-time updates from backend via IPC
- Minimize option for tray integration
- Keyboard shortcut: Escape to show pause/cancel dialog
- Accessibility: ARIA live regions for screen readers
```

### 4.4 Settings and Configuration Screen
```
PROMPT: Vision Pro Settings Screen - Configuration and Preferences

Design a comprehensive settings screen for application configuration.

Screen Layout:

1. Settings Header (60px):
   - Title: "Settings & Configuration"
   - Subtitle: "Manage updater behavior and preferences"

2. Settings Navigation (Left Sidebar, 200px width):
   - Category buttons (vertical list):
     * "General" (default selected)
     * "Download & Update"
     * "Backup & Recovery"
     * "Advanced"
     * "About"
   - Button style: Glass panels, selected = cyan border + glow
   - Button animation: Smooth transition on click

3. General Settings Panel (Right Side, Main Content):
   - Section 1: "Application"
     * Toggle: "Auto-launch on startup"
       - Label: "Start updater when system boots"
       - Switch: ON/OFF state
       - Help text: "Small impact on startup time"
     * Toggle: "Minimize to system tray"
       - Label: "Reduce to tray instead of closing"
     * Dropdown: "Theme"
       - Options: Dark (default), Light, Auto
     * Dropdown: "Language"
       - Options: English, Spanish, French, German, etc.

   - Section 2: "Update Behavior"
     * Toggle: "Auto-check for updates"
       - Label: "Automatically check for game updates daily"
       - Help text: "Checks at 2:00 AM system time"
     * Toggle: "Auto-update critical packs"
       - Label: "Immediately install critical game patches"
       - Warning: "May interrupt gameplay"
     * Number input: "Check frequency (hours)"
       - Min: 1, Max: 168
       - Default: 24

   - Section 3: "Notifications"
     * Toggle: "Desktop notifications"
     * Toggle: "Notification sounds"
     * Toggle: "Log completion notifications"

4. Download & Update Settings Panel:
   - Section 1: "Performance"
     * Number input: "Parallel downloads"
       - Min: 1, Max: 8
       - Help text: "More connections = faster, higher CPU"
     * Number input: "Download speed limit (MB/s)"
       - Input: 0 for unlimited
       - Help text: "0 = no limit"

   - Section 2: "Storage"
     * Path input: "Cache directory"
       - Current: "C:\Users\...\AppData\Local\Sims4Updater"
       - Button: "Browse" (folder picker)
     * Toggle: "Cleanup cache after update"
       - Label: "Remove temporary files"
     * Dropdown: "Cache size limit"
       - Options: Unlimited, 10GB, 25GB, 50GB

   - Section 3: "Network"
     * Dropdown: "Mirror preference"
       - Options: Auto, Mirror 1, Mirror 2, Mirror 3
     * Toggle: "Verify integrity during download"
       - Label: "Slower but safer downloads"

5. Backup & Recovery Settings Panel:
   - Section 1: "Automatic Backups"
     * Toggle: "Auto-backup before update"
       - Label: "Create restore point automatically"
       - Warning: "Requires sufficient disk space"
     * Dropdown: "Backup location"
       - Current path
       - Button: "Browse"
     * Number input: "Keep backups (count)"
       - Min: 1, Max: 10

   - Section 2: "Recovery Options"
     * Button: "View Backups" (opens backup manager dialog)
     * Button: "Create Manual Backup Now" (primary)
     * Button: "Restore from Backup" (secondary)

6. Advanced Settings Panel:
   - Warning: "⚠️ These settings are for advanced users"
   - Toggle: "Enable debug logging"
       - Label: "Verbose output in console"
     * Toggle: "Use xdelta3 delta patching"
       - Help text: "Reduces download size by ~40%"
     * Dropdown: "Manifest source"
       - Options: Official, Custom URL
     * Text input: "Custom manifest URL" (if Custom selected)

   - Section: "Experimental Features"
     * Toggle: "Parallel patching"
       - Label: "Apply patches simultaneously"
     * Toggle: "GPU acceleration"
       - Label: "Use hardware acceleration (if available)"

7. About Settings Panel:
   - Application info:
     * Name: "The Sims 4 Updater"
     * Version: "2.0.0 (Build 1234)"
     * Last updated: "2025-12-25"
   - Links:
     * Button: "Check for Updates"
     * Button: "View Changelog"
     * Button: "Report Bug"
     * Button: "GitHub Repository"
   - License: "MIT License"

8. Action Buttons (Bottom, Sticky):
   - Layout: Right-aligned
   - Buttons:
     * "Reset to Defaults" (secondary, warning color)
     * "Cancel" (secondary, dismisses changes)
     * "Save Changes" (primary, cyan)

Design Notes:
- Settings persist to config file on save
- Form validation for number inputs
- Confirmation dialog for destructive actions (Reset)
- Section dividers: 1px solid rgba(255,255,255,0.1)
- Help icons with tooltips for complex settings
- Smooth transitions between panels (slide animation)
```

### 4.5 Error and Recovery Screen
```
PROMPT: Vision Pro Error Recovery Screen - Failure and Recovery Interface

Design a comprehensive error recovery and diagnostics screen.

Screen Layout:

1. Error Header (140px, Red Tint):
   - Large error icon: ⚠️ (animated pulse)
   - Title: "Update Failed"
   - Subtitle: "An error occurred during the update process"
   - Error code: "ERR_DOWNLOAD_TIMEOUT [CODE: DL-1042]"
     * Font: SF Mono, 11px, gray
     * Gray text, monospace

2. Error Details Panel (Glass Panel, 200px):
   - Title: "What Happened?"
   - Description: Friendly explanation of the error
     * Example: "The connection to mirror server 2 was lost while downloading 'Eco Lifestyle (EP11)'. The download was interrupted after 89% completion."
   - Font: SF Pro Display, 14px
   - Line-height: 1.6

3. Recovery Options (3-column Layout):
   - Option 1: "Resume Download"
     * Button: Large primary (cyan)
     * Icon: Download arrow
     * Description: "Continue from where it left off (11.2 GB remaining)"
     * Status: "Ready to resume"

   - Option 2: "Retry from Beginning"
     * Button: Secondary
     * Icon: Refresh arrow
     * Description: "Start the update process again"
     * Time estimate: "~45 minutes"

   - Option 3: "Restore Backup"
     * Button: Secondary
     * Icon: Backup/restore icon
     * Description: "Revert to previous stable version"
     * Available: "Yes (created 2 days ago)"

4. Technical Details (Expandable Section):
   - Collapsed: "Show Technical Details ↓"
   - Expanded Content:
     * Full error traceback:
       - Font: SF Mono, 10px, dark background (#050505)
       - Text: Red (#ff4444) for error lines
       - Scrollable: Max-height 150px
       - Copy button: Top-right corner
     * Log entries: Last 20 lines from diagnostic log
     * Network info: Last successful connection timestamp

5. Support Section (Bottom Glass Panel):
   - Title: "Need Help?"
   - Layout: 2 columns
     * Left:
       - Button: "Contact Support"
       - Button: "View Documentation"
     * Right:
       - Button: "Report Bug"
       - Button: "Forum Discussion"

6. Action Buttons (Bottom, Sticky):
   - Layout: Right-aligned
   - Buttons:
     * "Dismiss" (secondary, gray)
     * "Primary Action" (primary, based on context)
       - Usually "Resume Download" (cyan)
       - Or "Retry" or "Restore"

Design States:
- Network Error: Red icon, "Check your internet connection"
- Disk Space Error: Orange icon, "Insufficient disk space (22 GB required, 8 GB available)"
- Permission Error: Red icon, "Insufficient permissions to write to game directory"
- Verification Failed: Orange icon, "Downloaded files are corrupted, restart download"
- Timeout Error: Yellow icon, "Connection timed out after 30 seconds"

Design Notes:
- Error animations: Subtle pulse on error icon
- Color feedback: Red for critical, orange for warnings
- Easy recovery paths: 3 clear options for user action
- Technical transparency: Details available but not overwhelming
- Accessibility: High contrast error text, readable fonts
```

---

## ANIMATIONS & TRANSITIONS

### 5.1 Magnetic Focus Engine Animation
```
PROMPT: Vision Pro Magnetic Focus Engine - Interactive Focus and Glow Effects

Design dynamic focus states with magnetic pull, scaling, and glow animations.

Animation Specifications:

1. Magnetic Cursor Effect:
   - Container: All interactive elements
   - Trigger: Mouse hover or focus state
   - Animation:
     * Glow expansion: 0 0 0px → 0 0 20px rgba(0,212,255,0.4)
     * Duration: 200ms
     * Easing: cubic-bezier(0.34, 1.56, 0.64, 1)

   - Scale effect (on element):
     * Scale: 1.0 → 1.02
     * Duration: 200ms
     * Easing: cubic-bezier(0.34, 1.56, 0.64, 1)

   - Border animation (if applicable):
     * Border color: rgba(255,255,255,0.2) → #00d4ff
     * Duration: 200ms

2. Cursor Position Tracking (Advanced):
   - Glowing aura follows cursor position within element
   - Effect: Light source from cursor direction
   - Implementation:
     * Radial gradient that shifts with cursor
     * Gradient center: Mouse position relative to element
     * Update frequency: 16ms (60fps)
     * Opacity: 0.3 (subtle)

3. Focus Ring Animation:
   - Active state for keyboard navigation
   - Ring style: 2px solid #00d4ff
   - Outer glow: 0 0 0 3px rgba(0,212,255,0.2)
   - Animation: Pulse effect (scale 0.95 to 1.0, 1s loop)
   - Duration to appear: 150ms

4. Glass Reflection Animation:
   - On element hover:
     * Subtle light sweep across glass surface
     * Direction: Top-left to bottom-right
     * Duration: 800ms
     * Opacity: 0.1
     * Easing: linear

5. Button Press Animation:
   - On click/activation:
     * Scale: 1.02 → 0.98
     * Duration: 100ms
     * Easing: cubic-bezier(0.13, 0.87, 0.35, 1.2)
   - Then revert:
     * Scale: 0.98 → 1.0
     * Duration: 150ms

Generate variations:
1. Button focus (with glow and scale)
2. Card hover (with glow and lift)
3. Input focus (with border glow and inner glow)
4. Toggle interaction (with spring animation)
5. Menu item hover (with background color shift)
```

### 5.2 Transition Animations
```
PROMPT: Vision Pro Transition Animations - Screen and Component Transitions

Design smooth transitions between screens and state changes.

Transition Specifications:

1. Screen Transitions (Page Changes):
   - Entry animation:
     * Scale: 0.9 → 1.0
     * Opacity: 0 → 1
     * Duration: 300ms
     * Easing: cubic-bezier(0.34, 1.56, 0.64, 1)
     * Direction: Slight upward motion (translateY: 20px → 0)

   - Exit animation (previous screen):
     * Opacity: 1 → 0
     * Scale: 1.0 → 0.95
     * Duration: 200ms
     * Direction: Slight downward motion

2. Modal Open Animation:
   - Backdrop: Fade in (0 → 0.6 opacity) 300ms
   - Modal container:
     * Scale: 0.85 → 1.0 (from center)
     * Opacity: 0 → 1
     * Duration: 300ms
     * Easing: cubic-bezier(0.34, 1.56, 0.64, 1)

3. Modal Close Animation:
   - Backdrop: Fade out (0.6 → 0) 200ms
   - Modal container:
     * Scale: 1.0 → 0.85
     * Opacity: 1 → 0
     * Duration: 200ms

4. Sidebar Slide Animation (Settings Panel):
   - Entry: Slide in from right
     * TranslateX: 100% → 0
     * Opacity: 0 → 1
     * Duration: 300ms
     * Easing: cubic-bezier(0.34, 1.56, 0.64, 1)

   - Exit: Slide out to right
     * TranslateX: 0 → 100%
     * Opacity: 1 → 0
     * Duration: 250ms

5. Dropdown Menu Animation:
   - Open:
     * ScaleY: 0 → 1
     * Opacity: 0 → 1
     * Duration: 200ms
     * Transform-origin: top center
     * Easing: cubic-bezier(0.34, 1.56, 0.64, 1)

   - Close:
     * ScaleY: 1 → 0
     * Opacity: 1 → 0
     * Duration: 150ms

6. List Item Entry Animation (Staggered):
   - For lists of items (DLC grid, pack list):
     * Each item offset: 50ms stagger
     * Animation per item:
       - Opacity: 0 → 1
       - TranslateY: 10px → 0
       - Duration: 300ms

7. Progress Fill Animation:
   - Progress bar fill:
     * Width: 0% → [target]%
     * Duration: 1000ms
     * Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)

   - Glow pulse during progress:
     * Box-shadow: 0 0 12px → 0 0 24px (back to 12px)
     * Duration: 2000ms (loop)

8. Badge Appearance Animation:
   - New badge (status changed):
     * Scale: 0 → 1
     * Rotation: -10deg → 0deg
     * Duration: 300ms
     * Spring effect

9. Notification Toast Animation:
   - Entry (slide in from top):
     * TranslateY: -30px → 0
     * Opacity: 0 → 1
     * Duration: 300ms

   - Auto-dismiss (fade out):
     * Opacity: 1 → 0
     * Duration: 300ms
     * Delay: 4000ms

10. Loading Skeleton Animation:
    - Placeholder shimmer effect:
      * Background: Linear gradient sweeping left to right
      * Duration: 1600ms (loop)
      * Opacity wave: 0.6 → 1.0 → 0.6

Generate animation examples:
1. Page navigation (left to right slide)
2. Modal dialog open/close
3. Settings panel transition
4. DLC card selection (checked state)
5. Progress update (smooth fill)
6. Error toast notification
7. Loading state shimmer
```

### 5.3 Micro-Interactions
```
PROMPT: Vision Pro Micro-Interactions - Subtle Feedback Animations

Design micro-interactions for button clicks, toggles, and form interactions.

Micro-Interaction Specifications:

1. Button Click Feedback:
   - Visual ripple effect:
     * Circle emanates from click point
     * Radius: 0 → 80px
     * Opacity: 0.3 → 0
     * Duration: 600ms
     * Color: rgba(0,212,255,0.3)

   - Press animation (simultaneous):
     * Scale: 1.0 → 0.98
     * Duration: 100ms

2. Checkbox Toggle Animation:
   - Check animation:
     * Inner fill: 0% → 100%
     * Duration: 300ms
     * Checkmark appears: Animated draw effect
     * Scale: 0.8 → 1.0
     * Easing: cubic-bezier(0.34, 1.56, 0.64, 1)

3. Toggle Switch Animation:
   - Switch activation:
     * Knob translateX: 0 → 22px
     * Duration: 250ms
     * Background color shift: rgba(255,255,255,0.08) → cyan gradient
     * Easing: cubic-bezier(0.34, 1.56, 0.64, 1)

4. Input Focus Animation:
   - Focus effects:
     * Border color: rgba(255,255,255,0.2) → #00d4ff
     * Background: rgba(255,255,255,0.06) → rgba(255,255,255,0.1)
     * Inner glow: Appear with 0 → 1 opacity
     * Duration: 150ms

   - Unfocus animation:
     * Reverse of above
     * Duration: 200ms
     * If error: Border color → red (#ff4444)

5. Dropdown Selection Animation:
   - Selected item animation:
     * Background: Fade to cyan tint
     * Icon appears: Checkmark scale 0 → 1
     * Duration: 200ms
     * List closes: ScaleY animation (1 → 0)

6. Success Confirmation Animation:
   - Item successfully updated:
     * Color flash: Green highlight (0.3s)
     * Checkmark icon appears: Scale 0 → 1 (spring)
     * Then fade: Opacity 1 → 0 (1s)
     * Total duration: ~2s

7. Error Shake Animation:
   - Form validation error:
     * Horizontal shake: translateX 0 → 3px → -3px → 0
     * 4 iterations (3 bounces)
     * Duration: 400ms
     * Background color: Flash red tint (0.2s)

8. Drag and Drop Animation:
   - Hover over drop target:
     * Border: Increase thickness or glow
     * Background: Slight color tint
     * Duration: 150ms

   - On drop:
     * Item scale: 1.0 → 0.95 → 1.0 (snap)
     * Position updates smoothly
     * Duration: 200ms

9. Counter Increment Animation (for DLC count):
   - Number changes:
     * Old number fades out + slides up
     * New number slides in from below
     * Duration: 300ms
     * Easing: cubic-bezier(0.34, 1.56, 0.64, 1)

10. Pulse/Glow Animation (for attention):
    - Continuous pulse on important elements:
      * Box-shadow: 0 0 12px → 0 0 24px → 0 0 12px
      * Duration: 2000ms (continuous loop)
      * Color: #00d4ff

Generate micro-interaction examples:
1. Button click with ripple and press
2. Checkbox toggle with checkmark animation
3. Toggle switch flip animation
4. Input focus glow effect
5. Dropdown item selection
6. Success state animation
7. Error shake animation
8. Drag and drop visual feedback
```

### 5.4 Loading and Progress Animations
```
PROMPT: Vision Pro Loading and Progress Animations

Design engaging loading states and progress indicators.

Animation Specifications:

1. Spinner Animation (Circular Loading):
   - Container: 32px × 32px circle
   - Design: Rotating border (partial ring)
   - Style:
     * Border: 2px solid transparent
     * Border-top: 2px solid #00d4ff
     * Border-right: 2px solid #0080ff
     * Border-radius: 50%

   - Rotation animation:
     * Rotate: 0 → 360deg
     * Duration: 1200ms
     * Timing: linear (infinite loop)
     * Animation: Continuous smooth rotation

2. Pulse Spinner (Alternative):
   - Container: 24px × 24px circle
   - Pulsing dots animation:
     * 3 dots arranged in circle
     * Each dot: 4px radius
     * Animation: Sequential opacity pulse
       - Dot 1: Pulse 0.4 → 1.0 → 0.4 (0s start)
       - Dot 2: Pulse 0.4 → 1.0 → 0.4 (200ms delay)
       - Dot 3: Pulse 0.4 → 1.0 → 0.4 (400ms delay)
     * Duration per dot: 1200ms (loop)

3. Progress Bar Animation:
   - Determinate progress:
     * Width animation: 0% → [target]%
     * Duration: 500ms to 1000ms (depends on speed)
     * Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)

   - Indeterminate progress (unknown duration):
     * Animated gradient sweep left to right
     * Width of animated section: 30%
     * Duration: 1500ms (loop)
     * Easing: linear

4. Skeleton Loading Animation:
   - Placeholder elements while loading:
     * Background: Gradient (light → darker → light)
     * Sweep direction: Left to right
     * Duration: 1600ms (loop)
     * Easing: linear
     * Opacity wave: Subtle pulsing

5. Animated Dots (Loading Status):
   - Display: "Checking..." or "Downloading..."
   - Dots animation:
     * Three dots appear sequentially
     * Timing: 600ms per dot
     * Duration: 1800ms total (loop)
     * Example: . → .. → ... → (repeat)

6. Upload Progress with Animation:
   - When file uploading:
     * Progress fill: Smooth width animation
     * Bytes counter: Live update text
     * Speed display: Real-time speed (MB/s)
     * All elements animate together for cohesion

7. Staggered List Loading:
   - Loading multiple items:
     * Each skeleton: Staggered entrance
     * Offset: 100ms between items
     * Fade in + skeleton shimmer simultaneously
     * When data loads: Skeleton → Content (fade transition)

8. Success State Animation:
   - After loading completes:
     * Checkmark appears: Animated draw effect
     * Color change: Green highlight
     * Scale: 0.8 → 1.0 (spring effect)
     * Then fade out: Opacity 1 → 0 (delayed 500ms)

9. Error Retry Animation:
   - On failed load with retry:
     * Progress bar: Sudden stop at current position
     * Color shift: Cyan → Red
     * Shake animation: Brief vibration
     * Retry button: Becomes highlighted
     * Manual retry click restarts animation

10. Download Speed Graph Animation:
    - Real-time speed visualization:
      * Bar chart updating in real-time
      * Each bar: Slides up with new speed data
      * Duration: 500ms per update
      * Color: Gradient based on speed (green fast, yellow slow)

Generate animation examples:
1. Circular spinner (continuous)
2. Pulsing dot indicator
3. Progress bar fill animation
4. Skeleton loading shimmer
5. Loading ellipsis animation
6. Success checkmark animation
7. Error state animation
8. Real-time speed gauge animation
```

---

## ACCESSIBILITY & POLISH

### 6.1 Keyboard Navigation
```
PROMPT: Vision Pro Keyboard Navigation System

Design complete keyboard accessibility for all screens and components.

Navigation Specifications:

1. Focus Management:
   - Focus visible state:
     * Ring: 2px solid #00d4ff
     * Outer glow: 0 0 0 3px rgba(0,212,255,0.2)
     * Pulse animation: Scale 0.95 to 1.0 (1s loop)

   - Focus order (logical tab order):
     * App follows standard tab order
     * No tabindex hijacking
     * Explicit logical progression for complex layouts

2. Keyboard Shortcuts:
   - Global shortcuts:
     * Tab: Next focusable element
     * Shift+Tab: Previous focusable element
     * Enter: Activate button/checkbox/toggle
     * Space: Toggle checkbox/activate button
     * Escape: Close modal/dialog/dropdown
     * Ctrl+Q or Cmd+Q: Quit application

   - Page-specific shortcuts:
     * Dashboard:
       - Ctrl+S or Cmd+S: Start update (if ready)
       - Ctrl+V or Cmd+V: Verify all
       - Ctrl+R or Cmd+R: Refresh/discover
     * DLC Grid:
       - Ctrl+A or Cmd+A: Select all
       - Ctrl+Shift+A or Cmd+Shift+A: Deselect all
       - Arrow keys: Navigate grid
       - Enter: Toggle selection
     * Settings:
       - Ctrl+Z or Cmd+Z: Undo changes
       - Ctrl+S or Cmd+S: Save changes

3. Arrow Key Navigation:
   - Grid navigation (DLC cards):
     * Left/Right arrows: Move between columns
     * Up/Down arrows: Move between rows
     * Enter: Toggle selection
     * Home: First item in row
     * End: Last item in row

   - List navigation:
     * Up/Down arrows: Move between items
     * Home/End: First/last item
     * Enter: Activate item

4. Form Navigation:
   - Tab order in settings:
     * Left sidebar categories
     * Then form fields (top to bottom, left to right)
     * Action buttons (bottom)
   - Form field keyboard interaction:
     * Text input: Type normally
     * Textarea: Type, Ctrl+Enter submits
     * Dropdown: Arrow keys open/navigate, Enter selects
     * Checkbox/Toggle: Space toggles

5. Dialog/Modal Keyboard:
   - Focus trap: Focus stays within modal
   - Tab cycles through focusable elements
   - Escape closes modal
   - Enter activates primary button (if available)

6. Shortcut Help:
   - Display available shortcuts:
     * Menu option: "Help" → "Keyboard Shortcuts"
     * Or: Ctrl+? / Cmd+? shows shortcut overlay
   - Overlay: Semi-transparent modal with categorized shortcuts
   - Format: Shortcut | Action description

Design Notes:
- Focus visible on every interactive element
- No invisible focus traps
- Logical tab order (top to bottom, left to right)
- Keyboard shortcuts displayed in tooltips/menu
- Screen reader friendly (see ARIA specifications)
```

### 6.2 Screen Reader Support (ARIA)
```
PROMPT: Vision Pro Screen Reader Accessibility (ARIA)

Design complete accessibility support for screen readers.

ARIA Specifications:

1. Semantic HTML Structure:
   - Use native HTML elements where possible
   - Landmarks:
     * <header>: Application header
     * <main>: Primary content
     * <nav>: Navigation (settings sidebar)
     * <section>: Major content sections
     * <aside>: Supplementary content (details panel)

2. ARIA Roles and Labels:
   - Page structure:
     * Main dashboard: role="main"
     * Settings sidebar: role="navigation", aria-label="Settings navigation"
     * DLC grid: role="grid" or role="list"
     * Progress bar: role="progressbar"

   - Component roles:
     * Button: role="button" (or use <button>)
     * Toggle: role="switch", aria-checked="[true|false]"
     * Checkbox: role="checkbox" (or use <input type="checkbox">)
     * Radio: role="radio" (or use <input type="radio">)
     * Dropdown: role="combobox", aria-expanded="[true|false]"
     * Modal: role="dialog", aria-modal="true"
     * Tabs: role="tablist", role="tab", role="tabpanel"

3. Labels and Descriptions:
   - Form fields:
     * Every input has: <label> or aria-label
     * aria-label format: "Category selection, dropdown"
     * aria-describedby for detailed help text

   - Buttons:
     * aria-label: Action description
     * Example: aria-label="Start update with 25 packs selected"

   - Images/Icons:
     * aria-label or alt text describing purpose
     * Example: aria-label="Game status: healthy"

4. Live Regions:
   - Dynamic content updates:
     * Progress updates: aria-live="polite", aria-label="Overall progress: 38%"
     * Status changes: aria-live="assertive" (high priority)
     * Notifications: aria-live="polite", role="alert"

   - Relevant elements:
     * Progress bar values
     * Status badges (updating, completed, error)
     * Error messages
     * Toast notifications

5. Expandable Content:
   - Collapsible sections:
     * Button: aria-expanded="[true|false]"
     * aria-controls="[id of controlled element]"
     * Initial state: aria-expanded="false"

   - Disclosure triangles:
     * aria-label="Show technical details, button"

6. Grid and List Semantics:
   - DLC grid:
     * role="grid"
     * Children: role="row"
     * Role within row: role="gridcell"
     * aria-selected="[true|false]" for selection state

   - Pack list:
     * role="list"
     * Children: role="listitem"
     * aria-label for each item (e.g., "Eco Lifestyle, Installed")

7. Form Validation:
   - Invalid fields:
     * aria-invalid="true"
     * aria-describedby="[id of error message]"
   - Error message: id="field_error", role="alert"

8. Skip Links:
   - Navigation skip links (hidden, revealed on focus):
     * "Skip to main content"
     * "Skip to sidebar"
     * Focus visible when tabbed to

Design Notes:
- Test with: NVDA (Windows), JAWS, VoiceOver (Mac)
- Announce dynamic changes in real-time
- Avoid ARIA where semantic HTML works
- Keep label text clear and concise
- Avoid redundant announcements (aria-label + visible text)
```

### 6.3 Color Contrast and Visual Clarity
```
PROMPT: Vision Pro Color Contrast and Visual Design Clarity

Ensure WCAG AAA compliance and optimal visual clarity.

Contrast Specifications:

1. Text Contrast Ratios (WCAG AAA = 7:1):
   - Primary text (#ffffff):
     * On dark background (#0a0e27): 21:1 ✓✓✓
     * On glass overlay (rgba(255,255,255,0.08)): 19:1 ✓✓✓

   - Secondary text (#b0b0b0):
     * On dark background: 8.5:1 ✓✓
     * On glass overlay: 7.5:1 ✓✓

   - Accent text (#00d4ff):
     * On dark background: 11:1 ✓✓✓
     * On glass overlay: 10:1 ✓✓✓

   - Status text (green #00ff88):
     * On dark background: 13:1 ✓✓✓
     * On glass overlay: 11.5:1 ✓✓✓

   - Warning text (yellow #ffcc00):
     * On dark background: 5.5:1 (needs dark background)
     * Workaround: Use on dark surface or add shadow

   - Error text (red #ff4444):
     * On dark background: 8.5:1 ✓✓✓
     * On glass overlay: 7.5:1 ✓✓

2. UI Component Contrast:
   - Button borders:
     * Cyan border (#00d4ff) on dark: 11:1 ✓✓✓
     * White border (#ffffff) on dark: 21:1 ✓✓✓

   - Disabled states:
     * Opacity reduction must maintain 3:1 minimum
     * Disabled button: 50% opacity = 3:1 ✓

   - Glass borders:
     * Border rgba(255,255,255,0.3) on dark: 6:1 ✓
     * Hover: rgba(255,255,255,0.4) on dark: 8:1 ✓✓

3. Non-Text Contrast:
   - Graphical objects (icons, progress bars):
     * Progress bar fill vs. background: 8:1 ✓✓✓
     * Icon vs. background: 7:1 minimum ✓✓
     * Focus indicator ring: 7:1 minimum ✓✓

4. Color Blindness Considerations:
   - Avoid red/green sole distinction:
     * Status indicators: Use shape + color
     * Green circle (completed) + checkmark
     * Red circle (error) + X mark
     * Yellow circle (warning) + exclamation mark

   - Deuteranopia (red-green colorblind):
     * Replace red-green with blue-yellow or add patterns

   - Protanopia (red-green colorblind):
     * Blue background, yellow text works well

   - Monochromacy (complete colorblindness):
     * All distinctions via shape, text, or opacity

5. Visual Hierarchy:
   - Size hierarchy:
     * Main title: 28px (h1)
     * Section title: 18px (h2)
     * Subsection: 14px (h3)
     * Body text: 14px regular
     * Small text: 12px (secondary, help)

   - Weight hierarchy:
     * Titles: Bold (700)
     * Subtitles: Regular (400)
     * Labels: Bold (600)
     * Body: Regular (400)

   - Color hierarchy:
     * Primary action: Cyan (#00d4ff)
     * Secondary action: Glass with white border
     * Disabled: 50% opacity
     * Information: Gray (#b0b0b0)

6. Spacing and Density:
   - Minimum touch target: 44×44px
   - Button padding: 12px vertical, 24px horizontal
   - Card padding: 24px
   - Section gap: 24px
   - Component gap: 12px

Design Verification:
- Use WCAG Contrast Checker tool
- Test with: Color Oracle (colorblind simulator)
- Verify all color combinations
- Ensure sufficient size/spacing for accessibility
```

### 6.4 Responsive Design
```
PROMPT: Vision Pro Responsive Design - Multi-Screen Optimization

Design responsive layouts for various screen sizes and orientations.

Breakpoint Specifications:

1. Display Sizes (Common Desktop Resolutions):
   - Ultra-wide (2560px): 4 column grid, full feature set
   - 4K (2160px): Full feature display
   - 1920px (FHD): Standard desktop, 4 column grid
   - 1440px (QHD): 3 column grid, optimized spacing
   - 1280px: 2 column grid, compact mode
   - 1024px: Single column, stacked layout

2. Responsive Layout (DLC Grid):
   - 2560px+: 6 columns, card size 140×160px
   - 1920px: 4 columns, card size 160×200px
   - 1440px: 3 columns, card size 160×200px
   - 1280px: 2 columns, card size 200×240px
   - 1024px: 1 column, card width 100%

3. Responsive Typography:
   - Title (h1):
     * 2560px: 32px
     * 1920px: 28px
     * 1440px: 26px
     * 1280px: 24px
     * 1024px: 22px

   - Section title (h2):
     * 2560px: 22px
     * 1920px: 18px
     * 1440px: 16px
     * 1280px: 15px
     * 1024px: 14px

   - Body text:
     * Fixed at 14px (readability)
     * Line-height: 1.6 (consistent)

4. Responsive Spacing:
   - Padding adjustments:
     * Large screens (2560px+): 32px padding
     * Medium screens (1440px): 24px padding
     * Small screens (1024px): 16px padding

   - Gap adjustments:
     * Large screens: 24px gap between components
     * Medium screens: 16px gap
     * Small screens: 12px gap

5. Responsive Components:
   - Settings sidebar:
     * 1440px+: Left sidebar 200px width
     * 1280px: Left sidebar 180px width
     * <1280px: Hamburger menu, full-width content

   - Details panel:
     * 1920px+: Right sidebar always visible
     * 1440px: Right sidebar on demand (toggle button)
     * <1440px: Full-width modal or drawer

   - Buttons:
     * Large screens: Side-by-side buttons
     * Small screens: Stacked buttons (full width)

6. Mobile-First Approach:
   - Start with smallest layout (1024px)
   - Scale up with media queries
   - Maintain touch targets (44px minimum)
   - Ensure readable text without zooming

7. Aspect Ratio Handling:
   - DLC cards: 4:5 aspect ratio (maintained)
   - Thumbnails: Square (1:1) or 16:9
   - Progress bars: Full width, 4px height
   - Modals: Width 90% max (max 400px on mobile)

8. Overflow Handling:
   - Horizontal overflow: Scrollable content area
   - Scrollbar style: Custom (rgba(0,212,255,0.4))
   - Max height: Use viewport height for long lists
   - Sticky headers: Keep titles visible while scrolling

Design Notes:
- Test on: 1024px, 1280px, 1440px, 1920px, 2560px
- Maintain functionality on all sizes
- Optimize touch targets for any touch input
- Use CSS media queries for smooth transitions
- Preserve design integrity across all breakpoints
```

### 6.5 Performance Optimization
```
PROMPT: Vision Pro Performance Optimization - Animation and Rendering

Design performant animations and rendering strategies.

Performance Specifications:

1. Animation Performance (60fps target):
   - GPU-accelerated animations:
     * Use transform and opacity (not size/position)
     * transform: translateX, translateY, scale, rotate
     * opacity: 0 to 1

   - Avoid reflow/repaint:
     * Don't animate width/height
     * Don't animate top/left/right/bottom
     * Use transform: translate() instead

   - Animation examples:
     * Button hover: transform: scale(1.02) ✓
     * Card lift: transform: translateY(-2px) ✓
     * Glow effect: box-shadow update (may cause repaint)
     * Progress fill: width change (repaint, necessary)

2. CSS Optimization:
   - Backdrop-filter performance:
     * Use will-change: backdrop-filter on hovered element
     * Limit blur to moderate values (12-20px max)
     * Don't apply to 100+ elements simultaneously

   - Box-shadow optimization:
     * Use 0 0 30px instead of multiple shadows when possible
     * Limit glow effects to focused/hovered elements
     * Pre-calculate shadow values (no dynamic calculation)

   - Transform optimization:
     * Use transform instead of position changes
     * Apply will-change: transform to animated elements
     * Use contain: paint for component isolation

3. JavaScript Optimization:
   - Debounce expensive operations:
     * Mouse tracking (cursor position): 16ms intervals
     * Window resize: Debounce 250ms
     * Scroll events: Debounce 200ms

   - Virtual scrolling:
     * For long lists (500+ items): Virtual scroll library
     * Render only visible items + buffer
     * Drastically reduces DOM nodes

   - Memoization:
     * Memoize expensive calculations
     * Avoid recalculating glow positions every frame

4. Image Optimization:
   - DLC thumbnail images:
     * Size: 160×200px (for grid view)
     * Format: WebP with fallback to PNG
     * Lazy load: Load on viewport intersection

   - Icon optimization:
     * Use SVG for icons (scalable, small)
     * Inline SVG for frequently used icons
     * Use CSS masks for color variants

   - Background gradients:
     * Use CSS gradients (not image-based)
     * Static gradients for performance

5. Animation Budget:
   - Per-frame budget: 16ms (60fps)
   - Large animations: Defer non-critical work
   - Progress updates: 30-100ms intervals (not 16ms)
   - Real-time updates (speed, %) are fine at lower frequency

6. Browser Paint Performance:
   - Minimize paint areas:
     * Keep animations within contained elements
     * Use will-change: [property] sparingly
     * Use contain: layout for complex sections

   - Layer count:
     * Limit composite layers
     * Use GPU acceleration for key elements
     * Profile with browser DevTools

7. Memory Management:
   - Event listeners:
     * Remove listeners on component unmount
     * Use event delegation for many similar elements
     * Clean up timers and intervals

   - Animation cleanup:
     * Cancel animations when component unmounts
     * Don't create new animation objects per render

Design Notes:
- Profile with Chrome DevTools (Performance tab)
- Target 60fps on mid-range hardware
- Use Lighthouse for performance metrics
- Test on lower-end machines (4GB RAM, integrated GPU)
- Optimize animations based on actual device performance
```

---

## SUMMARY & USAGE GUIDE

### How to Use This Prompt Pack with Google Stitch AI

1. **Copy individual prompts** from this document into Google Stitch AI
2. **Customize as needed** with specific brand colors or measurements
3. **Combine related prompts** for comprehensive component design
4. **Iterate and refine** based on generated outputs
5. **Export design assets** for use in the development process

### Recommended Prompt Application Order

**Phase 1: Foundation**
- 1.1 Overall Design Theme
- 1.2 Glassmorphism Implementation
- 1.3 Color Accessibility & Contrast

**Phase 2: Components**
- 2.1 through 2.8 (all component prompts)
- 3.1 through 3.4 (all interactive components)

**Phase 3: Screens**
- 4.1 through 4.5 (all screen designs)

**Phase 4: Animation & Polish**
- 5.1 through 5.4 (all animations)
- 6.1 through 6.5 (accessibility & optimization)

### Integration with Development

1. **Design Phase**: Generate all visual references
2. **Component Development**: Use component prompts as specs
3. **Implementation**: Code components with exact specifications
4. **Testing**: Validate against accessibility requirements
5. **Optimization**: Apply performance recommendations

---

**Created by:** Claude Code
**Date:** 2025-12-25
**Version:** 1.0
**Status:** Ready for Google Stitch AI Integration
