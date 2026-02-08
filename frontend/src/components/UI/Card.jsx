import React from 'react';
import './UI.css';

/**
 * Card - Base card component with consistent styling
 */
export function Card({
  children,
  variant = 'default',
  header = null,
  footer = null,
  hoverable = true,
  className = '',
  ...props
}) {
  return (
    <div 
      className={`card card-${variant} ${hoverable ? 'card-hoverable' : ''} ${className}`}
      {...props}
    >
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">
        {children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
