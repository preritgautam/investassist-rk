import { body, controller, get, post, request, response } from '../../../../../framework/plugins/WebPlugin';
import { isRootUser } from '../../../../middlewares/isRootUser';
import { AccountUser } from '../../../../db/entity/AccountUser';
import { Response } from 'express';
import { inject } from '../../../../boot';
import { AccountManager } from '../../../../service/manager/AccountManager';
import { SerializerService } from '../../../../../framework/plugins/SerializerPlugin';
import { Account } from '../../../../db/entity/Account';
import { PlanId } from '../../../../types';
import { StripeService } from '../../../../service/stripe/StripeService';

@controller({
  route: '/api/account/root/accounts',
  middlewares: ['security.auth.accountUserJwt', isRootUser],
})
export class AccountController {
  constructor(
    @inject(AccountManager) private readonly accountManager: AccountManager,
    @inject(SerializerService) private readonly serializer: SerializerService,
    @inject(StripeService) private readonly stripe: StripeService,
  ) {}

  @get('/account')
  async getAccountDetails(
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const account: Account = await user.account;

    res.send(await this.serializer.serialize(
      { account },
      { childOptions: { account: { groups: ['billing'] } } },
    ));
  }

  @post('/account/stripe/checkout')
  async startSubscriptionCheckout(
    @request('user') user: AccountUser,
    @body('planId') planId: PlanId,
    @body('includeTrial') includeTrial: boolean,
    @response() res: Response,
  ) {
    const checkoutUrl = await this.accountManager.startSubscriptionCheckout(user, planId, includeTrial, null);
    res.send({ checkoutUrl });
  }

  @get('/account/stripe/checkout/success')
  async getSubscriptionSuccessStatus(
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const successStatus = await this.accountManager.getSubscriptionSuccessStatus(user);
    res.send(successStatus);
  }

  @post('/account/stripe/subscription/cancel')
  async cancelSubscription(
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    await this.accountManager.cancelSubscription(user);
    res.sendStatus(200);
  }

  @post('/account/stripe/subscription/upgrade')
  async upgradeSubscriptionFromTrialToPaid(
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    await this.accountManager.upgradeFromTrialToPaid(user);
    res.sendStatus(200);
  }

  @get('/account/stripe/portalUrl')
  async getStripePortalurl(
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const account = await user.account;
    const portalUrl: string = await this.stripe.getStripePortalUrl(account);
    res.send({
      portalUrl,
    });
  }
}
