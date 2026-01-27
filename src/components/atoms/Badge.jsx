import React from 'react';

const Badge = ({ children, icon: Icon, color = 'var(--text-main)', bg = '#F3F4F6', ...props }) => {
    return (
        <span
            className="status-badge"
            style={{ background: bg, color: color }}
            {...props}
        >
            {Icon && <Icon size={12} />}
            {children}
        </span>
    );
};

export default Badge;
