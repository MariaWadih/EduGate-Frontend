import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export const useFetch = (serviceCall, options = {}) => {
    // Check if options is actually a dependency array (as passed by some hooks)
    const dependencies = Array.isArray(options) ? options : [serviceCall];
    const initialOptions = Array.isArray(options) ? {} : options;

    const [data, setData] = useState(initialOptions.initialData ?? null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!serviceCall) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = typeof serviceCall === 'function'
                ? await serviceCall()
                : await client.get(serviceCall);

            setData(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }, dependencies); // Pass dependencies here instead of [serviceCall]

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData, setData };
};
