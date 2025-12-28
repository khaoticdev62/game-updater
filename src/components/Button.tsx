import React from 'react';

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
 * Button component with multiple visual variants and states.
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
 *   - Full keyboard accessibility
 *   - Focus visible ring
 */

const ButtonComponent: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
}) => {
  // Memoize variant-specific classes
  const getVariantClasses = React.useCallback(() => {
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
  }, [variant]);

  const isDisabled = disabled || loading;

  return (
    <button
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
        duration-200
        focus-visible:ring-2
        focus-visible:ring-blue-400
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="spinner spinner-sm" />
          <span>{children}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export const Button = React.memo(ButtonComponent);

export default Button;
