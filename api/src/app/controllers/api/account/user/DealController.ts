import {
  body,
  controller, delete_,
  get,
  params,
  post,
  patch,
  request,
  response, service,
} from '../../../../../framework/plugins/WebPlugin';
import { AccountUser } from '../../../../db/entity/AccountUser';
import { AddDealParams, DealManager, UpdateDealParams } from '../../../../service/manager/DealManager';
import { SerializerService } from '../../../../../framework/plugins/SerializerPlugin';
import { inject } from '../../../../boot';
import { Response } from 'express';
import { AccountUserManager } from '../../../../service/manager/AccountUserManager';
import { AssumptionManager } from '../../../../service/manager/AssumptionManager';
import { Assumption } from '../../../../db/entity/Assumption';
import { DealUtils } from '../../../../service/manager/DealUtils';
import { DealDetails } from '../../../../db/entity/DealDetails';
import * as stream from 'stream';
import { AccountManager } from '../../../../service/manager/AccountManager';

@controller({
  route: '/api/account/user/deals',
  middlewares: ['security.auth.accountUserJwt'],
})
export class DealController {
  constructor(
    @inject(DealUtils) private readonly dealUtils: DealUtils,
    @inject(DealManager) private readonly dealManager: DealManager,
    @inject(AccountUserManager) private readonly accountUserManager: AccountUserManager,
    @inject(AccountManager) private readonly accountManager: AccountManager,
    @inject(SerializerService) private readonly serializer: SerializerService,
  ) {
  }

  @post('/')
  async addDeal(
    @body('deal') params: AddDealParams,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const account = await user.account;
    this.accountManager.ensureAccountIsNotFree(account);
    const deal = await this.dealManager.addDeal(account, user, params, null);
    res.status(201).send(await this.serializer.serialize(
      { deal },
      {
        childOptions: {
          deal: {
            groups: ['withDetails'],
          },
        },
      },
    ));
  }

  @get('/')
  async getDeals(
    @request('user') user: AccountUser,
    @service(AccountUserManager) accountUserManager: AccountUserManager,
    @response() res: Response,
  ) {
    const deals = await this.dealManager.getAllDeals(await user.account, user);

    const allAssignees: AccountUser[] = [];
    for (const deal of deals) {
      const assignee = await deal.assignedToUser;
      allAssignees.push(assignee);
    }

    await accountUserManager.ensureAccountUsersCGData(Array.from(allAssignees));

    res.send({
      deals: await this.serializer.serialize(
        deals,
        { groups: ['withAssignee', 'withOwner', 'withDetails'] },
      ),
    });
  }

  @patch('/:dealId')
  async updateDeal(
    @body('deal') dealParams: UpdateDealParams,
    @params('dealId') dealId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const deal = await this.dealManager.updateDeal(dealId, user, dealParams, null);
    res.send(await this.serializer.serialize(
      { deal },
      {
        childOptions: {
          deal: {
            groups: ['withDetails'],
          },
        },
      },
    ));
  }

  @get('/:dealId')
  async getDeal(
    @params('dealId') dealId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const deal = await this.dealUtils.getUserDeal(dealId, user, null, 'READ');
    res.send(await this.serializer.serialize(
      { deal },
      {
        childOptions: {
          deal: {
            groups: ['withDetails'],
          },
        },
      },
    ));
  }

  @get('/slug/:slug')
  async getDealBySlug(
    @params('slug') slug: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const deal = await this.dealUtils.getUserDealBySlug(slug, user, null, 'READ');
    await this.dealManager.ensureUserData(deal);
    res.send({
      deal: await this.serializer.serialize(
        deal,
        { groups: ['withAssignee', 'withOwner', 'withDetails'] },
      ),
    });
  }

  @delete_('/:dealId')
  async removeDeal(
    @params('dealId') dealId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const deal = await this.dealManager.removeDeal(dealId, user, null);
    res.send({
      deal: await this.serializer.serialize(
        deal,
        { groups: ['withAssignee', 'withDetails'] },
      ),
    });
  }


