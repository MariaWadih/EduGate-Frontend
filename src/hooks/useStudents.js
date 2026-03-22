import { useFetch } from './useFetch';
import { studentService } from '../services';

export const useStudents = (params) => {
    return useFetch(() => studentService.getAll(params), [JSON.stringify(params)]);
};
