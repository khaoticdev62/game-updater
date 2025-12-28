import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { setupMockElectron } from '../mocks/electron';

/**
 * Custom render function that wraps components with necessary providers
 * and ensures mock electron is configured
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  setupMockElectron();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Override the default render with our custom one
export { customRender as render };

/**
 * Wait for an element to be removed from the DOM
 */
export const waitForElementToBeRemoved = async (element: HTMLElement) => {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        observer.disconnect();
        resolve(undefined);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};
