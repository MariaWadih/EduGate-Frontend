import React from 'react';

const Toggle = ({
    checked = false,
    onChange,
    disabled = false,
    ...props
}) => {
    return (
        <div
            onClick={() => !disabled && onChange?.(!checked)}
            style={{
                width: '44px',
                height: '24px',
                background: checked ? 'var(--primary)' : '#D1D5DB',
                borderRadius: '12px',
                position: 'relative',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.2s ease',
                ...props.style
            }}
            {...props}
        >
            <div style={{
                width: '18px',
                height: '18px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: checked ? '23px' : '3px',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}></div>
        </div>
    );
};

export default Toggle;
