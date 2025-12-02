import { controller, get, post, query, request, response, service } from '../../../../../framework/plugins/WebPlugin';
import { Response } from 'express';
import { ModelIntegrationService } from '../../../../service/model/ModelIntegrationService';
import { DealUtils } from '../../../../service/manager/DealUtils';
import { AccountUser } from '../../../../db/entity/AccountUser';
import { Deal } from '../../../../db/entity/Deal';
import { SerializerService } from '../../../../../framework/plugins/SerializerPlugin';
import { AccountUserAuthService } from '../../../../service/auth/AccountUserAuthService';
import { BaseAuthService } from '../../../../../bootstrap/service/auth/BaseAuthService';

@controller({
  route: '/api/account/user/model/integration',
  middlewares: ['security.auth.cgAccountUserBasic'],
})
export class ModelIntegrationController {
  @get('/')
  async getDealData(
    @query('dealSlug') dealSlug: string,
    @request('user') user: AccountUser,
    @response() res: Response,
    @service(ModelIntegrationService) modelIntegrationService: ModelIntegrationService,
    @service(DealUtils) dealUtils: DealUtils,
  ) {
    const deal: Deal = await dealUtils.getUserDealBySlug(dealSlug, user, null);
    const dealData = await modelIntegrationService.getDealData(deal);
    res.send(dealData);
  }

  @post('/auth/token')
  async getAuthToken(
    @request('user') accountUser: AccountUser,
    @response() res: Response,
    @service(SerializerService) serializer: SerializerService,
    @service(AccountUserAuthService) authService: BaseAuthService,
  ) {
    await authService.deleteExistingTokens(accountUser);
    const token = await authService.createAuthToken(accountUser, 'accountUserJwt', null);

    res.status(200).send({
      data: await serializer.serialize({
        timestamp: Date.now(),
        user: accountUser,
        token: token.token,
      }, {
        childOptions: {
          user: { groups: ['id', 'withAccountDetails'] },
        },
      }),
    });
  }
}
