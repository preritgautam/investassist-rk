import { AbstractController } from '../../../../framework/plugins/WebPlugin';
import { controller, get, post, request, response, body } from '../../../../framework/plugins/WebPlugin';
import { Response } from 'express';
import { inject } from '../../../boot';
import { SerializerService } from '../../../../framework/plugins/SerializerPlugin';
import { ISecurityUser } from '../../../../framework/plugins/SecurityPlugin';
import { SuperAdminAuthService } from '../../../service/auth/SuperAdminAuthService';
import { IUser } from '../../../../bootstrap/models/IUser';
import { IUserToken } from '../../../../bootstrap/models/IUserToken';
import { InvalidUserTokenError } from '../../../../bootstrap/errors/InvalidUserTokenError';
import { BaseAuthService } from '../../../../bootstrap/service/auth/BaseAuthService';

@controller({
  route: '/api/_admin/auth',
})
export class AuthController extends AbstractController {
  constructor(
    @inject(SuperAdminAuthService) private readonly authService: BaseAuthService,
    @inject(SerializerService) private readonly serializer: SerializerService,
  ) {
    super();
  }

  @post('/token', { middlewares: ['security.auth.superAdminLocal'] })
  async createToken(@request('user') user: IUser, @response() res: Response) {
    const token = await this.authService.createAuthToken(user, 'superAdminJwt', null);

    res.status(200).send({
      data: await this.serializer.serialize({
        user: user,
        token: token.token,
      }, {
        childOptions: {
          user: { groups: ['id'] },
        },
      }),
    });
  }

  @get('/token', { middlewares: ['security.auth.superAdminJwt'] })
  async validateSession(
    @request('user') user: ISecurityUser,
    @response() res: Response,
  ) {
    res.status(200).send({
      data: {
        user: await this.serializer.serialize(user, { groups: ['id'] }),
      },
    });
  }

  @post('/forgot-password')
  async requestResetPassword(
    @body('email') email: string,
    @response() res: Response,
  ) {
    await this.authService.requestResetSecret(email, null);
    res.status(200).send({
      data: null,
    });
  }

  @post('/reset-password')
  async resetPassword(
    @body('email') email: string,
    @body('token') token: string,
    @body('newPassword') password: string,
    @response() res: Response,
  ) {
    try {
      await this.authService.resetSecret(email, token, password, null);
    } catch (e) {
      if (e instanceof InvalidUserTokenError) {
        return res.status(400).send({
          form: ['The reset password token is not valid.'],
        });
      } else {
        throw e;
      }
    }
    res.status(200).send({
      data: null,
    });
  }

  @post('/update-password', { middlewares: ['security.auth.superAdminJwt'] })
  async updatePassword(
    @request('user') user: IUser,
    @body('currentPassword') currentPassword: string,
    @body('newPassword') newPassword: string,
    @response() res: Response,
  ) {
    const validCurrentPassword = this.authService.verifyPassword(user, currentPassword);
    if (validCurrentPassword) {
      await this.authService.updateSecret(user, newPassword, null);
      res.status(200).send({
        data: null,
      });
    } else {
      res.status(401).send({
        form: [],
        fields: {
          currentPassword: ['Invalid current password provided'],
        },
      });
    }
  }

  @post('/logout', {
    middlewares: ['security.auth.superAdminJwt'],
  })
  async logout(@request('user') user: ISecurityUser, @response() res: Response) {
    if (user.activeAuthToken) {
      await this.authService.deleteAuthToken(<IUserToken>user.activeAuthToken, null);
    }
    res.send();
  }
}
