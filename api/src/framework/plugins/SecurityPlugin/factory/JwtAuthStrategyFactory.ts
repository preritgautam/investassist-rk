import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt/lib';
import { ISecurityUserService } from '../models/ISecurityUserService';
import { JwtPayload } from '../models/JwtPayload';
import { ISecurityUser } from '../models/ISecurityUser';
import { JwtConfig } from '../models/JwtConfig';
import { AbstractAuthStrategyFactory } from './AbstractAuthStrategyFactory';
import { JwtService } from '../service/JwtService';
import { JwtFromRequestFunction } from 'passport-jwt';

const defaultTokenExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();

export type JwtAuthStrategyFactoryOptions = {
  jwt: JwtConfig
  request?: {
    extractJwt: 'fromHeader' |
      'fromBodyField' |
      'fromUrlQueryParameter' |
      'fromAuthHeaderWithScheme' |
      'fromAuthHeader' |
      'fromExtractors' |
      'fromAuthHeaderAsBearerToken'
    extractJwtParams?: [string | JwtFromRequestFunction[]]
  }
};

export class JwtAuthStrategyFactory extends AbstractAuthStrategyFactory {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  createStrategy(
    userService: ISecurityUserService,
    jwtOptions: JwtAuthStrategyFactoryOptions,
  ) {
    const tokenExtractor = ExtractJwt[jwtOptions.request?.extractJwt ?? 'fromAuthHeaderAsBearerToken'](
      ...(jwtOptions.request?.extractJwtParams ?? []),
    );

    return new JwtStrategy(
      {
        secretOrKey: jwtOptions.jwt.secret,
        jwtFromRequest: tokenExtractor,
        passReqToCallback: true,
        issuer: jwtOptions.jwt.issuer,
      },
      async function(req, jwtPayload: JwtPayload, done) {
        const { uid } = jwtPayload;
        try {
          const user: ISecurityUser = await userService.findByUid(uid, null);

          if (!user) {
            return done(null, false);
          }

          const requestToken = defaultTokenExtractor(req);
          const userToken = await userService.findAuthToken(requestToken, user);

          if (!userToken) {
            return done(null, false);
          }

          user.activeAuthToken = userToken;
          done(null, user);
        } catch (error) {
          done(error);
        }
      },
    );
  }

  async createToken(payload: any, options: JwtAuthStrategyFactoryOptions) {
    return this.jwtService.createToken(payload, options.jwt);
  }

  async verifyToken(token: string, options: JwtAuthStrategyFactoryOptions) {
    return this.jwtService.verifyToken(token, options.jwt);
  }
}
