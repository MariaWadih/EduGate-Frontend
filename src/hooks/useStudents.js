import { useFetch } from './useFetch';
import { studentService } from '../services';

export const useStudents = () => {
    return useFetch(studentService.getAll);
};
