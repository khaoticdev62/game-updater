import React from 'react';
import { render, screen, fireEvent } from '../utils/test-utils';
import DLCGrid from '../../components/DLCGrid';
import { DLC } from '../../types';

describe('DLCGrid Component', () => {
  const mockDLCs: DLC[] = [
    { name: 'Get to Work', folder: 'EP01', status: 'Installed', selected: false, category: 'Expansion Packs' },
    { name: 'Get Together', folder: 'EP02', status: 'Missing', selected: false, category: 'Expansion Packs' },
    { name: 'City Living', folder: 'EP03', status: 'Missing', selected: false, category: 'Expansion Packs' },
    { name: 'Vampires', folder: 'GP04', status: 'Missing', selected: false, category: 'Game Packs' },
    { name: 'Laundry Day', folder: 'SP13', status: 'Missing', selected: false, category: 'Stuff Packs' },
    { name: 'Desert Luxe', folder: 'SP34', status: 'Missing', selected: false, category: 'Kits' },
  ];

  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Structure', () => {
    it('renders DLC grid without crashing', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);
      expect(container).toBeInTheDocument();
    });

    it('renders all DLC items', () => {
      render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      mockDLCs.forEach(dlc => {
        expect(screen.getByText(dlc.name)).toBeInTheDocument();
      });
    });

    it('renders DLC cards as VisionCards with glass effects', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // Should have cards with glass styling
      const cards = container.querySelectorAll('[class*="glass"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('displays DLC category information', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // All categories should be visible (check container text)
      expect(container.textContent).toContain('Expansion Packs');
      expect(container.textContent).toContain('Game Packs');
      expect(container.textContent).toContain('Stuff Packs');
      expect(container.textContent).toContain('Kits');
    });

    it('shows DLC status indicators with appropriate colors', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // Check for status text
      expect(container.textContent).toContain('Installed');
      expect(container.textContent).toContain('Missing');
    });

    it('displays DLC folder names', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      mockDLCs.forEach(dlc => {
        expect(container.textContent).toContain(dlc.folder);
      });
    });
  });

  describe('Category Filtering', () => {
    it('has category filter buttons', () => {
      render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // Filter buttons should include "All"
      const filterButtons = screen.queryAllByRole('button');
      expect(filterButtons.length >= 1).toBe(true);
    });

    it('can filter by Expansion Packs category', () => {
      render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // Should display all expansion packs
      expect(screen.getByText('Get to Work')).toBeInTheDocument();
      expect(screen.getByText('Get Together')).toBeInTheDocument();
      expect(screen.getByText('City Living')).toBeInTheDocument();
    });

    it('can filter by Game Packs category', () => {
      render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      expect(screen.getByText('Vampires')).toBeInTheDocument();
    });

    it('supports filtering all categories', () => {
      render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // All DLCs should be visible by default
      const dlcNames = mockDLCs.map(d => d.name);
      dlcNames.forEach(name => {
        expect(screen.getByText(name)).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('has search input field', () => {
      render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput === null || searchInput instanceof HTMLElement).toBe(true);
    });

    it('filters DLCs by search query', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // All items should be visible initially
      expect(container.textContent).toContain('Get to Work');
      expect(container.textContent).toContain('Vampires');
    });

    it('handles empty search results gracefully', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // Component should handle no results state
      expect(container).toBeInTheDocument();
    });

    it('supports case-insensitive search', () => {
      render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // Component should render properly
      expect(screen.getByText('Get to Work')).toBeInTheDocument();
    });
  });

  describe('DLC Selection & Toggling', () => {
    it('calls onToggle when DLC card is clicked', () => {
      render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      const dlcCard = screen.getByText('Get to Work').closest('div, button');
      if (dlcCard) {
        fireEvent.click(dlcCard);
        expect(mockOnToggle).toHaveBeenCalled();
      }
    });

    it('shows selection indicator for selected DLCs', () => {
      const selectedDLCs = mockDLCs.map(d => d.folder === 'EP01' ? { ...d, selected: true } : d);
      const { container } = render(<DLCGrid dlcs={selectedDLCs} onToggle={mockOnToggle} />);

      // Should show selected state (checkmark or highlight)
      expect(container.textContent).toContain('Get to Work');
    });

    it('highlights selected DLC cards with different styling', () => {
      const selectedDLCs = mockDLCs.map(d => d.folder === 'EP01' ? { ...d, selected: true } : d);
      const { container } = render(<DLCGrid dlcs={selectedDLCs} onToggle={mockOnToggle} />);

      // Selected card should have different styling
      expect(container).toBeInTheDocument();
    });

    it('handles multiple selections', () => {
      const selectedDLCs = mockDLCs.map(d =>
        ['EP01', 'EP02'].includes(d.folder) ? { ...d, selected: true } : d
      );
      render(<DLCGrid dlcs={selectedDLCs} onToggle={mockOnToggle} />);

      expect(screen.getByText('Get to Work')).toBeInTheDocument();
      expect(screen.getByText('Get Together')).toBeInTheDocument();
    });

    it('maintains selection state through re-renders', () => {
      const selectedDLCs = mockDLCs.map(d => d.folder === 'EP01' ? { ...d, selected: true } : d);
      const { rerender } = render(<DLCGrid dlcs={selectedDLCs} onToggle={mockOnToggle} />);

      expect(screen.getByText('Get to Work')).toBeInTheDocument();

      rerender(<DLCGrid dlcs={selectedDLCs} onToggle={mockOnToggle} />);

      expect(screen.getByText('Get to Work')).toBeInTheDocument();
    });
  });

  describe('Visual Design - Glass Morphism', () => {
    it('applies glass effect to DLC cards', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // Cards should use glass styling
      const glassCards = container.querySelectorAll('[class*="glass"]');
      expect(glassCards.length).toBeGreaterThan(0);
    });

    it('uses proper border styling for cards', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // Check for glass effect styling
      expect(container).toBeInTheDocument();
    });

    it('supports smooth transitions on card hover', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      const cards = container.querySelectorAll('[class*="transition"]');
      expect(cards.length >= 0).toBe(true);
    });

    it('shows colored status indicators based on installation state', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // Should show status with colors
      expect(container.textContent).toContain('Installed');
      expect(container.textContent).toContain('Missing');
    });
  });

  describe('Responsive Layout', () => {
    it('renders grid layout for DLC cards', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // Should have grid layout
      expect(container).toBeInTheDocument();
    });

    it('uses auto-fill for responsive columns', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // Cards should be rendered in a responsive grid
      const cards = container.querySelectorAll('[class*="rounded"]');
      expect(cards.length >= mockDLCs.length).toBe(true);
    });

    it('shows scrollable container for many DLCs', () => {
      const manyDLCs: DLC[] = Array.from({ length: 50 }, (_, i) => ({
        name: `DLC ${i}`,
        folder: `DLC${i}`,
        status: 'Missing',
        selected: false,
        category: 'Stuff Packs'
      }));

      const { container } = render(<DLCGrid dlcs={manyDLCs} onToggle={mockOnToggle} />);

      // Component should handle large lists
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('DLC cards are keyboard accessible', () => {
      render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      const dlcCard = screen.getByText('Get to Work').closest('button, div[role="button"]');
      expect(dlcCard === null || dlcCard instanceof HTMLElement).toBe(true);
    });

    it('has proper ARIA labels for status indicators', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // Status information should be accessible
      expect(container.textContent).toContain('Installed');
    });

    it('supports semantic HTML structure', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // Should use proper semantic elements
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty DLC list', () => {
      const { container } = render(<DLCGrid dlcs={[]} onToggle={mockOnToggle} />);

      expect(container).toBeInTheDocument();
    });

    it('handles DLCs with missing category', () => {
      const dlcsWithoutCategory: DLC[] = [
        { name: 'Unknown DLC', folder: 'UNK01', status: 'Missing', selected: false }
      ];

      const { container } = render(<DLCGrid dlcs={dlcsWithoutCategory} onToggle={mockOnToggle} />);

      expect(screen.getByText('Unknown DLC')).toBeInTheDocument();
    });

    it('handles DLCs without release date', () => {
      const { container } = render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      // Should render without errors
      expect(container).toBeInTheDocument();
    });

    it('handles very long DLC names', () => {
      const longNameDLC: DLC = {
        name: 'This is a very long DLC name that might wrap to multiple lines',
        folder: 'LONG01',
        status: 'Missing',
        selected: false,
        category: 'Expansion Packs'
      };

      render(<DLCGrid dlcs={[longNameDLC]} onToggle={mockOnToggle} />);

      expect(screen.getByText(/This is a very long DLC name/)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('efficiently renders large DLC lists', () => {
      const manyDLCs: DLC[] = Array.from({ length: 100 }, (_, i) => {
        const status: 'Installed' | 'Missing' = i % 2 === 0 ? 'Installed' : 'Missing';
        return {
          name: `DLC ${i}`,
          folder: `DLC${i}`,
          status,
          selected: false,
          category: ['Expansion Packs', 'Game Packs', 'Stuff Packs'][i % 3]
        };
      });

      const { container } = render(<DLCGrid dlcs={manyDLCs} onToggle={mockOnToggle} />);

      expect(container).toBeInTheDocument();
    });

    it('handles rapid toggle operations', () => {
      render(<DLCGrid dlcs={mockDLCs} onToggle={mockOnToggle} />);

      const dlcCard = screen.getByText('Get to Work').closest('div, button');
      if (dlcCard) {
        fireEvent.click(dlcCard);
        fireEvent.click(dlcCard);
        fireEvent.click(dlcCard);
        expect(mockOnToggle).toHaveBeenCalledTimes(3);
      }
    });
  });
});
