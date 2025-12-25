import { useState, useRef, useCallback } from 'react';

interface ParallaxState {
  x: number;
  y: number;
  rotateX: number;
  rotateY: number;
}

interface UseParallaxReturn {
  transform: string;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseLeave: () => void;
}

/**
 * useParallax Hook
 *
 * Creates a 3D parallax effect based on mouse position.
 * Tracks mouse movement relative to the element and calculates
 * 3D transform values for a magnetic, depth-aware effect.
 *
 * @param strength - Controls the intensity of the parallax effect (default: 10)
 * @returns Object with transform string and event handlers
 */
export const useParallax = (strength: number = 10): UseParallaxReturn => {
  const [parallaxState, setParallaxState] = useState<ParallaxState>({
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
  });

  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate distance from center
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const distX = (mouseX - centerX) / centerX;
    const distY = (mouseY - centerY) / centerY;

    // Calculate rotation angles (clamped)
    const rotateX = Math.max(-strength, Math.min(strength, distY * strength));
    const rotateY = Math.max(-strength, Math.min(strength, distX * strength));

    // Calculate translation for depth effect
    const x = (distX * strength) / 2;
    const y = (distY * strength) / 2;

    setParallaxState({
      x,
      y,
      rotateX,
      rotateY,
    });
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    // Smooth return to neutral position
    setParallaxState({
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
    });
  }, []);

  // Build CSS 3D transform string
  const transform = `
    perspective(1000px)
    rotateX(${parallaxState.rotateX}deg)
    rotateY(${parallaxState.rotateY}deg)
    translateZ(20px)
    translateX(${parallaxState.x}px)
    translateY(${parallaxState.y}px)
  `.trim();

  return {
    transform,
    handleMouseMove,
    handleMouseLeave,
  };
};

export default useParallax;
