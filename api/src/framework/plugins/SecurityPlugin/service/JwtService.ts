import * as jwt from 'jsonwebtoken';
import { JwtConfig } from '../models/JwtConfig';
import { JwtPayload } from '../models/JwtPayload';

class JwtService {
  createToken(payload: object, jwtConfig: JwtConfig): Promise<string> {
    return new Promise(function(resolve, reject) {
      jwt.sign(
        payload,
        jwtConfig.secret,
        {
          issuer: jwtConfig.issuer,
          expiresIn: jwtConfig.expiresIn,
        },
        function(err, token) {
          err ? reject(err) : resolve(token);
        },
      );
    });
  }

  async verifyToken(token: string, jwtConfig: JwtConfig): Promise<object> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, jwtConfig.secret, jwtConfig, function(err, payload: JwtPayload) {
        err ? reject(err) : resolve(payload);
      });
    });
  }
}

export { JwtService };
