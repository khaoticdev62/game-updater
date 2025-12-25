import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import CustomCursor from '../../components/CustomCursor';

describe('CustomCursor Component', () => {
  beforeEach(() => {
    // Clear any previous renders
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <CustomCursor isHealthy={true} isProbing={false} />
    );
    expect(container).toBeInTheDocument();
  });

  it('updates position on mouse move', async () => {
    const { container } = render(
      <CustomCursor isHealthy={true} isProbing={false} />
    );

    const cursor = container.querySelector('[style*="position: fixed"]');
    expect(cursor).toBeInTheDocument();

    // Simulate mouse move
    fireEvent.mouseMove(window, { clientX: 100, clientY: 200 });

    await waitFor(() => {
      const updatedCursor = container.querySelector('[style*="position: fixed"]');
      expect(updatedCursor).toHaveStyle('left: 100px');
      expect(updatedCursor).toHaveStyle('top: 200px');
    });
  });

  it('changes color to blue when healthy', async () => {
    const { rerender, container } = render(
      <CustomCursor isHealthy={true} isProbing={false} />
    );

    const cursor = container.querySelector('[style*="border"]');
    expect(cursor).toHaveStyle('border-color: rgb(52, 152, 219)'); // #3498db
  });

  it('changes color to red when unhealthy', () => {
    const { container } = render(
      <CustomCursor isHealthy={false} isProbing={false} />
    );

    const cursor = container.querySelector('[style*="border"]');
    expect(cursor).toHaveStyle('border-color: rgb(231, 76, 60)'); // #e74c3c
  });

  it('changes color to yellow when probing', () => {
    const { container } = render(
      <CustomCursor isHealthy={true} isProbing={true} />
    );

    const cursor = container.querySelector('[style*="border"]');
    expect(cursor).toHaveStyle('border-color: rgb(241, 196, 15)'); // #f1c40f
  });

  it('has glow effect', () => {
    const { container } = render(
      <CustomCursor isHealthy={true} isProbing={false} />
    );

    const cursor = container.querySelector('[style*="box-shadow"]');
    expect(cursor).toHaveStyle('box-shadow: 0 0 10px #3498db');
  });

  it('increases size when probing', () => {
    const { container } = render(
      <CustomCursor isHealthy={true} isProbing={true} />
    );

    const cursor = container.querySelector('[style*="width"]');
    expect(cursor).toHaveStyle('width: 24px');
    expect(cursor).toHaveStyle('height: 24px');
  });

  it('has normal size when not probing', () => {
    const { container } = render(
      <CustomCursor isHealthy={true} isProbing={false} />
    );

    const cursor = container.querySelector('[style*="width"]');
    expect(cursor).toHaveStyle('width: 12px');
    expect(cursor).toHaveStyle('height: 12px');
  });

  it('shows spinner animation when probing', () => {
    const { container } = render(
      <CustomCursor isHealthy={true} isProbing={true} />
    );

    const spinner = container.querySelector('[style*="border-top-color: transparent"]');
    expect(spinner).toBeInTheDocument();
  });

  it('hides spinner animation when not probing', () => {
    const { container } = render(
      <CustomCursor isHealthy={true} isProbing={false} />
    );

    const spinner = container.querySelector('[style*="border-top-color"]');
    expect(spinner).not.toBeInTheDocument();
  });

  it('has fixed positioning', () => {
    const { container } = render(
      <CustomCursor isHealthy={true} isProbing={false} />
    );

    const cursor = container.querySelector('[style*="position: fixed"]');
    expect(cursor).toHaveStyle('position: fixed');
  });

  it('has high z-index for visibility', () => {
    const { container } = render(
      <CustomCursor isHealthy={true} isProbing={false} />
    );

    const cursor = container.querySelector('[style*="position: fixed"]');
    expect(cursor).toHaveStyle('z-index: 9999');
  });

  it('has pointer-events none to not block interactions', () => {
    const { container } = render(
      <CustomCursor isHealthy={true} isProbing={false} />
    );

    const cursor = container.querySelector('[style*="pointer-events"]');
    expect(cursor).toHaveStyle('pointer-events: none');
  });

  it('responds to health status changes', async () => {
    const { rerender, container } = render(
      <CustomCursor isHealthy={true} isProbing={false} />
    );

    let cursor = container.querySelector('[style*="border"]');
    expect(cursor).toHaveStyle('border-color: rgb(52, 152, 219)'); // Blue

    rerender(<CustomCursor isHealthy={false} isProbing={false} />);

    cursor = container.querySelector('[style*="border"]');
    expect(cursor).toHaveStyle('border-color: rgb(231, 76, 60)'); // Red
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <CustomCursor isHealthy={true} isProbing={false} />
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
