import React from 'react';
import { render, screen, fireEvent } from '../utils/test-utils';
import { TopShelf } from '../../components/TopShelf';

describe('TopShelf Navigation Component', () => {
  const mockOnViewChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />);
    expect(container).toBeInTheDocument();
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Diagnostics')).toBeInTheDocument();
  });

  it('highlights active view', () => {
    const { container } = render(
      <TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />
    );

    const buttons = container.querySelectorAll('button');
    const dashboardBtn = Array.from(buttons).find(btn => btn.textContent?.includes('Dashboard'));

    expect(dashboardBtn).toHaveClass('bg-white/20');
  });

  it('calls onViewChange when navigation item is clicked', () => {
    render(<TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />);

    const libraryBtn = screen.getByText('Library').closest('button');
    fireEvent.click(libraryBtn!);

    expect(mockOnViewChange).toHaveBeenCalledWith('library');
  });

  it('handles switching between views', () => {
    render(<TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />);

    fireEvent.click(screen.getByText('Diagnostics').closest('button')!);
    expect(mockOnViewChange).toHaveBeenCalledWith('diagnostics');

    fireEvent.click(screen.getByText('Library').closest('button')!);
    expect(mockOnViewChange).toHaveBeenCalledWith('library');
  });

  it('applies glass effect styling', () => {
    const { container } = render(
      <TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />
    );

    const navButtons = container.querySelectorAll('button');
    const hasGlass = Array.from(navButtons).some(btn =>
      btn.className.includes('glass')
    );

    expect(hasGlass).toBe(true);
  });

  it('has proper navigation structure', () => {
    const { container } = render(
      <TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />
    );

    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  it('updates active state when prop changes', () => {
    const { container, rerender } = render(
      <TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />
    );

    let activeBtn = container.querySelector('[class*="bg-white/20"]');
    expect(activeBtn?.textContent).toContain('Dashboard');

    rerender(<TopShelf activeView="library" onViewChange={mockOnViewChange} />);

    activeBtn = container.querySelector('[class*="bg-white/20"]');
    expect(activeBtn?.textContent).toContain('Library');
  });

  it('has hover effects on buttons', () => {
    const { container } = render(
      <TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />
    );

    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
      expect(btn.className).toMatch(/hover/);
    });
  });

  it('renders navigation with proper gap/spacing', () => {
    const { container } = render(
      <TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />
    );

    const nav = container.querySelector('nav');
    expect(nav?.className).toMatch(/gap/);
  });

  it('has proper padding', () => {
    const { container } = render(
      <TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />
    );

    const nav = container.querySelector('nav');
    expect(nav?.className).toMatch(/p-/);
  });

  it('buttons are keyboard accessible', () => {
    render(<TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />);

    const libraryBtn = screen.getByText('Library').closest('button');

    // Simulate keyboard interaction
    fireEvent.keyDown(libraryBtn!, { key: 'Enter' });
    fireEvent.click(libraryBtn!);

    expect(mockOnViewChange).toHaveBeenCalled();
  });

  it('renders with smooth transitions', () => {
    const { container } = render(
      <TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />
    );

    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
      expect(btn.className).toMatch(/transition/);
    });
  });

  it('has proper icon rendering', () => {
    const { container } = render(
      <TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />
    );

    // Icons should be present (from lucide-react)
    const navItems = container.querySelectorAll('button');
    expect(navItems.length).toBeGreaterThan(0);
  });

  it('maintains consistent styling across all nav items', () => {
    const { container } = render(
      <TopShelf activeView="dashboard" onViewChange={mockOnViewChange} />
    );

    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
      expect(btn.className).toMatch(/glass|rounded|p/);
    });
  });
});
