# Vision Pro UX Stitch AI Prompt Pack - Index
## The Sims 4 Updater Desktop Application

**Created:** 2025-12-25
**Project:** The Sims 4 Updater v2.0 (Electron + React + Python)
**Design Language:** Apple Vision Pro UI/tvOS 18 Principles

---

## Directory Structure

```
.vision_pro_stitch_ai/
├── INDEX.md (this file)
├── 01_DESIGN_SYSTEM.md
├── 02_FOUNDATION_COMPONENTS.md
├── 03_INTERACTIVE_COMPONENTS.md
├── 04_SCREEN_DESIGNS.md
├── 05_ANIMATIONS.md
├── 06_ACCESSIBILITY_POLISH.md
└── QUICK_START.md
```

---

## Quick Navigation

### Design System & Foundation
- **File:** `01_DESIGN_SYSTEM.md`
- **Contents:**
  - Overall design theme and aesthetic
  - Glassmorphism implementation specs
  - Color accessibility and contrast
  - 3 comprehensive prompts for Google Stitch AI

### Foundation Components
- **File:** `02_FOUNDATION_COMPONENTS.md`
- **Components:**
  1. Primary Button
  2. Secondary Button
  3. Glass Panel/Card
  4. Input Field
  5. Toggle/Switch
  6. Progress Bar
  7. Badge/Tag
  8. Checkbox & Radio Button
- **Total:** 8 detailed component prompts

### Interactive Components
- **File:** `03_INTERACTIVE_COMPONENTS.md`
- **Components:**
  1. Dropdown/Select Menu
  2. Modal/Dialog
  3. Notification Toast
  4. Tooltip
- **Total:** 4 detailed interactive component prompts

### Screen-Level Designs
- **File:** `04_SCREEN_DESIGNS.md`
- **Screens:**
  1. Main Dashboard
  2. DLC Selection Grid View
  3. Update Progress Monitor
  4. Settings & Configuration
  5. Error & Recovery Interface
- **Total:** 5 comprehensive screen design prompts

### Animations & Transitions
- **File:** `05_ANIMATIONS.md`
- **Animation Categories:**
  1. Magnetic Focus Engine
  2. Transition Animations
  3. Micro-Interactions
  4. Loading & Progress Animations
- **Total:** 4 animation system prompts

### Accessibility & Polish
- **File:** `06_ACCESSIBILITY_POLISH.md`
- **Topics:**
  1. Keyboard Navigation
  2. Screen Reader Support (ARIA)
  3. Color Contrast & Visual Clarity
  4. Responsive Design
  5. Performance Optimization
- **Total:** 5 comprehensive accessibility prompts

---

## How to Use This Prompt Pack

### Method 1: Direct Copy-Paste (Recommended)
1. Open the relevant `.md` file for your current task
2. Copy the prompt text for the specific component/screen
3. Paste into Google Stitch AI
4. Customize colors/measurements as needed
5. Generate design assets

### Method 2: Bulk Import
1. Copy the entire content of `VISION_PRO_STITCH_AI_PROMPTS.md` (main file)
2. Paste into Google Stitch AI
3. Request specific sections/components
4. Ask AI to generate assets for prioritized items

### Method 3: Iterative Development
1. Start with `01_DESIGN_SYSTEM.md`
2. Generate foundational design assets
3. Use `02_FOUNDATION_COMPONENTS.md` for core components
4. Progress through screens using `04_SCREEN_DESIGNS.md`
5. Add animations from `05_ANIMATIONS.md`
6. Verify accessibility with `06_ACCESSIBILITY_POLISH.md`

---

## Key Design Specifications Quick Reference

### Color Palette
- **Primary Glass:** rgba(255,255,255,0.08-0.15)
- **Accent (Interactive):** #00d4ff (Cyan)
- **Success:** #00ff88 (Bright Green)
- **Warning:** #ffcc00 (Bright Yellow)
- **Error:** #ff4444 (Bright Red)
- **Background:** Linear gradient #0a0e27 to #1a1a2e
- **Text Primary:** #ffffff
- **Text Secondary:** #b0b0b0

### Core Measurements
- **Blur:** 8px (subtle), 12px (medium), 16px (high), 20px (ultra)
- **Border Radius:** 6px (small), 8px (inputs), 10px (panels), 12px (cards), 16px (large), 20px (modals)
- **Padding:** 12px (compact), 16px (standard), 24px (generous), 32px (sections)
- **Button Height:** 40px (small), 44px (standard), 48px (large), 56px (extra-large)
- **Touch Target Min:** 44×44px

