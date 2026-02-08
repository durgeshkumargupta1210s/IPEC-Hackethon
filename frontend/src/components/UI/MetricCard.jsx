import React from 'react';
import './UI.css';

/**
 * MetricCard - Display key metrics with icon, title, value, and status
 * Supports different variants (primary, success, warning, danger, neutral)
 */
export function MetricCard({
  icon,
  title,
  value,
  unit = '',
  status = '',
  description = '',
  variant = 'primary',
  size = 'default',
}) {
  const sizeClasses = {
    small: 'metric-card-small',
    default: 'metric-card-default',
    large: 'metric-card-large',
  };

  return (
    <div className={`metric-card metric-card-${variant} ${sizeClasses[size]}`}>
      {icon && <div className="metric-card-icon">{icon}</div>}
      <div className="metric-card-content">
        <div className="metric-card-title">{title}</div>
        <div className="metric-card-value">
          {value}
          {unit && <span className="metric-card-unit">{unit}</span>}
        </div>
        {status && <div className="metric-card-status">{status}</div>}
        {description && <div className="metric-card-description">{description}</div>}
      </div>
    </div>
  );
}
