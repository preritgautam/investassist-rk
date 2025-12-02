import mixpanel from 'mixpanel-browser';
import { Service } from '../../bootstrap/service/Service';
import { Deal, DealDocument } from '../../types';
import { appConfig } from '../../config';
import { userSession } from '../../userSession';

class MixPanelService extends Service {
  constructor() {
    super();
    mixpanel.init(appConfig.mixPanelProjectToken);
  }

  identify() {
    const user = this.getUserKey();
    mixpanel.identify(user.id);
  }

  track(eventName: string, data: any) {
    const user = this.getUserKey();
    mixpanel.track(eventName, {
      env: appConfig.appUniqueSlug,
      application: appConfig.appName,
      user,
      data,
    });
  }

  getUserKey() {
    const { user } = userSession.authManager.getSessionObj();
    return {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      isAdmin: user?.isRootUser,
    };
  }

  trackDealCreatedEvent(deal: Deal) {
    this.track('Deal Created', {
      deal: { id: deal.id, name: deal.name },
    });
  }

  trackDealDeletedEvent(deal: Deal) {
    this.track('Deal Deleted', {
      deal: { id: deal.id, name: deal.name },
    });
  }

  trackDealDocumentAddedEvent(document: DealDocument, deal: Deal) {
    this.track('Deal Document Added', {
      deal: {
        id: deal?.id,
        name: deal?.name,
      }, document: {
        id: document.id,
        name: document.name,
        documentType: document.documentType,
      },
    });
  }

  trackDealDocumentDeletedEvent(document: DealDocument, deal: Deal) {
    this.track('Deal Document Deleted', {
      deal: {
        id: deal?.id,
        name: deal?.name,
      }, document: {
        id: document.id,
        name: document.name,
        documentType: document.documentType,
      },
    });
  }

  trackDealDocumentValidatedEvent(document: DealDocument, deal: Deal) {
    this.track('Deal Document Marked Validated', {
      deal: {
        id: deal?.id,
        name: deal?.name,
      }, document: {
        id: document.id,
        name: document.name,
        documentType: document.documentType,
      },
    });
  }

  trackDealDocumentInValidatedEvent(document: DealDocument, deal: Deal) {
    this.track('Deal Document Unlocked', {
      deal: {
        id: deal?.id,
        name: deal?.name,
      }, document: {
        id: document.id,
        name: document.name,
        documentType: document.documentType,
      },
    });
  }

  trackDealDetailsUpdatedEvent(deal: Deal) {
    this.track('Deal Details Updated', {
      deal: {
        id: deal?.id,
        name: deal?.name,
      },
    });
  }

  trackDealModelGeneratedEvent(deal: Deal, rentRollIds : string[], cashFlowIds: string[]) {
    this.track('Deal Model Generated', {
      deal: {
        id: deal?.id,
        name: deal?.name,
      },
      rentRollIds,
      cashFlowIds,
    });
  }
}

export const useMixPanelService: () => MixPanelService = () => MixPanelService.useService();

export { MixPanelService };
