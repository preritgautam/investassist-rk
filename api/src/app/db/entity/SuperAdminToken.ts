import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { SuperAdmin } from './SuperAdmin';
import { serializable } from '../../../framework/plugins/SerializerPlugin/decorators/serializable';
import { expose } from '../../../framework/plugins/SerializerPlugin/decorators/expose';
import { IUserToken } from '../../../bootstrap/models/IUserToken';

/* eslint-disable new-cap */
@serializable()
@Entity()
export class SuperAdminToken implements IUserToken {
  @PrimaryGeneratedColumn('uuid')
  @expose()
  id: string;

  @ManyToOne(() => SuperAdmin, (user) => user.tokens, {
    onDelete: 'CASCADE',
  })
  user: Promise<SuperAdmin>;

  @expose()
  @Column({ length: 1024 })
  token: string;

  @expose()
  @Column()
  tokenType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
