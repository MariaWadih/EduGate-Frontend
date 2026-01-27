import React from 'react';
import Label from '../atoms/Label';
import Textarea from '../atoms/Textarea';

const TextareaField = ({
    label,
    required = false,
    error,
    rows = 4,
    ...textareaProps
}) => {
    return (
        <div>
            {label && <Label required={required}>{label}</Label>}
            <Textarea fullWidth rows={rows} {...textareaProps} />
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

export default TextareaField;
