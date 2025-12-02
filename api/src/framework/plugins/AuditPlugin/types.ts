export interface AuditWho {
  entity: string,
  id: string,
}

export interface AuditValue {
  value: any,
}

export type AuditHow = 'CREATED' | 'UPDATED' | 'DELETED';

