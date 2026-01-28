import { useFetch } from './useFetch';
import { announcementService } from '../services';

export const useAnnouncements = () => {
    return useFetch(announcementService.getAll);
};
