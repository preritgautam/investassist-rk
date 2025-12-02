import { inject, injectable } from '../../boot';
import { Deal } from '../../db/entity/Deal';
import { Assumption } from '../../db/entity/Assumption';
import { DealDetails } from '../../db/entity/DealDetails';
import { omit, pick } from 'lodash';
import { DealRentRollDetailsService } from './DealRentRollDetailsService';
import { DealFinancialDetailsService } from './DealFinancialDetailsService';
import { AppConfigType } from '../../config';
import { config } from '../../../framework/plugins/AppConfigPlugin/AppConfigPlugin';
import { splitString } from '../utils';
import * as XlsxPopulate from 'xlsx-populate';
import { Account } from '../../db/entity/Account';
import { storage } from '../../../framework/plugins/FileStoragePlugin/decorator/storage';
import { AbstractStorage } from '../../../framework/plugins/FileStoragePlugin/storage/AbstractStorage';
import { Buffer } from 'buffer';

interface GetDealDataOptions {
  cashFlowIds?: string[];
  rentRollIds?: string[];
}


@injectable()
export class ModelIntegrationService {
  constructor(
    @inject(DealRentRollDetailsService) private readonly rentRoll: DealRentRollDetailsService,
    @inject(DealFinancialDetailsService) private readonly financial: DealFinancialDetailsService,
    @config('modelIntegration') private readonly modelIntegrationConfig: AppConfigType['modelIntegration'],
    @storage('dealDocuments') private readonly documentsStore: AbstractStorage,
  ) {
  }

  async getDealData(deal: Deal, options?: GetDealDataOptions) {
    const { rentRollData, floorPlanSummary } = await this.rentRoll.getData(deal, options);

    return {
      deal: this.getDealDetails(deal),
      dealDetails: await this.getPropertyDetails(deal),
      assumptions: await this.getAssumptionDetails(deal),
      rentRoll: rentRollData,
      floorPlan: floorPlanSummary,
      financials: await this.financial.getData(deal, options),
    };
  }

  async getAssumptionDetails(deal: Deal): Promise<Partial<Assumption>> {
    let assumptions = await deal.assumption;

    if (assumptions === null) {
      assumptions = this.getDefaultAssumptions();
    }

    const keysToSkip: (keyof Assumption)[] = ['id', 'account', 'user', 'deal', 'name', 'createdAt', 'updatedAt'];
    return omit(assumptions, keysToSkip);
  }

  async getPropertyDetails(deal: Deal): Promise<Partial<DealDetails>> {
    const details = await deal.details;
    const keysToSkip: (keyof DealDetails)[] = ['id', 'deal', 'updatedAt', 'purchasePrice'];
    return {
      ...omit(details, keysToSkip),
      purchasePrice: details.purchasePrice,
    };
  }

  getDealDetails(deal: Deal): Partial<Deal> {
    const keysToPick: (keyof Deal)[] = ['name', 'address', 'slug', 'status', 'createdAt', 'updatedAt'];
    return pick(deal, keysToPick);
  }

  async getDealModelData(deal: Deal, rentRollIds: string[], cashFlowIds: string[]) {
    return await this.getDealData(deal, { rentRollIds, cashFlowIds });
  }

  private async getAccountModelWorkbook(account: Account): Promise<any> {
    const templates = await account.templates;
    if (templates.length) {
      // get the template model
      const stream = await this.documentsStore.readFile(templates[0].s3FilePath);

      const data = await new Promise((resolve, reject) => {
        const buffs: Buffer[] = [];
        let buffer: Buffer;
        stream.on('data', (b: Buffer) => buffs.push(b));
        stream.on('end', () => {
          buffer = Buffer.concat(buffs);
          resolve(buffer);
        });
        stream.on('error', (e) => reject(e));
      });

      return await XlsxPopulate.fromDataAsync(data);
    } else {
      let file: string;
      if (account.status === 'Trial') {
        if (account.planId === 'plan1') {
          file = this.modelIntegrationConfig.plan1LiteModelFile;
        } else if (account.planId === 'plan2') {
          file = this.modelIntegrationConfig.plan2LiteModelFile;
        }
      } else if (account.status === 'Paid') {
        if (account.planId === 'plan1') {
          file = this.modelIntegrationConfig.plan1ModelFile;
        } else if (account.planId === 'plan2') {
          file = this.modelIntegrationConfig.plan2ModelFile;
        }
      }

      return await XlsxPopulate.fromFileAsync(file);
    }
  }

  async generateDealModelFile(account: Account, dealData: object): Promise<Buffer> {
    const dealDataString = JSON.stringify(dealData);
    const dataChunks = splitString(dealDataString, 30000);

    const wb = await this.getAccountModelWorkbook(account);
    wb.addSheet('__data_sheet');
    wb.sheet('__data_sheet').cell('A1').value([dataChunks]);
    const outFileData: Buffer = await wb.outputAsync();

    return outFileData;
  }

  private getDefaultAssumptions(): Assumption {
    const a = new Assumption();

    a.DD_HoldPeriodYears = 10;
    a.DD_ClosingDate = null;
    a.AA_AcquisitionValuation = {
      type: 'ProformaCapRate',
      value: 6.5,
    };
    a.DA_DispositionValuation = {
      type: 'F12NOI',
      value: 0,
    };
    a.DA_TerminalCapRate = 7.5;
    a.CC_TransferTax = 0.50;
    a.CC_BrokerCommission = 1.5;
    a.CC_OtherClosingCosts = 0;
    a.OCC_PCAReport = 0;
    a.OCC_EnvironmentalReports = 0;
    a.OCC_OtherDueDiligence = 0;
    a.OCC_BackDuePropertyTaxes = 0;
    a.OCC_OutstandingLiens = 0;
    a.OCC_OtherAssumedLiabilities = 0;
    a.OCC_TitleInsuranceBPS = 0;
    a.OCC_LegalFees = 0;
    a.OCC_ALTASurvey = 0;
    a.OCC_DeferredMaintenance = 0;
    a.OCC_FindersFeesBPS = 0;
    a.OCC_PrepaymentPenalty = 0;
    a.OCC_OtherMiscClosingCosts = 0;
    a.upfrontFunding = false;
    a.IIA_RI_RentIncrement = 3;
    a.IIA_RI_MarketRentUnits = 3;
    a.IIA_RI_RentControlledUnits = 3;
    a.IIA_RI_AffordableUnits = 3;
    a.IIA_RI_Section8Units = 3;
    a.IIA_RI_OtherUnits = 3;
    a.IIA_OtherIncomeInflation = 3;
    a.RS_Renovated = false;
    a.EA_RealEstateTaxes = {
      type: 'atClose',
      value: 0,
    };
    a.EA_ManagementFees = {
      type: 'percentEGI',
      value: 4,
    };
    a.EI_GeneralInflation = 2.5;
    a.EI_RealEstateTaxInflation = 3;
    a.RR_ProjectedReserves = {
      type: 'dollarPerUnit',
      value: 250,
    };
    a.RR_GrowAtInflation = false;
    a.MTMUnitsStatus = 'Occupied';

    return a;
  }
}
