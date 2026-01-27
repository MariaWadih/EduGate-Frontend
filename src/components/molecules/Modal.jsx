import React from 'react';
import { motion } from 'framer-motion';
import Card from '../atoms/Card';

const Modal = ({ isOpen, onClose, children, title, width = '600px' }) => {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                style={{ width }}
            >
                <Card style={{ padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                    {title && <h2 style={{ marginBottom: '24px' }}>{title}</h2>}
                    {children}
                </Card>
            </motion.div>
        </div>
    );
};

export default Modal;
