import { EntityService } from '../../../bootstrap/service/entity/EntityService';
import { Account } from '../../db/entity/Account';
import { injectable } from '../../boot';

@injectable()
export class AccountService extends EntityService<Account> {
  constructor() {
    super(Account);
  }
}
