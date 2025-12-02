import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { expose, serializable } from '../../../framework/plugins/SerializerPlugin';
import { AccountUser } from './AccountUser';
import { ISecurityUserToken } from '../../../framework/plugins/SecurityPlugin/models/ISecurityUserToken';

@Entity()
@serializable()
export class AccountUserToken implements ISecurityUserToken {
  @PrimaryGeneratedColumn('uuid')
  @expose()
  id: string;

  @ManyToOne(() => AccountUser, (user) => user.tokens, {
    onDelete: 'CASCADE',
  })
  user: Promise<AccountUser>;

  @RelationId((token: AccountUserToken) => token.user)
  userId: string;

  @expose()
  @Column({ length: 1024 })
  token: string;

  @expose()
  @Column()
  tokenType: string;

  @CreateDateColumn()
  createdAt: Date;
}
