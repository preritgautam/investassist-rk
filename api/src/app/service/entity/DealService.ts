import { EntityService } from '../../../bootstrap/service/entity/EntityService';
import { Deal } from '../../db/entity/Deal';
import { inject, injectable } from '../../boot';
import { DealDetails } from '../../db/entity/DealDetails';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { Account } from '../../db/entity/Account';
import { DealStatus } from '../../models/enums/DealStatus';
import { AccountUser } from '../../db/entity/AccountUser';
import { DealDetailsService } from './DealDetailsService';

export interface CreateDealParams
  extends Pick<Deal, 'name' | 'address' | 'slug' | 'account' | 'ownedByUser' | 'assignedToUser'> {
  details: Partial<DealDetails>,
}

export interface UpdateDealParams extends Pick<Deal, 'name' | 'address' | 'slug' | 'status'> {
  details: Partial<DealDetails>,
}

@injectable()
export class DealService extends EntityService<Deal> {
  constructor(@inject(DealDetailsService) private readonly dealDetailsService: DealDetailsService) {
    super(Deal);
  }

  async createDeal(params: CreateDealParams, txn: TxnOption): Promise<Deal> {
    const deal = new Deal();
    deal.name = params.name;
    deal.address = params.address;
    deal.account = params.account;
    deal.ownedByUser = params.ownedByUser;
    deal.assignedToUser = params.assignedToUser;
    deal.status = DealStatus.NEW;
    deal.slug = params.slug;

    const details = new DealDetails();
    details.dateRenovated = params.details.dateRenovated;
    details.purchasePrice = params.details.purchasePrice ? params.details.purchasePrice * 1000000 : null;
    details.dateBuilt = params.details.dateBuilt;
    details.numUnits = params.details.numUnits;
    details.totalArea = params.details.totalArea;
    deal.details = Promise.resolve(details);

    await this.dealDetailsService.save(details, txn);
    return this.save(deal, txn);
  }

  async updateDeal(deal: Deal, params: UpdateDealParams, txn: TxnOption): Promise<Deal> {
    const details = await deal.details;

    params.details && Reflect.ownKeys(params.details).forEach((d) => details[d] = params.details[d]);

    params.name && (deal.name = params.name);
    params.address && (deal.address = params.address);
    params.status && (deal.status = params.status);
    return this.save(deal, txn);
  }

  async getSampleDeals(txn: TxnOption): Promise<Deal[]> {
    return this.getRepository(txn).createQueryBuilder('d')
      .where({ isSampleDeal: true })
      .getMany();
  }

  async getAccountDeals(account: Account, txn: TxnOption): Promise<Deal[]> {
    // @ts-ignore
    return this.getRepository(txn).find({
      where: { account, isSampleDeal: false },
      relations: {
        details: true,
      },
    });
  }

  async getUserDeals(user: AccountUser, txn: TxnOption): Promise<Deal[]> {
    // @ts-ignore
    return this.getRepository(txn).find({
      order: { createdAt: 'DESC' },
      where: [
        { isSampleDeal: false, assignedToUser: user },
        { isSampleDeal: false, ownedByUser: user },
      ],
      relations: {
        details: true,
      },
    });
  }

  async getDealBySlug(account: Account, slug: string, txn: TxnOption): Promise<Deal> {
    return this.getRepository(txn).createQueryBuilder('d')
      .where({ account })
      .andWhere({ slug })
      .getOneOrFail();
  }

  async getSampleDealBySlug(slug: string, txn: TxnOption): Promise<Deal> {
    return this.getRepository(txn).createQueryBuilder('d')
      .where({ isSampleDeal: true })
      .andWhere({ slug })
      .getOneOrFail();
  }

  private async checkDealExistsWithSlug(account: Account, slug: string) {
    return (await this.getRepository().count({ account, slug })) > 0;
  }

  private async getMatchingSlugs(account: Account, slug: string): Promise<{ slug: string }[]> {
    const qb = this.getRepository().createQueryBuilder('a')
      .select('slug')
      .where('regexp_like(a.slug, :slugPattern)', { slugPattern: `^${slug}-[0-9]*$` })
      .andWhere('a.accountId = :accountId', { accountId: account.id });

    return await qb.getRawMany();
  }

  async getValidSlug(account: Account, preferredSlug: string) {
    const dealExistsWithSlug = await this.checkDealExistsWithSlug(account, preferredSlug);

    if (!dealExistsWithSlug) {
      return preferredSlug;
    }

    const existingSlugs = await this.getMatchingSlugs(account, preferredSlug);
    const maxSlugNumber = Math.max(0, ...existingSlugs.map((s) => parseInt(s.slug.split('-').reverse()[0])));
    return `${preferredSlug}-${maxSlugNumber + 1}`;
  }
}
