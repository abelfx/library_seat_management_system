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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-yellow-500 p-4 bg-black text-white">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-white flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <span className="text-xl font-bold">EduWave</span>
          </div>
          <nav className="flex gap-6">
            <Link to="#" className="hover:text-yellow-500">
              Home
            </Link>
            <Link to="#" className="hover:text-yellow-500">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-black">Available Seats</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Guide and Reservations */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-black">Status Guide</h2>
            <div className="space-y-4 text-black">
              <div className="flex items-center gap-2">
                <Check className="text-green-500" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-yellow-500" />
                <span>Reserved</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="text-blue-500" />
                <span>Occupied</span>
              </div>
            </div>

            {/* Reserved Card */}
            {reservations.length > 0 && (
              <div className="bg-black text-white border border-gray-800 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-4">Reserved</h3>
                {reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="bg-white text-black p-4 rounded-lg mb-2"
                  >
                    <h4 className="font-bold">
                      Zone {reservation.zoneId} Seat {reservation.seatNumber}
                    </h4>
                    <p className="text-sm">
                      Check-in Time:{" "}
                      {new Date(reservation.checkIn).toLocaleTimeString()} LT
                    </p>
                    <p className="text-sm">
                      Check-out Time:{" "}
                      {new Date(reservation.checkOut).toLocaleTimeString()} LT
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Floor Cards - First Column */}
          <div className="space-y-6">
            {floors.slice(0, Math.ceil(floors.length / 2)).map((floor) => (
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

          {/* Floor Cards - Second Column */}
          <div className="space-y-6">
            {floors.slice(Math.ceil(floors.length / 2)).map((floor) => (
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

        {/* Modal */}
        {selectedFloor && (
          <FloorDetailsModal
            floor={selectedFloor}
            onClose={() => setSelectedFloor(null)}
          />
        )}
      </main>
    </div>
  );
}
