import React, { createContext, useContext, useState, useEffect } from 'react';
import { academicYearService } from '../services';
import { AuthContext } from './AuthContext';

const AcademicYearContext = createContext(null);

export const AcademicYearProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [academicYears, setAcademicYears] = useState([]);
    const [activeYear, setActiveYearState] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const fetchActive = async () => {
        try {
            const res = await academicYearService.getActive();
            setActiveYearState(res.data);
        } catch {
            // Silently fail – not blocking
        }
    };

    const fetchAll = async () => {
        try {
            const res = await academicYearService.getAll();
            setAcademicYears(res.data);
        } catch {
            // Silently fail
        }
    };
    
    useEffect(() => {
        if (user) {
            Promise.all([fetchActive(), fetchAll()]).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    /**
     * Activate a year by ID. Updates both local state and the server.
     */
    const activateYear = async (id) => {
        await academicYearService.activate(id);
        await Promise.all([fetchActive(), fetchAll()]);
    };

    /**
     * Create a new academic year and refresh the list.
     */
    const createYear = async (data) => {
        const res = await academicYearService.create(data);
        await fetchAll();
        return res.data;
    };

    return (
        <AcademicYearContext.Provider value={{
            activeYear,
            academicYears,
            loading,
            activateYear,
            createYear,
            refreshYears: fetchAll,
        }}>
            {children}
        </AcademicYearContext.Provider>
    );
};

/**
 * Hook to consume the academic year context.
 * Usage: const { activeYear, academicYears, activateYear } = useAcademicYear();
 */
export const useAcademicYear = () => {
    const context = useContext(AcademicYearContext);
    if (!context) throw new Error('useAcademicYear must be used inside AcademicYearProvider');
    return context;
};
