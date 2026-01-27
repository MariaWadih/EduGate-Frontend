import React from 'react';

const Input = ({
    className = '',
    fullWidth = false,
    ...props
}) => {
    return (
        <input
            className={`search-input ${className}`}
            style={fullWidth ? { width: '100%' } : {}}
            {...props}
        />
    );
};

export default Input;
