import {
  body,
  controller,
  delete_,
  get,
  params,
  post, put,
  request,
  response,
} from '../../../../../framework/plugins/WebPlugin';
import { AccountUser } from '../../../../db/entity/AccountUser';
import { Assumption } from '../../../../db/entity/Assumption';
import { Response } from 'express';
import { inject } from '../../../../boot';
import { AssumptionManager } from '../../../../service/manager/AssumptionManager';
import { SerializerService } from '../../../../../framework/plugins/SerializerPlugin';

@controller({
  route: '/api/account/user/assumptions',
  middlewares: ['security.auth.accountUserJwt'],
})
export class AssumptionController {
  constructor(
    @inject(AssumptionManager) private readonly assumptionManager: AssumptionManager,
    @inject(SerializerService) private readonly serializer: SerializerService,
  ) {
  }

  @post('/')
  async addAssumption(
    @request('user') user: AccountUser,
    @body('assumption') assumptionParams: Partial<Assumption>,
    @response() res: Response,
  ) {
    const assumption = await this.assumptionManager.addUserAssumption(user, assumptionParams, null);
    res.status(201).send({
      assumption: await this.serializer.serialize(assumption),
    });
  }

  @get('/')
  async getUserAssumptions(
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const assumptions = await this.assumptionManager.getUserAssumptions(user, null);
    res.send({
      assumptions: await this.serializer.serialize(assumptions, { groups: ['withData'] }),
    });
  }

  @get('/account-assumptions')
  async getUserAccountAssumptions(
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const assumptions = await this.assumptionManager.getAccountAssumptions(await user.account, null);
    res.send({
      assumptions: await this.serializer.serialize(assumptions, { groups: ['withData'] }),
    });
  }

  @delete_('/:assumptionId')
  async deleteAssumption(
    @params('assumptionId') assumptionId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    await this.assumptionManager.deleteUserAssumption(user, assumptionId, null);
    res.send();
  }

  @get('/:assumptionId')
  async getUserAssumption(
    @params('assumptionId') assumptionId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const assumption = await this.assumptionManager.getUserAssumption(user, assumptionId, null);
    res.send({
      assumption: await this.serializer.serialize(assumption, { groups: ['withData'] }),
    });
  }

  @get('/account/:assumptionId')
  async getAccountAssumption(
    @params('assumptionId') assumptionId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const assumption = await this.assumptionManager.getAccountAssumption(await user.account, assumptionId, null);
    res.send({
      assumption: await this.serializer.serialize(assumption, { groups: ['withData'] }),
    });
  }

  @put('/:assumptionId')
  async updateUserAssumption(
    @params('assumptionId') assumptionId: string,
    @request('user') user: AccountUser,
    @body('assumption') assumptionParams: Partial<Assumption>,
    @response() res: Response,
  ) {
    const assumption = await this.assumptionManager.updateUserAssumption(user, assumptionId, assumptionParams, null);
    res.send({
      assumption: await this.serializer.serialize(assumption),
    });
  }
}
