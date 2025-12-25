import React from 'react';
import { render, screen } from '../utils/test-utils';
import { Environment } from '../../components/Environment';

describe('Environment Component', () => {
  it('renders children correctly', () => {
    const { container } = render(
      <Environment isHealthy={true} isProbing={false}>
        <div>Test Content</div>
      </Environment>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });

  it('applies glass effect classes', () => {
    const { container } = render(
      <Environment isHealthy={true} isProbing={false}>
        <div>Content</div>
      </Environment>
    );

    const wrapper = container.querySelector('.glass-light');
    expect(wrapper).toBeInTheDocument();
  });

  it('applies healthy state styling when isHealthy is true', () => {
    const { container } = render(
      <Environment isHealthy={true} isProbing={false}>
        <div>Content</div>
      </Environment>
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('bg-mesh-gradient-blue');
  });

  it('applies unhealthy state styling when isHealthy is false', () => {
    const { container } = render(
      <Environment isHealthy={false} isProbing={false}>
        <div>Content</div>
      </Environment>
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('bg-mesh-gradient-purple');
  });

  it('maintains minimum height for full viewport', () => {
    const { container } = render(
      <Environment isHealthy={true} isProbing={false}>
        <div>Content</div>
      </Environment>
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('min-h-screen');
  });

  it('accepts multiple children', () => {
    render(
      <Environment isHealthy={true} isProbing={false}>
        <div>Content 1</div>
        <div>Content 2</div>
        <div>Content 3</div>
      </Environment>
    );

    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.getByText('Content 3')).toBeInTheDocument();
  });

  it('changes background when isHealthy prop changes', () => {
    const { container, rerender } = render(
      <Environment isHealthy={true} isProbing={false}>
        <div>Content</div>
      </Environment>
    );

    expect(container.firstChild).toHaveClass('bg-mesh-gradient-blue');

    rerender(
      <Environment isHealthy={false} isProbing={false}>
        <div>Content</div>
      </Environment>
    );

    expect(container.firstChild).toHaveClass('bg-mesh-gradient-purple');
  });

  it('handles isProbing prop without error', () => {
    const { container: container1 } = render(
      <Environment isHealthy={true} isProbing={false}>
        <div>Content</div>
      </Environment>
    );

    const { container: container2 } = render(
      <Environment isHealthy={true} isProbing={true}>
        <div>Content</div>
      </Environment>
    );

    expect(container1).toBeInTheDocument();
    expect(container2).toBeInTheDocument();
  });
});
