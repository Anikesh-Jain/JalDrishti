import React from 'react';

/**
 * JalDrishti Layout Primitive: Container
 * Centers and bounds content with responsive horizontal padding.
 */
export default function Container({
  children,
  size = 'default',
  className = '',
  ...props
}) {
  const sizeStyles = {
    sm: 'max-w-3xl',
    default: 'max-w-7xl',
    full: 'max-w-full'
  };

  const selectedSize = sizeStyles[size] || sizeStyles.default;

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${selectedSize} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
