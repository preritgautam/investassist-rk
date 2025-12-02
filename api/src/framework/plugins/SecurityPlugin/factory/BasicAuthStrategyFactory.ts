import { ISecurityUserService } from '../models/ISecurityUserService';
import { PasswordService } from '../service/PasswordService';
import { BasicStrategy } from 'passport-http';
import { ISecurityUserRequest } from '../models/ISecurityUserRequest';
import { AbstractAuthStrategyFactory } from './AbstractAuthStrategyFactory';
import { AbstractMiddleware } from '../../WebPlugin/middlewares/AbstractMiddleware';
import * as passport from 'passport';
import { ISecurityUser } from '../models/ISecurityUser';
import { InvalidCredentialsError } from '../errors/InvalidCredentialsError';

export type BasicAuthStrategyFactoryOptions = {}


export class BasicAuthStrategyFactory extends AbstractAuthStrategyFactory {
  constructor(private readonly passwordService: PasswordService) {
    super();
  }

  createStrategy(
    userService: ISecurityUserService,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: BasicAuthStrategyFactoryOptions,
  ) {
    const passwordService: PasswordService = this.passwordService;

    return new BasicStrategy(
      {
        passReqToCallback: true,
      },
      async function(req: ISecurityUserRequest, uid: string, password: string, done) {
        try {
          const user: ISecurityUser = await userService.findByUid(uid, null);

          if (user) {
            const valid = passwordService.verifyPassword(password, JSON.parse(user.secret));
            if (valid) {
              done(null, user);
            } else {
              return done(null, false);
            }
          } else {
            return done(null, false);
          }
        } catch (err) {
          done(err, null);
        }
      },
    );
  };

  // noinspection DuplicatedCode
  createMiddleware(strategyName: string) {
    return class extends AbstractMiddleware {
      middleware = function(req, res, next) {
        passport.authenticate(strategyName, function(err, user) {
          if (err) return next(err);
          if (!user) {
            next(new InvalidCredentialsError());
          }
          req.user = user;
          return next();
        })(req, res, next);
      };
    };
  }
}
