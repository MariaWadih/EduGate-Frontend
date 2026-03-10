import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    className = '',
    type = 'button',
    icon,
    size = 'medium',
    ...props
}) => {
    const baseClass = 'btn';

    // Determine variant class
    let variantClass = 'btn-primary';
    if (variant === 'outline') variantClass = 'btn-outline';
    else if (variant === 'ghost') variantClass = 'btn-ghost';
    else if (variant === 'link') variantClass = 'btn-link';

    // Determine size class
    const sizeClass = size === 'small' ? 'btn-sm' : size === 'large' ? 'btn-lg' : '';

    return (
        <button
            type={type}
            className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
            {...props}
        >
            {/* Check if icon is a valid React Element (already instantiated) or a Component function */}
            {React.isValidElement(icon)
                ? icon
                : (icon && React.createElement(icon, { size: size === 'small' ? 14 : 18 }))
            }
            {children}
        </button>
    );
};

export default Button;
