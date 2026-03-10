import React from 'react';

const Avatar = ({ name, children, size = 44, ...props }) => {
    // Map string sizes to pixel values
    const sizeMap = {
        sm: 32,
        md: 44,
        lg: 64
    };

    const finalSize = typeof size === 'string' && sizeMap[size] ? sizeMap[size] : size;
    const initial = name?.charAt(0)?.toUpperCase() || children || '?';

    return (
        <div
            style={{
                width: `${finalSize}px`,
                height: `${finalSize}px`,
                borderRadius: '12px',
                background: '#FFF7ED',
                color: '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: finalSize < 35 ? '0.85rem' : '1.1rem',
                flexShrink: 0,
                ...props.style
            }}
            {...props}
        >
            {initial}
        </div>
    );
};

export default Avatar;
