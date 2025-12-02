import { IAuditableEvent } from '../event/IAuditableEvent';
import { AbstractAuditLog } from '../entity/AbstractAuditLog';

export interface IAuditLogService {
  addLog(e: IAuditableEvent): Promise<AbstractAuditLog>;
}
