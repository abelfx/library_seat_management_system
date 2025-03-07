import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  collectionGroup,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Floor, Zone, Seat } from "../firebase/model/model";

// Floor Services
export const getFloors = async () => {
  const floorsCollection = collection(db, "Floor");
  const floorSnapshot = await getDocs(floorsCollection);
  return floorSnapshot.docs.map((doc) =>
    Floor.fromFirebase(doc.id, doc.data())
  );
};

export const getFloor = async (id) => {
  const floorDoc = doc(db, "Floor", id);
  const floorSnapshot = await getDoc(floorDoc);
  if (floorSnapshot.exists()) {
    return Floor.fromFirebase(floorSnapshot.id, floorSnapshot.data());
  }
  return null;
};

export const createFloor = async (floorData) => {
  const floor = new Floor(floorData);
  const docRef = await addDoc(collection(db, "Floor"), floor.toJSON());
  return { ...floor, id: docRef.id };
};

export const updateFloor = async (id, floorData) => {
  const floorRef = doc(db, "Floor", id);
  await updateDoc(floorRef, floorData);
  return { id, ...floorData };
};

export const deleteFloor = async (id) => {
  // Get all zones in this floor
  const zones = await getZonesByFloor(id);

  // Delete all seats in each zone and then the zone
  for (const zone of zones) {
    const seats = await getSeatsByZone(id, zone.id);
    for (const seat of seats) {
      await deleteSeat(id, zone.id, seat.id);
    }
    // Delete the zone
    await deleteZone(id, zone.id);
  }

  // Finally delete the floor
  await deleteDoc(doc(db, "Floor", id));
  return id;
};

// Zone Services
// export const getZones = async () => {
//   // Use collectionGroup to get all zones across all floors
//   const zonesGroup = collectionGroup(db, "zones");
//   const zoneSnapshot = await getDocs(zonesGroup);
//   return zoneSnapshot.docs.map((doc) => {
//     const data = doc.data();
//     // Extract floorId from the reference path
//     const floorId = doc.ref.path.split("/")[1];
//     return Zone.fromFirebase(doc.id, data, floorId);
//   });
// };
export const getZones = async () => {
  // Use collectionGroup to get all zones across all floors
  const zonesGroup = collectionGroup(db, "zones");
  const zoneSnapshot = await getDocs(zonesGroup);

  return zoneSnapshot.docs.map((doc) => {
    const data = doc.data();
    // Extract floorId from the reference path
    const pathParts = doc.ref.path.split("/");
    const floorId = pathParts[1];

    // Return zone object directly instead of using Zone.fromFirebase
    return {
      id: doc.id,
      floorId: floorId,
      ...data,
    };
  });
};
// export const getZonesByFloor = async (floorId) => {
//   const zonesCollection = collection(db, `Floor/${floorId}/zones`);
//   const zoneSnapshot = await getDocs(zonesCollection);
//   return zoneSnapshot.docs.map((doc) =>
//     Zone.fromFirebase(doc.id, doc.data(), floorId)
//   );
// };

export const getZone = async (floorId, zoneId) => {
  const zoneDoc = doc(db, `Floor/${floorId}/zones`, zoneId);
  const zoneSnapshot = await getDoc(zoneDoc);
  if (zoneSnapshot.exists()) {
    return Zone.fromFirebase(zoneSnapshot.id, zoneSnapshot.data(), floorId);
  }
  return null;
};

// Update the createZone function to include group zone properties
export const createZone = async (zoneData) => {
  try {
    const zone = new Zone({
      ...zoneData,
      isGroupZone: zoneData.isGroupZone || false,
      minGroupSize: zoneData.isGroupZone ? zoneData.minGroupSize || 2 : null,
      maxGroupSize: zoneData.isGroupZone ? zoneData.maxGroupSize || 8 : null,
    });

    const floorId = zone.floorId;
    const zonesRef = collection(db, `Floor/${floorId}/zones`);

    const docRef = await addDoc(zonesRef, zone.toJSON());
    return { ...zone, id: docRef.id };
  } catch (error) {
    console.error("Error creating zone:", error);
    throw error;
  }
};

