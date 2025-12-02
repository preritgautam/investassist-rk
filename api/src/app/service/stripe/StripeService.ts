import { inject, injectable } from '../../boot';
import { Account } from '../../db/entity/Account';
import { AccountUser } from '../../db/entity/AccountUser';
import { config } from '../../../framework/plugins/AppConfigPlugin/AppConfigPlugin';
import { AppConfigType } from '../../config';
import Stripe from 'stripe';
import { Exception } from 'handlebars';
import { PlanId } from '../../types';
import { UiAppUrlHelper } from '../UiAppUrlHelper';


@injectable()
export class StripeService {
  public readonly stripe: Stripe = null;
  private readonly originAppName: string;

  constructor(
    @config('stripe') private readonly stripeConfig: AppConfigType['stripe'],
    @config('uniqueSlug') private readonly appUniqueSlug: string,
    @inject(UiAppUrlHelper) private readonly ui: UiAppUrlHelper,
  ) {
    this.stripe = new Stripe(stripeConfig.key, {
      apiVersion: '2022-11-15',
    });
    this.originAppName = stripeConfig.originAppName;
  }

  public async createStripeCustomerForAccount(account: Account, rootUser: AccountUser): Promise<string> {
    if (!account.isRegisteredWithStripe) {
      const customerObj = this.buildCustomerObject(account, rootUser);
      const customer = await this.stripe.customers.create(customerObj);
      return customer.id;
    }
    return account.stripeCustomerId;
  }

  private buildCustomerObject(account: Account, rootUser: AccountUser) {
    if (!rootUser.isRootUser) {
      throw new Exception('The passed user is not a root user');
    }

    return {
      name: account.name,
      email: rootUser.email,
      description: account.name,
      metadata: {
        accountId: account.id,
        originApp: this.originAppName,
        appSlug: this.appUniqueSlug,
      },
    };
  }

  async startCheckout(
    account: Account, planId: PlanId, includeTrial: boolean, successUrl: string, cancelUrl: string,
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    return await this.stripe.checkout.sessions.create({
      line_items: [{
        price: this.stripeConfig[planId],
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: account.stripeCustomerId,
      currency: 'USD',
      customer: account.stripeCustomerId,
      metadata: {
        accountId: account.id,
        originApp: this.originAppName,
        appSlug: this.appUniqueSlug,
      },
      payment_method_types: ['card'],
      payment_method_collection: 'always',
      subscription_data: {
        description: `Invest assist ${planId} subscription`,
        metadata: {
          accountId: account.id,
          originApp: this.originAppName,
          appSlug: this.appUniqueSlug,
        },
        trial_period_days: includeTrial ? 14 : undefined,
      },
    });
  }

  async cancelSubscription(account: Account, cancelWhen: 'Now' | 'PeriodEnd') {
    const subscriptionId = account.stripeSubscriptionId;
    if (cancelWhen === 'Now') {
      await this.stripe.subscriptions.cancel(subscriptionId, {
        prorate: false,
        invoice_now: false,
      });
    } else if (cancelWhen === 'PeriodEnd') {
      await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  }

  getLocalPlanIdFromPlanId(planId: string): PlanId {
    for (const key of Reflect.ownKeys(this.stripeConfig)) {
      if ((key as string).startsWith('plan')) {
        if (this.stripeConfig[key] === planId) {
          return key as PlanId;
        }
      }
    }
  }

  async autoPayInvoice(invoiceId: string) {
    await this.stripe.invoices.pay(invoiceId, {
      off_session: true,
      forgive: false,
    });
  }

  async upgradeSubscriptionFromTrialToPaid(account: Account) {
    if (account.status === 'Trial') {
      await this.stripe.subscriptions.update(account.stripeSubscriptionId, {
        trial_end: 'now',
      });
    }
  }

  async getBillingPortalConfigurationId() {
    const configs = await this.stripe.billingPortal.configurations.list({ active: true });
    const usefulConfig: Stripe.BillingPortal.Configuration =
      configs.data.find((config: Stripe.BillingPortal.Configuration) => {
        return config.metadata.appSlug === this.appUniqueSlug &&
          config.metadata.autoApiConfig === 'yes';
      });

    if (usefulConfig) {
      return usefulConfig.id;
    }

    const config = await this.stripe.billingPortal.configurations.create({
      metadata: {
        originApp: this.originAppName,
        appSlug: this.appUniqueSlug,
        autoApiConfig: 'yes',
      },
      business_profile: {
        headline: 'Clik.Ai - InvestAssist',
        privacy_policy_url: 'https://www.clik.ai/terms-and-conditions',
        terms_of_service_url: 'https://www.clik.ai/terms-and-conditions',
      },
      default_return_url: this.ui.manageBillingUrl(),
      features: {
        customer_update: {
          enabled: true,
          allowed_updates: ['address', 'phone'],
        },
        invoice_history: {
          enabled: true,
        },
        payment_method_update: {
          enabled: true,
        },
        subscription_cancel: {
          enabled: false,
        },
        subscription_pause: {
          enabled: false,
        },
      },
    });

    return config.id;
  }

  async getStripePortalUrl(account: Account) {
    const stripeCustomerId = account.stripeCustomerId;
    const billingPortalConfigId = await this.getBillingPortalConfigurationId();
    const sessionUrl = await this.stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      configuration: billingPortalConfigId,
    });
    return sessionUrl.url;
  }
}
