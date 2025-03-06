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
  // First get all zones in this floor
  const zones = await getZonesByFloor(id);

  // Delete all seats in each zone
  for (const zone of zones) {
    const seats = await getSeatsByZone(zone.id);
    for (const seat of seats) {
      await deleteSeat(seat.id);
    }
    // Delete the zone
    await deleteZone(zone.id);
  }

  // Finally delete the floor
  await deleteDoc(doc(db, "floors", id));
  return id;
};

// Zone Services
export const getZones = async () => {
  const zonesCollection = collection(db, "zones");
  const zoneSnapshot = await getDocs(zonesCollection);
  return zoneSnapshot.docs.map((doc) =>
    Zone.fromFirebase(doc.id, doc.data(), doc.data().floorId)
  );
};

export const getZonesByFloor = async (floorId) => {
  const zonesCollection = collection(db, "zones");
  const q = query(zonesCollection, where("floorId", "==", floorId));
  const zoneSnapshot = await getDocs(q);
  return zoneSnapshot.docs.map((doc) =>
    Zone.fromFirebase(doc.id, doc.data(), floorId)
  );
};

export const getZone = async (id) => {
  const zoneDoc = doc(db, "zones", id);
  const zoneSnapshot = await getDoc(zoneDoc);
  if (zoneSnapshot.exists()) {
    return Zone.fromFirebase(
      zoneSnapshot.id,
      zoneSnapshot.data(),
      zoneSnapshot.data().floorId
    );
  }
  return null;
};

export const createZone = async (zoneData) => {
  const zone = new Zone(zoneData);
  const docRef = await addDoc(collection(db, "zones"), zone.toJSON());
  return { ...zone, id: docRef.id };
};

export const updateZone = async (id, zoneData) => {
  const zoneRef = doc(db, "zones", id);
  await updateDoc(zoneRef, zoneData);
  return { id, ...zoneData };
};

export const deleteZone = async (id) => {
  // First delete all seats in this zone
  const seats = await getSeatsByZone(id);
  for (const seat of seats) {
    await deleteSeat(seat.id);
  }

  // Then delete the zone
  await deleteDoc(doc(db, "zones", id));
  return id;
};

// Seat Services
export const getSeats = async () => {
  const seatsCollection = collection(db, "seats");
  const seatSnapshot = await getDocs(seatsCollection);
  return seatSnapshot.docs.map((doc) => {
    const data = doc.data();
    return Seat.fromFirebase(doc.id, data, data.zoneId, data.floorId);
  });
};

export const getSeatsByZone = async (zoneId) => {
  const seatsCollection = collection(db, "seats");
  const q = query(seatsCollection, where("zoneId", "==", zoneId));
  const seatSnapshot = await getDocs(q);
  return seatSnapshot.docs.map((doc) => {
    const data = doc.data();
    return Seat.fromFirebase(doc.id, data, zoneId, data.floorId);
  });
};

export const getSeatsByFloor = async (floorId) => {
  const seatsCollection = collection(db, "seats");
  const q = query(seatsCollection, where("floorId", "==", floorId));
  const seatSnapshot = await getDocs(q);
  return seatSnapshot.docs.map((doc) => {
    const data = doc.data();
    return Seat.fromFirebase(doc.id, data, data.zoneId, floorId);
  });
};

export const getSeat = async (id) => {
  const seatDoc = doc(db, "seats", id);
  const seatSnapshot = await getDoc(seatDoc);
  if (seatSnapshot.exists()) {
    const data = seatSnapshot.data();
    return Seat.fromFirebase(seatSnapshot.id, data, data.zoneId, data.floorId);
  }
  return null;
};

export const createSeat = async (seatData) => {
  const seat = new Seat(seatData);
  const formattedData = {
    ...seat.toJSON(),
    "seat-number": seat.seatNumber,
    "check-in": seat.checkIn,
    "check-out": seat.checkOut,
  };

  const docRef = await addDoc(collection(db, "seats"), formattedData);
  return { ...seat, id: docRef.id };
};

export const updateSeat = async (id, seatData) => {
  const seatRef = doc(db, "seats", id);

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
  return { id, ...seatData };
};

export const deleteSeat = async (id) => {
  await deleteDoc(doc(db, "seats", id));
  return id;
};

export const bookSeat = async (id, bookingData) => {
  const seat = await getSeat(id);
  if (!seat) {
    throw new Error("Seat not found");
  }

  seat.book(bookingData);

  return updateSeat(id, {
    isBooked: seat.isBooked,
    checkIn: seat.checkIn,
    checkOut: seat.checkOut,
    userId: seat.userId,
    bookedAt: seat.bookedAt,
  });
};

export const releaseSeat = async (id) => {
  const seat = await getSeat(id);
  if (!seat) {
    throw new Error("Seat not found");
  }

  seat.release();

  return updateSeat(id, {
    isBooked: seat.isBooked,
    checkIn: seat.checkIn,
    checkOut: seat.checkOut,
    userId: seat.userId,
    bookedAt: seat.bookedAt,
  });
};
