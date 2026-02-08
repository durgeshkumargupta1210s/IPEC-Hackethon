import React from 'react';
import './UI.css';

/**
 * StatusBadge - Display status indicators with color-coded variants
 */
export function StatusBadge({ 
  label, 
  variant = 'neutral',
  size = 'default',
  icon = null 
}) {
  const sizeClasses = {
    small: 'status-badge-small',
    default: 'status-badge-default',
    large: 'status-badge-large',
  };

  return (
    <div className={`status-badge status-badge-${variant} ${sizeClasses[size]}`}>
      {icon && <span className="status-badge-icon">{icon}</span>}
      <span className="status-badge-label">{label}</span>
    </div>
  );
}
