import { DateTime } from 'luxon';
import { inject, injectable } from '../../boot';
import { Account } from '../../db/entity/Account';
import { AccountService } from '../entity/AccountService';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { CGAccount, CGAccountUser, PickOptional, PlanId, SubscriptionSuccessStatus } from '../../types';
import { ClikGatewayManager } from './ClikGatewayManager';
import { FreeAccountError } from '../../errors/FreeAccountError';
import { parallel } from 'radash';
import { transactional } from '../../../framework/plugins/TypeORMPlugin/decorators/transactional';
import { AccountUser } from '../../db/entity/AccountUser';
import { Exception } from 'handlebars';
import { StripeService } from '../stripe/StripeService';
import { UiAppUrlHelper } from '../UiAppUrlHelper';
import { MailsManager } from '../MailsManager';
import { MailService } from '../../../framework/plugins/MailerPlugin/service/MailService';
import { AccountUserManager } from './AccountUserManager';
import { AssumptionManager } from './AssumptionManager';
import { all } from 'radash';
import { AccountTemplateService } from '../entity/AccountTemplateService';

export type UpdateAccountParams = PickOptional<Account, 'status' | 'enabled' | 'planId' | 'userLimit'>;

@injectable()
export class AccountManager {
  constructor(
    @inject(AccountService) private readonly accountService: AccountService,
    @inject(ClikGatewayManager) private readonly cgManager: ClikGatewayManager,
    @inject(StripeService) private readonly stripeService: StripeService,
    @inject(UiAppUrlHelper) private readonly uiAppUrlHelper: UiAppUrlHelper,
    @inject(MailsManager) private readonly mailsManager: MailsManager,
    @inject(MailService) private readonly mailsService: MailService,
    @inject(AccountUserManager) private readonly accountUserManager: AccountUserManager,
    @inject(AssumptionManager) private readonly assumptionManager: AssumptionManager,
    @inject(AccountTemplateService) private readonly accountTemplateService: AccountTemplateService,
  ) {
  }

  private async addAccount(cgAccount: CGAccount, txn: TxnOption = null): Promise<Account> {
    let account = new Account();
    account.clikGatewayId = cgAccount.id;
    account.cgAccount = cgAccount;
    // Allowing user to use paid plans for free for 30 days
    account.status = 'Paid';
    account.planId = 'plan1';
    account.currentSubscriptionEndsOn = DateTime.fromJSDate(new Date()).plus({ days: 30 }).toJSDate();
    account.enabled = true;
    account = await this.accountService.save(account, txn);
    await this.assumptionManager.addCompanyDefaultAssumption(account, txn);
    return account;
  }

  async getAccount(accountId: string, txn: TxnOption = null): Promise<Account> {
    const account = await this.accountService.findById(accountId, txn);
    if (!account.cgAccount) {
      account.cgAccount = await this.cgManager.getCGAccountDetails(account.clikGatewayId);
    }
    return account;
  }

  async ensureCGAccountData(account: Account) {
    if (!account.cgAccount) {
      account.cgAccount = await this.cgManager.getCGAccountDetails(account.clikGatewayId);
    }
    return account;
  }

  ensureAccountIsNotFree(account: Account) {
    if (account.status === 'Free') {
      throw new FreeAccountError(`Add Deal & Extract Document features are not available on Free Account.`);
    }
    return true;
  }

  async getOrAddAccount(cgAccount: CGAccount, txn: TxnOption): Promise<Account> {
    let account = await this.accountService.findOne({ where: { clikGatewayId: cgAccount.id } }, txn);
    if (account) {
      account.cgAccount = cgAccount;
    } else {
      account = await this.addAccount(cgAccount, txn);
    }

    return account;
  }

  async getAllAccounts(): Promise<Account[]> {
    const accounts = await this.accountService.find({}, null);
    await parallel(5, accounts, async (account: Account) => {
      try {
        await this.ensureCGAccountData(account);
      } catch (e) {
        // May happen on developers machine because of multiple CG in action
      }
      return account;
    });
    return accounts;
  }

  @transactional()
  async updateAccount(accountId: string, updates: UpdateAccountParams, txn: TxnOption): Promise<Account> {
    const account = await this.accountService.findById(accountId, txn);
    updates.status !== undefined && (account.status = updates.status);
    updates.enabled !== undefined && (account.enabled = updates.enabled);
    updates.planId !== undefined && (account.planId = updates.planId);
    updates.userLimit !== undefined && (account.userLimit = updates.userLimit);

    return this.accountService.save(account, txn);
  }

