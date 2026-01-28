import { useFetch } from './useFetch';
import { feedbackService } from '../services';

export const useFeedback = () => {
    return useFetch(feedbackService.getAll);
};
