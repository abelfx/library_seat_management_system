import { Check, Clock, User, Building2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase"; // Make sure path is correct
import { collection, getDocs, query, where } from "firebase/firestore";
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Floor {floor.floorName} Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <div className="p-4">
            {zones.map((zone) => (
              <div key={zone.id} className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Zone {zone.zoneName}
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {zone.seats.map((seat) => (
                    <div
                      key={seat.id}
                      className={`p-3 rounded-lg text-center ${
                        seat.isBooked
                          ? new Date(seat["check-in"]) > new Date()
                            ? "bg-amber-100 border-amber-500"
                            : "bg-blue-100 border-blue-500"
                          : "bg-green-100 border-green-500"
                      } border`}
                    >
                      <div className="font-medium">Seat {seat.seatNumber}</div>
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
      className="bg-black text-white border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-yellow-500 transition-colors"
      onClick={() => {
        onClick(); // For modal
        onSelect(floor); // For navigation
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="text-white" />
        <h3 className="text-xl font-bold">Floor {floor.floorName}</h3>
      </div>

      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Check className="text-green-500" />
          <div>
            <div className="text-lg font-bold">{available}</div>
            <div className="text-sm">Available</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="text-yellow-500" />
          <div>
            <div className="text-lg font-bold">{reserved}</div>
            <div className="text-sm">Reserved</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <User className="text-blue-500" />
          <div>
            <div className="text-lg font-bold">{occupied}</div>
            <div className="text-sm">Occupied</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SeatAvailability() {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [floorStats, setFloorStats] = useState({});
  const [selectedFloor, setSelectedFloor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch floors
        const floorsSnapshot = await getDocs(collection(db, "Floor"));
        const floorsData = floorsSnapshot.docs.map((doc) =>
          Floor.fromFirebase(doc.id, doc.data())
        );
        setFloors(floorsData);

        // Fetch stats and current user's reservations
        const stats = {};
        const currentReservations = [];
        const now = new Date().toISOString();
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

              // Calculate stats
              if (!seatData.isBooked) {
                floorStats.available++;
              } else {
                const checkIn = new Date(seatData["check-in"]).getTime();
                const now = new Date().getTime();

                if (now < checkIn) {
                  floorStats.reserved++;
                } else {
                  floorStats.occupied++;
                }

                // Check if this is current user's reservation
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="flex justify-center items-center h-screen">
          <div className="text-gray-900">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white py-4 px-6 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <div className="text-black text-xl font-bold">EduWave</div>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/home" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link to="/profile" className="text-gray-600 hover:text-gray-900">
            Profile
          </Link>
        </div>
      </nav>

      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Available Seats
        </h1>

        {/* Status Guide */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Status Guide
          </h2>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Check className="text-green-500" />
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-yellow-500" />
              <span className="text-gray-600">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="text-blue-500" />
              <span className="text-gray-600">Occupied</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Reserved Section */}
        {reservations.length > 0 && (
          <div className="bg-black text-white rounded-lg p-4 mb-8">
            <h3 className="text-xl font-bold mb-4">Reserved</h3>
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-gray-800 rounded p-4">
                <div className="text-sm">
                  <div>
                    Zone {reservation.zoneId} Seat {reservation.seatNumber}
                  </div>
                  <div>
                    Check-in Time:{" "}
                    {new Date(reservation.checkIn).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    LT
                  </div>
                  <div>
                    Check-out Time:{" "}
                    {new Date(reservation.checkOut).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    LT
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {floors.map((floor) => (
            <div
              key={floor.id}
              className="bg-black text-white rounded-lg p-4 cursor-pointer hover:ring-2 hover:ring-yellow-500 transition-all"
              onClick={() => {
                setSelectedFloor(floor);
                handleFloorSelect(floor);
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="text-white" />
                <h3 className="text-xl font-bold">Floor {floor.floorName}</h3>
              </div>

              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Check className="text-green-500" />
                  <div>
                    <div className="text-lg font-bold">
                      {floorStats[floor.id]?.available || 0}
                    </div>
                    <div className="text-sm text-gray-300">Available</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="text-yellow-500" />
                  <div>
                    <div className="text-lg font-bold">
                      {floorStats[floor.id]?.reserved || 0}
                    </div>
                    <div className="text-sm text-gray-300">Reserved</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="text-blue-500" />
                  <div>
                    <div className="text-lg font-bold">
                      {floorStats[floor.id]?.occupied || 0}
                    </div>
                    <div className="text-sm text-gray-300">Occupied</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedFloor && (
          <FloorDetailsModal
            floor={selectedFloor}
            onClose={() => setSelectedFloor(null)}
          />
        )}
      </div>
    </div>
  );
}
