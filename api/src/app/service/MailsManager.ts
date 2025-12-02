import { inject, injectable } from '../boot';
import { IUser } from '../../bootstrap/models/IUser';
import { ISecurityUserToken } from '../../framework/plugins/SecurityPlugin/models/ISecurityUserToken';
import { UiAppUrlHelper } from './UiAppUrlHelper';
import * as Mail from 'nodemailer/lib/mailer';
import { TemplateService } from '../../framework/plugins/TemplatePlugin/service/TemplateService';
import { SuperAdmin } from '../db/entity/SuperAdmin';
import { Document } from '../db/entity/Document';
import { Deal } from '../db/entity/Deal';
import { Readable } from 'stream';
import { config } from '../../framework/plugins/AppConfigPlugin/AppConfigPlugin';
import { AppConfigType } from '../config';
import { Account } from '../db/entity/Account';
import { TicketDetails } from '../types';
import { PlanMap } from '../constant/PlanMap';
import { DateTime } from 'luxon';
import { AccountUser } from '../db/entity/AccountUser';


@injectable()
export class MailsManager {
  constructor(
    @inject(UiAppUrlHelper) private readonly uiAppUrlHelper: UiAppUrlHelper,
    @inject(TemplateService) private readonly templates: TemplateService,
    @config('emailIds') private readonly emailIds: AppConfigType['emailIds'],
    @config('uniqueSlug') private readonly appUniqueSlug: string,
  ) {
  }

  async resetPasswordRequestedMailData(user: IUser, resetToken: ISecurityUserToken): Promise<Mail.Options> {
    const isAdmin = user instanceof SuperAdmin;
    const mailData = {
      user: {
        name: user.name,
        email: user.email,
      },
      resetLink: isAdmin ? this.uiAppUrlHelper.resetSuperAdminPasswordUrl(user.email, resetToken.token) : '',
    };

    return {
      to: user.email,
      subject: 'mailer.auth.resetPasswordRequested.subject',
      text: JSON.stringify({
        mail: 'Reset Password Requested',
        mailData,
      }, null, 2),
      html: await this.templates.render('mails/admin/reset-password-requested.njk.html', mailData),
    };
  }

  async raiseTicketMailData(
    account: Account, user: IUser, deal: Deal, document: Document, documentStream: Readable, details: TicketDetails,
  ) {
    const mailData = {
      accountName: account.name,
      dealName: deal.name,
      userName: user.name,
      userEmail: user.email,
      documentName: document.name,
      documentType: document.documentType.label,
      startPage: document.startPage,
      endPage: document.endPage,
      accountLoginUrl: this.uiAppUrlHelper.accountLoginUrl(account.slug),
      issueType: details.issueType,
      details: details.details,
    };

    return {
      to: this.emailIds.raiseTicket,
      subject: `INA - Support Ticket Raised - ${account.name} - ${deal.name} - ${document.name}`,
      html: await this.templates.render('mails/admin/support-ticket-raised.njk.html', mailData),
      attachments: [
        {
          filename: document.name,
          content: documentStream,
        },
      ],
    };
  }

  async raiseTicketMailToUserData(
    user: IUser, deal: Deal, document: Document, details: TicketDetails,
  ) {
    const mailData = {
      userName: user.name,
      dealName: deal.name,
      documentName: document.name,
      documentType: document.documentType.label,
      startPage: document.startPage,
      endPage: document.endPage,
      issueType: details.issueType,
      details: details.details,
      imageUrl: `${this.uiAppUrlHelper.mailsImageBasePath()}/support-issue.png`,
      clikImageUrl: `${this.uiAppUrlHelper.mailsImageBasePath()}/clik-logo.png`,
    };

    return {
      to: user.email,
      subject: `Support Ticket Raised- ${deal.name} - ${document.name}`,
      html: await this.templates.render('mails/user/ticket-raised-mail-to-user.njk.html', mailData),
    };
  }

