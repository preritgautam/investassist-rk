import { ISecurityUser } from './ISecurityUser';
import { ISecurityUserToken } from './ISecurityUserToken';

export interface ISecurityUserService {
  findByUid(uid: any, txnOptions: any): Promise<ISecurityUser>;
  setSecret(user: ISecurityUser, secret: string): void;
  findAuthToken(tokenString: string, user: ISecurityUser): Promise<ISecurityUserToken>
}
