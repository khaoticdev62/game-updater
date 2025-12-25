import React, { useState, useEffect } from 'react';

interface CustomCursorProps {
  isHealthy: boolean;
  isProbing: boolean;
}

const CustomCursor: React.FC<CustomCursorProps> = ({ isHealthy, isProbing }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);

  const getCursorColor = () => {
    if (isProbing) return '#f1c40f'; // Warning/Scanning
    return isHealthy ? '#3498db' : '#e74c3c'; // Normal vs Error
  };

  return (
    <div style={{
      position: 'fixed',
      top: position.y,
      left: position.x,
      width: isProbing ? '24px' : '12px',
      height: isProbing ? '24px' : '12px',
      backgroundColor: 'transparent',
      border: `2px solid ${getCursorColor()}`,
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: 9999,
      transform: 'translate(-50%, -50%)',
      transition: 'width 0.2s, height 0.2s, border-color 0.2s',
      boxShadow: `0 0 10px ${getCursorColor()}`
    }}>
      {isProbing && (
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: `2px solid ${getCursorColor()}`,
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CustomCursor;
