import {
  AbstractEventListener,
  EventHandler,
} from '../../EventPlugin';
import { IAuditableEvent } from './IAuditableEvent';
import { IAuditLogService } from '../service/IAuditLogService';
import { AbstractEvent } from '../../EventPlugin';
import { Type } from '../../../core/container';

export class AuditLogEventsListener extends AbstractEventListener {
  private static subscribed: Set<string> = new Set();

  constructor(private readonly auditLogService: IAuditLogService) {
    super();
  }

  static subscribeEvent(e: Type<AbstractEvent>) {
    // @ts-ignore
    this.subscribed.add(e.getType());
  }

  getSubscribedEvents(): { [p: string]: EventHandler } {
    const events = {};
    const handler = this.onAuditLogEvent.bind(this);
    for (const event of AuditLogEventsListener.subscribed) {
      events[event] = handler;
    }
    return events;
  }

  onAuditLogEvent(e: IAuditableEvent) {
    this.auditLogService.addLog(e).catch(console.error);
  }
}
