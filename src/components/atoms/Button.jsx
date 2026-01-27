import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    className = '',
    type = 'button',
    icon: Icon,
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
            {Icon && <Icon size={18} />}
            {children}
        </button>
    );
};

export default Button;
