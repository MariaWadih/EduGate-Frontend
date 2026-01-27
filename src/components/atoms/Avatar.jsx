import React from 'react';

const Avatar = ({ name, size = 44, ...props }) => {
    const initial = name?.charAt(0)?.toUpperCase() || '?';

    return (
        <div
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '12px',
                background: '#FFF7ED',
                color: '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                ...props.style
            }}
            {...props}
        >
            {initial}
        </div>
    );
};

export default Avatar;
