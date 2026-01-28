import { useFetch } from './useFetch';
import { teacherService } from '../services';

export const useTeacherClasses = () => {
    return useFetch(teacherService.getMyClasses, { initialData: [] });
};
