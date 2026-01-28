import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    className = '',
    type = 'button',
    icon,
    ...props
}) => {
    const baseClass = 'btn';
    const variantClass = variant === 'outline' ? 'btn-outline' : 'btn-primary';

    return (
        <button
            type={type}
            className={`${baseClass} ${variantClass} ${className}`}
            {...props}
        >
            {/* Check if icon is a valid React Element (already instantiated) or a Component function */}
            {React.isValidElement(icon)
                ? icon
                : (icon && React.createElement(icon, { size: 18 }))
            }
            {children}
        </button>
    );
};

export default Button;
