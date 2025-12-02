import { inject, injectable } from '../../boot';
import { EntityService } from '../../../bootstrap/service/entity/EntityService';
import { AccountUserToken } from '../../db/entity/AccountUserToken';
import { IUserTokenService } from '../../../bootstrap/service/auth/IUserTokenService';
import { SecurityService } from '../../../framework/plugins/SecurityPlugin/service/SecurityService';
import { TokenType } from '../../../bootstrap/models/enums/TokenType';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { AccountUser } from '../../db/entity/AccountUser';
import { ISecurityUserToken } from '../../../framework/plugins/SecurityPlugin/models/ISecurityUserToken';

@injectable()
class AccountUserTokenService extends EntityService<AccountUserToken> implements IUserTokenService {
  constructor(@inject(SecurityService) private readonly securityService: SecurityService) {
    super(AccountUserToken);
  }

  async findByToken(tokenString, tokenType: TokenType, txnOptions: TxnOption): Promise<AccountUserToken> {
    return this.getRepository(txnOptions).findOne({ token: tokenString, tokenType: tokenType.key });
  }

  async deleteExistingAuthTokens(user: AccountUser): Promise<void> {
    const tokens = await this.getRepository(null).find({
      user: user,
      tokenType: TokenType.AUTH_TOKEN.key,
    });
    await this.getRepository(null).remove(tokens);
  }

  async createUserToken(
    user: AccountUser, tokenString: string, tokenType: TokenType, txnOptions: TxnOption,
  ): Promise<ISecurityUserToken> {
    const token = new AccountUserToken();
    token.token = tokenString;
    token.user = Promise.resolve(user);
    token.tokenType = tokenType.key;
    await this.getRepository(txnOptions).save(token);
    return token;
  }
}

export { AccountUserTokenService };
