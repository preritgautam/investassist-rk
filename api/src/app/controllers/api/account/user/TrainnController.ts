import { controller, post, request, response } from '../../../../../framework/plugins/WebPlugin';
import { AccountUser } from '../../../../db/entity/AccountUser';
import { Response } from 'express';
import { inject } from '../../../../boot';
import { TrainnService } from '../../../../service/trainn/TrainnService';

@controller({
  route: '/api/account/user/trainn',
  middlewares: ['security.auth.accountUserJwt'],
})
export class TrainnController {
  constructor(
    @inject(TrainnService) private readonly trainnService: TrainnService,
  ) {}

  @post('/session')
  async createTrainnSession(
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const sessionUrl = await this.trainnService.createSession(user);
    res.send({ sessionUrl });
  }
}
