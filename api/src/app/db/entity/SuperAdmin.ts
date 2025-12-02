import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SuperAdminToken } from './SuperAdminToken';
import { serializable } from '../../../framework/plugins/SerializerPlugin';
import { expose } from '../../../framework/plugins/SerializerPlugin';
import { IUser } from '../../../bootstrap/models/IUser';

/* eslint-disable new-cap */
@serializable()
@Entity()
export class SuperAdmin implements IUser {
  get uid() {
    return this.email;
  }

  get secret() {
    return this.password;
  }

  @expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @expose()
  @Column()
  name: string;

  @expose()
  @Column({ unique: true })
  email: string;

  @Column({ length: 2048 })
  password: string;

  @OneToMany(() => SuperAdminToken, (token) => token.user)
  tokens: Promise<SuperAdminToken[]>;

  @expose()
  @Column({ type: 'json' })
  roles: string[];

  @expose()
  @CreateDateColumn()
  createdAt: Date;

  @expose()
  @UpdateDateColumn()
  updatedAt: Date;
}
