import { injectable } from '../../boot';
import { config } from '../../../framework/plugins/AppConfigPlugin/decorators/config';
import { AppConfigType } from '../../config';
import { AccountUser } from '../../db/entity/AccountUser';
import axios from 'axios';

@injectable()
export class TrainnService {
  constructor(
    @config('trainn') private readonly trainnConfig: AppConfigType['trainn'],
  ) {}

  async createSession(user: AccountUser): Promise<string> {
    const apiUrl = `https://${this.trainnConfig.workspaceName}.api.trainn.co/v1/sessions`;
    const { data: { access_url: accessUrl } } = await axios.post(
      apiUrl,
      { customer_id: user.id },
      {
        auth: {
          username: this.trainnConfig.apiKey,
          password: undefined,
        },
      },
    );
    return accessUrl;
  }
}
