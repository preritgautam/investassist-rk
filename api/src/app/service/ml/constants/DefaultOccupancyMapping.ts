import { RentRollOccupancyStatus } from '../../../models/enums/RentRollOccupancyStatus';

export const DefaultOccupancyMappingRegex: [RegExp, RentRollOccupancyStatus][] = [
  [new RegExp('.*admin.*'), RentRollOccupancyStatus.Admin],
  [new RegExp('.*down.*'), RentRollOccupancyStatus.Down],
  [new RegExp('.*(employee|manager).*'), RentRollOccupancyStatus.Employee],
  [new RegExp('.*(applicant|pending).*'), RentRollOccupancyStatus.Exclude],
  [new RegExp('.*(model|non.?(revenue|productive)|demo).*'), RentRollOccupancyStatus.Model],
  [new RegExp('.*(office|ofc).*'), RentRollOccupancyStatus.Office],
  [new RegExp('.*(vacan|unrented|evict|\\bvac\\b).*'), RentRollOccupancyStatus.Vacant],
  [new RegExp('.*'), RentRollOccupancyStatus.Occupied],
];

export const DefaultOccupancyMapping: Record<string, RentRollOccupancyStatus> = {
  'Not Ready': RentRollOccupancyStatus.Down,
  '-Construction': RentRollOccupancyStatus.Down,

  'Empl': RentRollOccupancyStatus.Employee,
  'emp': RentRollOccupancyStatus.Employee,

  'App-Aprvd': RentRollOccupancyStatus.Exclude,
  'App-Pend': RentRollOccupancyStatus.Exclude,

  'VA': RentRollOccupancyStatus.Vacant,
  'VL': RentRollOccupancyStatus.Vacant,
  'Rented Not': RentRollOccupancyStatus.Vacant,
  'Available': RentRollOccupancyStatus.Vacant,
  'NU': RentRollOccupancyStatus.Vacant,
  'VR': RentRollOccupancyStatus.Vacant,
  'VU': RentRollOccupancyStatus.Vacant,
  'Fully Available': RentRollOccupancyStatus.Vacant,
  'Current': RentRollOccupancyStatus.Vacant,
  'No Notice\nRented': RentRollOccupancyStatus.Vacant,
  'No Notice\nRented Not': RentRollOccupancyStatus.Vacant,
  'Noboe': RentRollOccupancyStatus.Vacant,
  'Van Rood': RentRollOccupancyStatus.Vacant,
};

export function matchOccupancy(occupancy: string): RentRollOccupancyStatus {
  return DefaultOccupancyMapping[occupancy] ?? DefaultOccupancyMappingRegex.find(([regex]) => {
    return regex.test(occupancy);
  })?.[1];
}