  @transactional()
  async startSubscriptionCheckout(
    rootUser: AccountUser, planId: PlanId, includeTrial: boolean, txn: TxnOption,
  ): Promise<string> {
    if (!rootUser.isRootUser) {
      throw new Exception('Passed user is not a root user');
    }

    const account = await rootUser.account;

    if (!account.stripeCustomerId) {
      account.stripeCustomerId = await this.stripeService.createStripeCustomerForAccount(account, rootUser);
      await this.accountService.save(account, txn);
    }

    if (account.stripePlanId || account.stripeSubscriptionId) {
      throw new Error('There is already a subscription for the account');
    }

    const session = await this.stripeService.startCheckout(
      account, planId, !account.oneTrialAvailed && includeTrial,
      this.uiAppUrlHelper.subscriptionSuccessUrl(),
      this.uiAppUrlHelper.subscriptionCancelUrl(),
    );

    return session.url;
  }

  async accountSubscriptionCreated(accountId: string, subscriptionId: string, planId: string, isTrialing: boolean) {
    const account = await this.getAccount(accountId);
    if (!account.stripeSubscriptionId && !account.stripePlanId) {
      account.stripePlanId = planId;
      account.stripeSubscriptionId = subscriptionId;
      // for paid plan keep it in free mode till payment succeeds
      account.status = isTrialing ? 'Trial' : 'Free';
      account.planId = this.stripeService.getLocalPlanIdFromPlanId(planId);
      account.oneTrialAvailed = true;
      if (isTrialing) {
        account.trialStartedOn = new Date();
      }
      await this.accountService.save(account, null);

      const adminMailData = await this.mailsManager.subscriptionCreatedAdminMailData(account);
      await this.mailsService.sendMail(adminMailData);
      const user = await this.accountUserManager.getAccountRootUser(account);
      const userMailData = await this.mailsManager.subscriptionCreatedUserMailData(user, account);
      await this.mailsService.sendMail(userMailData);
    }
  }

  async getSubscriptionSuccessStatus(rootUser: AccountUser): Promise<SubscriptionSuccessStatus> {
    if (!rootUser.isRootUser) {
      throw new Error('Only root user can check this');
    }

    const account = await rootUser.account;
    return {
      subscriptionSuccessful: !!account.stripeSubscriptionId,
      plan: account.planId,
      isTrial: account.status === 'Trial',
      isPaid: account.status === 'Paid',
      trialStartedOn: account.trialStartedOn,
    };
  }

  async handleSuccessfulPayment(
    accountId: string,
    stripeCustomerId: string,
    subscriptionId: string,
    planId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const account = await this.getAccount(accountId);
    if (
      account.stripeCustomerId === stripeCustomerId &&
      account.stripeSubscriptionId === subscriptionId &&
      account.planId === this.stripeService.getLocalPlanIdFromPlanId(planId)
    ) {
      if (account.trialEndedOn === null) {
        account.trialEndedOn = startDate;
      }
      account.currentSubscriptionStartedOn = startDate;
      account.currentSubscriptionEndsOn = endDate;
      account.status = 'Paid';
      account.lastInvoiceFailed = null;
      account.lastInvoiceUrl = null;
      await this.accountService.save(account, null);

      const adminMailData = await this.mailsManager.paymentSuccessfulAdminMailData(account);
      await this.mailsService.sendMail(adminMailData);
      const user = await this.accountUserManager.getAccountRootUser(account);
      const userMailData = await this.mailsManager.paymentSuccessfulUserMailData(user, account);
      await this.mailsService.sendMail(userMailData);
    } else {
      throw new Error('Something is not right. The customer/subscription/plan id did not match');
    }
  }

  async cancelSubscription(rootUser: AccountUser) {
    if (!rootUser.isRootUser) {
      throw new Error('The passed user is not a root user');
    }

    const account = await rootUser.account;
    await this.ensureCGAccountData(account);

    if (account.status === 'Trial') {
      await this.stripeService.cancelSubscription(account, 'Now');
    } else if (account.status === 'Paid') {
      await this.stripeService.cancelSubscription(account, 'PeriodEnd');
    }

    account.markedForCancellationOn = new Date();
    await this.accountService.save(account, null);

    const adminMailData = await this.mailsManager.subscriptionCancelledAdminMailData(account);
    await this.mailsService.sendMail(adminMailData);
    const user = await this.accountUserManager.getAccountRootUser(account);
    try {
      const userMailData = await this.mailsManager.subscriptionCancelledUserMailData(user, account);
      await this.mailsService.sendMail(userMailData);
    } catch (e) {
      console.error(e);
    }
  }

