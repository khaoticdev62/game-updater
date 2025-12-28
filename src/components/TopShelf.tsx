import React from 'react';
import { motion } from 'framer-motion';
import { Home, Library, Activity, Settings } from 'lucide-react';

interface TopShelfProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}

/**
 * TopShelf Navigation Component
 *
 * Horizontal navigation system inspired by Apple TV.
 * Provides smooth transitions and visual feedback for the active view.
 *
 * Props:
 *   - activeView: Currently active view ID
 *   - onViewChange: Callback when view is changed
 *
 * Features:
 *   - Glass morphism effects
 *   - Smooth transitions
 *   - Icon integration
 *   - Active state indication
 *   - Keyboard accessible
 *   - Responsive design
 */

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
  { id: 'advanced', label: 'Advanced', icon: Settings },
];

const TopShelfComponent: React.FC<TopShelfProps> = ({ activeView, onViewChange }) => {
  // Memoize click handler to prevent unnecessary function recreation
  const handleItemClick = React.useCallback(
    (itemId: string) => {
      onViewChange(itemId);
    },
    [onViewChange]
  );

  return (
    <nav className="flex gap-4 p-6 bg-slate-950/50 border-b border-white/5">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeView === item.id;

        return (
          <motion.button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`
              glass-light
              px-6
              py-3
              rounded-glass
              flex
              items-center
              gap-2
              text-white
              font-semibold
              transition-all
              duration-fast
              transform-gpu
              hover:glass-medium
              ${isActive ? 'bg-white/20 border-blue-500/50' : ''}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconComponent size={20} className="text-white" />
            <span>{item.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
};

export const TopShelf = React.memo(TopShelfComponent);

export default TopShelf;
