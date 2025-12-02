import { ISecurityUserToken } from './ISecurityUserToken';
import { CGAccountUser } from '../../../../app/types';

export interface ISecurityUser {
  uid: string,
  secret: string,
  tokens: Promise<ISecurityUserToken[]>,
  roles: string[] | any[],
  activeAuthToken?: ISecurityUserToken,
  enabled?: boolean,
  accountId?: string,
  cgAccountUser?: CGAccountUser,
}
