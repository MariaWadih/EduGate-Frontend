import { useFetch } from './useFetch';
import { analyticsService } from '../services';

export const useTeacherDashboard = () => {
    return useFetch(analyticsService.getTeacherOverview);
};
