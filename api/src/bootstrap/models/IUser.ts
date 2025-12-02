import { ISecurityUser } from '../../framework/plugins/SecurityPlugin';

export interface IUser extends ISecurityUser {
  id: string,
  name: string,
  email: string,
}
