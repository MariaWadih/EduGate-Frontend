import React from 'react';
import { Search } from 'lucide-react';
import Card from '../atoms/Card';
import Input from '../atoms/Input';

const SearchBar = ({ value, onChange, placeholder = "Search...", ...props }) => {
    return (
        <Card style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', ...props.style }}>
            <div style={{ position: 'relative', flex: 1 }}>
                <Search
                    style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)'
                    }}
                    size={18}
                />
                <Input
                    placeholder={placeholder}
                    style={{ paddingLeft: '40px' }}
                    value={value}
                    onChange={onChange}
                    fullWidth
                />
            </div>
        </Card>
    );
};

export default SearchBar;
