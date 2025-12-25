import { Mutex } from 'async-mutex';
import { Vehicle } from '../models/Vehicle';
import { ParkingTicket } from '../models/ParkingTicket';
import { ParkingSpot } from '../models/ParkingSpot';
import { ParkingLotRepository } from '../repositories/ParkingLotRepository';
import { ParkingSpotManager } from './ParkingSpotManager';
import { FeeCalculator } from './FeeCalculator';
import { SpotType, AvailabilitySummary } from '../types';

/**
 * Main service orchestrating all parking lot operations
 */
export class ParkingLotService {
  private repository: ParkingLotRepository;
  private spotManager: ParkingSpotManager;
  private feeCalculator: FeeCalculator;
  private mutex: Mutex;
  private ticketCounter: number;

  constructor(
    repository: ParkingLotRepository,
    spotManager: ParkingSpotManager,
    feeCalculator: FeeCalculator
  ) {
    this.repository = repository;
    this.spotManager = spotManager;
    this.feeCalculator = feeCalculator;
    this.mutex = new Mutex();
    this.ticketCounter = 1;
  }

  /**
   * Check-in a vehicle to the parking lot
   * Returns a parking ticket if successful, null if no spots available
   */
  async checkInVehicle(vehicle: Vehicle): Promise<ParkingTicket | null> {
    return this.mutex.runExclusive(async () => {
      // Check if vehicle is already parked
      const existingTicket = this.repository.getActiveTicketByVehicle(vehicle.licensePlate);
      if (existingTicket) {
        throw new Error(`Vehicle ${vehicle.licensePlate} is already parked at spot ${existingTicket.spot.id}`);
      }

      // Try to allocate a spot
      const spot = await this.spotManager.allocateSpot(vehicle.type, vehicle.licensePlate);
      if (!spot) {
        console.log(`No available spots for ${vehicle.type}`);
        return null;
      }

      // Create parking ticket
      const ticketId = this.generateTicketId();
      const ticket = new ParkingTicket(ticketId, vehicle, spot, new Date());
      this.repository.addTicket(ticket);

      console.log(`✓ Vehicle ${vehicle} checked in at ${spot.id} on floor ${spot.floor}`);
      return ticket;
    });
  }

  /**
   * Check-out a vehicle from the parking lot
   * Calculates fee, releases spot, and completes the ticket
   */
  async checkOutVehicle(licensePlate: string): Promise<ParkingTicket> {
    return this.mutex.runExclusive(async () => {
      const ticket = this.repository.getActiveTicketByVehicle(licensePlate);
      if (!ticket) {
        throw new Error(`No active parking session found for vehicle ${licensePlate}`);
      }

      const exitTime = new Date();
      const duration = ticket.getDuration();
      const fee = this.feeCalculator.calculateFee(ticket.vehicle.type, duration);

      // Complete the ticket
      ticket.complete(exitTime, fee);
      this.repository.completeTicket(ticket.ticketId);

      // Release the spot
      await this.spotManager.releaseSpot(ticket.spot.id);

      console.log(`✓ Vehicle ${ticket.vehicle} checked out from ${ticket.spot.id}`);
      console.log(`  Duration: ${duration.toFixed(2)} hours, Fee: $${fee.toFixed(2)}`);

      return ticket;
    });
  }

  /**
   * Get real-time availability of parking spots
   */
  getAvailability(): AvailabilitySummary[] {
    return this.spotManager.getAvailability();
  }

  /**
   * Get all active parking sessions
   */
  getActiveTickets(): ParkingTicket[] {
    return this.repository.getActiveTickets();
  }

  /**
   * Get ticket by ID
   */
  getTicket(ticketId: string): ParkingTicket | undefined {
    return this.repository.getTicket(ticketId);
  }

  /**
   * Initialize parking lot with spots
   */
  initializeParkingLot(floors: number, spotsPerFloor: { [key in SpotType]: number }): void {
    let spotIdCounter = 1;

    for (let floor = 1; floor <= floors; floor++) {
      // Add motorcycle spots
      for (let i = 0; i < spotsPerFloor[SpotType.MOTORCYCLE]; i++) {
        const spot = new ParkingSpot(`M${spotIdCounter++}`, floor, SpotType.MOTORCYCLE);
        this.repository.addSpot(spot);
      }

      // Add compact spots
      for (let i = 0; i < spotsPerFloor[SpotType.COMPACT]; i++) {
        const spot = new ParkingSpot(`C${spotIdCounter++}`, floor, SpotType.COMPACT);
        this.repository.addSpot(spot);
      }

      // Add large spots
      for (let i = 0; i < spotsPerFloor[SpotType.LARGE]; i++) {
        const spot = new ParkingSpot(`L${spotIdCounter++}`, floor, SpotType.LARGE);
        this.repository.addSpot(spot);
      }
    }

    console.log(`Parking lot initialized with ${floors} floors`);
    console.log(`Total spots: ${this.repository.getAllSpots().length}`);
  }

  private generateTicketId(): string {
    return `T${String(this.ticketCounter++).padStart(6, '0')}`;
  }
}
