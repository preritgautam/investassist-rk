import { Assumption } from '../../../../../types';
import { AcquisitionValuationModel } from '../../../../enums/AcquisitionValuationModel';
import { DispositionValuationModel } from '../../../../enums/DispositionValuationModel';
import { FlexibleAmountType } from '../../../../enums/FlexibleAmountType';

export const defaultAssumption: Assumption = {
  DD_HoldPeriodYears: 10,
  DD_ClosingDate: null,
  AA_AcquisitionValuation: {
    type: AcquisitionValuationModel.ProformaCapRate.key,
    value: 6.5,
  },
  DA_DispositionValuation: {
    type: DispositionValuationModel.Forward12MonthNOI.key,
    value: 0,
  },
  DA_TerminalCapRate: 7.5,
  CC_TransferTax: 0.50,
  CC_BrokerCommission: 1.5,
  CC_OtherClosingCosts: 0,
  OCC_PCAReport: 0,
  OCC_EnvironmentalReports: 0,
  OCC_OtherDueDiligence: 0,
  OCC_BackDuePropertyTaxes: 0,
  OCC_OutstandingLiens: 0,
  OCC_OtherAssumedLiabilities: 0,
  OCC_TitleInsuranceBPS: 0,
  OCC_LegalFees: 0,
  OCC_ALTASurvey: 0,
  OCC_DeferredMaintenance: 0,
  OCC_FindersFeesBPS: 0,
  OCC_PrepaymentPenalty: 0,
  OCC_OtherMiscClosingCosts: 0,
  upfrontFunding: false,
  IIA_RI_RentIncrement: 3,
  IIA_RI_MarketRentUnits: 3,
  IIA_RI_RentControlledUnits: 3,
  IIA_RI_AffordableUnits: 3,
  IIA_RI_Section8Units: 3,
  IIA_RI_OtherUnits: 3,
  IIA_OtherIncomeInflation: 3,
  RS_Renovated: false,
  EA_RealEstateTaxes: {
    type: FlexibleAmountType.atClose.key,
    value: 0,
  },
  EA_ManagementFees: {
    type: FlexibleAmountType.percentEGI.key,
    value: 4,
  },
  EI_GeneralInflation: 2.5,
  EI_RealEstateTaxInflation: 3,
  RR_ProjectedReserves: {
    type: FlexibleAmountType.dollarPerUnit.key,
    value: 250,
  },
  RR_GrowAtInflation: false,
  MTMUnitsStatus: 'Occupied',
};
