import { EntityService } from '../../../bootstrap/service/entity/EntityService';
import { DealDetails } from '../../db/entity/DealDetails';
import { injectable } from '../../boot';

export interface UpdateDealDetailsParams extends Omit<DealDetails, 'id' | 'deal' | 'updatedAt'> {
}


@injectable()
export class DealDetailsService extends EntityService<DealDetails> {
  constructor() {
    super(DealDetails);
  }

  copyDetails(dealDetails: DealDetails, details: Partial<DealDetails>) {
    dealDetails.bidDueDate = details.bidDueDate;
    dealDetails.startOfOperations = details.startOfOperations;
    dealDetails.purchasePrice = details.purchasePrice;
    dealDetails.fund = details.fund;
    dealDetails.numUnits = details.numUnits;
    dealDetails.totalArea = details.totalArea;
    dealDetails.assetQuality = details.assetQuality;
    dealDetails.buildingType = details.buildingType;
    dealDetails.ageRestricted = details.ageRestricted;
    dealDetails.affordabilityStatus = details.affordabilityStatus;
    dealDetails.noOfBuildings = details.noOfBuildings;
    dealDetails.noOfStories = details.noOfStories;
    dealDetails.parkingSpaces = details.parkingSpaces;
    dealDetails.dateBuilt = details.dateBuilt;
    dealDetails.dateRenovated = details.dateRenovated;
    dealDetails.sizeAcres = details.sizeAcres;
    dealDetails.affordableUnitsPercent = details.affordableUnitsPercent;
    dealDetails.propertyManager = details.propertyManager;
    dealDetails.hasElevator = details.hasElevator;
    dealDetails.hasFitnessCenter = details.hasFitnessCenter;
    dealDetails.hasDoorman = details.hasDoorman;
    dealDetails.hasPool = details.hasPool;
    dealDetails.hasWaterFront = details.hasWaterFront;
    dealDetails.hasSpa = details.hasSpa;
    dealDetails.hasRoofDeck = details.hasRoofDeck;
    dealDetails.hasOtherAmenities = details.hasOtherAmenities;
    dealDetails.expectedPurchasePrice = details.expectedPurchasePrice;
    dealDetails.equityMultiple = details.equityMultiple;
    dealDetails.requiredEquity = details.requiredEquity;
    dealDetails.leveragedIRR = details.leveragedIRR;
    dealDetails.goingInCapRateFwd = details.goingInCapRateFwd;
    dealDetails.salePrice = details.salePrice;
    dealDetails.saleDate = details.saleDate;
    dealDetails.capRateTrailing = details.capRateTrailing;
    dealDetails.noiTrailing12 = details.noiTrailing12;
    dealDetails.buyer = details.buyer;
    dealDetails.seller = details.seller;
    dealDetails.broker = details.broker;
    dealDetails.lastSaleDate = details.lastSaleDate;
    dealDetails.lastSalePrice = details.lastSalePrice;
  }
}
