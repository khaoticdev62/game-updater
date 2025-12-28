import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useParallax } from '../hooks/useParallax';

interface VisionCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive';
  className?: string;
}

/**
 * VisionCard Component
 *
 * Core reusable component for the Vision Pro UI/UX system.
 * Features glassmorphism effects, 3D parallax transforms, and smooth animations.
 *
 * Props:
 *   - children: React nodes to render inside the card
 *   - variant: Display variant ('default', 'elevated', 'interactive')
 *   - className: Additional custom classes
 *
 * Features:
 *   - Glassmorphism background with backdrop blur
 *   - 3D parallax effect on mouse movement
 *   - Smooth hover animations (scale, glow)
 *   - Multiple visual variants
 *   - Hardware-accelerated transforms
 *   - Responsive design
 */

const VisionCardComponent: React.FC<VisionCardProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { transform, handleMouseMove, handleMouseLeave } = useParallax(8);

  // Determine variant-specific classes
  const getVariantClasses = React.useCallback(() => {
    switch (variant) {
      case 'elevated':
        return 'shadow-glass-lg hover:shadow-glass-glow';
      case 'interactive':
        return 'shadow-glass-md hover:shadow-glass-glow cursor-pointer interactive';
      default:
        return 'shadow-glass-md hover:shadow-glass-lg';
    }
  }, [variant]);

  return (
    <motion.div
      ref={cardRef}
      className={`
        vision-card
        glass-medium
        rounded-card
        p-6
        border
        border-white/10
        transition-all
        duration-fast
        transform-gpu
        ${getVariantClasses()}
        ${className}
      `}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={
        variant === 'interactive'
          ? {
              scale: 1.05,
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            }
          : {}
      }
      whileTap={
        variant === 'interactive'
          ? {
              scale: 0.98,
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            }
          : {}
      }
    >
      {children}
    </motion.div>
  );
};

export const VisionCard = React.memo(VisionCardComponent);

export default VisionCard;
