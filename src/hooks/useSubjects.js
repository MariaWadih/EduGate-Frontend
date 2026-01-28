import { useFetch } from './useFetch';
import { academicService } from '../services';

export const useSubjects = () => {
    return useFetch(academicService.getSubjects, { initialData: [] });
};
