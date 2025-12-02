import { SuperAdminToken } from '../../db/entity/SuperAdminToken';
import { SuperAdmin } from '../../db/entity/SuperAdmin';
import { EntityService } from '../../../bootstrap/service/entity/EntityService';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { ISecurityUserToken } from '../../../framework/plugins/SecurityPlugin/models/ISecurityUserToken';
import { IUserTokenService } from '../../../bootstrap/service/auth/IUserTokenService';
import { inject, injectable } from '../../boot';
import { SecurityService } from '../../../framework/plugins/SecurityPlugin/service/SecurityService';
import { TokenType } from '../../../bootstrap/models/enums/TokenType';

@injectable()
class SuperAdminTokenService extends EntityService<SuperAdminToken> implements IUserTokenService {
  constructor(@inject(SecurityService) private readonly securityService: SecurityService) {
    super(SuperAdminToken);
  }

  async findByToken(tokenString, tokenType: TokenType, txnOptions: TxnOption): Promise<SuperAdminToken> {
    return this.getRepository(txnOptions).findOne({ token: tokenString, tokenType: tokenType.key });
  }

  async deleteExistingAuthTokens(user: SuperAdmin): Promise<void> {
    const tokens = await this.getRepository(null).find({
      user: user,
      tokenType: TokenType.AUTH_TOKEN.key,
    });
    await this.getRepository(null).remove(tokens);
  }

  async createUserToken(
    user: SuperAdmin, tokenString: string, tokenType: TokenType, txnOptions: TxnOption,
  ): Promise<ISecurityUserToken> {
    const token = new SuperAdminToken();
    token.token = tokenString;
    token.user = Promise.resolve(user);
    token.tokenType = tokenType.key;
    await this.getRepository(txnOptions).save(token);
    return token;
  }
}

export { SuperAdminTokenService };