  async subscriptionCreatedAdminMailData(account: Account) {
    const mailData = {
      appUniqueSlug: this.appUniqueSlug,
      accountName: account.name,
      stripeCustomerId: account.stripeCustomerId,
      stripeSubscriptionId: account.stripeSubscriptionId,
      stripePlanId: account.stripePlanId,
      planId: account.planId,
      status: account.status,
      trialStartedOn: account.trialStartedOn,
      trialEndedOn: account.trialEndedOn,
    };

    return {
      to: this.emailIds.accountUpdates,
      subject: `INA - Subscription Created - ${mailData.accountName}`,
      html: await this.templates.render('mails/admin/subscription-created.njk.html', mailData),
    };
  }

  async subscriptionCancelledAdminMailData(account: Account) {
    const mailData = {
      appUniqueSlug: this.appUniqueSlug,
      accountName: account.name,
      stripeCustomerId: account.stripeCustomerId,
      stripeSubscriptionId: account.stripeSubscriptionId,
      stripePlanId: account.stripePlanId,
      planId: account.planId,
      status: account.status,
      trialStartedOn: account.trialStartedOn,
      trialEndedOn: account.trialEndedOn,
      currentSubscriptionStartedOn: account.currentSubscriptionStartedOn,
      currentSubscriptionEndsOn: account.currentSubscriptionEndsOn,
      markedForCancellationOn: account.markedForCancellationOn,
      isTrial: account.status === 'Trial',
    };

    return {
      to: this.emailIds.accountUpdates,
      subject: `INA - Subscription Cancelled - ${mailData.accountName}`,
      html: await this.templates.render('mails/admin/subscription-cancelled.njk.html', mailData),
    };
  }

  async subscriptionCancelledUserMailData(user: IUser, account: Account) {
    const mailData = {
      appUniqueSlug: this.appUniqueSlug,
      userName: user.name,
      planName: PlanMap[account.planId],
      imageUrl: `${this.uiAppUrlHelper.mailsImageBasePath()}/subscription-cancelled.png`,
      accountName: account.name,
      stripeCustomerId: account.stripeCustomerId,
      stripeSubscriptionId: account.stripeSubscriptionId,
      stripePlanId: account.stripePlanId,
      planId: account.planId,
      status: account.status,
      trialStartedOn: account.trialStartedOn,
      trialEndedOn: account.trialEndedOn,
      currentSubscriptionStartedOn: account.currentSubscriptionStartedOn,
      currentSubscriptionEndsOn: DateTime.fromJSDate(account.currentSubscriptionEndsOn)
        .toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY, { locale: 'en-us' }),
      markedForCancellationOn: account.markedForCancellationOn,
      isTrial: account.status === 'Trial',
      clikImageUrl: `${this.uiAppUrlHelper.mailsImageBasePath()}/clik-logo.png`,
    };

