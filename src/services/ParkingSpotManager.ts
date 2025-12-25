import { Mutex } from 'async-mutex';
import { ParkingSpot } from '../models/ParkingSpot';
import { VehicleType, SpotType, AvailabilitySummary } from '../types';
import { ParkingLotRepository } from '../repositories/ParkingLotRepository';

/**
 * ParkingSpotManager service for managing parking spot allocation
 */
export class ParkingSpotManager {
  private repository: ParkingLotRepository;
  private mutex: Mutex;

  constructor(repository: ParkingLotRepository) {
    this.repository = repository;
    this.mutex = new Mutex();
  }

  /**
   * Find and allocate the best available parking spot for a vehicle
   * Uses mutex locking to ensure thread-safe allocation
   * 
   * Algorithm:
   * 1. Filter spots that can fit the vehicle type and are available
   * 2. Sort by floor (lower floors first) then by spot ID
   * 3. Return the first matching spot
   */
  async allocateSpot(vehicleType: VehicleType, vehicleLicense: string): Promise<ParkingSpot | null> {
    return this.mutex.runExclusive(async () => {
      const availableSpots = this.repository
        .getAvailableSpots()
        .filter(spot => spot.canFit(vehicleType))
        .sort((a, b) => {
          // Prioritize lower floors
          if (a.floor !== b.floor) {
            return a.floor - b.floor;
          }
          // Then by spot ID
          return a.id.localeCompare(b.id);
        });

      if (availableSpots.length === 0) {
        return null;
      }

      const selectedSpot = availableSpots[0];
      selectedSpot.occupy(vehicleLicense);
      return selectedSpot;
    });
  }

  /**
   * Release a parking spot
   */
  async releaseSpot(spotId: string): Promise<void> {
    return this.mutex.runExclusive(async () => {
      const spot = this.repository.getSpot(spotId);
      if (!spot) {
        throw new Error(`Spot ${spotId} not found`);
      }
      spot.release();
    });
  }

  /**
   * Get real-time availability summary by floor and spot type
   */
  getAvailability(): AvailabilitySummary[] {
    const spots = this.repository.getAllSpots();
    const summaryMap = new Map<string, AvailabilitySummary>();

    spots.forEach(spot => {
      const key = `${spot.floor}-${spot.spotType}`;
      
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          floor: spot.floor,
          spotType: spot.spotType,
          available: 0,
          total: 0
        });
      }

      const summary = summaryMap.get(key)!;
      summary.total++;
      if (spot.isAvailable) {
        summary.available++;
      }
    });

    return Array.from(summaryMap.values()).sort((a, b) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      return a.spotType.localeCompare(b.spotType);
    });
  }

  /**
   * Check if any spots are available for a vehicle type
   */
  hasAvailableSpot(vehicleType: VehicleType): boolean {
    return this.repository
      .getAvailableSpots()
      .some(spot => spot.canFit(vehicleType));
  }
}
