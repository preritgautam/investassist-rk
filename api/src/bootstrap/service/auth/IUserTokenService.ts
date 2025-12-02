import { ISecurityUser } from '../../../framework/plugins/SecurityPlugin/models/ISecurityUser';
import { ISecurityUserToken } from '../../../framework/plugins/SecurityPlugin/models/ISecurityUserToken';
import { IUserToken } from '../../models/IUserToken';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { TokenType } from '../../models/enums/TokenType';
import { IUser } from '../../models/IUser';

export interface IUserTokenService {
  createUserToken(
    user: ISecurityUser, tokenString: string, tokenType: TokenType, txnOptions: TxnOption,
  ): Promise<ISecurityUserToken>;

  deleteExistingAuthTokens(user: IUser): Promise<void>;

  findByToken(tokenString: string, tokenType: TokenType, txnOptions: TxnOption): Promise<IUserToken>

  delete(token: IUserToken, txnOptions: TxnOption);

}
