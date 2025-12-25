/**
 * Vehicle type enumeration
 */
export enum VehicleType {
  MOTORCYCLE = 'MOTORCYCLE',
  CAR = 'CAR',
  BUS = 'BUS'
}

/**
 * Parking spot type enumeration
 */
export enum SpotType {
  MOTORCYCLE = 'MOTORCYCLE',
  COMPACT = 'COMPACT',
  LARGE = 'LARGE'
}

/**
 * Parking rate configuration
 */
export interface ParkingRate {
  vehicleType: VehicleType;
  baseFee: number;        // First hour flat fee
  hourlyRate: number;     // Additional hours rate
}

/**
 * Availability summary
 */
export interface AvailabilitySummary {
  floor: number;
  spotType: SpotType;
  available: number;
  total: number;
}
