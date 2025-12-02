import { inject, injectable } from '../../boot';
import { AccountUser } from '../../db/entity/AccountUser';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { Deal } from '../../db/entity/Deal';
import { DealService } from '../entity/DealService';
import { Document } from '../../db/entity/Document';
import { DocumentService } from '../entity/DocumentService';

export type AccessLevel = 'READ' | 'WRITE'

@injectable()
export class DealUtils {
  constructor(
    @inject(DealService) private readonly dealService: DealService,
    @inject(DocumentService) private readonly documentService: DocumentService,
  ) {
  }

  // By default, check for more restrictive check i.e. WRITE
  async canAccessDeal(deal: Deal, user: AccountUser, accessLevel: AccessLevel = 'WRITE'): Promise<boolean> {
    if (accessLevel === 'READ' && deal.isSampleDeal) {
      return true;
    }

    // Different account deal
    if (deal.accountId !== user.accountId) {
      return false;
    }

    // Same account admin can access all deals
    if (user.roles.includes('Admin')) {
      return true;
    }

    // Under same account deal owner or deal assignee can access the deal
    return !!(deal.ownedByUserId === user.id || deal.assignedToUserId === user.id);
  }

  async getUserDeal(
    dealId: string, user: AccountUser, txn: TxnOption, accessLevel: AccessLevel = 'WRITE',
  ): Promise<Deal> {
    const deal = await this.dealService.findById(dealId, txn);

    if (await this.canAccessDeal(deal, user, accessLevel) === false) {
      throw new Error('Unauthorized deal access');
    }

    return deal;
  }

  async getUserDealBySlug(
    slug: string, user: AccountUser, txn: TxnOption, accessLevel: AccessLevel = 'WRITE',
  ): Promise<Deal> {
    let deal: Deal;

    try {
      deal = await this.dealService.getDealBySlug(await user.account, slug, txn);
    } catch (e) {
      deal = await this.dealService.getSampleDealBySlug(slug, txn);
    }

    if (await this.canAccessDeal(deal, user, accessLevel) === false) {
      throw new Error('Unauthorized deal access');
    }

    return deal;
  }

  async getDealDocuments(user: AccountUser, dealId: string, txn: TxnOption): Promise<Document[]> {
    const deal = await this.getUserDeal(dealId, user, txn, 'READ');
    return this.documentService.getDealDocuments(deal, txn);
  }

  async getDealDocument(
    user: AccountUser, dealId: string, documentId: string, txn: TxnOption, accessLevel: AccessLevel = 'WRITE',
  ): Promise<Document> {
    const deal = await this.getUserDeal(dealId, user, txn, accessLevel);
    return await this.documentService.getDealDocument(deal, documentId, txn);
  }
}
