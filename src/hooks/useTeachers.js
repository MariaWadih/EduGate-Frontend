import { useFetch } from './useFetch';
import { teacherService } from '../services';

export const useTeachers = (params) => {
    return useFetch(() => teacherService.getAll(params), [JSON.stringify(params)]);
};
