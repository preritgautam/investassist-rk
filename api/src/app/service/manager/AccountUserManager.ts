import { inject, injectable } from '../../boot';
import { Account } from '../../db/entity/Account';
import { AccountUser } from '../../db/entity/AccountUser';
import { AccountUserService } from '../entity/AccountUserService';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { CGAccountUser, UserPreferences } from '../../types';
import { ClikGatewayManager } from './ClikGatewayManager';
import { ISecurityUserToken } from '../../../framework/plugins/SecurityPlugin/models/ISecurityUserToken';
import { AccountUserTokenService } from '../entity/AccountUserTokenService';
import { TokenType } from '../../../bootstrap/models/enums/TokenType';
import { IUserService } from '../../../bootstrap/service/auth/IUserService';
import { DealService } from '../entity/DealService';
import { AssumptionService } from '../entity/AssumptionService';
import { AssumptionManager } from './AssumptionManager';

@injectable({
  alias: 'app.service.accountUserManager',
})
export class AccountUserManager implements IUserService {
  constructor(
    @inject(AccountUserService) private readonly accountUserService: AccountUserService,
    @inject(ClikGatewayManager) private readonly cgManager: ClikGatewayManager,
    @inject(AccountUserTokenService) private readonly tokenService: AccountUserTokenService,
    @inject(DealService) private readonly dealService: DealService,
    @inject(AssumptionService) private readonly assumptionService: AssumptionService,
    @inject(AssumptionManager) private readonly assumptionManager: AssumptionManager,
  ) {
  }

  private async addAccountUser(
    account: Account, cgAccountUser: CGAccountUser, txn: TxnOption = null,
  ): Promise<AccountUser> {
    const accountUsersCount = await this.getAccountUsersCount(account, txn);
    if (accountUsersCount + 1 > account.userLimit) {
      throw new Error('Account user limit exceeded');
    }
    const accountUser = new AccountUser();
    accountUser.account = Promise.resolve(account);
    accountUser.isRootUser = cgAccountUser.isRootUser;
    accountUser.clikGatewayId = cgAccountUser.id;
    accountUser.cgAccountUser = cgAccountUser;
    return this.accountUserService.save(accountUser, txn);
  }

  async ensureAccountUsersCGData(users: AccountUser[], batchSize: number = 3) {
    const promises = new Array(batchSize).fill(0).map(() => Promise.resolve());
    let i = 0;
    for (const user of users) {
      promises[i] = promises[i]
        .then(async () => {
          if (!user.cgAccountUser) {
            user.cgAccountUser = await this.cgManager.getCGAccountUserDetails(user.clikGatewayId);
          }
        });
      i = (i + 1) % batchSize;
    }
    await Promise.allSettled(promises);
  }

  async getAccountUser(accountUserId: string, txn: TxnOption = null): Promise<AccountUser> {
    const accountUser = await this.accountUserService.findById(accountUserId, txn);
    if (!accountUser.cgAccountUser) {
      accountUser.cgAccountUser = await this.cgManager.getCGAccountUserDetails(accountUser.clikGatewayId);
    }
    return accountUser;
  }

  async getAccountUserByCGId(clikGatewayId: string, txn: TxnOption = null) {
    return await this.accountUserService.findOne({ where: { clikGatewayId } }, txn);
  }

  async getOrAddAccountUser(
    account: Account, cgAccountUser: CGAccountUser, txn: TxnOption = null,
  ): Promise<AccountUser> {
    let user = await this.getAccountUserByCGId(cgAccountUser.id, txn);

    if (user) {
      user.cgAccountUser = cgAccountUser;
    } else {
      user = await this.addAccountUser(account, cgAccountUser);
    }

    return user;
  }

  async findAuthToken(tokenString: string): Promise<ISecurityUserToken> {
    return this.tokenService.findByToken(tokenString, TokenType.AUTH_TOKEN, null);
  }

  async findByUid(uid: string, txn: TxnOption): Promise<AccountUser> {
    return this.getAccountUser(uid, txn);
  }

  async getAccountUsers(account: Account, txn: TxnOption = null) {
    const users = await this.accountUserService.find({ where: { account } }, txn);
    await this.ensureAccountUsersCGData(users);
    return users;
  }

  async getAccountUsersCount(account: Account, txn: TxnOption = null) {
    return await this.accountUserService.count({ where: { account } }, txn);
  }

  async transferUserDealsAndAssumptions(user: AccountUser, rootUser: AccountUser, txn: TxnOption = null) {
    const userDeals = await this.dealService.getUserDeals(user, txn);
    for (const deal of userDeals) {
      if (deal.assignedToUserId === user.id) {
        deal.assignedToUser = Promise.resolve(rootUser);
      }
      if (deal.ownedByUserId === user.id) {
        deal.ownedByUser = Promise.resolve(rootUser);
      }
      await this.dealService.save(deal, txn);
    }

    const assumptions = await this.assumptionManager.getUserAssumptions(user, txn);
    for (const assumption of assumptions) {
      assumption.user = Promise.resolve(rootUser);
      await this.assumptionService.save(assumption, txn);
    }
  }

  async deleteAccountUser(userId: string, account: Account, rootUser: AccountUser, txn: TxnOption = null) {
    const user = await this.accountUserService.findOne({
      where: {
        id: userId,
        account: account,
      },
    }, txn);
    await this.transferUserDealsAndAssumptions(user, rootUser, txn);
    return await this.accountUserService.delete(user, txn);
  }

  setSecret(): void {
    throw new Error('This method should not be called here');
  }

  save(user: AccountUser, txn: TxnOption): Promise<AccountUser> {
    return this.accountUserService.save(user, txn);
  }

  updateUserPreferences(user: AccountUser, userPreferences: UserPreferences, txn: TxnOption): Promise<AccountUser> {
    user.userPreferences = userPreferences;
    return this.accountUserService.save(user, txn);
  }

  async getAccountRootUser(account: Account): Promise<AccountUser> {
    const user = await this.accountUserService.findOne({
      where: {
        isRootUser: true,
        account: account,
      },
    }, null);
    await this.ensureAccountUsersCGData([user]);
    return user;
  }

  async acceptTerms(user: AccountUser) {
    if (user.acceptedTermsOn === null) {
      user.acceptedTermsOn = new Date();
      await this.accountUserService.save(user, null);
    }
  }
}
