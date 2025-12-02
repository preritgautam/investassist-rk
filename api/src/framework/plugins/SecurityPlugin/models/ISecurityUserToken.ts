import { ISecurityUser } from './ISecurityUser';

export interface ISecurityUserToken {
  user: Promise<ISecurityUser>,
  token: string,
  tokenType: string,
}
