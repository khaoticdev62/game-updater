import React from 'react';
import { motion } from 'framer-motion';

/**
 * Environment Component
 *
 * Creates an animated mesh gradient background that responds to application state.
 * The background color shifts based on backend health status, creating a visual
 * indicator of the system's operational state.
 *
 * Props:
 *   - isHealthy: Boolean indicating if the backend is healthy (blue gradient) or not (purple gradient)
 *   - isProbing: Boolean indicating if the system is currently probing/checking status
 *   - children: React nodes to render within the environment
 *
 * Features:
 *   - Smooth transitions between health states
 *   - Glassmorphism overlay effect
 *   - Hardware-accelerated animations
 *   - Responsive to backend status changes
 */

interface EnvironmentProps {
  isHealthy: boolean;
  isProbing: boolean;
  children: React.ReactNode;
}

export const Environment: React.FC<EnvironmentProps> = ({
  isHealthy,
  isProbing,
  children,
}) => {
  return (
    <motion.div
      className={`min-h-screen w-full relative overflow-hidden transform-gpu ${
        isHealthy ? 'bg-mesh-gradient-blue' : 'bg-mesh-gradient-purple'
      }`}
      animate={{
        opacity: isProbing ? 0.8 : 1,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    >
      {/* Animated overlay for depth effect */}
      <motion.div
        className="absolute inset-0 glass-light"
        animate={{
          opacity: isProbing ? 0.3 : 0.1,
        }}
        transition={{
          duration: 0.3,
        }}
      />

      {/* Content wrapper with proper stacking */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};

export default Environment;