    return {
      to: user.email,
      subject: `Clik.Ai - InvestAssist - Subscription Cancelled`,
      html: await this.templates.render('mails/user/subscription-cancelled.njk.html', mailData),
    };
  }

  async subscriptionDeletedAdminMailData(account: Account) {
    const mailData = {
      appUniqueSlug: this.appUniqueSlug,
      accountName: account.name,
      stripeCustomerId: account.stripeCustomerId,
      stripeSubscriptionId: account.stripeSubscriptionId,
      stripePlanId: account.stripePlanId,
      planId: account.planId,
      status: account.status,
      trialStartedOn: account.trialStartedOn,
      trialEndedOn: account.trialEndedOn,
      currentSubscriptionStartedOn: account.currentSubscriptionStartedOn,
      currentSubscriptionEndsOn: account.currentSubscriptionEndsOn,
      markedForCancellationOn: account.markedForCancellationOn,
      currentSubscriptionCancelledOn: account.currentSubscriptionCancelledOn,
    };

    return {
      to: this.emailIds.accountUpdates,
      subject: `INA - Subscription Deleted - ${mailData.accountName}`,
      html: await this.templates.render('mails/admin/subscription-deleted.njk.html', mailData),
    };
  }

  async subscriptionDeletedUserMailData(user: IUser, account: Account) {
    const mailData = {
      appUniqueSlug: this.appUniqueSlug,
      accountName: account.name,
      stripeCustomerId: account.stripeCustomerId,
      stripeSubscriptionId: account.stripeSubscriptionId,
      stripePlanId: account.stripePlanId,
      planId: account.planId,
      status: account.status,
      trialStartedOn: account.trialStartedOn,
      trialEndedOn: account.trialEndedOn,
      currentSubscriptionStartedOn: account.currentSubscriptionStartedOn,
      currentSubscriptionEndsOn: account.currentSubscriptionEndsOn,
      markedForCancellationOn: account.markedForCancellationOn,
      currentSubscriptionCancelledOn: account.currentSubscriptionCancelledOn,
      planName: PlanMap[account.planId],
      imageUrl: `${this.uiAppUrlHelper.mailsImageBasePath()}/subscription-cancelled.png`,
      clikImageUrl: `${this.uiAppUrlHelper.mailsImageBasePath()}/clik-logo.png`,
    };

    return {
      to: user.email,
      subject: `Clik.Ai - InvestAssist - Subscription Deleted`,
      html: await this.templates.render('mails/user/subscription-deleted.njk.html', mailData),
    };
  }

  async subscriptionCreatedUserMailData(user: IUser, account: Account) {
    const subscriptionStartDate = account.status === 'Trial' ?
      DateTime.fromJSDate(account.trialStartedOn).plus({ days: 14 }) :
      DateTime.now();

    const mailData = {
      user,
      appUniqueSlug: this.appUniqueSlug,
      accountName: account.name,
      stripeCustomerId: account.stripeCustomerId,
      stripeSubscriptionId: account.stripeSubscriptionId,
      stripePlanId: account.stripePlanId,
      planId: account.planId,
      status: account.status,
      trialStartedOn: DateTime.fromJSDate(account.trialStartedOn)
        .toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY, { locale: 'en-us' }),
      currentSubscriptionStartedOn: subscriptionStartDate
        .toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY, { locale: 'en-us' }),
      markedForCancellationOn: account.markedForCancellationOn,
      currentSubscriptionCancelledOn: account.currentSubscriptionCancelledOn,
      plan: PlanMap[account.planId],
      isTrial: account.status === 'Trial',
      imageUrl: `${this.uiAppUrlHelper.mailsImageBasePath()}/payment-success.png`,
      clikImageUrl: `${this.uiAppUrlHelper.mailsImageBasePath()}/clik-logo.png`,
    };

    return {
      to: user.email,
      subject: `Clik.Ai - InvestAssist Subscription Created`,
      html: await this.templates.render('mails/user/subscription-created.njk.html', mailData),
    };
  }

  async paymentSuccessfulAdminMailData(account: Account) {
    const mailData = {
      appUniqueSlug: this.appUniqueSlug,
      accountName: account.name,
      stripeCustomerId: account.stripeCustomerId,
      stripeSubscriptionId: account.stripeSubscriptionId,
      stripePlanId: account.stripePlanId,
      planId: account.planId,
      status: account.status,
      currentSubscriptionStartedOn: account.currentSubscriptionStartedOn,
      currentSubscriptionEndsOn: account.currentSubscriptionEndsOn,
    };

    return {
      to: this.emailIds.accountUpdates,
      subject: `INA - Subscription Payment Successful - ${mailData.accountName}`,
      html: await this.templates.render('mails/admin/subscription-payment-success.njk.html', mailData),
    };
  }

  async paymentSuccessfulUserMailData(user: IUser, account: Account) {
    const mailData = {
      appUniqueSlug: this.appUniqueSlug,
      accountName: account.name,
      stripeCustomerId: account.stripeCustomerId,
      stripeSubscriptionId: account.stripeSubscriptionId,
      stripePlanId: account.stripePlanId,
      planId: account.planId,
      status: account.status,
      currentSubscriptionStartedOn: DateTime.fromJSDate(account.currentSubscriptionStartedOn)
        .toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY, { locale: 'en-us' }),
      currentSubscriptionEndsOn: DateTime.fromJSDate(account.currentSubscriptionEndsOn)
        .toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY, { locale: 'en-us' }),
      imageUrl: `${this.uiAppUrlHelper.mailsImageBasePath()}/payment-success.png`,
      clikImageUrl: `${this.uiAppUrlHelper.mailsImageBasePath()}/clik-logo.png`,
      userName: user.name,
      planName: PlanMap[account.planId],
      isTrial: account.status === 'Trial',
    };

    return {
      to: user.email,
      subject: `Clik.Ai - InvestAssist Payment Successful`,
      html: await this.templates.render('mails/user/subscription-payment-success.njk.html', mailData),
    };
  }

  async paymentFailedAdminMailData(account: Account) {
    const mailData = {
      appUniqueSlug: this.appUniqueSlug,
      accountName: account.name,
      stripeCustomerId: account.stripeCustomerId,
      stripeSubscriptionId: account.stripeSubscriptionId,
      stripePlanId: account.stripePlanId,
      planId: account.planId,
      status: account.status,
      currentSubscriptionStartedOn: account.currentSubscriptionStartedOn,
      currentSubscriptionEndsOn: account.currentSubscriptionEndsOn,
      imageUrl: `${this.uiAppUrlHelper.mailsImageBasePath()}/payment-failed.png`,
      invoiceUrl: account.lastInvoiceUrl,
      isTrial: account.status === 'Trial',
      planName: PlanMap[account.planId],
    };

    return {
      to: this.emailIds.accountUpdates,
      subject: `INA - Subscription Payment Failed - ${mailData.accountName}`,
      html: await this.templates.render('mails/admin/subscription-payment-failed.njk.html', mailData),
    };
  }

  async paymentFailedUserMailData(user: IUser, account: Account) {
    const mailData = {
      appUniqueSlug: this.appUniqueSlug,
      accountName: account.name,
      userName: user.name,
      stripeCustomerId: account.stripeCustomerId,
      stripeSubscriptionId: account.stripeSubscriptionId,
      stripePlanId: account.stripePlanId,
      planId: account.planId,
      status: account.status,
      currentSubscriptionStartedOn: account.currentSubscriptionStartedOn,
      currentSubscriptionEndsOn: account.currentSubscriptionEndsOn,
      imageUrl: `${this.uiAppUrlHelper.mailsImageBasePath()}/payment-failed.png`,
      clikImageUrl: `${this.uiAppUrlHelper.mailsImageBasePath()}/clik-logo.png`,
      invoiceUrl: account.lastInvoiceUrl,
      isTrial: account.status === 'Trial',
      planName: PlanMap[account.planId],
    };

    return {
      to: user.email,
      subject: `Clik.Ai - InvestAssist - Subscription Payment Failed`,
      html: await this.templates.render('mails/user/subscription-payment-failed.njk.html', mailData),
    };
  }

  async documentUploadedAdminMailData(
    user: AccountUser, account: Account, deal: Deal, document: Document, documentStream: Readable,
  ) {
    const mailData = {
      appUniqueSlug: this.appUniqueSlug,
      accountName: account.name,
      dealName: deal.name,
      userName: user.name,
      userEmail: user.email,
      documentName: document.name,
      documentType: document.documentType.label,
    };

    return {
      to: this.emailIds.accountUpdates,
      subject: `INA - Document Uploaded - ${account.name} - ${deal.name} - ${document.name}`,
      html: await this.templates.render('mails/admin/document-uploaded.njk.html', mailData),
      attachments: [
        {
          filename: document.name,
          content: documentStream,
        },
      ],
    };
  }
}
