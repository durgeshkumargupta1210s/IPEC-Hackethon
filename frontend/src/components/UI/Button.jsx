import React from 'react';
import './UI.css';

/**
 * Button - Reusable button component with variants and sizes
 */
export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'default',
  disabled = false,
  type = 'button',
  className = '',
  icon = null,
  loading = false,
  ...props
}) {
  const sizeClasses = {
    small: 'btn-small',
    default: 'btn-default',
    large: 'btn-large',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
}