  @transactional()
  async setSubscriptionDeleted(accountId: string, txn: TxnOption) {
    const account = await this.getAccount(accountId, txn);
    if (!account) {
      return;
    }
    if (account.status === 'Trial') {
      account.trialCancelledOn = new Date();
    }

    // build mail data before updating account
    const adminMailData = await this.mailsManager.subscriptionDeletedAdminMailData(account);
    let userMailData;
    try {
      const user = await this.accountUserManager.getAccountRootUser(account);
      userMailData = await this.mailsManager.subscriptionDeletedUserMailData(user, account);
    } catch (e) {
      console.error(e);
    }

    account.status = 'Free';
    account.currentSubscriptionCancelledOn = new Date();
    account.stripeSubscriptionId = null;
    account.stripePlanId = null;
    account.planId = null;
    account.currentSubscriptionStartedOn = null;
    account.currentSubscriptionEndsOn = null;
    account.markedForCancellationOn = null;
    account.trialStartedOn = null;
    account.trialEndedOn = null;
    account.currentSubscriptionCancelledOn = null;
    account.lastInvoiceFailed = null;
    account.lastInvoiceUrl = null;
    await this.accountService.save(account, txn);

    // send mail after account update
    await this.mailsService.sendMail(adminMailData);
    try {
      await this.mailsService.sendMail(userMailData);
    } catch (e) {
      console.error(e);
    }
  }

  async tryPayingInvoice(accountId: string, customer: string, subscription: string, invoiceId: string) {
    const account = await this.getAccount(accountId);
    if (
      account.stripeCustomerId !== customer || account.markedForCancellationOn) {
      throw new Error('Something is not right here, an invoice got finalized that shouldn\'t have');
    }

    await this.stripeService.autoPayInvoice(invoiceId);
  }

  async upgradeFromTrialToPaid(rootUser: AccountUser) {
    if (!rootUser.isRootUser) {
      throw new Error('Only root user can check this');
    }

    const account = await rootUser.account;
    await this.stripeService.upgradeSubscriptionFromTrialToPaid(account);
  }

  async handlePaymentFailure(
    accountId: string, customer: string, subscription: string, invoiceUrl: string,
  ) {
    const account = await this.getAccount(accountId);
    if (
      account.stripeCustomerId !== customer) {
      throw new Error('Something is not right here. An invoice payment failed for mismatching account');
    }

    account.lastInvoiceFailed = true;
    account.lastInvoiceUrl = invoiceUrl;
    await this.accountService.save(account, null);

    const adminMailData = await this.mailsManager.paymentFailedAdminMailData(account);
    await this.mailsService.sendMail(adminMailData);
    const user = await this.accountUserManager.getAccountRootUser(account);
    const userMailData = await this.mailsManager.paymentFailedUserMailData(user, account);
    await this.mailsService.sendMail(userMailData);
  }

  @transactional()
  async createAccountFromCGAccount(
    cgAccountId: string, cgUserId: string, txn: TxnOption = null,
  ): Promise<{ account: Account, admin: AccountUser }> {
    const [cgAccount, cgAccountUser] = await all([
      this.cgManager.getCGAccountDetails(cgAccountId),
      this.cgManager.getCGAccountUserDetails(cgUserId),
    ]) as [CGAccount, CGAccountUser];

    const account = await this.getOrAddAccount(cgAccount, txn);
    const admin = await this.accountUserManager.getOrAddAccountUser(account, cgAccountUser);

    return { account, admin };
  }

  @transactional()
  async deleteAccount(account: Account, txn: TxnOption) {
    // Delete template
    const templates = await account.templates;
    await this.accountTemplateService.removeTemplates(templates, txn);

    if (account.stripeSubscriptionId) {
      await this.stripeService.cancelSubscription(account, 'Now');
    }

    // Delete account rest of the relations don't have and extra data to be deleted
    // and will be handled by onDelete Cascade
    await this.accountService.delete(account, txn);
  }
}
