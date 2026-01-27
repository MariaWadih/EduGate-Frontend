import React from 'react';
import Label from '../atoms/Label';
import Select from '../atoms/Select';

const SelectField = ({
    label,
    required = false,
    error,
    children,
    ...selectProps
}) => {
    return (
        <div>
            {label && <Label required={required}>{label}</Label>}
            <Select fullWidth {...selectProps}>
                {children}
            </Select>
            {error && (
                <span style={{
                    color: 'var(--danger)',
                    fontSize: '0.75rem',
                    marginTop: '4px',
                    display: 'block'
                }}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default SelectField;
