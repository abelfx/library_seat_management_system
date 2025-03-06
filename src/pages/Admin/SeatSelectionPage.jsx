import { useState } from "react";
import SeatSelection from "./SeatSelection";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { bookSeat } from "../../services/firebase-service";

export default function SeatSelectionPage() {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [bookingData, setBookingData] = useState({
    userId: "",
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
  });
  const [bookingComplete, setBookingComplete] = useState(false);

  const handleSeatSelect = (seat) => {
    setSelectedSeat(seat);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleBookSeat = async () => {
    try {
      await bookSeat(selectedSeat.id, bookingData);
      setOpenDialog(false);
      setBookingComplete(true);
    } catch (error) {
      console.error("Error booking seat:", error);
      alert("Failed to book seat: " + error.message);
    }
  };

  return (
    <Box className="p-4">
      {bookingComplete ? (
        <Paper className="p-6 max-w-md mx-auto text-center">
          <Typography variant="h5" className="mb-4">
            Booking Confirmed!
          </Typography>
          <Typography className="mb-4">
            You have successfully booked Seat {selectedSeat.seatNumber}.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setBookingComplete(false);
              setSelectedSeat(null);
            }}
          >
            Book Another Seat
          </Button>
        </Paper>
      ) : (
        <SeatSelection onSeatSelect={handleSeatSelect} />
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Book Seat {selectedSeat?.seatNumber}</DialogTitle>
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
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
