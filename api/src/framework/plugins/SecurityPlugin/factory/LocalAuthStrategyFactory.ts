import { ISecurityUserService } from '../models/ISecurityUserService';
import { PasswordService } from '../service/PasswordService';
import { Strategy as LocalStrategy } from 'passport-local';
import { ISecurityUserRequest } from '../models/ISecurityUserRequest';
import { AbstractAuthStrategyFactory } from './AbstractAuthStrategyFactory';
import { AbstractMiddleware } from '../../WebPlugin/middlewares/AbstractMiddleware';
import * as passport from 'passport';
import { ISecurityUser } from '../models/ISecurityUser';
import { InvalidCredentialsError } from '../errors/InvalidCredentialsError';

export type LocalAuthStrategyFactoryOptions = {
  usernameField?: string,
  passwordField?: string,
}


export class LocalAuthStrategyFactory extends AbstractAuthStrategyFactory {
  constructor(private readonly passwordService: PasswordService) {
    super();
  }

  createStrategy(
    userService: ISecurityUserService,
    options: LocalAuthStrategyFactoryOptions = {},
  ) {
    const passwordService: PasswordService = this.passwordService;

    return new LocalStrategy(
      {
        usernameField: options.usernameField || 'email',
        passwordField: options.passwordField || 'password',
        session: false,
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
              return done(null, false, { message: 'Invalid Credentials Provided' });
            }
          } else {
            return done(null, false, { message: 'Invalid Credentials Provided' });
          }
        } catch (err) {
          done(err, null);
        }
      },
    );
  };

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
