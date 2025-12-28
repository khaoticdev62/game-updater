import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { Button } from '../../components/Button';

describe('Button Component', () => {
  it('renders with text content', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant by default', () => {
    const { container } = render(<Button>Click</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('btn-primary');
  });

  it('applies secondary variant', () => {
    const { container } = render(<Button variant="secondary">Click</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('btn-secondary');
  });

  it('applies danger variant', () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('btn-danger');
  });

  it('applies ghost variant', () => {
    const { container } = render(<Button variant="ghost">Click</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('btn-ghost');
  });

  it('can be disabled', () => {
    const { container } = render(<Button disabled>Click</Button>);
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('shows loading state with spinner', () => {
    const { container } = render(<Button loading>Loading</Button>);
    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('disables button when loading', () => {
    const { container } = render(<Button loading>Loading</Button>);
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('has proper accessibility attributes', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByText('Click Me') as HTMLButtonElement;
    expect(button.type).toBe('button');
  });

  it('supports children elements', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('applies padding classes', () => {
    const { container } = render(<Button>Click</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('py-3');
  });

  it('applies border radius', () => {
    const { container } = render(<Button>Click</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('rounded-button');
  });

  it('has focus visible state', () => {
    const { container } = render(<Button>Click</Button>);
    const button = container.querySelector('button');
    // Check for focus-visible CSS class (pseudo-class selector)
    expect(button?.className).toMatch(/focus-visible:ring/);
  });

  it('prevents click when disabled', () => {
    const handleClick = jest.fn();
    const { container } = render(
      <Button disabled onClick={handleClick}>
        Click
      </Button>
    );
    const button = container.querySelector('button') as HTMLButtonElement;

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('prevents click when loading', () => {
    const handleClick = jest.fn();
    const { container } = render(
      <Button loading onClick={handleClick}>
        Loading
      </Button>
    );
    const button = container.querySelector('button') as HTMLButtonElement;

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies glass effect for secondary variant', () => {
    const { container } = render(<Button variant="secondary">Click</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('glass-medium');
  });

  it('has transition classes for smooth animations', () => {
    const { container } = render(<Button>Click</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('transition-all');
  });

  it('handles multiple variant changes', () => {
    const { container, rerender } = render(<Button>Click</Button>);
    let button = container.querySelector('button');
    expect(button).toHaveClass('btn-primary');

    rerender(<Button variant="danger">Delete</Button>);
    button = container.querySelector('button');
    expect(button).toHaveClass('btn-danger');
  });
});
