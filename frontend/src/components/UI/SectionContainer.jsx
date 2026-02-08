import React from 'react';
import './UI.css';

/**
 * SectionContainer - Wrapper for organizing sections with consistent styling
 */
export function SectionContainer({ 
  title, 
  icon = '', 
  children, 
  variant = 'default',
  className = '' 
}) {
  return (
    <div className={`section-container section-container-${variant} ${className}`}>
      {title && (
        <div className="section-header">
          {icon && <span className="section-icon">{icon}</span>}
          <h2 className="section-title">{title}</h2>
        </div>
      )}
      <div className="section-content">
        {children}
      </div>
    </div>
  );
}
