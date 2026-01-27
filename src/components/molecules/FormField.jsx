import React from 'react';
import Label from '../atoms/Label';
import Input from '../atoms/Input';

const FormField = ({
    label,
    required = false,
    error,
    ...inputProps
}) => {
    return (
        <div>
            {label && <Label required={required}>{label}</Label>}
            <Input fullWidth {...inputProps} />
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

export default FormField;
