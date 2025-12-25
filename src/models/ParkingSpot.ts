import { SpotType, VehicleType } from '../types';

/**
 * ParkingSpot class representing a single parking spot
 */
export class ParkingSpot {
  readonly id: string;
  readonly floor: number;
  readonly spotType: SpotType;
  private _isAvailable: boolean;
  private _currentVehicleLicense?: string;

  constructor(id: string, floor: number, spotType: SpotType) {
    this.id = id;
    this.floor = floor;
    this.spotType = spotType;
    this._isAvailable = true;
  }

  get isAvailable(): boolean {
    return this._isAvailable;
  }

  get currentVehicleLicense(): string | undefined {
    return this._currentVehicleLicense;
  }

  /**
   * Check if this spot can accommodate the given vehicle type
   */
  canFit(vehicleType: VehicleType): boolean {
    switch (this.spotType) {
      case SpotType.MOTORCYCLE:
        return vehicleType === VehicleType.MOTORCYCLE;
      case SpotType.COMPACT:
        return vehicleType === VehicleType.MOTORCYCLE || vehicleType === VehicleType.CAR;
      case SpotType.LARGE:
        return true; // Can fit any vehicle
      default:
        return false;
    }
  }

  /**
   * Occupy this parking spot with a vehicle
   */
  occupy(vehicleLicense: string): void {
    if (!this._isAvailable) {
      throw new Error(`Spot ${this.id} is already occupied`);
    }
    this._isAvailable = false;
    this._currentVehicleLicense = vehicleLicense;
  }

  /**
   * Release this parking spot
   */
  release(): void {
    this._isAvailable = true;
    this._currentVehicleLicense = undefined;
  }

  toString(): string {
    return `Spot ${this.id} (Floor ${this.floor}, ${this.spotType}) - ${this._isAvailable ? 'Available' : 'Occupied'}`;
  }
}
