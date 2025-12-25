import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

/**
 * Button Component
 *
 * High-polish button component with multiple visual variants and states.
 * Features smooth animations, haptic feedback, and full accessibility support.
 *
 * Props:
 *   - children: Button content
 *   - variant: Visual style ('primary', 'secondary', 'danger', 'ghost')
 *   - onClick: Click handler
 *   - disabled: Disable button
 *   - loading: Show loading spinner and disable interaction
 *   - type: HTML button type
 *   - className: Additional classes
 *
 * Features:
 *   - Multiple color variants
 *   - Loading state with spinner
 *   - Disabled state styling
 *   - Haptic feedback animation (scale on click)
 *   - Smooth transitions
 *   - Full keyboard accessibility
 *   - Focus visible ring
 */

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
}) => {
  // Determine variant-specific classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'glass-medium hover:glass-heavy text-white border border-white/10';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'ghost':
        return 'hover:glass-light text-white';
      case 'primary':
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        btn-${variant}
        ${getVariantClasses()}
        px-6
        py-3
        rounded-button
        font-semibold
        transition-all
        duration-micro
        transform-gpu
        focus-visible:ring-2
        focus-visible:ring-blue-400
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="spinner spinner-sm" />
          <span>{children}</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