// Update the updateZone function to handle group zone properties
export const updateZone = async (zoneId, zoneData) => {
  try {
    const zone = new Zone({
      ...zoneData,
      isGroupZone: zoneData.isGroupZone || false,
      minGroupSize: zoneData.isGroupZone ? zoneData.minGroupSize || 2 : null,
      maxGroupSize: zoneData.isGroupZone ? zoneData.maxGroupSize || 8 : null,
    });

    const floorId = zone.floorId;
    const zoneRef = doc(db, `Floor/${floorId}/zones`, zoneId);

    const updatedZone = {
      ...zone.toJSON(),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(zoneRef, updatedZone);
    return { id: zoneId, ...updatedZone };
  } catch (error) {
    console.error("Error updating zone:", error);
    throw error;
  }
};

// Update the isValidBooking function to use the correct path
export const isValidBooking = async (floorId, zoneId, groupSize = 1) => {
  try {
    const zoneRef = doc(db, `Floor/${floorId}/zones`, zoneId);
    const zoneSnap = await getDoc(zoneRef);

    if (!zoneSnap.exists()) {
      return { valid: false, message: "Zone not found" };
    }

    const zoneData = zoneSnap.data();

    // Check if this is a group zone
    if (zoneData.isGroupZone) {
      // For group zones, enforce minimum group size
      if (groupSize < (zoneData.minGroupSize || 2)) {
        return {
          valid: false,
          message: `This is a group study zone. Minimum group size is ${
            zoneData.minGroupSize || 2
          } people.`,
        };
      }

      // Enforce maximum group size
      if (groupSize > (zoneData.maxGroupSize || 8)) {
        return {
          valid: false,
          message: `Maximum group size for this zone is ${
            zoneData.maxGroupSize || 8
          } people.`,
        };
      }

      return { valid: true };
    } else {
      // For individual zones, only allow single bookings
      if (groupSize > 1) {
        return {
          valid: false,
          message:
            "This zone is for individual use only. Please select a group study zone for group bookings.",
        };
      }

      return { valid: true };
    }
  } catch (error) {
    console.error("Error checking booking validity:", error);
    throw error;
  }
};

// You might also need to update your getZonesByFloor function to retrieve the group zone properties
export const getZonesByFloor = async (floorId) => {
  try {
    const zonesRef = collection(db, `Floor/${floorId}/zones`);
    const snapshot = await getDocs(zonesRef);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching zones by floor:", error);
    throw error;
  }
};

export const deleteZone = async (floorId, zoneId) => {
  // First delete all seats in this zone
  const seats = await getSeatsByZone(floorId, zoneId);
  for (const seat of seats) {
    await deleteSeat(floorId, zoneId, seat.id);
  }

  // Then delete the zone
  await deleteDoc(doc(db, `Floor/${floorId}/zones`, zoneId));
  return zoneId;
};

// Seat Services
export const getSeats = async () => {
  // Use collectionGroup to get all seats across all zones and floors
  const seatsGroup = collectionGroup(db, "seats");
  const seatSnapshot = await getDocs(seatsGroup);
  return seatSnapshot.docs.map((doc) => {
    const data = doc.data();
    const pathSegments = doc.ref.path.split("/");
    const floorId = pathSegments[1];
    const zoneId = pathSegments[3];
    return Seat.fromFirebase(doc.id, data, zoneId, floorId);
  });
};

export const getSeatsByZone = async (floorId, zoneId) => {
  const seatsCollection = collection(
    db,
    `Floor/${floorId}/zones/${zoneId}/seats`
  );
  const seatSnapshot = await getDocs(seatsCollection);
  return seatSnapshot.docs.map((doc) => {
    const data = doc.data();
    return Seat.fromFirebase(doc.id, data, zoneId, floorId);
  });
};

export const getSeatsByFloor = async (floorId) => {
  // Get all zones in the floor
  const zones = await getZonesByFloor(floorId);

  // Get all seats from each zone
  let allSeats = [];
  for (const zone of zones) {
    const seats = await getSeatsByZone(floorId, zone.id);
    allSeats = [...allSeats, ...seats];
  }

  return allSeats;
};

export const getSeat = async (floorId, zoneId, seatId) => {
  const seatDoc = doc(db, `Floor/${floorId}/zones/${zoneId}/seats`, seatId);
  const seatSnapshot = await getDoc(seatDoc);
  if (seatSnapshot.exists()) {
    const data = seatSnapshot.data();
    return Seat.fromFirebase(seatSnapshot.id, data, zoneId, floorId);
  }
  return null;
};

export const createSeat = async (seatData) => {
  const seat = new Seat(seatData);
  const floorId = seat.floorId;
  const zoneId = seat.zoneId;

  const formattedData = {
    ...seat.toJSON(),
    "seat-number": seat.seatNumber,
    "check-in": seat.checkIn,
    "check-out": seat.checkOut,
  };

  const docRef = await addDoc(
    collection(db, `Floor/${floorId}/zones/${zoneId}/seats`),
    formattedData
  );
  return { ...seat, id: docRef.id };
};

export const updateSeat = async (floorId, zoneId, seatId, seatData) => {
  const seatRef = doc(db, `Floor/${floorId}/zones/${zoneId}/seats`, seatId);

  // Format data to match Firestore structure
  const formattedData = {
    ...seatData,
  };

  if (seatData.seatNumber !== undefined) {
    formattedData["seat-number"] = seatData.seatNumber;
  }

  if (seatData.checkIn !== undefined) {
    formattedData["check-in"] = seatData.checkIn;
  }

  if (seatData.checkOut !== undefined) {
    formattedData["check-out"] = seatData.checkOut;
  }

  await updateDoc(seatRef, formattedData);
  return { id: seatId, ...seatData };
};

export const deleteSeat = async (floorId, zoneId, seatId) => {
  await deleteDoc(doc(db, `Floor/${floorId}/zones/${zoneId}/seats`, seatId));
  return seatId;
};

export const bookSeat = async (floorId, zoneId, seatId, bookingData) => {
  const seat = await getSeat(floorId, zoneId, seatId);
  if (!seat) {
    throw new Error("Seat not found");
  }

  seat.book(bookingData);

  return updateSeat(floorId, zoneId, seatId, {
    isBooked: seat.isBooked,
    checkIn: seat.checkIn,
    checkOut: seat.checkOut,
    userId: seat.userId,
    bookedAt: seat.bookedAt,
  });
};

export const releaseSeat = async (floorId, zoneId, seatId) => {
  const seat = await getSeat(floorId, zoneId, seatId);
  if (!seat) {
    throw new Error("Seat not found");
  }

  seat.release();

  return updateSeat(floorId, zoneId, seatId, {
    isBooked: seat.isBooked,
    checkIn: seat.checkIn,
    checkOut: seat.checkOut,
    userId: seat.userId,
    bookedAt: seat.bookedAt,
  });
};
