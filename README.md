# Smart Parking Lot System

A comprehensive backend system for managing a multi-floor smart parking lot with automatic spot allocation, real-time tracking, and fee calculation.

## Features

### ✅ Functional Requirements

- **Automatic Spot Allocation**: Intelligently assigns parking spots based on vehicle size (motorcycle, car, bus) and availability
- **Check-In/Check-Out Management**: Records entry and exit times for all vehicles
- **Dynamic Fee Calculation**: Calculates parking fees based on duration and vehicle type
- **Real-Time Availability**: Provides up-to-date information on parking spot availability
- **Concurrent Operations**: Handles multiple vehicles entering/exiting simultaneously using mutex locks

### 🏗️ Architecture

The system follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────┐
│      Application Layer (Demo)      │
├─────────────────────────────────────┤
│         Service Layer               │
│  - ParkingLotService                │
│  - ParkingSpotManager               │
│  - FeeCalculator                    │
├─────────────────────────────────────┤
│      Repository Layer               │
│  - ParkingLotRepository             │
├─────────────────────────────────────┤
│        Domain Models                │
│  - Vehicle, ParkingSpot             │
│  - ParkingTicket                    │
└─────────────────────────────────────┘
```

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Build the project**:
```bash
npm run build
```

3. **Run the demo**:
```bash
npm start
```

Or run both build and start together:
```bash
npm run dev
```

## System Design

### Data Models

#### Vehicle
- `licensePlate`: Unique identifier for the vehicle
- `type`: MOTORCYCLE | CAR | BUS
- `ownerName`: Optional owner information

#### ParkingSpot
- `id`: Unique spot identifier
- `floor`: Floor number
- `spotType`: MOTORCYCLE | COMPACT | LARGE
- `isAvailable`: Current availability status
- Compatibility logic: Large spots can fit any vehicle, compact spots fit cars and motorcycles, motorcycle spots only fit motorcycles

#### ParkingTicket
- `ticketId`: Unique ticket identifier
- `vehicle`: Reference to parked vehicle
- `spot`: Assigned parking spot
- `entryTime`: Check-in timestamp
- `exitTime`: Check-out timestamp (optional)
- `fee`: Calculated parking fee (set on checkout)

### Spot Allocation Algorithm

The system uses an intelligent allocation strategy:

1. **Filter Compatible Spots**: Only considers spots that can accommodate the vehicle type
2. **Prioritize Lower Floors**: Assigns spots on lower floors first for convenience
3. **Thread-Safe**: Uses mutex locking to prevent race conditions
4. **Upgrade Capability**: Larger spots can accommodate smaller vehicles (e.g., a bus spot can fit a car)

```typescript
// Example: Finding spot for a car
availableSpots
  .filter(spot => spot.canFit(VehicleType.CAR))  // COMPACT or LARGE spots
  .sort((a, b) => a.floor - b.floor)             // Lower floors first
  .first()                                        // Get best match
```

### Fee Calculation Logic

Fees are calculated based on:
- **Vehicle Type**: Different rates for motorcycles, cars, and buses
- **Duration**: Time spent in the parking lot (rounded up to nearest hour)
- **Rate Structure**:
  - Base fee for the first hour (flat rate)
  - Hourly rate for additional hours

**Default Rates**:
| Vehicle Type | Base Fee (1 hr) | Hourly Rate (> 1 hr) |
|--------------|-----------------|----------------------|
| Motorcycle   | $2.00           | $1.00                |
| Car          | $5.00           | $2.50                |
| Bus          | $10.00          | $5.00                |

Example: A car parked for 3.5 hours = $5.00 + (3 × $2.50) = $12.50

### Concurrency Handling

The system ensures thread-safety using **async-mutex**:

- **ParkingSpotManager**: Locks during spot allocation/release
- **ParkingLotService**: Locks during check-in/check-out operations
- **Repository**: In-memory Maps with indexed lookups for fast access

This prevents issues like:
- Two vehicles being assigned the same spot
- Race conditions during availability checks
- Inconsistent state during concurrent operations

## Usage Example

```typescript
// Initialize the parking lot
const repository = new ParkingLotRepository();
const spotManager = new ParkingSpotManager(repository);
const feeCalculator = new FeeCalculator();
const parkingLot = new ParkingLotService(repository, spotManager, feeCalculator);

// Create a 3-floor parking lot
parkingLot.initializeParkingLot(3, {
  MOTORCYCLE: 10,
  COMPACT: 20,
  LARGE: 10
});

// Check in a vehicle
const car = new Vehicle('ABC-123', VehicleType.CAR, 'John Doe');
const ticket = await parkingLot.checkInVehicle(car);

// Check availability
const availability = parkingLot.getAvailability();

// Check out the vehicle
const completedTicket = await parkingLot.checkOutVehicle('ABC-123');
console.log(`Fee: $${completedTicket.fee}`);
```

## Project Structure

```
parking-lot/
├── src/
│   ├── models/
│   │   ├── Vehicle.ts           # Vehicle domain model
│   │   ├── ParkingSpot.ts       # Parking spot model
│   │   └── ParkingTicket.ts     # Ticket/transaction model
│   ├── services/
│   │   ├── ParkingSpotManager.ts    # Spot allocation logic
│   │   ├── FeeCalculator.ts         # Fee calculation logic
│   │   └── ParkingLotService.ts     # Main orchestration service
│   ├── repositories/
│   │   └── ParkingLotRepository.ts  # Data access layer
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── index.ts                 # Demo application
├── package.json
├── tsconfig.json
└── README.md
```

## Technology Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js
- **Concurrency**: async-mutex
- **Storage**: In-memory (Maps) - easily replaceable with a database

## Future Enhancements

- REST API endpoints for external integration
- Database persistence (PostgreSQL/MongoDB)
- Payment processing integration
- Reserved parking spots
- Monthly parking passes
- Email notifications for tickets
- Admin dashboard for monitoring
- Analytics and reporting

## License

MIT
