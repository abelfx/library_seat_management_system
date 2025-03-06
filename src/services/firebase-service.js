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
  const floorsCollection = collection(db, "floors");
  const floorSnapshot = await getDocs(floorsCollection);
  return floorSnapshot.docs.map((doc) =>
    Floor.fromFirebase(doc.id, doc.data())
  );
};

export const getFloor = async (id) => {
  const floorDoc = doc(db, "floors", id);
  const floorSnapshot = await getDoc(floorDoc);
  if (floorSnapshot.exists()) {
    return Floor.fromFirebase(floorSnapshot.id, floorSnapshot.data());
  }
  return null;
};

export const createFloor = async (floorData) => {
  const floor = new Floor(floorData);
  const docRef = await addDoc(collection(db, "floors"), floor.toJSON());
  return { ...floor, id: docRef.id };
};

export const updateFloor = async (id, floorData) => {
  const floorRef = doc(db, "floors", id);
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
  await deleteDoc(doc(db, "floors", id));
  return id;
};

// Zone Services
export const getZones = async () => {
  // Use collectionGroup to get all zones across all floors
  const zonesGroup = collectionGroup(db, "zones");
  const zoneSnapshot = await getDocs(zonesGroup);
  return zoneSnapshot.docs.map((doc) => {
    const data = doc.data();
    // Extract floorId from the reference path
    const floorId = doc.ref.path.split("/")[1];
    return Zone.fromFirebase(doc.id, data, floorId);
  });
};

export const getZonesByFloor = async (floorId) => {
  const zonesCollection = collection(db, `floors/${floorId}/zones`);
  const zoneSnapshot = await getDocs(zonesCollection);
  return zoneSnapshot.docs.map((doc) =>
    Zone.fromFirebase(doc.id, doc.data(), floorId)
  );
};

export const getZone = async (floorId, zoneId) => {
  const zoneDoc = doc(db, `floors/${floorId}/zones`, zoneId);
  const zoneSnapshot = await getDoc(zoneDoc);
  if (zoneSnapshot.exists()) {
    return Zone.fromFirebase(zoneSnapshot.id, zoneSnapshot.data(), floorId);
  }
  return null;
};

export const createZone = async (zoneData) => {
  const zone = new Zone(zoneData);
  const floorId = zone.floorId;
  const docRef = await addDoc(
    collection(db, `floors/${floorId}/zones`),
    zone.toJSON()
  );
  return { ...zone, id: docRef.id };
};

export const updateZone = async (floorId, zoneId, zoneData) => {
  const zoneRef = doc(db, `floors/${floorId}/zones`, zoneId);
  await updateDoc(zoneRef, zoneData);
  return { id: zoneId, ...zoneData };
};

export const deleteZone = async (floorId, zoneId) => {
  // First delete all seats in this zone
  const seats = await getSeatsByZone(floorId, zoneId);
  for (const seat of seats) {
    await deleteSeat(floorId, zoneId, seat.id);
  }

  // Then delete the zone
  await deleteDoc(doc(db, `floors/${floorId}/zones`, zoneId));
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
    `floors/${floorId}/zones/${zoneId}/seats`
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
  const seatDoc = doc(db, `floors/${floorId}/zones/${zoneId}/seats`, seatId);
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
    collection(db, `floors/${floorId}/zones/${zoneId}/seats`),
    formattedData
  );
  return { ...seat, id: docRef.id };
};

export const updateSeat = async (floorId, zoneId, seatId, seatData) => {
  const seatRef = doc(db, `floors/${floorId}/zones/${zoneId}/seats`, seatId);

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
  await deleteDoc(doc(db, `floors/${floorId}/zones/${zoneId}/seats`, seatId));
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
