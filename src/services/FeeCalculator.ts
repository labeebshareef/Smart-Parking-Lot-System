import { VehicleType, ParkingRate } from '../types';

/**
 * FeeCalculator service for calculating parking fees
 */
export class FeeCalculator {
  private rates: Map<VehicleType, ParkingRate>;

  constructor(rates?: ParkingRate[]) {
    this.rates = new Map();
    
    // Default rates if none provided
    const defaultRates: ParkingRate[] = rates || [
      { vehicleType: VehicleType.MOTORCYCLE, baseFee: 2, hourlyRate: 1 },
      { vehicleType: VehicleType.CAR, baseFee: 5, hourlyRate: 2.5 },
      { vehicleType: VehicleType.BUS, baseFee: 10, hourlyRate: 5 }
    ];

    defaultRates.forEach(rate => {
      this.rates.set(rate.vehicleType, rate);
    });
  }

  /**
   * Calculate parking fee based on vehicle type and duration
   * @param vehicleType Type of vehicle
   * @param durationHours Parking duration in hours
   * @returns Calculated fee
   */
  calculateFee(vehicleType: VehicleType, durationHours: number): number {
    const rate = this.rates.get(vehicleType);
    if (!rate) {
      throw new Error(`No rate found for vehicle type: ${vehicleType}`);
    }

    // Round up partial hours
    const hours = Math.ceil(durationHours);

    if (hours <= 1) {
      return rate.baseFee;
    }

    // Base fee for first hour + hourly rate for additional hours
    const additionalHours = hours - 1;
    return rate.baseFee + (additionalHours * rate.hourlyRate);
  }

  /**
   * Get the rate configuration for a vehicle type
   */
  getRate(vehicleType: VehicleType): ParkingRate | undefined {
    return this.rates.get(vehicleType);
  }

  /**
   * Update the rate for a vehicle type
   */
  setRate(rate: ParkingRate): void {
    this.rates.set(rate.vehicleType, rate);
  }
}
