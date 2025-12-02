import { ISecurityUserService } from '../models/ISecurityUserService';
import { AbstractMiddleware } from '../../WebPlugin/middlewares/AbstractMiddleware';
import * as passport from 'passport';

export abstract class AbstractAuthStrategyFactory {
  abstract createStrategy(userProvider: ISecurityUserService, options: any);

  createMiddleware(strategyName: string) {
    return class extends AbstractMiddleware {
      middleware = passport.authenticate(strategyName, { session: false }, null);
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createToken(payload: any, options: any): Promise<string> {
    throw new Error('This strategy does not supports creating a token');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async verifyToken(token: string, options: any): Promise<object> {
    throw new Error('This strategy does not supports verifying a token');
  }
}
