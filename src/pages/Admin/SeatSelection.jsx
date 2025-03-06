import { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid, Button, Chip } from "@mui/material";
import { CheckCircle, Cancel, EventSeat } from "@mui/icons-material";
import {
  getFloors,
  getZonesByFloor,
  getSeatsByZone,
} from "../../services/firebase-service";

export default function SeatSelection({ onSeatSelect }) {
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [zones, setZones] = useState([]);
  const [seats, setSeats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => {
    fetchFloors();
  }, []);

  useEffect(() => {
    if (selectedFloor) {
      fetchZonesByFloor(selectedFloor.id);
    }
  }, [selectedFloor]);

  const fetchFloors = async () => {
    try {
      const floorsData = await getFloors();
      setFloors(floorsData);
      if (floorsData.length > 0) {
        setSelectedFloor(floorsData[0]);
      }
    } catch (error) {
      console.error("Error fetching floors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchZonesByFloor = async (floorId) => {
    setLoading(true);
    try {
      const zonesData = await getZonesByFloor(floorId);
      setZones(zonesData);

      // Fetch seats for each zone
      const seatsMap = {};
      for (const zone of zonesData) {
        const zoneSeats = await getSeatsByZone(zone.id);
        seatsMap[zone.id] = zoneSeats;
      }
      setSeats(seatsMap);
    } catch (error) {
      console.error("Error fetching zones and seats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (!seat.isBooked) {
      setSelectedSeat(seat);
      if (onSeatSelect) {
        onSeatSelect(seat);
      }
    }
  };

  const getSeatStatusClass = (seat) => {
    if (seat.isBooked) {
      if (
        seat.checkIn &&
        new Date(seat.checkIn) <= new Date() &&
        (!seat.checkOut || new Date(seat.checkOut) > new Date())
      ) {
        return "bg-yellow-500 text-white"; // Occupied
      }
      return "bg-red-500 text-white"; // Booked
    }
    return "bg-green-500 text-white hover:bg-green-600"; // Available
  };

  const getSeatIcon = (seat) => {
    if (seat.isBooked) {
      if (
        seat.checkIn &&
        new Date(seat.checkIn) <= new Date() &&
        (!seat.checkOut || new Date(seat.checkOut) > new Date())
      ) {
        return (
          <Chip
            icon={<EventSeat />}
            label="Occupied"
            color="warning"
            size="small"
          />
        );
      }
      return (
        <Chip icon={<Cancel />} label="Booked" color="error" size="small" />
      );
    }
    return (
      <Chip
        icon={<CheckCircle />}
        label="Available"
        color="success"
        size="small"
      />
    );
  };

  if (loading && floors.length === 0) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box className="w-full max-w-4xl mx-auto">
      <Typography variant="h4" component="h1" className="text-center mb-6">
        Seat Selection
      </Typography>
      <Typography variant="subtitle1" className="text-center mb-8">
        Select your preferred seat
      </Typography>

      <Box className="flex justify-center gap-4 mb-6">
        {floors.map((floor) => (
          <Button
            key={floor.id}
            variant={selectedFloor?.id === floor.id ? "contained" : "outlined"}
            onClick={() => setSelectedFloor(floor)}
          >
            {floor.floorName}
          </Button>
        ))}
      </Box>

      <Box className="mb-8">
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Box className="flex items-center gap-2">
              <Box className="w-4 h-4 rounded-full bg-green-500"></Box>
              <Typography>Available: Seat is free for booking</Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box className="flex items-center gap-2">
              <Box className="w-4 h-4 rounded-full bg-red-500"></Box>
              <Typography>Booked: Reserved but not checked in</Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box className="flex items-center gap-2">
              <Box className="w-4 h-4 rounded-full bg-yellow-500"></Box>
              <Typography>Occupied: User has checked in</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {zones.map((zone) => (
        <Paper key={zone.id} className="mb-6 p-4">
          <Typography variant="h6" className="mb-4 font-bold">
            {zone.zoneName}
          </Typography>

          <Grid container spacing={2}>
            {seats[zone.id]?.map((seat) => (
              <Grid item xs={6} sm={4} md={3} key={seat.id}>
                <Box
                  className={`p-3 rounded-md text-center cursor-pointer transition-all ${getSeatStatusClass(
                    seat
                  )} ${
                    selectedSeat?.id === seat.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => handleSeatClick(seat)}
                >
                  <Typography variant="subtitle1" className="font-bold">
                    Seat {seat.seatNumber}
                  </Typography>
                  <Box className="mt-2">{getSeatIcon(seat)}</Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}

      {selectedSeat && (
        <Box className="mt-6 text-center">
          <Typography variant="h6">
            Selected: Seat {selectedSeat.seatNumber}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            className="mt-2"
            onClick={() => onSeatSelect && onSeatSelect(selectedSeat)}
          >
            Confirm Selection
          </Button>
        </Box>
      )}
    </Box>
  );
}
