import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EventSeat as SeatIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LockOpen as LockOpenIcon,
} from "@mui/icons-material";
import {
  getFloors,
  getZonesByFloor,
  getSeatsByZone,
  createSeat,
  updateSeat,
  deleteSeat,
  bookSeat,
  releaseSeat,
} from "../../services/firebase-service";

export default function SeatManagement() {
  const [seats, setSeats] = useState([]);
  const [floors, setFloors] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBookDialog, setOpenBookDialog] = useState(false);
  const [editingSeat, setEditingSeat] = useState(null);
  const [seatNumber, setSeatNumber] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [filterFloorId, setFilterFloorId] = useState("");
  const [filterZoneId, setFilterZoneId] = useState("");
  const [bookingData, setBookingData] = useState({
    userId: "",
    checkIn: "",
    checkOut: "",
  });

  useEffect(() => {
    fetchFloors();
  }, []);

  useEffect(() => {
    if (filterFloorId) {
      fetchZonesByFloor(filterFloorId);
    } else {
      setZones([]);
      setFilterZoneId("");
    }
  }, [filterFloorId, zones]);

  useEffect(() => {
    if (filterZoneId) {
      fetchSeatsByZone(filterZoneId);
    } else if (filterFloorId) {
      // Could fetch all seats for a floor here if needed
      setSeats([]);
    } else {
      setSeats([]);
    }
  }, [filterZoneId]);

  const fetchFloors = async () => {
    try {
      const floorsData = await getFloors();
      setFloors(floorsData);
      if (floorsData.length > 0 && !filterFloorId) {
        setFilterFloorId(floorsData[0].id);
      }
    } catch (error) {
      console.error("Error fetching floors:", error);
    }
  };

  const fetchZonesByFloor = async (floorId) => {
    try {
      const zonesData = await getZonesByFloor(floorId);
      setZones(zonesData);
      if (zonesData.length > 0) {
        setFilterZoneId(zonesData[0].id);
      } else {
        setFilterZoneId("");
        setSeats([]);
      }
    } catch (error) {
      console.error("Error fetching zones by floor:", error);
    }
  };

  const fetchSeatsByZone = async (zoneId) => {
    setLoading(true);
    try {
      const seatsData = await getSeatsByZone(zoneId);
      setSeats(seatsData);
    } catch (error) {
      console.error("Error fetching seats by zone:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (seat = null) => {
    if (seat) {
      setEditingSeat(seat);
      setSeatNumber(seat.seatNumber);
      setSelectedFloorId(seat.floorId);
      setSelectedZoneId(seat.zoneId);
    } else {
      setEditingSeat(null);
      setSeatNumber("");
      setSelectedFloorId(filterFloorId);
      setSelectedZoneId(filterZoneId);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSeat(null);
    setSeatNumber("");
    setSelectedFloorId("");
    setSelectedZoneId("");
  };

  const handleOpenBookDialog = (seat) => {
    setEditingSeat(seat);
    setBookingData({
      userId: "",
      checkIn: new Date().toISOString().split("T")[0],
      checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
    });
    setOpenBookDialog(true);
  };

  const handleCloseBookDialog = () => {
    setOpenBookDialog(false);
    setEditingSeat(null);
    setBookingData({
      userId: "",
      checkIn: "",
      checkOut: "",
    });
  };

  const handleSaveSeat = async () => {
    try {
      if (editingSeat) {
        await updateSeat(editingSeat.id, {
          seatNumber,
          zoneId: selectedZoneId,
          floorId: selectedFloorId,
        });
      } else {
        await createSeat({
          seatNumber,
          zoneId: selectedZoneId,
          floorId: selectedFloorId,
        });
      }
      handleCloseDialog();
      if (filterZoneId) {
        fetchSeatsByZone(filterZoneId);
      }
    } catch (error) {
      console.error("Error saving seat:", error);
    }
  };

  const handleDeleteSeat = async (id) => {
    if (window.confirm("Are you sure you want to delete this seat?")) {
      try {
        await deleteSeat(id);
        if (filterZoneId) {
          fetchSeatsByZone(filterZoneId);
        }
      } catch (error) {
        console.error("Error deleting seat:", error);
      }
    }
  };

  const handleBookSeat = async () => {
    try {
      await bookSeat(editingSeat.id, bookingData);
      handleCloseBookDialog();
      if (filterZoneId) {
        fetchSeatsByZone(filterZoneId);
      }
    } catch (error) {
      console.error("Error booking seat:", error);
    }
  };

  const handleReleaseSeat = async (id) => {
    try {
      await releaseSeat(id);
      if (filterZoneId) {
        fetchSeatsByZone(filterZoneId);
      }
    } catch (error) {
      console.error("Error releasing seat:", error);
    }
  };

  const getFloorName = (floorId) => {
    const floor = floors.find((f) => f.id === floorId);
    return floor ? floor.floorName : "Unknown Floor";
  };

  const getZoneName = (zoneId) => {
    const zone = zones.find((z) => z.id === zoneId);
    return zone ? zone.zoneName : "Unknown Zone";
  };

  const getSeatStatusChip = (seat) => {
    if (seat.isBooked) {
      if (
        seat.checkIn &&
        new Date(seat.checkIn) <= new Date() &&
        (!seat.checkOut || new Date(seat.checkOut) > new Date())
      ) {
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Occupied"
            color="warning"
            size="small"
          />
        );
      }
      return (
        <Chip icon={<CancelIcon />} label="Booked" color="error" size="small" />
      );
    }
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label="Available"
        color="success"
        size="small"
      />
    );
  };

  return (
    <Box>
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h5" component="h2">
          Seat Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={!filterZoneId}
        >
          Add Seat
        </Button>
      </Box>

      <Box className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Floor</InputLabel>
          <Select
            value={filterFloorId}
            onChange={(e) => setFilterFloorId(e.target.value)}
            label="Floor"
          >
            <MenuItem value="">Select Floor</MenuItem>
            {floors.map((floor) => (
              <MenuItem key={floor.id} value={floor.id}>
                {floor.floorName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          fullWidth
          variant="outlined"
          size="small"
          disabled={!filterFloorId || zones.length === 0}
        >
          <InputLabel>Zone</InputLabel>
          <Select
            value={filterZoneId}
            onChange={(e) => setFilterZoneId(e.target.value)}
            label="Zone"
          >
            <MenuItem value="">Select Zone</MenuItem>
            {zones.map((zone) => (
              <MenuItem key={zone.id} value={zone.id}>
                {zone.zoneName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Typography>Loading seats...</Typography>
      ) : (
        <>
          {!filterZoneId ? (
            <Paper className="p-4 text-center">
              <Typography>
                Please select a floor and zone to view seats
              </Typography>
            </Paper>
          ) : seats.length === 0 ? (
            <Paper className="p-4 text-center">
              <Typography>
                No seats found in this zone. Add one to get started.
              </Typography>
            </Paper>
          ) : (
            <>
              <TableContainer component={Paper} className="mb-6">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Seat Number</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>User ID</TableCell>
                      <TableCell>Check In</TableCell>
                      <TableCell>Check Out</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {seats.map((seat) => (
                      <TableRow key={seat.id}>
                        <TableCell>{seat.seatNumber}</TableCell>
                        <TableCell>{getSeatStatusChip(seat)}</TableCell>
                        <TableCell>{seat.userId || "-"}</TableCell>
                        <TableCell>
                          {seat.checkIn
                            ? new Date(seat.checkIn).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {seat.checkOut
                            ? new Date(seat.checkOut).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(seat)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          {seat.isBooked ? (
                            <IconButton
                              color="warning"
                              onClick={() => handleReleaseSeat(seat.id)}
                              size="small"
                              title="Release Seat"
                            >
                              <LockOpenIcon />
                            </IconButton>
                          ) : (
                            <IconButton
                              color="success"
                              onClick={() => handleOpenBookDialog(seat)}
                              size="small"
                              title="Book Seat"
                            >
                              <SeatIcon />
                            </IconButton>
                          )}
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteSeat(seat.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box className="mt-6">
                <Typography variant="h6" className="mb-3">
                  Seat Map
                </Typography>
                <Paper className="p-4">
                  <Grid container spacing={2}>
                    {seats.map((seat) => (
                      <Grid item xs={6} sm={4} md={3} lg={2} key={seat.id}>
                        <Box
                          className={`p-3 rounded-md text-center cursor-pointer transition-all ${
                            seat.isBooked
                              ? seat.checkIn &&
                                new Date(seat.checkIn) <= new Date() &&
                                (!seat.checkOut ||
                                  new Date(seat.checkOut) > new Date())
                                ? "bg-yellow-500 text-white" // Occupied
                                : "bg-red-500 text-white" // Booked
                              : "bg-green-500 text-white" // Available
                          }`}
                          onClick={() =>
                            seat.isBooked
                              ? handleReleaseSeat(seat.id)
                              : handleOpenBookDialog(seat)
                          }
                        >
                          <SeatIcon className="mb-1" />
                          <Typography variant="subtitle2">
                            {seat.seatNumber}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Box>
            </>
          )}
        </>
      )}

      {/* Add/Edit Seat Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingSeat ? "Edit Seat" : "Add New Seat"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Seat Number"
            type="text"
            fullWidth
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
            className="mb-4"
          />

          <FormControl fullWidth className="mb-4">
            <InputLabel>Floor</InputLabel>
            <Select
              value={selectedFloorId}
              onChange={(e) => {
                setSelectedFloorId(e.target.value);
                setSelectedZoneId("");
                if (e.target.value) {
                  getZonesByFloor(e.target.value).then((zonesData) => {
                    setZones(zonesData);
                    if (zonesData.length > 0) {
                      setSelectedZoneId(zonesData[0].id);
                    }
                  });
                }
              }}
              label="Floor"
            >
              {floors.map((floor) => (
                <MenuItem key={floor.id} value={floor.id}>
                  {floor.floorName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={!selectedFloorId}>
            <InputLabel>Zone</InputLabel>
            <Select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              label="Zone"
            >
              {zones.map((zone) => (
                <MenuItem key={zone.id} value={zone.id}>
                  {zone.zoneName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveSeat}
            color="primary"
            disabled={!seatNumber.trim() || !selectedFloorId || !selectedZoneId}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Book Seat Dialog */}
      <Dialog open={openBookDialog} onClose={handleCloseBookDialog}>
        <DialogTitle>Book Seat {editingSeat?.seatNumber}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="User ID"
            type="text"
            fullWidth
            value={bookingData.userId}
            onChange={(e) =>
              setBookingData({ ...bookingData, userId: e.target.value })
            }
            className="mb-4"
          />

          <TextField
            margin="dense"
            label="Check In Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={bookingData.checkIn}
            onChange={(e) =>
              setBookingData({ ...bookingData, checkIn: e.target.value })
            }
            className="mb-4"
          />

          <TextField
            margin="dense"
            label="Check Out Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={bookingData.checkOut}
            onChange={(e) =>
              setBookingData({ ...bookingData, checkOut: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBookDialog}>Cancel</Button>
          <Button
            onClick={handleBookSeat}
            color="primary"
            disabled={
              !bookingData.userId ||
              !bookingData.checkIn ||
              !bookingData.checkOut
            }
          >
            Book
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
