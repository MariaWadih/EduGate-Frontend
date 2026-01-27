import React from 'react';

const ProgressBar = ({
    value = 0,
    max = 100,
    showLabel = true,
    colorThreshold = 80,
    successColor = 'var(--success)',
    primaryColor = 'var(--primary)',
    ...props
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const barColor = value > colorThreshold ? successColor : primaryColor;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', ...props.style }}>
            <div style={{
                flex: 1,
                minWidth: '60px',
                height: '6px',
                background: '#F3F4F6',
                borderRadius: '3px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: barColor,
                    transition: 'width 0.3s ease'
                }}></div>
            </div>
            {showLabel && (
                <span style={{
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    minWidth: '40px'
                }}>
                    {Number(value).toFixed(1)}%
                </span>
            )}
        </div>
    );
};

export default ProgressBar;
