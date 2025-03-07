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
  FormControlLabel,
  Switch,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Person as PersonIcon,
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
  const [isGroupZone, setIsGroupZone] = useState(false);
  const [minGroupSize, setMinGroupSize] = useState(2);
  const [maxGroupSize, setMaxGroupSize] = useState(8);

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
      setIsGroupZone(zone.isGroupZone || false);
      setMinGroupSize(zone.minGroupSize || 2);
      setMaxGroupSize(zone.maxGroupSize || 8);
    } else {
      setEditingZone(null);
      setZoneName("");
      setSelectedFloorId(
        filterFloorId || (floors.length > 0 ? floors[0].id : "")
      );
      setIsGroupZone(false);
      setMinGroupSize(2);
      setMaxGroupSize(8);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingZone(null);
    setZoneName("");
    setSelectedFloorId("");
    setIsGroupZone(false);
    setMinGroupSize(2);
    setMaxGroupSize(8);
  };

  const handleSaveZone = async () => {
    try {
      const zoneData = {
        zoneName,
        floorId: selectedFloorId,
        isGroupZone,
        minGroupSize: isGroupZone ? minGroupSize : null,
        maxGroupSize: isGroupZone ? maxGroupSize : null,
      };

      if (editingZone) {
        await updateZone(editingZone.id, zoneData);
      } else {
        await createZone(zoneData);
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
        // Find the zone to get its floorId
        const zone = zones.find((z) => z.id === id);
        if (zone) {
          await deleteZone(zone.floorId, id);
          if (filterFloorId) {
            fetchZonesByFloor(filterFloorId);
          } else {
            fetchZones();
          }
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
                <TableCell>Zone Type</TableCell>
                <TableCell>Group Size</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {zones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
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
                      {zone.isGroupZone ? (
                        <Tooltip title="Group Study Zone">
                          <GroupIcon color="primary" />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Individual Zone">
                          <PersonIcon />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      {zone.isGroupZone
                        ? `${zone.minGroupSize || 2} - ${
                            zone.maxGroupSize || 8
                          } people`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {zone.createdAt instanceof Date
                        ? zone.createdAt.toLocaleString()
                        : zone.createdAt
                        ? new Date(
                            zone.createdAt.seconds * 1000
                          ).toLocaleString()
                        : "N/A"}
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

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
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

          <FormControl fullWidth className="mb-4">
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

          <FormControlLabel
            control={
              <Switch
                checked={isGroupZone}
                onChange={(e) => setIsGroupZone(e.target.checked)}
                color="primary"
              />
            }
            label="Group Study Zone (No Individual Bookings)"
            className="mb-4"
          />

          {isGroupZone && (
            <Box className="p-4 border rounded mb-4">
              <Typography variant="subtitle2" className="mb-2">
                Group Size Requirements
              </Typography>
              <Box className="flex gap-4">
                <TextField
                  label="Minimum Group Size"
                  type="number"
                  value={minGroupSize}
                  onChange={(e) =>
                    setMinGroupSize(Math.max(2, parseInt(e.target.value) || 2))
                  }
                  InputProps={{ inputProps: { min: 2 } }}
                  fullWidth
                />
                <TextField
                  label="Maximum Group Size"
                  type="number"
                  value={maxGroupSize}
                  onChange={(e) =>
                    setMaxGroupSize(
                      Math.max(
                        minGroupSize,
                        parseInt(e.target.value) || minGroupSize
                      )
                    )
                  }
                  InputProps={{ inputProps: { min: minGroupSize } }}
                  fullWidth
                />
              </Box>
            </Box>
          )}
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
