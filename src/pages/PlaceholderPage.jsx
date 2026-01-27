import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/atoms';
import { Activity } from 'lucide-react';

const PlaceholderPage = ({ title }) => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 style={{ marginBottom: '32px' }}>{title}</h1>
            <Card style={{ padding: '80px 40px', textAlign: 'center' }}>
                <div style={{ background: '#F3F4F6', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px auto' }}>
                    <Activity size={48} color="var(--primary)" />
                </div>
                <h2 style={{ marginBottom: '12px' }}>{title} module is currently being optimized.</h2>
                <p className="text-muted" style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                    Real data is already synced. Full management features coming in the next update.
                </p>
            </Card>
        </motion.div>
    );
};

export default PlaceholderPage;
