import { Request } from 'express';
import { ISecurityUser } from './ISecurityUser';

export interface ISecurityUserRequest extends Request {
  user: ISecurityUser;
}
