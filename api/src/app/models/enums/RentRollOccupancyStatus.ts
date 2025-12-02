import { Enum } from '../../../bootstrap/models/enums/Enum';

export class RentRollOccupancyStatus extends Enum {
  static Admin = new RentRollOccupancyStatus('Admin', 'Admin');
  static Down = new RentRollOccupancyStatus('Down', 'Down');
  static Office = new RentRollOccupancyStatus('Office', 'Office');
  static Occupied = new RentRollOccupancyStatus('Occupied', 'Occupied');
  static Vacant = new RentRollOccupancyStatus('Vacant', 'Vacant');
  static Model = new RentRollOccupancyStatus('Model', 'Model');
  static Employee = new RentRollOccupancyStatus('Employee', 'Employee');
  static Exclude = new RentRollOccupancyStatus('Exclude', 'Exclude');
}
