import { controller, post, request, response } from '../../../framework/plugins/WebPlugin';
import { Response, Request } from 'express';
import { config } from '../../../framework/plugins/AppConfigPlugin/AppConfigPlugin';
import { AppConfigType } from '../../config';
import { inject } from '../../boot';
import { AccountManager } from '../../service/manager/AccountManager';
import { ExpressRawJson } from '../../middlewares/ExpressRawJson';
import { StripeService } from '../../service/stripe/StripeService';

interface SubscriptionCreatedWebhookData {
  id: string;
  plan: {
    id: string;
  };
  status: string;
  metadata: {
    appSlug: string;
    accountId: string;
  };
}

interface InvoicePaymentSucceededData {
  subscription: string;
  customer: string;
  // eslint-disable-next-line camelcase
  amount_due: number;
  // eslint-disable-next-line camelcase
  amount_paid: number;
  lines: {
    data: [{
      metadata: {
        accountId: string;
        appSlug: string;
        originApp: string;
      };
      period: {
        start: number;
        end: number;
      };
      plan: {
        id: string;
      };
    }]
  };
}

interface InvoicePaymentFailedData {
  subscription: string;
  customer: string;
  // eslint-disable-next-line camelcase
  hosted_invoice_url: string;
  lines: {
    data: [{
      metadata: {
        accountId: string;
        appSlug: string;
        originApp: string;
      };
      period: {
        start: number;
        end: number;
      };
      plan: {
        id: string;
      };
    }]
  };
}

interface SubscriptionDeletedData {
  id: string;
  metadata: {
    appSlug: string;
    accountId: string;
  };
}

interface InvoiceFinalizedData {
  id: string;
  customer: string;
  // eslint-disable-next-line camelcase
  amount_due: number;
  // eslint-disable-next-line camelcase
  amount_paid: number;
  lines: {
    data: [{
      metadata: {
        accountId: string;
        appSlug: string;
      };
    }]
  },
  subscription: string;
}

interface WebhookData<WebhookType = any> {
  type: string;
  data: {
    object: WebhookType;
  };
}

@controller({ route: '/webhooks/stripe', middlewares: [ExpressRawJson] })
export class StripeController {
  constructor(
    @config('uniqueSlug') private readonly appUniqueSlug: AppConfigType['uniqueSlug'],
    @inject(AccountManager) private readonly accountManager: AccountManager,
    @inject(StripeService) private readonly stripeService: StripeService,
    @config('stripe.webhookSecret') private readonly webhookSecret: string,
  ) {}

  @post('/')
  async handleStripeWebhook(
    @request() req: Request,
    @response() res: Response,
  ) {
    const sig = req.headers['stripe-signature'];

    let webhookData: WebhookData;
    try {
      webhookData =
        this.stripeService.stripe.webhooks.constructEvent(req.body, sig, this.webhookSecret);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (webhookData.type === 'customer.subscription.created') {
      const data: SubscriptionCreatedWebhookData = webhookData.data.object;
      const { metadata } = data;
      if (typeof metadata === 'object' && metadata.appSlug === this.appUniqueSlug) {
        const accountId = metadata.accountId;
        const subscriptionId = data.id;
        const planId = data.plan.id;
        const isTrialing = data.status === 'trialing';

        await this.accountManager.accountSubscriptionCreated(accountId, subscriptionId, planId, isTrialing);
      }
    } else if (webhookData.type === 'invoice.finalized') {
      const data: InvoiceFinalizedData = webhookData.data.object;
      if (data?.lines?.data) {
        const { metadata } = data.lines.data[0];
        if (typeof metadata === 'object' && metadata.appSlug === this.appUniqueSlug) {
          const { accountId } = metadata;
          const { subscription, customer, id, amount_paid: amountPaid, amount_due: amountDue } = data;
          if (amountDue + amountPaid > 0) {
            await this.accountManager.tryPayingInvoice(accountId, customer, subscription, id);
          }
        }
      }
    } else if (webhookData.type === 'invoice.payment_succeeded') {
      const data: InvoicePaymentSucceededData = webhookData.data.object;
      if (data?.lines?.data) {
        const { metadata, period, plan } = data.lines.data[0];
        if (typeof metadata === 'object' && metadata.appSlug === this.appUniqueSlug) {
          const { accountId } = metadata;
          const { subscription, customer, amount_paid: amountPaid, amount_due: amountDue } = data;
          const startDate = new Date(period.start * 1000);
          const endDate = new Date(period.end * 1000);

          if (amountDue + amountPaid > 0) {
            await this.accountManager.handleSuccessfulPayment(
              accountId,
              customer, subscription, plan.id,
              startDate, endDate,
            );
          }
        }
      }
    } else if (webhookData.type === 'customer.subscription.deleted') {
      const data: SubscriptionDeletedData = webhookData.data.object;
      const { metadata } = data;
      if (typeof metadata === 'object' && metadata.appSlug === this.appUniqueSlug) {
        const accountId = metadata.accountId;

        await this.accountManager.setSubscriptionDeleted(accountId, null);
      }
    } else if (webhookData.type === 'invoice.payment_failed') {
      const data: InvoicePaymentFailedData = webhookData.data.object;
      if (data?.lines?.data) {
        const { metadata } = data.lines.data[0];
        if (typeof metadata === 'object' && metadata.appSlug === this.appUniqueSlug) {
          const { accountId } = metadata;
          const { subscription, customer, hosted_invoice_url: invoiceUrl } = data;

          await this.accountManager.handlePaymentFailure(
            accountId,
            customer, subscription,
            invoiceUrl,
          );
        }
      }
    }

    res.sendStatus(200);
  }
}
