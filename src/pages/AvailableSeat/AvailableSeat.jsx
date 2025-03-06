// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { Clock, Info, Check, ArrowLeft, User } from "lucide-react";
// import {
//   collection,
//   getDocs,
//   doc,
//   getDoc,
//   updateDoc,
// } from "firebase/firestore";
// import { db } from "../../firebase/firebase";

// const SeatSelection = () => {
//   const { floorId } = useParams();
//   const navigate = useNavigate();

//   const [zones, setZones] = useState([]);
//   const [floor, setFloor] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedSeat, setSelectedSeat] = useState(null);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [currentSeat, setCurrentSeat] = useState(null);
//   const [checkInTime, setCheckInTime] = useState("");
//   const [checkOutTime, setCheckOutTime] = useState("");
//   const [additionalInfo, setAdditionalInfo] = useState("");

//   useEffect(() => {
//     const fetchFloorData = async () => {
//       try {
//         setLoading(true);
//         // Fetch floor details
//         const floorDoc = await getDoc(doc(db, "Floor", floorId));
//         if (!floorDoc.exists()) {
//           throw new Error("Floor not found");
//         }
//         setFloor(floorDoc.data());

//         // Fetch zones and their seats
//         const zonesSnapshot = await getDocs(
//           collection(db, "Floor", floorId, "zones")
//         );
//         const zonesData = [];

//         for (const zoneDoc of zonesSnapshot.docs) {
//           const seatsSnapshot = await getDocs(
//             collection(db, "Floor", floorId, "zones", zoneDoc.id, "seats")
//           );

//           const seats = seatsSnapshot.docs.map((seatDoc) => ({
//             id: seatDoc.id,
//             ...seatDoc.data(),
//             seatNumber: seatDoc.data()["seat-number"],
//           }));

//           zonesData.push({
//             id: zoneDoc.id,
//             name: zoneDoc.data().zoneName,
//             seats: seats.sort((a, b) => a.seatNumber - b.seatNumber),
//           });
//         }

//         setZones(zonesData.sort((a, b) => a.name.localeCompare(b.name)));
//       } catch (error) {
//         console.error("Error fetching floor data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFloorData();
//   }, [floorId]);

//   const getSeatStatus = (seat) => {
//     if (!seat.isBooked) return "available";
//     const now = new Date().getTime();
//     const checkIn = new Date(seat["check-in"]).getTime();
//     return now < checkIn ? "booked" : "occupied";
//   };

//   const selectSeat = (seat, zoneName) => {
//     if (!seat.isBooked) {
//       setSelectedSeat(seat.id);
//       setCurrentSeat({ ...seat, zoneName });
//       setDialogOpen(true);
//     }
//   };

//   const handleConfirm = async () => {
//     try {
//       if (!currentSeat || !checkInTime || !checkOutTime) return;

//       const seatRef = doc(
//         db,
//         "Floor",
//         floorId,
//         "zones",
//         currentSeat.zoneId,
//         "seats",
//         currentSeat.id
//       );

//       await updateDoc(seatRef, {
//         isBooked: true,
//         "check-in": `${
//           new Date().toISOString().split("T")[0]
//         }T${checkInTime}:00`,
//         "check-out": `${
//           new Date().toISOString().split("T")[0]
//         }T${checkOutTime}:00`,
//         userId: "current-user-id", // Replace with actual user ID
//         bookedAt: new Date().toISOString(),
//         additionalInfo,
//       });

//       setDialogOpen(false);
//       // Refresh the data
//       window.location.reload();
//     } catch (error) {
//       console.error("Error booking seat:", error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         Loading...
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         <header className="text-center mb-12">
//           <button
//             onClick={() => navigate("/")}
//             className="absolute left-4 top-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
//           >
//             <ArrowLeft size={20} />
//             Back to Floors
//           </button>
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">
//             Floor {floor?.floorName} - Seat Selection
//           </h1>
//           <p className="text-xl text-gray-600">Choose your perfect spot</p>
//         </header>

