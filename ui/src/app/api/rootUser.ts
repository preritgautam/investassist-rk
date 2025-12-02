import { userSession } from '../../userSession';

const f = userSession.apiFactory;

export const getAccountBillingDetailsApi = f.createGetApi('/api/account/root/accounts/account');

export const getSubscriptionCheckoutUrlApi =
  f.createPostApi('/api/account/root/accounts/account/stripe/checkout');

export const getSubscriptionSuccessStatusApi = f.createGetApi(
  '/api/account/root/accounts/account/stripe/checkout/success',
);

export const cancelSubscriptionApi =
  f.createPostApi('/api/account/root/accounts/account/stripe/subscription/cancel');

export const upgradeSubscriptionApi =
  f.createPostApi('/api/account/root/accounts/account/stripe/subscription/upgrade');

export const getStripePortalUrlApi =
  f.createGetApi('/api/account/root/accounts/account/stripe/portalUrl');