  @patch('/:dealId/assign')
  async changeDealAssignedTo(
    @params('dealId') dealId: string,
    @request('user') user: AccountUser,
    @body('assignedToUserId') assignedToUserId: string,
    @service(AccountUserManager) accountUserManager: AccountUserManager,
    @response() res: Response,
  ) {
    const accountUser = await accountUserManager.getAccountUser(assignedToUserId, null);
    const deal = await this.dealManager.assignDeal(user, dealId, accountUser, null);
    res.send({
      deal: await this.serializer.serialize(
        deal,
        { groups: ['withAssignee', 'withDetails'] },
      ),
    });
  }

  @get('/:dealId/assumption')
  async getAssumptions(
    @params('dealId') dealId: string,
    @request('user') user: AccountUser,
    @service(AssumptionManager) assumptionsManager: AssumptionManager,
    @response() res: Response,
  ) {
    let assumption: Assumption | null;
    try {
      assumption = await this.dealManager.getDealAssumption(dealId, user, null);
    } catch (e) {
      assumption = null;
    }
    res.send({
      assumption: await this.serializer.serialize(assumption, { groups: ['withData'] }),
    });
  }

  @patch('/:dealId/assumption')
  async updateAssumptions(
    @params('dealId') dealId: string,
    @request('user') user: AccountUser,
    @body('assumption') assumptionsParams: Partial<Assumption>,
    @service(AssumptionManager) assumptionsManager: AssumptionManager,
    @response() res: Response,
  ) {
    const assumption = await this.dealManager.addOrUpdateDealAssumptions(dealId, user, assumptionsParams, null);
    res.send({
      assumption: await this.serializer.serialize(assumption),
    });
  }

  @get('/:dealId/matchingDeals/cashFlow')
  async getMatchingDeals(
    @params('dealId') dealId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const deals = await this.dealManager.getMatchingDeals(dealId, user, null);
    res.send({ deals });
  }

  @get('/:dealId/details')
  async getDealDetails(
    @params('dealId') dealId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const details = await this.dealManager.getDealDetails(user, dealId, null);
    res.send({
      dealDetails: await this.serializer.serialize(details),
    });
  }

  @patch('/:dealId/details')
  async updateDealDetails(
    @params('dealId') dealId: string,
    @request('user') user: AccountUser,
    @body('dealDetails') details: Partial<DealDetails>,
    @response() res: Response,
  ) {
    await this.dealManager.updateDealDetails(user, dealId, details, null);
    res.send();
  }

  @get('/:dealId/dictionary')
  async getDealDictionary(
    @params('dealId') dealId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const dictionary = await this.dealManager.getDealDictionary(user, dealId, null);
    res.send({ dictionary });
  }

  @post('/:dealId/model/download')
  async downloadDealModel(
    @params('dealId') dealId: string,
    @body('rentRollIds') rentRollIds: string[],
    @body('cashFlowIds') cashFlowIds: string[],
    @body('addToModelHistory') addToModelHistory: boolean,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const file = await this.dealManager.generateDealModel(user, dealId, rentRollIds, cashFlowIds, addToModelHistory);

    const readStream = new stream.PassThrough();
    readStream.end(file.fileData);

    res.set('Content-disposition', 'attachment; filename=' + file.fileName);
    res.set('Content-type', 'application/vnd.ms-excel.sheet.macroEnabled.12');
    readStream.pipe(res);
  }

  @get('/:dealId/model/history')
  async getDealModelHistory(
    @params('dealId') dealId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const modelHistories = await this.dealManager.getDealModelHistory(user, dealId, null);
    res.send({
      modelHistories: await this.serializer.serialize(modelHistories),
    });
  }

  @post('/:dealId/model/history/:modelHistoryId/download')
  async downloadDealModelHistory(
    @params('dealId') dealId: string,
    @params('modelHistoryId') modelHistoryId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const file = await this.dealManager.generateDealModelHistory(user, dealId, modelHistoryId, null);

    const readStream = new stream.PassThrough();
    readStream.end(file.fileData);

    res.set('Content-disposition', 'attachment; filename=' + file.fileName);
    res.set('Content-type', 'application/vnd.ms-excel.sheet.macroEnabled.12');
    readStream.pipe(res);
  }

  @delete_('/:dealId/model/history/:modelHistoryId')
  async deleteDealModelHistory(
    @params('dealId') dealId: string,
    @params('modelHistoryId') modelHistoryId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const modelHistory = await this.dealManager.deleteDealModelHistory(user, dealId, modelHistoryId, null);
    res.send({
      modelHistory: await this.serializer.serialize(modelHistory),
    });
  }
}
