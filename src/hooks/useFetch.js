import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export const useFetch = (serviceCall, options = {}) => {
    const [data, setData] = useState(options.initialData ?? null);
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
    }, [serviceCall]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData, setData };
};
