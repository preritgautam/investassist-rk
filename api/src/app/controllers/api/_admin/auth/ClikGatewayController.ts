import { body, controller, get, post, response } from '../../../../../framework/plugins/WebPlugin';
import { inject } from '../../../../boot';
import { ClikGatewayManager } from '../../../../service/manager/ClikGatewayManager';
import { Response } from 'express';
import { CGSuperAdmin } from '../../../../types';
import { BaseAuthService } from '../../../../../bootstrap/service/auth/BaseAuthService';
import { SerializerService } from '../../../../../framework/plugins/SerializerPlugin';
import { SuperAdminService } from '../../../../service/entity/SuperAdminService';
import { SuperAdminAuthService } from '../../../../service/auth/SuperAdminAuthService';

@controller({
  route: '/api/_admin/auth/clik-gateway',
})
export class ClikGatewayController {
  constructor(
    @inject(ClikGatewayManager) private readonly clikGatewayManager: ClikGatewayManager,
    @inject(SuperAdminService) private readonly superAdminService: SuperAdminService,
    @inject(SuperAdminAuthService) private readonly authService: BaseAuthService,
    @inject(SerializerService) private readonly serializer: SerializerService,
  ) {
  }

  @get('/auth-url')
  async getAuthUrl(@response() res: Response) {
    const authUrl = await this.clikGatewayManager.getAdminAuthUrl();
    res.send({ authUrl });
  }

  @post('/token')
  async getToken(
    @body('ssoToken') ssoToken: string,
    @response() res: Response,
  ) {
    const cgSuperAdmin: CGSuperAdmin = await this.clikGatewayManager.getAdminBySSOToken(ssoToken);
    const admin = await this.superAdminService.getOrAddAdmin(cgSuperAdmin, null);
    const token = await this.authService.createAuthToken(admin, 'superAdminJwt', null);

    res.status(200).send({
      data: await this.serializer.serialize({
        timestamp: Date.now(),
        user: admin,
        token: token.token,
      }, {
        childOptions: {
          user: { groups: ['id'] },
        },
      }),
    });
  }

  @get('/add-account-url')
  async getAddAccountUrl(@response() res: Response) {
    const addAccountUrl = await this.clikGatewayManager.getAddAccountUrl();
    res.send({ addAccountUrl });
  }
}