//         <div className="bg-white shadow-lg rounded-lg overflow-hidden">
//           <div className="flex justify-center gap-6 py-4 bg-gray-50 border-b">
//             <div className="flex items-center gap-2">
//               <Check className="text-green-500" />
//               <span className="text-sm font-medium text-gray-700">
//                 Available
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Clock className="text-yellow-500" />
//               <span className="text-sm font-medium text-gray-700">
//                 Reserved
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <User className="text-blue-500" />
//               <span className="text-sm font-medium text-gray-700">
//                 Occupied
//               </span>
//             </div>
//           </div>

//           <div className="p-6 space-y-8">
//             {zones.map((zone) => (
//               <div key={zone.id} className="space-y-4">
//                 <div className="flex flex-col">
//                   <div className="mb-4">
//                     <h3 className="text-2xl font-bold text-gray-800">
//                       Zone {zone.name}
//                     </h3>
//                     <div className="h-1 w-20 bg-yellow-500 mt-2"></div>
//                   </div>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
//                     {zone.seats.map((seat) => {
//                       const status = getSeatStatus(seat);
//                       const isSelected = selectedSeat === seat.id;

//                       return (
//                         <motion.button
//                           key={seat.id}
//                           whileHover={{ scale: 1.05 }}
//                           whileTap={{ scale: 0.95 }}
//                           className={`
//                             h-16 flex flex-col items-center justify-center
//                             rounded-md shadow transition-colors
//                             ${
//                               status !== "available"
//                                 ? "bg-gray-100 border-2 border-gray-300 text-gray-600 cursor-not-allowed"
//                                 : isSelected
//                                 ? "bg-green-500 text-white"
//                                 : "bg-white border-2 border-gray-200 text-gray-800 hover:border-yellow-500"
//                             }
//                           `}
//                           onClick={() => selectSeat(seat, zone.name)}
//                           disabled={status !== "available"}
//                         >
//                           <span className="text-sm font-medium">
//                             Seat {seat.seatNumber}
//                           </span>
//                           <span className="mt-1">
//                             {status === "available" ? (
//                               <Check className="w-4 h-4 text-green-500" />
//                             ) : status === "booked" ? (
//                               <Clock className="w-4 h-4 text-yellow-500" />
//                             ) : (
//                               <User className="w-4 h-4 text-blue-500" />
//                             )}
//                           </span>
//                         </motion.button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {dialogOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
//             >
//               <h2 className="text-2xl font-bold mb-4">Seat Booking Details</h2>
//               <div className="space-y-4">
//                 <div className="flex items-center">
//                   <span className="w-1/3 text-gray-600">Seat:</span>
//                   <span className="w-2/3 font-medium">
//                     {currentSeat?.zone} - Seat {currentSeat?.seatNumber}
//                   </span>
//                 </div>
//                 <div className="flex items-center">
//                   <label htmlFor="checkin" className="w-1/3 text-gray-600">
//                     Check-in:
//                   </label>
//                   <div className="w-2/3 relative">
//                     <Clock
//                       className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                       size={18}
//                     />
//                     <input
//                       id="checkin"
//                       type="time"
//                       value={checkInTime}
//                       onChange={(e) => setCheckInTime(e.target.value)}
//                       className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex items-center">
//                   <label htmlFor="checkout" className="w-1/3 text-gray-600">
//                     Check-out:
//                   </label>
//                   <div className="w-2/3 relative">
//                     <Clock
//                       className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                       size={18}
//                     />
//                     <input
//                       id="checkout"
//                       type="time"
//                       value={checkOutTime}
//                       onChange={(e) => setCheckOutTime(e.target.value)}
//                       className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex items-center">
//                   <label htmlFor="info" className="w-1/3 text-gray-600">
//                     Additional Info:
//                   </label>
//                   <div className="w-2/3 relative">
//                     <Info
//                       className="absolute left-3 top-3 text-gray-400"
//                       size={18}
//                     />
//                     <textarea
//                       id="info"
//                       value={additionalInfo}
//                       onChange={(e) => setAdditionalInfo(e.target.value)}
//                       className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       rows="3"
//                     ></textarea>
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-6 flex justify-end gap-4">
//                 <button
//                   onClick={() => setDialogOpen(false)}
//                   className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleConfirm}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
//                 >
//                   <Check size={18} />
//                   Confirm Booking
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SeatSelection;

