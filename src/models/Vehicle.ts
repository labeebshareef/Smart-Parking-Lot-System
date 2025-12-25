import { VehicleType } from '../types';

/**
 * Vehicle class representing a vehicle in the parking lot
 */
export class Vehicle {
  readonly licensePlate: string;
  readonly type: VehicleType;
  readonly ownerName?: string;

  constructor(licensePlate: string, type: VehicleType, ownerName?: string) {
    this.licensePlate = licensePlate;
    this.type = type;
    this.ownerName = ownerName;
  }

  toString(): string {
    return `${this.type} - ${this.licensePlate}`;
  }
}
