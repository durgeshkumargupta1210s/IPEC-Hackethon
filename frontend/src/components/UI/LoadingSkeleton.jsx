import React from 'react';
import './UI.css';

/**
 * LoadingSkeleton - Animated skeleton loader for data loading states
 */
export function LoadingSkeleton({ 
  count = 1, 
  variant = 'card',
  height = '100px' 
}) {
  const skeletons = Array.from({ length: count });

  const variantClasses = {
    card: 'loading-skeleton-card',
    text: 'loading-skeleton-text',
    metric: 'loading-skeleton-metric',
  };

  return (
    <>
      {skeletons.map((_, idx) => (
        <div 
          key={idx} 
          className={`loading-skeleton ${variantClasses[variant]}`}
          style={variant === 'text' ? { height } : {}}
        />
      ))}
    </>
  );
}
