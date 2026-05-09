import { analyticsService } from '../services';
import { useFetch } from './useFetch';

export const useTeacherDashboard = (filters = {}) => {
    return useFetch(
        () => analyticsService.getTeacherOverview(filters),
        [filters.class_id, filters.subject_id]
    );
};