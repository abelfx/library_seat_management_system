"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Info, Check, ArrowLeft, User } from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

const SeatSelection = () => {
  const { floorId } = useParams();
  const navigate = useNavigate();

  const [zones, setZones] = useState([]);
  const [floor, setFloor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSeat, setCurrentSeat] = useState(null);
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  useEffect(() => {
    const fetchFloorData = async () => {
      try {
        setLoading(true);
        // Fetch floor details
        const floorDoc = await getDoc(doc(db, "Floor", floorId));
        if (!floorDoc.exists()) {
          throw new Error("Floor not found");
        }
        setFloor(floorDoc.data());

        // Fetch zones and their seats
        const zonesSnapshot = await getDocs(
          collection(db, "Floor", floorId, "zones")
        );
        const zonesData = [];

        for (const zoneDoc of zonesSnapshot.docs) {
          const seatsSnapshot = await getDocs(
            collection(db, "Floor", floorId, "zones", zoneDoc.id, "seats")
          );

          const seats = seatsSnapshot.docs.map((seatDoc) => ({
            id: seatDoc.id,
            ...seatDoc.data(),
            seatNumber: seatDoc.data()["seat-number"],
          }));

          zonesData.push({
            id: zoneDoc.id,
            name: zoneDoc.data().zoneName,
            seats: seats.sort((a, b) => a.seatNumber - b.seatNumber),
          });
        }

        setZones(zonesData.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Error fetching floor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFloorData();
  }, [floorId]);

  const getSeatStatus = (seat) => {
    if (!seat.isBooked) return "available";
    const now = new Date().getTime();
    const checkIn = new Date(seat["check-in"]).getTime();
    return now < checkIn ? "booked" : "occupied";
  };

  const selectSeat = (seat, zoneName) => {
    if (!seat.isBooked) {
      setSelectedSeat(seat.id);
      setCurrentSeat({ ...seat, zoneName });
      setDialogOpen(true);
    }
  };

  const handleConfirm = async () => {
    try {
      if (!currentSeat || !checkInTime || !checkOutTime) return;

      const seatRef = doc(
        db,
        "Floor",
        floorId,
        "zones",
        currentSeat.zoneId,
        "seats",
        currentSeat.id
      );

      await updateDoc(seatRef, {
        isBooked: true,
        "check-in": `${
          new Date().toISOString().split("T")[0]
        }T${checkInTime}:00`,
        "check-out": `${
          new Date().toISOString().split("T")[0]
        }T${checkOutTime}:00`,
        userId: "current-user-id", // Replace with actual user ID
        bookedAt: new Date().toISOString(),
        additionalInfo,
      });

      setDialogOpen(false);
      // Refresh the data
      window.location.reload();
    } catch (error) {
      console.error("Error booking seat:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <button
            onClick={() => navigate("/")}
            className="absolute left-4 top-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Floors
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Floor {floor?.floorName} - Seat Selection
          </h1>
          <p className="text-xl text-gray-600">Choose your perfect spot</p>
        </header>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex justify-center gap-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center gap-2">
              <Check className="text-green-500" />
              <span className="text-sm font-medium text-gray-700">
                Available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                Reserved
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                Occupied
              </span>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {zones.map((zone) => (
              <div key={zone.id} className="space-y-4">
                <div className="flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                      Zone {zone.name}
                    </h3>
                    <div className="h-1 w-20 bg-yellow-500 mt-2"></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {zone.seats.map((seat) => {
                      const status = getSeatStatus(seat);
                      const isSelected = selectedSeat === seat.id;

                      return (
                        <motion.button
                          key={seat.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`
                            h-16 flex flex-col items-center justify-center
                            rounded-md shadow transition-colors
                            ${
                              status !== "available"
                                ? "bg-gray-100 border-2 border-gray-300 text-gray-600 cursor-not-allowed"
                                : isSelected
                                ? "bg-green-500 text-white"
                                : "bg-white border-2 border-gray-200 text-gray-800 hover:border-yellow-500"
                            }
                          `}
                          onClick={() => selectSeat(seat, zone.name)}
                          disabled={status !== "available"}
                        >
                          <span className="text-sm font-medium">
                            Seat {seat.seatNumber}
                          </span>
                          <span className="mt-1">
                            {status === "available" ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : status === "booked" ? (
                              <Clock className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <User className="w-4 h-4 text-blue-500" />
                            )}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {dialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold mb-4">Seat Booking Details</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="w-1/3 text-gray-600">Seat:</span>
                  <span className="w-2/3 font-medium">
                    {currentSeat?.zone} - Seat {currentSeat?.seatNumber}
                  </span>
                </div>
                <div className="flex items-center">
                  <label htmlFor="checkin" className="w-1/3 text-gray-600">
                    Check-in:
                  </label>
                  <div className="w-2/3 relative">
                    <Clock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      id="checkin"
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <label htmlFor="checkout" className="w-1/3 text-gray-600">
                    Check-out:
                  </label>
                  <div className="w-2/3 relative">
                    <Clock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      id="checkout"
                      type="time"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <label htmlFor="info" className="w-1/3 text-gray-600">
                    Additional Info:
                  </label>
                  <div className="w-2/3 relative">
                    <Info
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <textarea
                      id="info"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Check size={18} />
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelection;
