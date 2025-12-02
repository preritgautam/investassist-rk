import { AbstractEvent } from '../../framework/plugins/EventPlugin';
import { Deal } from '../db/entity/Deal';

export class DealEvent extends AbstractEvent {
  constructor(public readonly deal: Deal) {
    super();
  }
}

export class DealCreatedEvent extends DealEvent {
}

export class DealUpdatedEvent extends DealEvent {
}
