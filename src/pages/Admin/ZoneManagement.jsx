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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  getFloors,
  getZones,
  getZonesByFloor,
  createZone,
  updateZone,
  deleteZone,
} from "../../services/firebase-service";

export default function ZoneManagement() {
  const [zones, setZones] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneName, setZoneName] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [filterFloorId, setFilterFloorId] = useState("");

  useEffect(() => {
    fetchFloors();
    fetchZones();
  }, []);

  useEffect(() => {
    if (filterFloorId) {
      fetchZonesByFloor(filterFloorId);
    } else {
      fetchZones();
    }
  }, [filterFloorId]);

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

  const fetchZones = async () => {
    setLoading(true);
    try {
      const zonesData = await getZones();
      setZones(zonesData);
    } catch (error) {
      console.error("Error fetching zones:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchZonesByFloor = async (floorId) => {
    setLoading(true);
    try {
      const zonesData = await getZonesByFloor(floorId);
      setZones(zonesData);
    } catch (error) {
      console.error("Error fetching zones by floor:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (zone = null) => {
    if (zone) {
      setEditingZone(zone);
      setZoneName(zone.zoneName);
      setSelectedFloorId(zone.floorId);
    } else {
      setEditingZone(null);
      setZoneName("");
      setSelectedFloorId(
        filterFloorId || (floors.length > 0 ? floors[0].id : "")
      );
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingZone(null);
    setZoneName("");
    setSelectedFloorId("");
  };

  const handleSaveZone = async () => {
    try {
      if (editingZone) {
        await updateZone(editingZone.id, {
          zoneName,
          floorId: selectedFloorId,
        });
      } else {
        await createZone({
          zoneName,
          floorId: selectedFloorId,
        });
      }
      handleCloseDialog();
      if (filterFloorId) {
        fetchZonesByFloor(filterFloorId);
      } else {
        fetchZones();
      }
    } catch (error) {
      console.error("Error saving zone:", error);
    }
  };

  const handleDeleteZone = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this zone? This will also delete all seats associated with this zone."
      )
    ) {
      try {
        await deleteZone(id);
        if (filterFloorId) {
          fetchZonesByFloor(filterFloorId);
        } else {
          fetchZones();
        }
      } catch (error) {
        console.error("Error deleting zone:", error);
      }
    }
  };

  const getFloorName = (floorId) => {
    const floor = floors.find((f) => f.id === floorId);
    return floor ? floor.floorName : "Unknown Floor";
  };

  return (
    <Box>
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h5" component="h2">
          Zone Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={floors.length === 0}
        >
          Add Zone
        </Button>
      </Box>

      <Box className="mb-4">
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Filter by Floor</InputLabel>
          <Select
            value={filterFloorId}
            onChange={(e) => setFilterFloorId(e.target.value)}
            label="Filter by Floor"
          >
            <MenuItem value="">All Floors</MenuItem>
            {floors.map((floor) => (
              <MenuItem key={floor.id} value={floor.id}>
                {floor.floorName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Typography>Loading zones...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Zone Name</TableCell>
                <TableCell>Floor</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {zones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {floors.length === 0
                      ? "No floors found. Create a floor first."
                      : "No zones found. Create one to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                zones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell>{zone.id}</TableCell>
                    <TableCell>{zone.zoneName}</TableCell>
                    <TableCell>{getFloorName(zone.floorId)}</TableCell>
                    <TableCell>
                      {new Date(zone.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(zone)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteZone(zone.id)}
                        size="small"
                      >
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
        <DialogTitle>{editingZone ? "Edit Zone" : "Add New Zone"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Zone Name"
            type="text"
            fullWidth
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            className="mb-4"
          />
          <FormControl fullWidth>
            <InputLabel>Floor</InputLabel>
            <Select
              value={selectedFloorId}
              onChange={(e) => setSelectedFloorId(e.target.value)}
              label="Floor"
            >
              {floors.map((floor) => (
                <MenuItem key={floor.id} value={floor.id}>
                  {floor.floorName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveZone}
            color="primary"
            disabled={!zoneName.trim() || !selectedFloorId}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
