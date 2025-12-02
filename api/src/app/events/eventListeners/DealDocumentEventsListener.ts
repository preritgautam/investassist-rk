import { AbstractEventListener, EventHandler } from '../../../framework/plugins/EventPlugin';
import { inject, injectable } from '../../boot';
import { DealManager } from '../../service/manager/DealManager';
import {
  DealDocumentDataUpdatedEvent,
  DealDocumentDeletedEvent,
  DealDocumentProcessedEvent,
} from '../dealDocumentsEvents';
import { DocumentManager } from '../../service/manager/DocumentManager';
import { CashFlowManager } from '../../service/manager/CashFlowManager';


async function tryAndDontRaise(asyncFunc: () => Promise<any>) {
  try {
    await asyncFunc();
  } catch (e) {
    console.error(e);
  }
}


@injectable()
export class DealDocumentEventsListener extends AbstractEventListener {
  constructor(
    @inject(DealManager) private readonly dealManager: DealManager,
    @inject(DocumentManager) private readonly documentManager: DocumentManager,
    @inject(CashFlowManager) private readonly cashFlowManager: CashFlowManager,
  ) {
    super();
  }

  getSubscribedEvents(): { [p: string]: EventHandler } {
    return {
      [DealDocumentDataUpdatedEvent.getType()]: this.onDealDocumentDataUpdated.bind(this),
      [DealDocumentDeletedEvent.getType()]: this.onDealDocumentDelete.bind(this),
      [DealDocumentProcessedEvent.getType()]: this.onDealDocumentProcessed.bind(this),
    };
  }

  async onDealDocumentDataUpdated(event: DealDocumentDataUpdatedEvent) {
    await Promise.allSettled([
      this.dealManager.updateDealDictionary(event.document, null),
      this.documentManager.mapChargeCodes(event.document, null),
      this.documentManager.mapOccupancy(event.document, null),
      this.documentManager.mapFloorPlans(event.document, null),
    ]);
  }

  async onDealDocumentDelete(event: DealDocumentDeletedEvent) {
    if (!event.deleteDeal) {
      await Promise.allSettled([
        this.dealManager.rebuildDealDictionary(event.deal, null).catch(console.error),
      ]);
    }
  }

  async onDealDocumentProcessed(event: DealDocumentProcessedEvent) {
    // Let everything happen sequentially, but not stop others on failure
    await tryAndDontRaise(() => this.cashFlowManager.reverseRowSigns(event.document));
    await tryAndDontRaise(() => this.dealManager.applyDealDictionaryToDocument(event.document, null));
    await tryAndDontRaise(() => this.dealManager.updateDealDictionary(event.document, null));
    await tryAndDontRaise(() => this.documentManager.mapChargeCodes(event.document, null));
    await tryAndDontRaise(() => this.documentManager.mapOccupancy(event.document, null));
    await tryAndDontRaise(() => this.documentManager.mapFloorPlans(event.document, null));
  }
}
