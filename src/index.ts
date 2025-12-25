import { Vehicle } from './models/Vehicle';
import { ParkingLotRepository } from './repositories/ParkingLotRepository';
import { ParkingSpotManager } from './services/ParkingSpotManager';
import { FeeCalculator } from './services/FeeCalculator';
import { ParkingLotService } from './services/ParkingLotService';
import { VehicleType, SpotType } from './types';

/**
 * Demo application showing the Smart Parking Lot System in action
 */
async function main() {
  console.log('=== Smart Parking Lot System Demo ===\n');

  // Initialize services
  const repository = new ParkingLotRepository();
  const spotManager = new ParkingSpotManager(repository);
  const feeCalculator = new FeeCalculator();
  const parkingLot = new ParkingLotService(repository, spotManager, feeCalculator);

  // Configure parking lot: 3 floors with different spot types
  parkingLot.initializeParkingLot(3, {
    [SpotType.MOTORCYCLE]: 10,  // 10 motorcycle spots per floor
    [SpotType.COMPACT]: 20,     // 20 compact spots per floor
    [SpotType.LARGE]: 10        // 10 large spots per floor
  });

  console.log('\n--- Initial Availability ---');
  printAvailability(parkingLot);

  console.log('\n--- Scenario 1: Vehicle Check-ins ---');
  
  // Create various vehicles
  const motorcycle1 = new Vehicle('MC-001', VehicleType.MOTORCYCLE, 'John');
  const car1 = new Vehicle('CAR-001', VehicleType.CAR, 'Alice');
  const car2 = new Vehicle('CAR-002', VehicleType.CAR, 'Bob');
  const bus1 = new Vehicle('BUS-001', VehicleType.BUS, 'Transit Co.');

  // Check in vehicles
  await parkingLot.checkInVehicle(motorcycle1);
  await parkingLot.checkInVehicle(car1);
  await parkingLot.checkInVehicle(car2);
  await parkingLot.checkInVehicle(bus1);

  console.log('\n--- Availability After Check-ins ---');
  printAvailability(parkingLot);

  console.log('\n--- Active Parking Sessions ---');
  const activeTickets = parkingLot.getActiveTickets();
  activeTickets.forEach(ticket => {
    console.log(`  ${ticket.toString()}`);
  });

  // Simulate time passing (for demo, we'll just wait a bit)
  console.log('\n--- Simulating time passage (2 seconds = 2 hours in demo) ---');
  await sleep(2000);

  console.log('\n--- Scenario 2: Vehicle Check-outs ---');
  
  // Check out vehicles
  await parkingLot.checkOutVehicle('MC-001');
  await parkingLot.checkOutVehicle('CAR-001');

  console.log('\n--- Availability After Check-outs ---');
  printAvailability(parkingLot);

  console.log('\n--- Scenario 3: Concurrent Operations ---');
  
  // Simulate concurrent check-ins
  const concurrentVehicles = [
    new Vehicle('CAR-003', VehicleType.CAR, 'Charlie'),
    new Vehicle('CAR-004', VehicleType.CAR, 'David'),
    new Vehicle('CAR-005', VehicleType.CAR, 'Eve'),
    new Vehicle('MC-002', VehicleType.MOTORCYCLE, 'Frank')
  ];

  console.log('Checking in multiple vehicles simultaneously...');
  const checkInPromises = concurrentVehicles.map(vehicle => 
    parkingLot.checkInVehicle(vehicle)
  );
  
  await Promise.all(checkInPromises);

  console.log('\n--- Final Availability ---');
  printAvailability(parkingLot);

  console.log('\n--- All Active Sessions ---');
  const finalTickets = parkingLot.getActiveTickets();
  console.log(`Total active sessions: ${finalTickets.length}`);
  finalTickets.forEach(ticket => {
    console.log(`  ${ticket.toString()}`);
  });

  console.log('\n--- Scenario 4: Testing Full Capacity ---');
  
  // Try to check in many vehicles to test capacity
  console.log('Attempting to fill motorcycle spots...');
  let motorcycleCount = 0;
  for (let i = 3; i <= 50; i++) {
    const mc = new Vehicle(`MC-${String(i).padStart(3, '0')}`, VehicleType.MOTORCYCLE);
    const ticket = await parkingLot.checkInVehicle(mc);
    if (ticket) {
      motorcycleCount++;
    } else {
      console.log(`✗ No more motorcycle spots available after ${motorcycleCount} motorcycles`);
      break;
    }
  }

  console.log('\n--- Final System State ---');
  printAvailability(parkingLot);
  console.log(`\nTotal vehicles parked: ${parkingLot.getActiveTickets().length}`);

  console.log('\n=== Demo Complete ===');
}

function printAvailability(parkingLot: ParkingLotService) {
  const availability = parkingLot.getAvailability();
  console.log('\nFloor | Spot Type   | Available | Total');
  console.log('------|-------------|-----------|------');
  availability.forEach(summary => {
    const spotType = summary.spotType.padEnd(11);
    console.log(`  ${summary.floor}   | ${spotType} | ${String(summary.available).padStart(9)} | ${String(summary.total).padStart(5)}`);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the demo
main().catch(console.error);
