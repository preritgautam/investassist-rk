import { AbstractEvent } from '../../../framework/plugins/EventPlugin/model/AbstractEvent';
import { IUser } from '../../models/IUser';
import { ISecurityUserToken } from '../../../framework/plugins/SecurityPlugin/models/ISecurityUserToken';

export class PasswordUpdated extends AbstractEvent {
  static Type = 'PasswordUpdated';

  constructor(
    public readonly user: IUser,
  ) {
    super();
  }
}

export class ResetPasswordTokenGenerated extends AbstractEvent {
  static Type = 'ResetPasswordTokenGenerated';

  constructor(
    public readonly user: IUser,
    public readonly token: ISecurityUserToken,
  ) {
    super();
  }
}
