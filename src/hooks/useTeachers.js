import { useFetch } from './useFetch';
import { teacherService } from '../services';

export const useTeachers = () => {
    return useFetch(teacherService.getAll, { initialData: [] });
};
