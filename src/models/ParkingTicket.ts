import { Vehicle } from './Vehicle';
import { ParkingSpot } from './ParkingSpot';

/**
 * ParkingTicket class representing a parking session
 */
export class ParkingTicket {
  readonly ticketId: string;
  readonly vehicle: Vehicle;
  readonly spot: ParkingSpot;
  readonly entryTime: Date;
  private _exitTime?: Date;
  private _fee?: number;

  constructor(ticketId: string, vehicle: Vehicle, spot: ParkingSpot, entryTime: Date) {
    this.ticketId = ticketId;
    this.vehicle = vehicle;
    this.spot = spot;
    this.entryTime = entryTime;
  }

  get exitTime(): Date | undefined {
    return this._exitTime;
  }

  get fee(): number | undefined {
    return this._fee;
  }

  get isActive(): boolean {
    return this._exitTime === undefined;
  }

  /**
   * Complete the parking session with exit time and calculated fee
   */
  complete(exitTime: Date, fee: number): void {
    if (!this.isActive) {
      throw new Error(`Ticket ${this.ticketId} is already completed`);
    }
    this._exitTime = exitTime;
    this._fee = fee;
  }

  /**
   * Get the parking duration in hours
   */
  getDuration(): number {
    const endTime = this._exitTime || new Date();
    return (endTime.getTime() - this.entryTime.getTime()) / (1000 * 60 * 60);
  }

  toString(): string {
    const status = this.isActive ? 'Active' : 'Completed';
    const feeStr = this._fee !== undefined ? `$${this._fee.toFixed(2)}` : 'N/A';
    return `Ticket ${this.ticketId} - ${this.vehicle} - ${status} - Fee: ${feeStr}`;
  }
}
