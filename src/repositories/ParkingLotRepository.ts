import { ParkingSpot } from '../models/ParkingSpot';
import { ParkingTicket } from '../models/ParkingTicket';

/**
 * Repository for managing parking lot data
 * Uses in-memory storage with Maps for fast lookups
 */
export class ParkingLotRepository {
  private spots: Map<string, ParkingSpot>;
  private tickets: Map<string, ParkingTicket>;
  private activeTicketsByVehicle: Map<string, ParkingTicket>;

  constructor() {
    this.spots = new Map();
    this.tickets = new Map();
    this.activeTicketsByVehicle = new Map();
  }

  // Parking Spot operations
  addSpot(spot: ParkingSpot): void {
    this.spots.set(spot.id, spot);
  }

  getSpot(spotId: string): ParkingSpot | undefined {
    return this.spots.get(spotId);
  }

  getAllSpots(): ParkingSpot[] {
    return Array.from(this.spots.values());
  }

  getAvailableSpots(): ParkingSpot[] {
    return this.getAllSpots().filter(spot => spot.isAvailable);
  }

  // Parking Ticket operations
  addTicket(ticket: ParkingTicket): void {
    this.tickets.set(ticket.ticketId, ticket);
    if (ticket.isActive) {
      this.activeTicketsByVehicle.set(ticket.vehicle.licensePlate, ticket);
    }
  }

  getTicket(ticketId: string): ParkingTicket | undefined {
    return this.tickets.get(ticketId);
  }

  getActiveTicketByVehicle(licensePlate: string): ParkingTicket | undefined {
    return this.activeTicketsByVehicle.get(licensePlate);
  }

  completeTicket(ticketId: string): void {
    const ticket = this.tickets.get(ticketId);
    if (ticket) {
      this.activeTicketsByVehicle.delete(ticket.vehicle.licensePlate);
    }
  }

  getAllTickets(): ParkingTicket[] {
    return Array.from(this.tickets.values());
  }

  getActiveTickets(): ParkingTicket[] {
    return this.getAllTickets().filter(ticket => ticket.isActive);
  }
}
