import { useFetch } from './useFetch';
import { analyticsService } from '../services';

export const useStudentDashboard = () => {
    return useFetch(analyticsService.getStudentOverview);
};
