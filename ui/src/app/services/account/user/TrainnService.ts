import { Service } from '../../../../bootstrap/service/Service';
import { createTrainnSessionApi } from '../../../api/accountUser';

export class TrainnService extends Service {
  async createSession(): Promise<string> {
    const { data: { sessionUrl } } = await createTrainnSessionApi();
    return sessionUrl;
  }
}

export const useTrainnService: () => TrainnService = () => TrainnService.useService();