### Animation Standards
- **Standard Duration:** 150-300ms
- **Easing:** cubic-bezier(0.34, 1.56, 0.64, 1) (spring)
- **Modal Duration:** 300ms in, 200ms out
- **Transition Easing:** cubic-bezier(0.25, 0.46, 0.45, 0.94) (smooth)
- **Target FPS:** 60fps (16ms per frame)

### Accessibility
- **Minimum Contrast:** WCAG AAA (7:1 ratio)
- **Focus Ring:** 2px solid #00d4ff + 3px outer glow
- **Keyboard Navigation:** Tab, Shift+Tab, Enter, Space, Escape, Arrow Keys
- **Skip Links:** Support for screen reader users

---

## Priority Implementation Order

### Phase 1: Foundation (Week 1)
1. ✓ Establish design tokens (colors, spacing, typography)
2. ✓ Create base components (Button, Input, Card)
3. ✓ Implement glassmorphism effects
4. ✓ Set up animation framework

### Phase 2: Core Components (Week 2)
1. ✓ Build all foundation components
2. ✓ Create interactive components (Dropdown, Modal, Toast)
3. ✓ Implement focus & keyboard navigation
4. ✓ User manual verification

### Phase 3: Screens (Week 3-4)
1. ✓ Design & implement Dashboard
2. ✓ Design & implement DLC Grid
3. ✓ Design & implement Progress Monitor
4. ✓ Design & implement Settings
5. ✓ Design & implement Error Recovery
6. ✓ User manual verification

### Phase 4: Polish (Week 5)
1. ✓ Add all animations
2. ✓ Implement magnetic focus engine
3. ✓ Performance optimization
4. ✓ Accessibility audit (WCAG AAA)
5. ✓ Final polish & testing

---

## Integration with Development Workflow

### For Frontend Developers
1. Use component specs as implementation reference
2. Match exact measurements and colors
3. Implement animations per specifications
4. Test keyboard navigation
5. Verify contrast ratios with WCAG tool

### For Designers
1. Generate assets using Google Stitch AI
2. Export color swatches and component samples
3. Create Figma design system
4. Provide handoff specs to developers

### For QA/Testing
1. Use accessibility prompts for testing guidelines
2. Verify keyboard navigation per specifications
3. Test across breakpoints (1024px, 1440px, 1920px, 2560px)
4. Validate color contrast ratios
5. Performance test animations on various hardware

---

## Google Stitch AI Generation Tips

### Effective Prompts
✓ Include specific measurements and colors
✓ Request visual examples and variations
✓ Ask for multiple states (hover, focus, active, disabled)
✓ Specify animation timings and easing functions
✓ Request accessibility considerations

### Request Examples
- "Generate a primary button component with 3 size variations"
- "Create a dashboard mockup with all the sections specified"
- "Design a DLC card with hover and selected states"
- "Show the progress screen with real-time animation"

### Output Requests
- Request PNG/SVG exports
- Ask for animation demonstrations
- Request responsive layout previews
- Export design tokens (CSS variables)
- Request Figma-compatible assets

---

## File Status & Completeness

| File | Status | Sections | Components |
|------|--------|----------|-----------|
| 01_DESIGN_SYSTEM.md | Complete | 3 | - |
| 02_FOUNDATION_COMPONENTS.md | Complete | 8 | 8 |
| 03_INTERACTIVE_COMPONENTS.md | Complete | 4 | 4 |
| 04_SCREEN_DESIGNS.md | Complete | 5 | 5 |
| 05_ANIMATIONS.md | Complete | 4 | 20+ |
| 06_ACCESSIBILITY_POLISH.md | Complete | 5 | - |

**Total:** 29 detailed prompts covering 40+ UI components, 5 screens, 20+ animations

---

## Next Steps

1. **Now:** Review this index and choose starting point
2. **Next:** Open relevant `.md` file for your current task
3. **Then:** Copy prompt into Google Stitch AI
4. **Finally:** Integrate generated assets into development

---

## Support & Customization

### To Customize Prompts
- Replace color codes with your brand colors
- Adjust measurements for different screen sizes
- Modify animations for different devices
- Add project-specific requirements

### To Extend Prompts
- Add more component variants
- Create additional screen designs
- Add platform-specific guidance (Windows, macOS, Linux)
- Include performance metrics

### Questions or Issues
- Cross-reference specifications across files
- Check "Quick Reference" sections
- Review related prompt files for consistency
- Ensure all values follow established design tokens

---

**Ready to design?** Start with `01_DESIGN_SYSTEM.md` and work through to `06_ACCESSIBILITY_POLISH.md`

Last Updated: 2025-12-25
