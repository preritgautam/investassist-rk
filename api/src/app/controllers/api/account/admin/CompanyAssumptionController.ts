import {
  body,
  controller,
  post,
  request,
  response,
} from '../../../../../framework/plugins/WebPlugin';
import { AccountUser } from '../../../../db/entity/AccountUser';
import { Assumption } from '../../../../db/entity/Assumption';
import { Response } from 'express';
import { inject } from '../../../../boot';
import { AssumptionManager } from '../../../../service/manager/AssumptionManager';
import { SerializerService } from '../../../../../framework/plugins/SerializerPlugin';
import { isAccountAdmin } from '../../../../middlewares/isAccountAdmin';

@controller({
  route: '/api/account/admin/assumptions',
  middlewares: ['security.auth.accountUserJwt', isAccountAdmin],
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
    const account = await user.account;
    const assumption = await this.assumptionManager.addCompanyAssumption(account, assumptionParams, null);
    res.status(201).send({
      assumption: await this.serializer.serialize(assumption),
    });
  }
}
