
import { useState, useEffect } from "react"
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
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"
import { getFloors, createFloor, updateFloor, deleteFloor } from "../../services/firebase-service"

export default function FloorManagement() {
  const [floors, setFloors] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingFloor, setEditingFloor] = useState(null)
  const [floorName, setFloorName] = useState("")

  useEffect(() => {
    fetchFloors()
  }, [])

  const fetchFloors = async () => {
    setLoading(true)
    try {
      const floorsData = await getFloors()
      setFloors(floorsData)
    } catch (error) {
      console.error("Error fetching floors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (floor = null) => {
    if (floor) {
      setEditingFloor(floor)
      setFloorName(floor.floorName)
    } else {
      setEditingFloor(null)
      setFloorName("")
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingFloor(null)
    setFloorName("")
  }

  const handleSaveFloor = async () => {
    try {
      if (editingFloor) {
        await updateFloor(editingFloor.id, { floorName })
      } else {
        await createFloor({ floorName })
      }
      handleCloseDialog()
      fetchFloors()
    } catch (error) {
      console.error("Error saving floor:", error)
    }
  }

  const handleDeleteFloor = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this floor? This will also delete all zones and seats associated with this floor.",
      )
    ) {
      try {
        await deleteFloor(id)
        fetchFloors()
      } catch (error) {
        console.error("Error deleting floor:", error)
      }
    }
  }

  return (
    <Box>
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h5" component="h2">
          Floor Management
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Floor
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading floors...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Floor Name</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {floors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No floors found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                floors.map((floor) => (
                  <TableRow key={floor.id}>
                    <TableCell>{floor.id}</TableCell>
                    <TableCell>{floor.floorName}</TableCell>
                    <TableCell>{new Date(floor.createdAt).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenDialog(floor)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteFloor(floor.id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}


<Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingFloor ? "Edit Floor" : "Add New Floor"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Floor Name"
            type="text"
            fullWidth
            value={floorName}
            onChange={(e) => setFloorName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveFloor} color="primary" disabled={!floorName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