"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  Info,
  Check,
  ArrowLeft,
  User,
  X,
  AlertCircle,
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { getAuth } from "firebase/auth";

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
  const [seatCounts, setSeatCounts] = useState({
    available: 0,
    reserved: 0,
    occupied: 0,
  });
  const [user, setUser] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const fetchFloorData = async () => {
      try {
        setLoading(true);
        const floorDoc = await getDoc(doc(db, "Floor", floorId));
        if (!floorDoc.exists()) {
          throw new Error("Floor not found");
        }
        setFloor({ id: floorDoc.id, ...floorDoc.data() });

        const zonesSnapshot = await getDocs(
          collection(db, "Floor", floorId, "zones")
        );
        const zonesData = [];
        let availableCount = 0;
        let reservedCount = 0;
        let occupiedCount = 0;

        for (const zoneDoc of zonesSnapshot.docs) {
          const seatsSnapshot = await getDocs(
            collection(db, "Floor", floorId, "zones", zoneDoc.id, "seats")
          );

          const seats = seatsSnapshot.docs
            .map((seatDoc) => ({
              id: seatDoc.id,
              ...seatDoc.data(),
              zoneId: zoneDoc.id,
              floorId: floorId,
              seatNumber: seatDoc.data()["seat-number"],
            }))
            .sort((a, b) => a.seatNumber - b.seatNumber);

          seats.forEach((seat) => {
            const status = getSeatStatus(seat);
            if (status === "available") availableCount++;
            else if (status === "booked") reservedCount++;
            else if (status === "occupied") occupiedCount++;
          });

          zonesData.push({
            id: zoneDoc.id,
            name: zoneDoc.data().zoneName,
            seats: seats,
          });
        }

        setSeatCounts({
          available: availableCount,
          reserved: reservedCount,
          occupied: occupiedCount,
        });

        setZones(zonesData.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Error fetching floor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFloorData();
  }, [floorId]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const getSeatStatus = (seat) => {
    if (!seat.isBooked) return "available";
    const now = new Date().getTime();
    const checkIn = new Date(seat.checkIn).getTime();
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
      if (!currentSeat || !checkInTime || !checkOutTime || !user) {
        if (!user) {
          navigate("/login");
          return;
        }
        return;
      }

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
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        bookedAt: new Date().toISOString(),
        additionalInfo,
      });

      setDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error booking seat:", error);
      if (error.code === "permission-denied") {
        alert("You need to be logged in to book a seat");
        navigate("/login");
      } else {
        alert("Failed to book seat. Please try again.");
      }
    }
  };

  const handleCancelBooking = async (seat) => {
    try {
      if (!user) {
        navigate("/login");
        return;
      }

      if (seat.userId !== user.uid) {
        alert("You can only cancel your own bookings.");
        return;
      }

      const seatRef = doc(
        db,
        "Floor",
        floorId,
        "zones",
        seat.zoneId,
        "seats",
        seat.id
      );

      await updateDoc(seatRef, {
        isBooked: false,
        "check-in": null,
        "check-out": null,
        userId: null,
        userEmail: null,
        userName: null,
        bookedAt: null,
        additionalInfo: null,
      });

      window.location.reload();
    } catch (error) {
      console.error("Error canceling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12">
        <header className="relative text-center mb-8 sm:mb-12">
          <button
            onClick={() => navigate("/")}
            className="absolute left-0 top-0 flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Floors</span>
          </button>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 mt-12 sm:mt-2">
            Floor {floor?.floorName}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Choose your perfect spot
          </p>
        </header>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex justify-start sm:justify-center gap-4 py-4 px-4 bg-gray-50 border-b overflow-x-auto whitespace-nowrap">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Check className="text-green-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  Available
                </span>
                <span className="text-xs text-gray-500">
                  {seatCounts.available} seats
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Clock className="text-yellow-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  Reserved
                </span>
                <span className="text-xs text-gray-500">
                  {seatCounts.reserved} seats
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <User className="text-blue-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  Occupied
                </span>
                <span className="text-xs text-gray-500">
                  {seatCounts.occupied} seats
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-8">
            {zones.map((zone) => (
              <div key={zone.id} className="space-y-4">
                <div className="flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                      Zone {zone.name}
                    </h3>
                    <div className="h-1 w-20 bg-yellow-500 mt-2"></div>
                  </div>
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                    {zone.seats.map((seat) => {
                      const status = getSeatStatus(seat);
                      const isSelected = selectedSeat === seat.id;
                      const isUsersSeat = seat.userId === user?.uid;

                      return (
                        <div key={seat.id} className="relative">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                              w-full h-14 sm:h-16 flex flex-col items-center justify-center
                              rounded-md shadow transition-colors
                              ${
                                status !== "available"
                                  ? isUsersSeat
                                    ? "bg-blue-100 border-2 border-blue-400 text-blue-800"
                                    : "bg-gray-100 border-2 border-gray-300 text-gray-600 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-green-500 text-white"
                                  : "bg-white border-2 border-gray-200 text-gray-800 hover:border-yellow-500"
                              }
                            `}
                            onClick={() => {
                              if (status === "available") {
                                selectSeat(seat, zone.name);
                              }
                            }}
                            disabled={status !== "available" && !isUsersSeat}
                          >
                            <span className="text-xs sm:text-sm font-medium">
                              Seat {seat.seatNumber}
                            </span>
                            <span className="mt-1">
                              {status === "available" ? (
                                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                              ) : status === "booked" ? (
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                              ) : (
                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                              )}
                            </span>
                          </motion.button>

                          {status !== "available" && (
                            <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 sm:w-56 hidden group-hover:block">
                              <div className="bg-white rounded-lg shadow-lg p-3 text-xs">
                                <p className="font-medium mb-1">
                                  {isUsersSeat ? "Your Booking" : "Booked"}
                                </p>
                                <p>
                                  Check-in:{" "}
                                  {new Date(seat.checkIn).toLocaleTimeString()}
                                </p>
                                <p>
                                  Check-out:{" "}
                                  {new Date(seat.checkOut).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          )}

                          {isUsersSeat && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelBooking(seat);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                              title="Cancel Booking"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {dialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">
                  Seat Booking Details
                </h2>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <span className="text-gray-600 sm:w-1/3">Seat:</span>
                  <span className="font-medium sm:w-2/3">
                    {currentSeat?.zoneName} - Seat {currentSeat?.seatNumber}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <label htmlFor="checkin" className="text-gray-600 sm:w-1/3">
                    Check-in:
                  </label>
                  <div className="relative sm:w-2/3">
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <label htmlFor="checkout" className="text-gray-600 sm:w-1/3">
                    Check-out:
                  </label>
                  <div className="relative sm:w-2/3">
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
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
                  <label htmlFor="info" className="text-gray-600 sm:w-1/3">
                    Additional Info:
                  </label>
                  <div className="relative sm:w-2/3">
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
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md">
              <div className="flex items-start mb-4">
                <AlertCircle className="text-red-500 w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold">Cancel Booking</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Are you sure you want to cancel this booking? This action
                    cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  No, Keep it
                </button>
                <button
                  onClick={() => {
                    handleCancelBooking(selectedSeat);
                    setShowCancelConfirm(false);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Yes, Cancel Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelection;
