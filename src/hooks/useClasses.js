import { useFetch } from './useFetch';
import { academicService } from '../services';

export const useClasses = () => {
    return useFetch(academicService.getClasses, { initialData: [] });
};
