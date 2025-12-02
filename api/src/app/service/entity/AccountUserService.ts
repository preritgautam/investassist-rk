import { EntityService } from '../../../bootstrap/service/entity/EntityService';
import { AccountUser } from '../../db/entity/AccountUser';
import { injectable } from '../../boot';

@injectable()
export class AccountUserService extends EntityService<AccountUser> {
  constructor() {
    super(AccountUser);
  }
}
