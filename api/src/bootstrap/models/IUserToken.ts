import { ISecurityUserToken } from '../../framework/plugins/SecurityPlugin/models/ISecurityUserToken';
import { IUser } from './IUser';

export interface IUserToken extends ISecurityUserToken {
  id: string,
  user: Promise<IUser>,
}
