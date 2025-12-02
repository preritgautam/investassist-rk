import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { expose, serializable } from '../../../framework/plugins/SerializerPlugin';
import { Account } from './Account';
import { CGAccountUser, UserPreferences } from '../../types';
import { IUser } from '../../../bootstrap/models/IUser';
import { AccountUserToken } from './AccountUserToken';
import { Deal } from './Deal';
import { Assumption } from './Assumption';

@serializable()
@Entity()
export class AccountUser implements IUser {
  get uid() {
    return this.id;
  }

  get secret() {
    return '';
  }

  @expose()
  get name() {
    return this.cgAccountUser?.name;
  }

  @expose()
  get email() {
    return this.cgAccountUser?.email;
  }

  @expose()
  get roles() {
    return this.cgAccountUser?.roles;
  }

  @expose()
  get enabled() {
    return this.cgAccountUser?.enabled;
  }

  @expose()
  get accountStatus() {
    return (async () => {
      const account = await this.account;
      return account.status;
    })();
  }

  @expose({ groups: ['withAccountDetails'] })
  get accountDetails() {
    return (async () => {
      const account = await this.account;
      return {
        status: account.status,
        id: account.id,
        lastInvoiceFailed: account.lastInvoiceFailed,
        lastInvoiceUrl: account.lastInvoiceUrl,
        oneTrialAvailed: account.oneTrialAvailed,
        markedForCancellationOn: account.markedForCancellationOn,
        userLimit: account.userLimit,
        planId: account.planId,
      };
    })();
  }

  @expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  clikGatewayId: string;

  @ManyToOne(() => Account, (account) => account.users, { onDelete: 'CASCADE' })
  account: Promise<Account>;

  @expose()
  @RelationId((user: AccountUser) => user.account)
  accountId: string;

  @OneToMany(() => AccountUserToken, (token) => token.user)
  tokens: Promise<AccountUserToken[]>;

  @expose()
  @CreateDateColumn()
  createdAt: Date;

  cgAccountUser?: CGAccountUser;

  @OneToMany(() => Deal, (deal) => deal.ownedByUser)
  ownedDeals: Promise<Deal[]>;

  @OneToMany(() => Deal, (deal) => deal.assignedToUser)
  assignedDeals: Promise<Deal[]>;

  @OneToMany(() => Assumption, (assumption) => assumption.user)
  assumptions: Promise<Assumption[]>;

  @expose()
  @Column({ type: 'json', nullable: true })
  userPreferences: UserPreferences;


  @expose()
  @Column({ default: false })
  isRootUser: boolean;

  @expose()
  @Column({ nullable: true, default: null })
  acceptedTermsOn: Date;
}
