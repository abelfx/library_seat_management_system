import { useState } from "react";
import { Box, Container, Typography, Paper, Tabs, Tab } from "@mui/material";
import FloorManagement from "./FloorManagement";
import ZoneManagement from "./ZoneMangement";
import SeatManagement from "./SeatManagement";
import AdminManagement from "./AdminManagement";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl" className="py-8">
      <Typography variant="h4" component="h1" className="mb-6 font-bold">
        Seat Booking Admin Dashboard
      </Typography>

      <Paper elevation={3} className="mb-8">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Floors" />
          <Tab label="Zones" />
          <Tab label="Seats" />
          <Tab label="Admins" />
        </Tabs>
      </Paper>

      <Box className="mt-4">
        {activeTab === 0 && <FloorManagement />}
        {activeTab === 1 && <ZoneManagement />}
        {activeTab === 2 && <SeatManagement />}
        {activeTab === 3 && <AdminManagement />}
      </Box>
    </Container>
  );
}
