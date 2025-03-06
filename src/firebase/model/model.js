// // Floor Model
// export class Floor {
//   constructor(data) {
//     this.id = data.id || null;
//     this.floorName = data.floorName;
//     this.createdAt = data.createdAt || new Date().toISOString();
//   }

//   toJSON() {
//     return {
//       id: this.id,
//       floorName: this.floorName,
//       createdAt: this.createdAt,
//     };
//   }

//   static fromFirebase(id, data) {
//     return new Floor({
//       id,
//       floorName: data.floorName,
//       createdAt: data.createdAt,
//     });
//   }
// }

// // Zone Model
// export class Zone {
//   constructor(data) {
//     this.id = data.id || null;
//     this.zoneName = data.zoneName;
//     this.floorId = data.floorId;
//     this.createdAt = data.createdAt || new Date().toISOString();
//   }

//   toJSON() {
//     return {
//       id: this.id,
//       zoneName: this.zoneName,
//       floorId: this.floorId,
//       createdAt: this.createdAt,
//     };
//   }

//   static fromFirebase(id, data, floorId) {
//     return new Zone({
//       id,
//       zoneName: data.zoneName,
//       floorId,
//       createdAt: data.createdAt,
//     });
//   }
// }

// // Seat Model
// export class Seat {
//   constructor(data) {
//     this.id = data.id || null;
//     this.seatNumber = data.seatNumber;
//     this.isBooked = data.isBooked || false;
//     this.checkIn = data.checkIn || null;
//     this.checkOut = data.checkOut || null;
//     this.userId = data.userId || null;
//     this.bookedAt = data.bookedAt || null;
//     this.zoneId = data.zoneId;
//     this.floorId = data.floorId;
//     this.createdAt = data.createdAt || new Date().toISOString();
//   }

//   toJSON() {
//     return {
//       id: this.id,
//       seatNumber: this.seatNumber,
//       isBooked: this.isBooked,
//       checkIn: this.checkIn,
//       checkOut: this.checkOut,
//       userId: this.userId,
//       bookedAt: this.bookedAt,
//       zoneId: this.zoneId,
//       floorId: this.floorId,
//       createdAt: this.createdAt,
//     };
//   }

//   static fromFirebase(id, data, zoneId, floorId) {
//     return new Seat({
//       id,
//       seatNumber: data["seat-number"],
//       isBooked: data.isBooked,
//       checkIn: data["check-in"],
//       checkOut: data["check-out"],
//       userId: data.userId,
//       bookedAt: data.bookedAt,
//       zoneId,
//       floorId,
//       createdAt: data.createdAt,
//     });
//   }

//   isAvailable() {
//     return !this.isBooked;
//   }

//   canBeBooked(requestedCheckIn, requestedCheckOut) {
//     if (this.isBooked) return false;

//     const requested = {
//       start: new Date(requestedCheckIn).getTime(),
//       end: new Date(requestedCheckOut).getTime(),
//     };

//     // Add any additional booking validation logic here
//     return requested.start < requested.end;
//   }

//   book(bookingData) {
//     if (!this.canBeBooked(bookingData.checkIn, bookingData.checkOut)) {
//       throw new Error("Seat cannot be booked for the requested time period");
//     }

//     this.isBooked = true;
//     this.checkIn = bookingData.checkIn;
//     this.checkOut = bookingData.checkOut;
//     this.userId = bookingData.userId;
//     this.bookedAt = new Date().toISOString();
//   }

//   release() {
//     this.isBooked = false;
//     this.checkIn = null;
//     this.checkOut = null;
//     this.userId = null;
//     this.bookedAt = null;
//   }
// }
// Floor Model
//
// Floor Model
export class Floor {
  constructor(data) {
    this.id = data.id || null;
    this.floorName = data.floorName;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      floorName: this.floorName,
      createdAt: this.createdAt,
    };
  }

  static fromFirebase(id, data) {
    return new Floor({
      id,
      floorName: data.floorName,
      createdAt: data.createdAt,
    });
  }
}

// Zone Model
export class Zone {
  constructor(data) {
    this.id = data.id || null;
    this.zoneName = data.zoneName;
    this.floorId = data.floorId;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      zoneName: this.zoneName,
      floorId: this.floorId,
      createdAt: this.createdAt,
    };
  }

  static fromFirebase(id, data, floorId) {
    return new Zone({
      id,
      zoneName: data.zoneName,
      floorId,
      createdAt: data.createdAt,
    });
  }
}

// Seat Model
export class Seat {
  constructor(data) {
    this.id = data.id || null;
    this.seatNumber = data.seatNumber;
    this.isBooked = data.isBooked || false;
    this.checkIn = data.checkIn || null;
    this.checkOut = data.checkOut || null;
    this.userId = data.userId || null;
    this.userEmail = data.userEmail || null;
    this.userName = data.userName || null;
    this.bookedAt = data.bookedAt || null;
    this.zoneId = data.zoneId;
    this.floorId = data.floorId;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      seatNumber: this.seatNumber,
      isBooked: this.isBooked,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      userId: this.userId,
      userEmail: this.userEmail,
      userName: this.userName,
      bookedAt: this.bookedAt,
      zoneId: this.zoneId,
      floorId: this.floorId,
      createdAt: this.createdAt,
    };
  }

  static fromFirebase(id, data, zoneId, floorId) {
    return new Seat({
      id,
      seatNumber: data["seat-number"],
      isBooked: data.isBooked,
      checkIn: data["check-in"],
      checkOut: data["check-out"],
      userId: data.userId,
      userEmail: data.userEmail,
      userName: data.userName,
      bookedAt: data.bookedAt,
      zoneId,
      floorId,
      createdAt: data.createdAt,
    });
  }

  isAvailable() {
    return !this.isBooked;
  }

  canBeBooked(requestedCheckIn, requestedCheckOut) {
    if (this.isBooked) return false;

    const requested = {
      start: new Date(requestedCheckIn).getTime(),
      end: new Date(requestedCheckOut).getTime(),
    };

    // Add any additional booking validation logic here
    return requested.start < requested.end;
  }

  book(bookingData) {
    if (!this.canBeBooked(bookingData.checkIn, bookingData.checkOut)) {
      throw new Error("Seat cannot be booked for the requested time period");
    }

    this.isBooked = true;
    this.checkIn = bookingData.checkIn;
    this.checkOut = bookingData.checkOut;
    this.userId = bookingData.userId;
    this.bookedAt = new Date().toISOString();
  }

  release() {
    this.isBooked = false;
    this.checkIn = null;
    this.checkOut = null;
    this.userId = null;
    this.bookedAt = null;
  }
}

// favourites model
export class FavoriteSeat {
  constructor(id, userId, floorId, zoneId, seatNumber) {
    this.id = id;
    this.userId = userId;
    this.floorId = floorId;
    this.zoneId = zoneId;
    this.seatNumber = seatNumber;
  }

  static fromFirebase(id, data) {
    return new FavoriteSeat(
      id,
      data.userId,
      data.floorId,
      data.zoneId,
      data.seatNumber
    );
  }

  toJSON() {
    return {
      userId: this.userId,
      floorId: this.floorId,
      zoneId: this.zoneId,
      seatNumber: this.seatNumber,
    };
  }
}
