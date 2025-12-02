import { ISecurityUserService } from '../../../framework/plugins/SecurityPlugin/models/ISecurityUserService';
import { IUser } from '../../models/IUser';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';

export interface IUserService extends ISecurityUserService {
  findByUid(uid: string, txnOptions: TxnOption): Promise<IUser>;
  save(user: IUser, txnOptions: TxnOption): Promise<IUser>;
}
