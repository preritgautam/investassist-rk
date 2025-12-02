import { AbstractEvent } from '../../framework/plugins/EventPlugin';
import { Deal } from '../db/entity/Deal';
import { Document } from '../db/entity/Document';


abstract class DealDocumentEvent extends AbstractEvent {
  constructor(public readonly document: Document) {
    super();
  }
}

export class DealDocumentDataUpdatedEvent extends DealDocumentEvent {
}

export class DealDocumentProcessedEvent extends DealDocumentEvent {
}

export class DealDocumentDeletedEvent extends AbstractEvent {
  constructor(
    public readonly deal: Deal,
    public readonly document: Document,
    public readonly deleteDeal: boolean,
  ) {
    super();
  }
}

