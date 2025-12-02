/* eslint-disable new-cap */
import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { serializable } from '../../SerializerPlugin/decorators/serializable';
import { expose } from '../../SerializerPlugin/decorators/expose';
import { AuditHow, AuditValue, AuditWho } from '../types';

@serializable()
export class AbstractAuditLog {
  @expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @expose()
  @Column({ type: 'json' })
  who: AuditWho;

  @expose()
  @Column({ length: 256 })
  what: string;

  @expose()
  @Column({ length: 256 })
  how: string;

  @expose()
  get howEnum() {
    return this.how as AuditHow;
  }

  @expose()
  @Column({ length: 256 })
  event: string;

  @expose()
  @Column({ type: 'json', nullable: true })
  original?: AuditValue;

  @expose()
  @Column({ type: 'json', nullable: true })
  updated?: AuditValue;

  @expose()
  @Column({ length: 1024 })
  description: string;

  @expose()
  @Column({ type: 'json', nullable: true })
  data: object = null;

  @expose()
  @CreateDateColumn()
  createdAt: Date;
}
