import { EntityService } from '../../../bootstrap/service/entity/EntityService';
import { Assumption } from '../../db/entity/Assumption';
import { Account } from '../../db/entity/Account';
import { AccountUser } from '../../db/entity/AccountUser';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { injectable } from '../../boot';
import { Deal } from '../../db/entity/Deal';

interface CreateAssumptionParams {
  account: Account,
  user?: AccountUser,
  deal?: Deal,
  assumptionParams: Partial<Assumption>
}

@injectable()
export class AssumptionService extends EntityService<Assumption> {
  constructor() {
    super(Assumption);
  }

  async createAssumption(params: CreateAssumptionParams, txn: TxnOption) {
    const assumption = new Assumption();

    assumption.account = Promise.resolve(params.account);
    assumption.user = Promise.resolve(params.user);
    assumption.deal = Promise.resolve(params.deal);

    AssumptionService.copyParams(assumption, params.assumptionParams);
    return this.getRepository(txn).save(assumption);
  }

  async updateAssumption(assumption: Assumption, assumptionParams: Partial<Assumption>, txn: TxnOption) {
    AssumptionService.copyParams(assumption, assumptionParams);
    return this.getRepository(txn).save(assumption);
  }

  private static copyParams(assumption: Assumption, assumptionParams: Partial<Assumption>) {
    assumption.name = assumptionParams.name;

    // ----------------------------------------
    // Deal Details Starts
    assumption.DD_ClosingDate = assumptionParams.DD_ClosingDate;
    assumption.DD_HoldPeriodYears = assumptionParams.DD_HoldPeriodYears;
    // Deal Details Ends
    // -----------------------------------------

    // -----------------------------------------
    // Acquisition Assumptions Starts
    assumption.AA_AcquisitionValuation = assumptionParams.AA_AcquisitionValuation;
    // Acquisition Assumptions Ends
    // -----------------------------------------


    // -----------------------------------------
    // Disposition Assumptions Starts
    assumption.DA_DispositionValuation = assumptionParams.DA_DispositionValuation;
    assumption.DA_TerminalCapRate = assumptionParams.DA_TerminalCapRate;
    // Disposition Assumptions Ends
    // -----------------------------------------


    // -----------------------------------------
    // Closing Cost Starts
    assumption.CC_TransferTax = assumptionParams.CC_TransferTax;
    assumption.CC_BrokerCommission = assumptionParams.CC_BrokerCommission;
    assumption.CC_OtherClosingCosts = assumptionParams.CC_OtherClosingCosts;
    // Closing Cost Assumptions Ends
    // -----------------------------------------

    // -----------------------------------------
    // Other Closing Cost Starts
    assumption.OCC_PCAReport = assumptionParams.OCC_PCAReport;
    assumption.OCC_EnvironmentalReports = assumptionParams.OCC_EnvironmentalReports;
    assumption.OCC_OtherDueDiligence = assumptionParams.OCC_OtherDueDiligence;
    assumption.OCC_BackDuePropertyTaxes = assumptionParams.OCC_BackDuePropertyTaxes;
    assumption.OCC_OutstandingLiens = assumptionParams.OCC_OutstandingLiens;
    assumption.OCC_OtherAssumedLiabilities = assumptionParams.OCC_OtherAssumedLiabilities;
    assumption.OCC_TitleInsuranceBPS = assumptionParams.OCC_TitleInsuranceBPS;
    assumption.OCC_LegalFees = assumptionParams.OCC_LegalFees;
    assumption.OCC_ALTASurvey = assumptionParams.OCC_ALTASurvey;
    assumption.OCC_DeferredMaintenance = assumptionParams.OCC_DeferredMaintenance;
    assumption.OCC_FindersFeesBPS = assumptionParams.OCC_FindersFeesBPS;
    assumption.OCC_PrepaymentPenalty = assumptionParams.OCC_PrepaymentPenalty;
    assumption.OCC_OtherMiscClosingCosts = assumptionParams.OCC_OtherMiscClosingCosts;
    // Other Closing Cost Assumptions Ends
    // -----------------------------------------

    assumption.upfrontFunding = assumptionParams.upfrontFunding;

    // ------------------------------------------------------
    // Increment & Inflation Assumptions (Annual) Starts
    //  --------------------------
    //  Rent Increments Starts
    assumption.IIA_RI_RentIncrement = assumptionParams.IIA_RI_RentIncrement;
    assumption.IIA_RI_MarketRentUnits = assumptionParams.IIA_RI_MarketRentUnits;
    assumption.IIA_RI_RentControlledUnits = assumptionParams.IIA_RI_RentControlledUnits;
    assumption.IIA_RI_AffordableUnits = assumptionParams.IIA_RI_AffordableUnits;
    assumption.IIA_RI_Section8Units = assumptionParams.IIA_RI_Section8Units;
    assumption.IIA_RI_OtherUnits = assumptionParams.IIA_RI_OtherUnits;
    //  Rent Increments Ends
    //  --------------------------
    assumption.IIA_OtherIncomeInflation = assumptionParams.IIA_OtherIncomeInflation;
    // Increment & Inflation Assumptions (Annual) Ends
    // ------------------------------------------------------

    // ------------------------------------------------------
    // Renovation Schedule Starts
    assumption.RS_Renovated = assumptionParams.RS_Renovated;
    // Renovation Schedule Ends
    // ------------------------------------------------------

    // ------------------------------------------------------
    // Expense Assumptions Starts
    assumption.EA_RealEstateTaxes = assumptionParams.EA_RealEstateTaxes;
    assumption.EA_ManagementFees = assumptionParams.EA_ManagementFees;
    // Expense Assumptions Ends
    // ------------------------------------------------------

    // Expense Inflation Starts
    // ------------------------------------------------------
    assumption.EI_GeneralInflation = assumptionParams.EI_GeneralInflation;
    assumption.EI_RealEstateTaxInflation = assumptionParams.EI_RealEstateTaxInflation;
    // ------------------------------------------------------
    // Expense Inflation Starts

    // Replacement Reserves Starts
    // ------------------------------------------------------
    assumption.RR_ProjectedReserves = assumptionParams.RR_ProjectedReserves;
    assumption.RR_GrowAtInflation = assumptionParams.RR_GrowAtInflation;
    // ------------------------------------------------------
    // Replacement Reserves Ends

    assumption.MTMUnitsStatus = assumptionParams.MTMUnitsStatus;
  }
}
