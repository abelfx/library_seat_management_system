import { Check, Clock, User, Building2, X, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { db } from "../../firebase/firebase"; // Make sure path is correct
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Floor, Seat } from "../../firebase/model/model"; // Adjust path as needed

function FloorDetailsModal({ floor, onClose }) {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZoneDetails = async () => {
      try {
        setLoading(true);
        const zonesSnapshot = await getDocs(
          collection(db, "Floor", floor.id, "zones")
        );
        const zonesData = [];

        for (const zoneDoc of zonesSnapshot.docs) {
          const seatsSnapshot = await getDocs(
            collection(db, "Floor", floor.id, "zones", zoneDoc.id, "seats")
          );

          const seats = seatsSnapshot.docs.map((seatDoc) => ({
            id: seatDoc.id,
            ...seatDoc.data(),
            seatNumber: seatDoc.data()["seat-number"],
          }));

          zonesData.push({
            id: zoneDoc.id,
            zoneName: zoneDoc.data().zoneName,
            seats: seats.sort((a, b) => a.seatNumber - b.seatNumber),
          });
        }

        setZones(
          zonesData.sort((a, b) => a.zoneName.localeCompare(b.zoneName))
        );
      } catch (err) {
        console.error("Error fetching zone details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchZoneDetails();
  }, [floor.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
      <div className="bg-white rounded-lg w-full max-w-[95%] md:max-w-4xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-3 sm:p-4 flex justify-between items-center">
          <h2 className="text-base sm:text-xl font-bold">
            Floor {floor.floorName} Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <div className="p-2 sm:p-4">
            {zones.map((zone) => (
              <div key={zone.id} className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3">
                  Zone {zone.zoneName}
                </h3>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-4">
                  {zone.seats.map((seat) => (
                    <div
                      key={seat.id}
                      className={`p-2 sm:p-3 rounded-lg text-center ${
                        seat.isBooked
                          ? new Date(seat["check-in"]) > new Date()
                            ? "bg-amber-100 border-amber-500"
                            : "bg-blue-100 border-blue-500"
                          : "bg-green-100 border-green-500"
                      } border`}
                    >
                      <div className="text-sm sm:text-base font-medium">
                        Seat {seat.seatNumber}
                      </div>
                      {seat.isBooked && (
                        <div className="text-xs mt-1">
                          {new Date(seat["check-in"]) > new Date()
                            ? "Reserved"
                            : "Occupied"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FloorCard({
  floor,
  available,
  reserved,
  occupied,
  onClick,
  onSelect,
}) {
  return (
    <div
      className="bg-black text-white border border-gray-800 rounded-lg p-3 sm:p-4 cursor-pointer hover:border-yellow-500 transition-colors"
      onClick={() => {
        onClick();
        onSelect(floor);
      }}
    >
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        <h3 className="text-lg sm:text-xl font-bold">
          Floor {floor.floorName}
        </h3>
      </div>

      <div className="flex justify-between text-sm sm:text-base">
        <div className="flex items-center gap-1 sm:gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <div>
            <div className="font-bold">{available}</div>
            <div className="text-xs sm:text-sm">Available</div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Clock className="w-4 h-4 text-yellow-500" />
          <div>
            <div className="font-bold">{reserved}</div>
            <div className="text-xs sm:text-sm">Reserved</div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <User className="w-4 h-4 text-blue-500" />
          <div>
            <div className="font-bold">{occupied}</div>
            <div className="text-xs sm:text-sm">Occupied</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SeatAvailability() {
  const [floors, setFloors] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [floorStats, setFloorStats] = useState({});
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [totalStats, setTotalStats] = useState({
    available: 0,
    reserved: 0,
    occupied: 0,
    total: 0,
  });
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [favoriteSeats, setFavoriteSeats] = useState([]);
  const [availableFavorites, setAvailableFavorites] = useState([]);
  const [selectedFavorite, setSelectedFavorite] = useState({
    floorId: "",
    zoneId: "",
    seatNumber: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch floors
        const floorsSnapshot = await getDocs(collection(db, "Floor"));
        const floorsData = floorsSnapshot.docs.map((doc) =>
          Floor.fromFirebase(doc.id, doc.data())
        );
        setFloors(floorsData);

        // Fetch zones for all floors
        const allZones = [];
        for (const floor of floorsData) {
          const zonesSnapshot = await getDocs(
            collection(db, "Floor", floor.id, "zones")
          );
          zonesSnapshot.docs.forEach((zoneDoc) => {
            allZones.push({
              id: zoneDoc.id,
              floorId: floor.id,
              name: zoneDoc.data().zoneName,
            });
          });
        }
        setZones(allZones);

        const stats = {};
        const currentReservations = [];
        const totalCounts = {
          available: 0,
          reserved: 0,
          occupied: 0,
          total: 0,
        };
        const userId = "current-user-id"; // Replace with actual user ID

        // Iterate through floors
        for (const floor of floorsData) {
          const zonesSnapshot = await getDocs(
            collection(db, "Floor", floor.id, "zones")
          );
          let floorStats = { available: 0, reserved: 0, occupied: 0 };

          // Iterate through zones
          for (const zoneDoc of zonesSnapshot.docs) {
            const seatsSnapshot = await getDocs(
              collection(db, "Floor", floor.id, "zones", zoneDoc.id, "seats")
            );

            seatsSnapshot.docs.forEach((seatDoc) => {
              const seatData = seatDoc.data();
              totalCounts.total++;

              if (!seatData.isBooked) {
                floorStats.available++;
                totalCounts.available++;
              } else {
                const checkIn = new Date(seatData["check-in"]).getTime();
                const now = new Date().getTime();

                if (now < checkIn) {
                  floorStats.reserved++;
                  totalCounts.reserved++;
                } else {
                  floorStats.occupied++;
                  totalCounts.occupied++;
                }

                // Check current user's reservations
                if (
                  seatData.userId === userId &&
                  new Date(seatData["check-out"]) >= new Date()
                ) {
                  currentReservations.push({
                    id: seatDoc.id,
                    seatNumber: seatData["seat-number"],
                    zoneId: zoneDoc.id,
                    floorId: floor.id,
                    checkIn: seatData["check-in"],
                    checkOut: seatData["check-out"],
                  });
                }
              }
            });
          }

          stats[floor.id] = floorStats;
        }

        setFloorStats(stats);
        setTotalStats(totalCounts);
        setReservations(currentReservations);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFloorSelect = (floor) => {
    navigate(`/available-seats/${floor.id}`);
  };

  const checkFavoriteSeatsAvailability = useCallback(async () => {
    const available = [];

    for (const favSeat of favoriteSeats) {
      const seatRef = collection(
        db,
        "Floor",
        favSeat.floorId,
        "zones",
        favSeat.zoneId,
        "seats"
      );
      const q = query(seatRef, where("seat-number", "==", favSeat.seatNumber));
      const seatSnapshot = await getDocs(q);

      if (!seatSnapshot.empty) {
        const seatData = seatSnapshot.docs[0].data();
        if (!seatData.isBooked) {
          available.push({
            ...favSeat,
            floorName: floors.find((f) => f.id === favSeat.floorId)?.floorName,
            zoneName: zones.find((z) => z.id === favSeat.zoneId)?.name,
          });
        }
      }
    }

    setAvailableFavorites(available);
  }, [favoriteSeats, floors, zones]);

  useEffect(() => {
    const userId = "current-user-id"; // Replace with actual user ID
    const unsubscribe = onSnapshot(
      query(collection(db, "favoriteSeats"), where("userId", "==", userId)),
      (snapshot) => {
        const favorites = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFavoriteSeats(favorites);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (favoriteSeats.length > 0) {
      const checkInterval = setInterval(checkFavoriteSeatsAvailability, 60000); // Check every minute
      checkFavoriteSeatsAvailability(); // Initial check

      return () => clearInterval(checkInterval);
    }
  }, [favoriteSeats, checkFavoriteSeatsAvailability]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Hide on mobile */}
      <aside className="hidden md:block w-64 lg:w-72 bg-black text-white fixed h-full left-0 top-0 overflow-y-auto">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 border-2 border-white rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <span className="text-xl font-bold">LibrarySeats</span>
          </div>

          {/* Navigation Links */}
          <nav className="mb-8">
            <div className="space-y-2">
              <Link
                to="/home"
                className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span className="font-medium">Home</span>
              </Link>

              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="font-medium">Profile</span>
              </Link>
            </div>
          </nav>

          {/* Divider */}
          <div className="h-px bg-white/10 mb-8"></div>

          {/* Total Statistics */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-300">
              Overall Status
            </h2>

            {/* Available */}
            <div className="bg-green-500/10 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium">Available</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">
                  {totalStats.available}
                </span>
                <span className="text-sm text-gray-400 mb-1">seats</span>
              </div>
              <div className="mt-2 bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-full rounded-full"
                  style={{
                    width: `${
                      (totalStats.available / totalStats.total) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Reserved */}
            <div className="bg-yellow-500/10 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Reserved</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">
                  {totalStats.reserved}
                </span>
                <span className="text-sm text-gray-400 mb-1">seats</span>
              </div>
              <div className="mt-2 bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-yellow-500 h-full rounded-full"
                  style={{
                    width: `${(totalStats.reserved / totalStats.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Occupied */}
            <div className="bg-blue-500/10 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Occupied</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">
                  {totalStats.occupied}
                </span>
                <span className="text-sm text-gray-400 mb-1">seats</span>
              </div>
              <div className="mt-2 bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{
                    width: `${(totalStats.occupied / totalStats.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* User's Reservations */}
            {reservations.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-300 mb-4">
                  Your Reservations
                </h2>
                <div className="space-y-3">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="bg-white/10 p-3 rounded-lg text-sm"
                    >
                      <h4 className="font-medium mb-1">
                        Zone {reservation.zoneId} - Seat{" "}
                        {reservation.seatNumber}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {new Date(reservation.checkIn).toLocaleTimeString()} -
                        {new Date(reservation.checkOut).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <button
                onClick={() => setShowFavoriteModal(true)}
                className="w-full px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                Manage Favorite Seats
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header - Show only on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black text-white z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-white rounded-lg flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <span className="text-lg font-bold">LibrarySeats</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full md:ml-64 lg:ml-72 p-4 sm:p-6 md:p-8 mt-14 md:mt-0 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Floor Overview
            </h1>
            <button
              onClick={() => setShowFavoriteModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span className="text-sm sm:text-base">Favorite Seats</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {floors.map((floor) => (
              <FloorCard
                key={floor.id}
                floor={floor}
                available={floorStats[floor.id]?.available || 0}
                reserved={floorStats[floor.id]?.reserved || 0}
                occupied={floorStats[floor.id]?.occupied || 0}
                onClick={() => setSelectedFloor(floor)}
                onSelect={handleFloorSelect}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedFloor && (
        <FloorDetailsModal
          floor={selectedFloor}
          onClose={() => setSelectedFloor(null)}
        />
      )}

      <ManageFavoritesModal
        isOpen={showFavoriteModal}
        onClose={() => setShowFavoriteModal(false)}
        floors={floors}
        zones={zones}
      />

      {availableFavorites.length > 0 && (
        <AvailabilityNotification
          seats={availableFavorites}
          onClose={() => setAvailableFavorites([])}
        />
      )}
    </div>
  );
}

const AddFavoritePopup = ({ isOpen, onClose, onAdd, floors, zones }) => {
  const [selection, setSelection] = useState({
    floorId: "",
    zoneId: "",
    seatNumber: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setSelection({ floorId: "", zoneId: "", seatNumber: "" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[95%] sm:max-w-md mx-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Add Favorite Seat
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor
              </label>
              <select
                value={selection.floorId}
                onChange={(e) =>
                  setSelection({ ...selection, floorId: e.target.value })
                }
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Floor</option>
                {floors.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    Floor {floor.floorName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone
              </label>
              <select
                value={selection.zoneId}
                onChange={(e) =>
                  setSelection({ ...selection, zoneId: e.target.value })
                }
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selection.floorId}
              >
                <option value="">Select Zone</option>
                {zones
                  .filter((zone) => zone.floorId === selection.floorId)
                  .map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      Zone {zone.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seat Number
              </label>
              <input
                type="number"
                value={selection.seatNumber}
                onChange={(e) =>
                  setSelection({ ...selection, seatNumber: e.target.value })
                }
                placeholder="Enter seat number"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selection.zoneId}
              />
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (
                  selection.floorId &&
                  selection.zoneId &&
                  selection.seatNumber
                ) {
                  onAdd(selection);
                  setSelection({ floorId: "", zoneId: "", seatNumber: "" });
                }
              }}
              disabled={
                !selection.floorId || !selection.zoneId || !selection.seatNumber
              }
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Favorite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageFavoritesModal = ({ isOpen, onClose, floors, zones }) => {
  const [favorites, setFavorites] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = "current-user-id"; // Replace with actual user ID

    if (isOpen) {
      const fetchFavorites = async () => {
        try {
          const favoritesRef = collection(db, "favoriteSeats");
          const q = query(favoritesRef, where("userId", "==", userId));
          const snapshot = await getDocs(q);
          const favoritesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFavorites(favoritesData);
        } catch (err) {
          console.error("Error fetching favorites:", err);
          setError("Failed to load favorite seats");
        }
      };

      fetchFavorites();
    }
  }, [isOpen]);

  const handleAddFavorite = async (selection) => {
    try {
      if (favorites.length >= 3) {
        alert("You can only have up to 3 favorite seats!");
        return;
      }

      const userId = "current-user-id"; // Replace with actual user ID

      // Check for duplicate
      const isDuplicate = favorites.some(
        (fav) =>
          fav.floorId === selection.floorId &&
          fav.zoneId === selection.zoneId &&
          fav.seatNumber === selection.seatNumber
      );

      if (isDuplicate) {
        alert("This seat is already in your favorites!");
        return;
      }

      await addDoc(collection(db, "favoriteSeats"), {
        userId,
        ...selection,
        createdAt: new Date().toISOString(),
      });

      // Refresh favorites list
      const favoritesRef = collection(db, "favoriteSeats");
      const q = query(favoritesRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const favoritesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFavorites(favoritesData);
      setShowAddPopup(false);
    } catch (error) {
      console.error("Error adding favorite:", error);
      setError("Failed to add favorite seat");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-2">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-[95%] sm:max-w-lg mx-auto">
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Favorite Seats
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      Floor{" "}
                      {floors.find((f) => f.id === favorite.floorId)?.floorName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Zone {favorite.zoneId} - Seat {favorite.seatNumber}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await deleteDoc(doc(db, "favoriteSeats", favorite.id));
                        setFavorites(
                          favorites.filter((f) => f.id !== favorite.id)
                        );
                      } catch (error) {
                        console.error("Error removing favorite:", error);
                      }
                    }}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}

              {favorites.length < 3 && (
                <button
                  onClick={() => setShowAddPopup(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add Favorite Seat
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 sm:p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddFavoritePopup
        isOpen={showAddPopup}
        onClose={() => setShowAddPopup(false)}
        onAdd={handleAddFavorite}
        floors={floors}
        zones={zones}
      />
    </>
  );
};

const AvailabilityNotification = ({ seats, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-white rounded-lg shadow-lg p-3 sm:p-4 max-w-md animate-slide-up mx-auto sm:mx-0">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm sm:text-base font-bold text-green-600">
          Favorite Seats Available!
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} className="sm:w-4 sm:h-4" />
        </button>
      </div>
      <div className="space-y-1 sm:space-y-2">
        {seats.map((seat, index) => (
          <div key={index} className="text-xs sm:text-sm">
            Floor {seat.floorName} - Zone {seat.zoneName} - Seat{" "}
            {seat.seatNumber}
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate(`/available-seats/${seats[0].floorId}`)}
        className="mt-3 sm:mt-4 w-full p-2 bg-green-500 text-white text-sm sm:text-base rounded-md hover:bg-green-600"
      >
        Book Now
      </button>
    </div>
  );
};
