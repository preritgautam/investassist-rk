import { inject, injectable } from '../../boot';
import { AssumptionService } from '../entity/AssumptionService';
import { AccountUser } from '../../db/entity/AccountUser';
import { Assumption } from '../../db/entity/Assumption';
import { transactional } from '../../../framework/plugins/TypeORMPlugin/decorators/transactional';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { Account } from '../../db/entity/Account';
import { Deal } from '../../db/entity/Deal';
import { EntityNotFoundError } from 'typeorm';


@injectable()
export class AssumptionManager {
  constructor(
    @inject(AssumptionService) private readonly assumptionService: AssumptionService,
  ) {
  }

  @transactional()
  async addUserAssumption(user: AccountUser, assumptionParams: Partial<Assumption>, txn: TxnOption) {
    return await this.assumptionService.createAssumption({
      account: await user.account,
      user,
      assumptionParams,
    }, txn);
  }


  @transactional()
  async addCompanyAssumption(account: Account, assumptionParams: Partial<Assumption>, txn: TxnOption) {
    return await this.assumptionService.createAssumption({
      account,
      user: null,
      assumptionParams,
    }, txn);
  }

  @transactional()
  async addCompanyDefaultAssumption(account: Account, txn: TxnOption) {
    const defaultValues: Assumption = new Assumption();
    defaultValues.name = 'Default Assumptions';
    defaultValues.DD_ClosingDate = '';
    defaultValues.DD_HoldPeriodYears = 10;
    defaultValues.AA_AcquisitionValuation = { type: 'ProformaCapRate', value: 6.5 };
    defaultValues.DA_DispositionValuation = { type: 'F12NOI', value: 0 };
    defaultValues.DA_TerminalCapRate = 5.5;
    defaultValues.CC_TransferTax = 0.50;
    defaultValues.CC_BrokerCommission = 1.5;
    defaultValues.CC_OtherClosingCosts = 0;
    defaultValues.OCC_PCAReport = 0;
    defaultValues.OCC_EnvironmentalReports = 0;
    defaultValues.OCC_OtherDueDiligence = 0;
    defaultValues.OCC_BackDuePropertyTaxes = 0;
    defaultValues.OCC_OutstandingLiens = 0;
    defaultValues.OCC_OtherAssumedLiabilities = 0;
    defaultValues.OCC_TitleInsuranceBPS = 0;
    defaultValues.OCC_LegalFees = 0;
    defaultValues.OCC_ALTASurvey = 0;
    defaultValues.OCC_DeferredMaintenance = 0;
    defaultValues.OCC_FindersFeesBPS = 0;
    defaultValues.OCC_PrepaymentPenalty = 0;
    defaultValues.OCC_OtherMiscClosingCosts = 0;
    defaultValues.upfrontFunding = false;
    defaultValues.IIA_RI_RentIncrement = 3;
    defaultValues.IIA_RI_MarketRentUnits = 3;
    defaultValues.IIA_RI_RentControlledUnits = 3;
    defaultValues.IIA_RI_AffordableUnits = 3;
    defaultValues.IIA_RI_Section8Units = 3;
    defaultValues.IIA_RI_OtherUnits = 3;
    defaultValues.IIA_OtherIncomeInflation = 3;
    defaultValues.RS_Renovated = false;
    defaultValues.EA_RealEstateTaxes = { type: 'atClose', value: 0 };
    defaultValues.EA_ManagementFees = { type: 'percentEGI', value: 4 };
    defaultValues.EI_GeneralInflation = 2.5;
    defaultValues.EI_RealEstateTaxInflation = 3;
    defaultValues.RR_ProjectedReserves = { type: 'dollarPerUnit', value: 250 };
    defaultValues.RR_GrowAtInflation = false;
    defaultValues.MTMUnitsStatus = 'Occupied';
    return this.addCompanyAssumption(account, defaultValues, txn);
  }

  @transactional()
  async addOrUpdateDealAssumption(deal: Deal, assumptionParams: Partial<Assumption>, txn: TxnOption) {
    let assumption: Assumption;
    try {
      assumption = await this.getDealAssumption(deal, txn);
      await this.assumptionService.updateAssumption(assumption, assumptionParams, txn);
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        assumption = await this.assumptionService.createAssumption({
          account: await deal.account,
          deal,
          assumptionParams,
        }, txn);
      } else {
        throw e;
      }
    }
    return assumption;
  }

  async getDealAssumption(deal: Deal, txn: TxnOption): Promise<Assumption> {
    return this.assumptionService.getRepository(txn).createQueryBuilder('a')
      .where({ deal: deal })
      .getOneOrFail();
  }

  async getUserAssumption(user: AccountUser, assumptionId: string, txn: TxnOption): Promise<Assumption> {
    let assumption = await this.assumptionService.getRepository(txn).createQueryBuilder('a')
      .where({ user: user, id: assumptionId })
      .getOne();
    if (!assumption) {
      if (user.isRootUser) {
        const account = await user.account;
        assumption = await this.assumptionService.getRepository(txn).createQueryBuilder('a')
          .where({
            user: null,
            deal: null,
            id: assumptionId,
            account,
          })
          .getOneOrFail();
      } else {
        throw new EntityNotFoundError(Assumption, {
          userId: user.id,
          id: assumptionId,
        });
      }
    }

    return assumption;
  }

  async getAccountAssumption(account: Account, assumptionId: string, txn: TxnOption): Promise<Assumption> {
    return this.assumptionService.getRepository(txn).createQueryBuilder('a')
      .where({ user: null, deal: null, id: assumptionId, account: account })
      .getOneOrFail();
  }

  async getAccountAssumptions(account: Account, txn: TxnOption): Promise<Assumption[]> {
    return this.assumptionService.getRepository(txn).createQueryBuilder('a')
      .where({ user: null })
      .andWhere({ deal: null })
      .andWhere({ account: account })
      .orderBy('a.createdAt', 'DESC')
      .getMany();
  }

  async getUserAssumptions(user: AccountUser, txn: TxnOption): Promise<Assumption[]> {
    return this.assumptionService.getRepository(txn).createQueryBuilder('a')
      .where({ user: user })
      .orderBy('a.createdAt', 'DESC')
      .getMany();
  }

  @transactional()
  async deleteUserAssumption(user: AccountUser, assumptionId: string, txn: TxnOption): Promise<Assumption> {
    const assumption = await this.getUserAssumption(user, assumptionId, txn);
    await this.assumptionService.delete(assumption, txn);
    return assumption;
  }

  @transactional()
  async updateUserAssumption(
    user: AccountUser, assumptionId: string, assumptionParams: Partial<Assumption>, txn: TxnOption,
  ) {
    let assumption = await this.getUserAssumption(user, assumptionId, txn);
    assumption = await this.assumptionService.updateAssumption(assumption, assumptionParams, txn);
    return assumption;
  }
}
