import React from 'react';
import { render, screen } from './utils/test-utils';
import App from '../App';

describe('App Component - Smoke Test', () => {
  it('renders without crashing', () => {
    // This is a basic smoke test - just verify the app renders
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('renders main heading', () => {
    render(<App />);
    const heading = screen.getByText('Sims 4 Updater');
    expect(heading).toBeInTheDocument();
  });

  it('renders configuration section', () => {
    render(<App />);
    const configSection = screen.getByText('Configuration');
    expect(configSection).toBeInTheDocument();
  });

  it('renders available content section', () => {
    render(<App />);
    const contentSection = screen.getByText('Available Content');
    expect(contentSection).toBeInTheDocument();
  });
});
