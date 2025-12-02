import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { expose, serializable } from '../../../framework/plugins/SerializerPlugin';
import { AccountUser } from './AccountUser';
import { AccountStatusType, CGAccount, PlanId } from '../../types';
import { Deal } from './Deal';
import { Assumption } from './Assumption';
import Stripe from 'stripe';
import { AccountTemplate } from './AccountTemplate';

@serializable()
@Entity()
export class Account {
  @expose()
  get name() {
    return this.cgAccount?.name;
  }

  @expose()
  get slug() {
    return this.cgAccount?.slug;
  }

  @expose()
  get isCGEnabled() {
    return this.cgAccount?.enabled;
  }

  @expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @expose()
  @Column({ unique: true })
  clikGatewayId: string;

  @OneToMany(() => AccountUser, (user) => user.account)
  users: Promise<AccountUser[]>;

  @expose()
  @CreateDateColumn()
  createdAt: Date;

  cgAccount?: CGAccount;

  @OneToMany(() => Deal, (deal) => deal.account)
  deals: Promise<Deal[]>;

  @OneToMany(() => Assumption, (assumption) => assumption.account)
  assumptions: Promise<Assumption[]>;

  @expose()
  @Column({ type: 'varchar', default: 'Free' })
  status: AccountStatusType;

  @expose()
  @Column({ default: true })
  enabled: boolean;


  @expose({ groups: ['admin'] })
  @Column({ type: 'varchar', length: 255, default: null })
  stripeCustomerId: string = null;

  @expose()
  get isRegisteredWithStripe(): boolean {
    return !!this.stripeCustomerId;
  }

  @Column({ type: 'varchar', length: 255, default: null })
  stripeSubscriptionId: string = null;

  @expose({ groups: ['billing'] })
  stripeSubscription?: Stripe.Subscription;

  @expose()
  @Column({ type: 'varchar', length: 255, default: null })
  planId: PlanId;

  @Column({ type: 'varchar', length: 255, default: null })
  stripePlanId: string = null;

  @expose({ groups: ['billing'] })
  stripePlan?: Stripe.Price;


  @expose()
  @Column({ type: 'datetime', default: null })
  trialStartedOn: Date;

  @expose()
  @Column({ type: 'datetime', default: null })
  trialCancelledOn: Date;

  @expose()
  @Column({ type: 'datetime', default: null })
  trialEndedOn: Date;

  @expose()
  @Column({ type: 'datetime', default: null })
  currentSubscriptionStartedOn: Date;

  @expose()
  @Column({ type: 'datetime', default: null })
  currentSubscriptionEndsOn: Date;

  @expose()
  @Column({ type: 'datetime', default: null })
  currentSubscriptionCancelledOn: Date;

  @expose()
  @Column({ type: 'datetime', default: null })
  markedForCancellationOn: Date;

  @expose()
  @Column({ type: 'boolean', default: null })
  oneTrialAvailed: boolean;

  @expose()
  @Column({ type: 'boolean', default: null })
  lastInvoiceFailed: boolean;

  @expose()
  @Column({ type: 'varchar', length: 2048, default: null })
  lastInvoiceUrl: string;

  @expose()
  @Column({ type: 'integer', default: 1 })
  userLimit: number;

  @OneToMany(() => AccountTemplate, (template: AccountTemplate) => template.account)
  templates: Promise<AccountTemplate[]>;
}
