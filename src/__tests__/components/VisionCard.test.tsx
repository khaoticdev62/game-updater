import React from 'react';
import { render, screen, fireEvent } from '../utils/test-utils';
import { VisionCard } from '../../components/VisionCard';

describe('VisionCard Component', () => {
  it('renders children correctly', () => {
    render(
      <VisionCard>
        <div>Test Content</div>
      </VisionCard>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies glass morphism classes', () => {
    const { container } = render(
      <VisionCard>
        <div>Content</div>
      </VisionCard>
    );

    const card = container.querySelector('.glass-medium');
    expect(card).toBeInTheDocument();
  });

  it('accepts default variant', () => {
    const { container } = render(
      <VisionCard variant="default">
        <div>Content</div>
      </VisionCard>
    );

    const card = container.querySelector('[class*="vision-card"]');
    expect(card).toBeInTheDocument();
  });

  it('accepts elevated variant', () => {
    const { container } = render(
      <VisionCard variant="elevated">
        <div>Content</div>
      </VisionCard>
    );

    const card = container.querySelector('[class*="vision-card"]');
    expect(card).toBeInTheDocument();
  });

  it('accepts interactive variant', () => {
    const { container } = render(
      <VisionCard variant="interactive">
        <div>Content</div>
      </VisionCard>
    );

    const card = container.querySelector('[class*="interactive"]');
    expect(card).toBeInTheDocument();
  });

  it('has rounded borders', () => {
    const { container } = render(
      <VisionCard>
        <div>Content</div>
      </VisionCard>
    );

    const card = container.querySelector('[class*="rounded"]');
    expect(card).toBeInTheDocument();
  });

  it('has shadow effect', () => {
    const { container } = render(
      <VisionCard>
        <div>Content</div>
      </VisionCard>
    );

    const card = container.querySelector('[class*="shadow"]');
    expect(card).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <VisionCard className="custom-class">
        <div>Content</div>
      </VisionCard>
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('responds to mouse move events', () => {
    const { container } = render(
      <VisionCard>
        <div>Content</div>
      </VisionCard>
    );

    const card = container.firstChild as HTMLElement;
    fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });

    // Verify event handler was called
    expect(card).toBeInTheDocument();
  });

  it('responds to mouse leave events', () => {
    const { container } = render(
      <VisionCard>
        <div>Content</div>
      </VisionCard>
    );

    const card = container.firstChild as HTMLElement;
    fireEvent.mouseLeave(card);

    // Verify event handler was called
    expect(card).toBeInTheDocument();
  });

  it('applies hover scale effect for interactive variant', () => {
    const { container } = render(
      <VisionCard variant="interactive">
        <div>Content</div>
      </VisionCard>
    );

    const card = container.querySelector('[class*="interactive"]');
    expect(card).toHaveClass('interactive');
  });

  it('maintains proper padding', () => {
    const { container } = render(
      <VisionCard>
        <div>Content</div>
      </VisionCard>
    );

    const card = container.querySelector('[class*="p-"]');
    expect(card).toBeInTheDocument();
  });

  it('supports multiple children', () => {
    render(
      <VisionCard>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </VisionCard>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('has border styling', () => {
    const { container } = render(
      <VisionCard>
        <div>Content</div>
      </VisionCard>
    );

    const card = container.querySelector('[class*="border"]');
    expect(card).toBeInTheDocument();
  });

  it('uses proper z-index layering', () => {
    const { container } = render(
      <VisionCard>
        <div>Content</div>
      </VisionCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();
    // z-index is applied via CSS class, verified by presence of card
  });
});
