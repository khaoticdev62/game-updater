/**
 * Tailwind Configuration Tests
 * Verifies that the Tailwind 4 design system is properly configured
 */

describe('Tailwind 4 Configuration', () => {
  it('should have valid config file', () => {
    const config = require('../../tailwind.config.js');
    expect(config).toBeDefined();
    expect(config.theme).toBeDefined();
    expect(config.theme.extend).toBeDefined();
  });

  it('should define glass background colors', () => {
    const config = require('../../tailwind.config.js');
    const colors = config.theme.extend.backgroundColor;

    expect(colors['glass-light']).toBeDefined();
    expect(colors['glass-medium']).toBeDefined();
    expect(colors['glass-heavy']).toBeDefined();
  });

  it('should define glass blur utilities', () => {
    const config = require('../../tailwind.config.js');
    const blurs = config.theme.extend.backdropBlur;

    expect(blurs['glass-light']).toBeDefined();
    expect(blurs['glass-medium']).toBeDefined();
    expect(blurs['glass-heavy']).toBeDefined();
  });

  it('should define mesh gradient backgrounds', () => {
    const config = require('../../tailwind.config.js');
    const images = config.theme.extend.backgroundImage;

    expect(images['mesh-gradient-blue']).toBeDefined();
    expect(images['mesh-gradient-purple']).toBeDefined();
    expect(images['mesh-gradient-dark']).toBeDefined();
  });

  it('should define custom shadow depths', () => {
    const config = require('../../tailwind.config.js');
    const shadows = config.theme.extend.boxShadow;

    expect(shadows['glass-sm']).toBeDefined();
    expect(shadows['glass-md']).toBeDefined();
    expect(shadows['glass-lg']).toBeDefined();
    expect(shadows['glass-glow']).toBeDefined();
    expect(shadows['glass-glow-purple']).toBeDefined();
  });

  it('should define color palette', () => {
    const config = require('../../tailwind.config.js');
    const colors = config.theme.extend.colors;

    expect(colors.primary).toBeDefined();
    expect(colors.accent).toBeDefined();

    // Verify primary color scale
    expect(colors.primary['500']).toEqual('#3b82f6');
    expect(colors.primary['600']).toEqual('#2563eb');
  });

  it('should define display typography', () => {
    const config = require('../../tailwind.config.js');
    const sizes = config.theme.extend.fontSize;

    expect(sizes.display).toBeDefined();
    expect(sizes.headline).toBeDefined();
    expect(sizes.title).toBeDefined();
    expect(sizes.body).toBeDefined();
    expect(sizes.caption).toBeDefined();
  });

  it('should define border radius utilities', () => {
    const config = require('../../tailwind.config.js');
    const radius = config.theme.extend.borderRadius;

    expect(radius.glass).toBeDefined();
    expect(radius.card).toBeDefined();
    expect(radius.button).toBeDefined();
  });

  it('should define smooth transitions', () => {
    const config = require('../../tailwind.config.js');
    const durations = config.theme.extend.transitionDuration;

    expect(durations.micro).toBeDefined();
    expect(durations.fast).toBeDefined();
    expect(durations.normal).toBeDefined();
    expect(durations.slow).toBeDefined();
  });

  it('should include custom plugins', () => {
    const config = require('../../tailwind.config.js');
    expect(config.plugins).toBeDefined();
    expect(Array.isArray(config.plugins)).toBe(true);
    expect(config.plugins.length).toBeGreaterThan(0);
  });

  it('should have content glob patterns', () => {
    const config = require('../../tailwind.config.js');
    expect(config.content).toBeDefined();
    expect(Array.isArray(config.content)).toBe(true);
    expect(config.content.length).toBeGreaterThan(0);
  });
});
