import { AuditHow } from '../types';

export interface IAuditableEvent {
  what: string;
  how: AuditHow;
  from: any;
  to: any;
  description: string;
}
