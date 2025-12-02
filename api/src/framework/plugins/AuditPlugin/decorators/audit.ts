import { AbstractEvent } from '../../EventPlugin';
import { Type } from '../../../core/container';
import { IAuditableEvent } from '../event/IAuditableEvent';
import { AuditLogEventsListener } from '../event/AuditLogEventsListener';

export const auditKey = Symbol('AuditOptions');


export type AuditDecorator = (() => (constructor: Type<AbstractEvent & IAuditableEvent>) => void)

export const audit: AuditDecorator = () => {
  return function(constructor: Type<AbstractEvent & IAuditableEvent>) {
    AuditLogEventsListener.subscribeEvent(constructor);
    Reflect.defineMetadata(auditKey, { auditable: true }, constructor);
  };
};
