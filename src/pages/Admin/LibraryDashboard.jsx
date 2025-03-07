// import React, { useState, useEffect } from 'react';
// import {
//   collection,
//   getDocs,
//   doc,
//   updateDoc,
//   setDoc,
//   query,
//   where,
//   onSnapshot,
//   Timestamp,
//   orderBy,
//   limit,
//   getDoc,
//   deleteDoc
// } from 'firebase/firestore';
// import { db } from '../firebase-config';
// import {
//   Grid,
//   Paper,
//   Typography,
//   Tabs,
//   Tab,
//   Box,
//   Button,
//   Divider,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   Switch,
//   FormControlLabel,
//   Tooltip,
//   Snackbar,
//   Alert,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Card,
//   CardContent,
//   CardHeader,
//   Badge
// } from '@mui/material';
// import {
//   Dashboard as DashboardIcon,
//   Event as EventIcon,
//   Assessment as AssessmentIcon,
//   Settings as SettingsIcon,
//   Notifications as NotificationsIcon,
//   Block as BlockIcon,
//   Warning as WarningIcon,
//   People as PeopleIcon,
//   Timer as TimerIcon,
//   Logout as LogoutIcon,
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   Edit as EditIcon,
//   Refresh as RefreshIcon,
//   Search as SearchIcon,
//   Message as MessageIcon,
//   HourglassEmpty as HourglassEmptyIcon,
//   AccessTime as AccessTimeIcon
// } from '@mui/icons-material';
// import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// // Heat map component for seat utilization
// const HeatMap = ({ data }) => {
//   const colors = [
//     '#e6f7ff', // Barely used
//     '#91d5ff', // Light use
//     '#40a9ff', // Moderate use
//     '#1890ff', // High use
//     '#096dd9', // Very high use
//   ];

//   return (
//     <div className="grid grid-cols-10 gap-1">
//       {data.map((seat, index) => (
//         <Tooltip key={index} title={`Seat ${seat.id}: Used ${seat.usagePercentage}% of time`}>
//           <div
//             className="w-8 h-8 flex items-center justify-center text-xs rounded cursor-pointer"
//             style={{
//               backgroundColor: colors[Math.floor(seat.usagePercentage / 20)],
//               color: seat.usagePercentage > 60 ? 'white' : 'black'
//             }}
//           >
//             {seat.id}
//           </div>
//         </Tooltip>
//       ))}
//     </div>
//   );
// };

// function AdminDashboard() {
//   // State management
//   const [tabValue, setTabValue] = useState(0);
//   const [seats, setSeats] = useState([]);
//   const [floors, setFloors] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [violations, setViolations] = useState([]);
//   const [selectedFloor, setSelectedFloor] = useState('');
//   const [openDialog, setOpenDialog] = useState(false);
//   const [dialogType, setDialogType] = useState('');
//   const [formData, setFormData] = useState({});
//   const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
//   const [policies, setPolicies] = useState({
//     maxBookingHours: 4,
//     checkInTimeMinutes: 15,
//     extensionAllowed: true,
//     maxExtensionHours: 2,
//     autoReleaseUnused: true,
//     autoReleaseMinutes: 15
//   });

//   // Fetch data from Firebase
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       // Fetch floors
//       const floorsSnapshot = await getDocs(collection(db, 'floors'));
//       const floorsData = floorsSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setFloors(floorsData);

//       if (floorsData.length > 0) {
//         setSelectedFloor(floorsData[0].id);
//       }

//       // Fetch policies
//       const policiesDoc = await getDoc(doc(db, 'admin', 'policies'));
//       if (policiesDoc.exists()) {
//         setPolicies(policiesDoc.data());
//       } else {
//         // Create default policies if they don't exist
//         await setDoc(doc(db, 'admin', 'policies'), policies);
//       }
//     };

//     fetchInitialData();

//     // Set up real-time listeners
//     const bookingsListener = onSnapshot(
//       query(collection(db, 'bookings'), where('status', 'in', ['active', 'pending'])),
//       (snapshot) => {
//         const bookingsData = snapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           timestamp: doc.data().timestamp?.toDate()
//         }));
//         setBookings(bookingsData);

//         // Auto-release seats logic (would normally be in a Cloud Function)
//         const now = new Date();
//         bookingsData.forEach(async (booking) => {
//           if (booking.status === 'pending' &&
//               booking.timestamp &&
//               (now - booking.timestamp) / (1000 * 60) > policies.autoReleaseMinutes) {
//             await updateDoc(doc(db, 'bookings', booking.id), {
//               status: 'auto-released'
//             });
//             await updateDoc(doc(db, 'seats', booking.seatId), {
//               status: 'available'
//             });
//           }
//         });
//       }
//     );

//     const usersListener = onSnapshot(
//       collection(db, 'users'),
//       (snapshot) => {
//         const usersData = snapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setUsers(usersData);
//       }
//     );

//     const violationsListener = onSnapshot(
//       collection(db, 'violations'),
//       (snapshot) => {
//         const violationsData = snapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           timestamp: doc.data().timestamp?.toDate()
//         }));
//         setViolations(violationsData);
//       }
//     );

//     return () => {
//       bookingsListener();
//       usersListener();
//       violationsListener();
//     };
//   }, [policies.autoReleaseMinutes]);

//   // Fetch seats when selected floor changes
//   useEffect(() => {
//     if (selectedFloor) {
//       const seatsListener = onSnapshot(
//         query(collection(db, 'seats'), where('floorId', '==', selectedFloor)),
//         (snapshot) => {
//           const seatsData = snapshot.docs.map(doc => ({
//             id: doc.id,
//             ...doc.data()
//           }));
//           setSeats(seatsData);
//         }
//       );

//       return () => seatsListener();
//     }
//   }, [selectedFloor]);

//   // Handle tab change
//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };

//   // Handle dialog opens
//   const handleOpenDialog = (type, data = {}) => {
//     setDialogType(type);
//     setFormData(data);
//     setOpenDialog(true);
//   };

//   // Handle dialog close
//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value
//     });
//   };

//   // Handle form submission
//   const handleSubmit = async () => {
//     try {
//       switch (dialogType) {
//         case 'blockSeat':
//           await updateDoc(doc(db, 'seats', formData.id), {
//             status: 'blocked',
//             blockReason: formData.reason,
//             blockedUntil: formData.endDate ? new Date(formData.endDate) : null
//           });
//           setAlert({ open: true, message: 'Seat blocked successfully', severity: 'success' });
//           break;

//         case 'editPolicy':
//           await updateDoc(doc(db, 'admin', 'policies'), {
//             ...formData
//           });
//           setPolicies(formData);
//           setAlert({ open: true, message: 'Policies updated successfully', severity: 'success' });
//           break;

//         case 'warnUser':
//           // Add to violations collection
//           await setDoc(doc(collection(db, 'violations')), {
//             userId: formData.userId,
//             reason: formData.reason,
//             timestamp: Timestamp.now(),
//             status: 'active'
//           });

//           // Update user record
//           const userRef = doc(db, 'users', formData.userId);
//           const userDoc = await getDoc(userRef);
//           if (userDoc.exists()) {
//             const userData = userDoc.data();
//             const warningCount = (userData.warningCount || 0) + 1;
//             await updateDoc(userRef, {
//               warningCount,
//               status: warningCount >= 3 ? 'suspended' : 'active'
//             });
//           }

//           setAlert({ open: true, message: 'Warning issued successfully', severity: 'success' });
//           break;

//         default:
//           break;
//       }
//       handleCloseDialog();
//     } catch (error) {
//       console.error('Error submitting form:', error);
//       setAlert({ open: true, message: `Error: ${error.message}`, severity: 'error' });
//     }
//   };

//   // Save policy changes
//   const savePolicies = async () => {
//     try {
//       await updateDoc(doc(db, 'admin', 'policies'), policies);
//       setAlert({ open: true, message: 'Policies saved successfully', severity: 'success' });
//     } catch (error) {
//       console.error('Error saving policies:', error);
//       setAlert({ open: true, message: `Error: ${error.message}`, severity: 'error' });
//     }
//   };

//   // Handle policy input changes
//   const handlePolicyChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setPolicies({
//       ...policies,
//       [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
//     });
//   };

//   // Get analytics data
//   const getAnalyticsData = () => {
//     // Usage by hour (mock data - in a real app, you'd calculate this from bookings)
//     const hourlyUsage = [
//       { hour: '8 AM', usage: 20 },
//       { hour: '9 AM', usage: 45 },
//       { hour: '10 AM', usage: 68 },
//       { hour: '11 AM', usage: 80 },
//       { hour: '12 PM', usage: 75 },
//       { hour: '1 PM', usage: 78 },
//       { hour: '2 PM', usage: 82 },
//       { hour: '3 PM', usage: 70 },
//       { hour: '4 PM', usage: 55 },
//       { hour: '5 PM', usage: 40 },
//       { hour: '6 PM', usage: 30 },
//     ];

//     // Seat status summary
//     const seatStatusCount = {
//       available: seats.filter(s => s.status === 'available').length,
//       occupied: seats.filter(s => s.status === 'occupied').length,
//       blocked: seats.filter(s => s.status === 'blocked').length,
//       reserved: seats.filter(s => s.status === 'reserved').length,
//     };

//     const seatStatusData = [
//       { name: 'Available', value: seatStatusCount.available },
//       { name: 'Occupied', value: seatStatusCount.occupied },
//       { name: 'Blocked', value: seatStatusCount.blocked },
//       { name: 'Reserved', value: seatStatusCount.reserved },
//     ];

//     // Seat utilization heatmap (mock data)
//     const heatmapData = seats.map((seat) => ({
//       id: seat.id,
//       usagePercentage: Math.floor(Math.random() * 100) // In real app, calculate from booking history
//     }));

//     return { hourlyUsage, seatStatusData, heatmapData };
//   };

//   // Prepare analytics data
//   const analyticsData = getAnalyticsData();

//   const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

//   // Render tab content
//   const renderTabContent = () => {
//     switch (tabValue) {
//       case 0: // Dashboard
//         return (
//           <Grid container spacing={3}>
//             {/* Summary Cards */}
//             <Grid item xs={12} md={3}>
//               <Card className="bg-blue-50">
//                 <CardContent>
//                   <Typography variant="h6" className="font-bold">Total Seats</Typography>
//                   <Typography variant="h3">{seats.length}</Typography>
//                   <Typography variant="body2" className="text-gray-600">Across {floors.length} floors</Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <Card className="bg-green-50">
//                 <CardContent>
//                   <Typography variant="h6" className="font-bold">Active Bookings</Typography>
//                   <Typography variant="h3">{bookings.filter(b => b.status === 'active').length}</Typography>
//                   <Typography variant="body2" className="text-gray-600">
//                     {bookings.filter(b => b.status === 'pending').length} pending check-in
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <Card className="bg-red-50">
//                 <CardContent>
//                   <Typography variant="h6" className="font-bold">Violations Today</Typography>
//                   <Typography variant="h3">
//                     {violations.filter(v => {
//                       const today = new Date();
//                       const violationDate = v.timestamp;
//                       return violationDate &&
//                         violationDate.getDate() === today.getDate() &&
//                         violationDate.getMonth() === today.getMonth() &&
//                         violationDate.getFullYear() === today.getFullYear();
//                     }).length}
//                   </Typography>
//                   <Typography variant="body2" className="text-gray-600">
//                     {users.filter(u => u.status === 'suspended').length} users suspended
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <Card className="bg-purple-50">
//                 <CardContent>
//                   <Typography variant="h6" className="font-bold">Usage Rate</Typography>
//                   <Typography variant="h3">
//                     {seats.length > 0 ?
//                       Math.round((seats.filter(s => s.status === 'occupied').length / seats.length) * 100) : 0}%
//                   </Typography>
//                   <Typography variant="body2" className="text-gray-600">
//                     Current occupancy
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>

//             {/* Live Seat Status */}
//             <Grid item xs={12} md={6}>
//               <Paper className="p-4">
//                 <div className="flex justify-between items-center mb-4">
//                   <Typography variant="h6" className="font-bold">Live Seat Status</Typography>
//                   <div>
//                     <FormControl variant="outlined" size="small" className="min-w-[120px]">
//                       <InputLabel>Floor</InputLabel>
//                       <Select
//                         value={selectedFloor}
//                         onChange={(e) => setSelectedFloor(e.target.value)}
//                         label="Floor"
//                       >
//                         {floors.map((floor) => (
//                           <MenuItem key={floor.id} value={floor.id}>
//                             {floor.name}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                     <IconButton onClick={() => {}} className="ml-2">
//                       <RefreshIcon />
//                     </IconButton>
//                   </div>
//                 </div>
//                 <Divider className="mb-4" />
//                 <div className="flex flex-wrap gap-2 mb-4">
//                   <Button
//                     variant="outlined"
//                     size="small"
//                     startIcon={<BlockIcon />}
//                     onClick={() => handleOpenDialog('blockSeat')}
//                   >
//                     Block Seats
//                   </Button>
//                   <Button
//                     variant="outlined"
//                     size="small"
//                     startIcon={<TimerIcon />}
//                   >
//                     Reset All Timers
//                   </Button>
//                 </div>
//                 <div className="bg-gray-100 p-4 rounded-lg">
//                   <Grid container spacing={1}>
//                     {seats.map((seat) => (
//                       <Grid item key={seat.id}>
//                         <Tooltip title={`Seat ${seat.id}: ${seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}${seat.blockReason ? ` (${seat.blockReason})` : ''}`}>
//                           <Paper
//                             className={`w-10 h-10 flex items-center justify-center cursor-pointer ${
//                               seat.status === 'available' ? 'bg-green-100' :
//                               seat.status === 'occupied' ? 'bg-red-100' :
//                               seat.status === 'blocked' ? 'bg-gray-300' :
//                               'bg-yellow-100'
//                             }`}
//                             onClick={() => handleOpenDialog('seatDetails', seat)}
//                           >
//                             {seat.status === 'occupied' ? (
//                               <Badge color="error" variant="dot">
//                                 <Typography>{seat.id}</Typography>
//                               </Badge>
//                             ) : (
//                               <Typography>{seat.id}</Typography>
//                             )}
//                           </Paper>
//                         </Tooltip>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 </div>
//                 <Box className="mt-4 flex justify-between text-sm">
//                   <span className="flex items-center">
//                     <div className="w-3 h-3 bg-green-100 rounded mr-1"></div> Available
//                   </span>
//                   <span className="flex items-center">
//                     <div className="w-3 h-3 bg-red-100 rounded mr-1"></div> Occupied
//                   </span>
//                   <span className="flex items-center">
//                     <div className="w-3 h-3 bg-yellow-100 rounded mr-1"></div> Reserved
//                   </span>
//                   <span className="flex items-center">
//                     <div className="w-3 h-3 bg-gray-300 rounded mr-1"></div> Blocked
//                   </span>
//                 </Box>
//               </Paper>
//             </Grid>

//             {/* Seat Utilization */}
//             <Grid item xs={12} md={6}>
//               <Paper className="p-4">
//                 <Typography variant="h6" className="font-bold mb-4">Seat Status Distribution</Typography>
//                 <ResponsiveContainer width="100%" height={250}>
//                   <PieChart>
//                     <Pie
//                       data={analyticsData.seatStatusData}
//                       cx="50%"
//                       cy="50%"
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                       label={({name, value}) => `${name}: ${value}`}
//                     >
//                       {analyticsData.seatStatusData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Legend />
//                     <RechartsTooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </Paper>
//             </Grid>

//             {/* Recent Activity */}
//             <Grid item xs={12} md={6}>
//               <Paper className="p-4">
//                 <Typography variant="h6" className="font-bold mb-4">Recent Activity</Typography>
//                 <TableContainer className="max-h-[300px]">
//                   <Table size="small">
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>Time</TableCell>
//                         <TableCell>User</TableCell>
//                         <TableCell>Action</TableCell>
//                         <TableCell>Seat</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {bookings.slice(0, 5).map((booking) => (
//                         <TableRow key={booking.id}>
//                           <TableCell>{booking.timestamp ? booking.timestamp.toLocaleTimeString() : 'N/A'}</TableCell>
//                           <TableCell>{booking.userId}</TableCell>
//                           <TableCell>{booking.status === 'active' ? 'Checked In' : 'Reserved'}</TableCell>
//                           <TableCell>{booking.seatId}</TableCell>
//                         </TableRow>
//                       ))}
//                       {violations.slice(0, 3).map((violation) => (
//                         <TableRow key={violation.id} className="bg-red-50">
//                           <TableCell>{violation.timestamp ? violation.timestamp.toLocaleTimeString() : 'N/A'}</TableCell>
//                           <TableCell>{violation.userId}</TableCell>
//                           <TableCell>Violation: {violation.reason}</TableCell>
//                           <TableCell>-</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </Paper>
//             </Grid>

//             {/* Active Warnings */}
//             <Grid item xs={12} md={6}>
//               <Paper className="p-4">
//                 <div className="flex justify-between items-center mb-4">
//                   <Typography variant="h6" className="font-bold">Active Warnings</Typography>
//                   <Button
//                     variant="outlined"
//                     size="small"
//                     color="warning"
//                     startIcon={<WarningIcon />}
//                     onClick={() => handleOpenDialog('warnUser')}
//                   >
//                     Issue Warning
//                   </Button>
//                 </div>
//                 <TableContainer className="max-h-[300px]">
//                   <Table size="small">
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>User</TableCell>
//                         <TableCell>Reason</TableCell>
//                         <TableCell>Issued</TableCell>
//                         <TableCell>Status</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {violations.filter(v => v.status === 'active').slice(0, 6).map((violation) => (
//                         <TableRow key={violation.id}>
//                           <TableCell>{violation.userId}</TableCell>
//                           <TableCell>{violation.reason}</TableCell>
//                           <TableCell>{violation.timestamp ? violation.timestamp.toLocaleDateString() : 'N/A'}</TableCell>
//                           <TableCell>
//                             <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
//                               Active
//                             </span>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </Paper>
//             </Grid>
//           </Grid>
//         );

//       case 1: // Seat Management
//         return (
//           <Grid container spacing={3}>
//             {/* Seat Configuration */}
//             <Grid item xs={12} md={7}>
//               <Paper className="p-4">
//                 <div className="flex justify-between items-center mb-4">
//                   <Typography variant="h6" className="font-bold">Seat Management</Typography>
//                   <div>
//                     <FormControl variant="outlined" size="small" className="min-w-[120px]">
//                       <InputLabel>Floor</InputLabel>
//                       <Select
//                         value={selectedFloor}
//                         onChange={(e) => setSelectedFloor(e.target.value)}
//                         label="Floor"
//                       >
//                         {floors.map((floor) => (
//                           <MenuItem key={floor.id} value={floor.id}>
//                             {floor.name}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </div>
//                 </div>
//                 <TableContainer className="max-h-[500px]">
//                   <Table size="small">
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>Seat ID</TableCell>
//                         <TableCell>Status</TableCell>
//                         <TableCell>Type</TableCell>
//                         <TableCell>Restrictions</TableCell>
//                         <TableCell>Actions</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {seats.map((seat) => (
//                         <TableRow key={seat.id}>
//                           <TableCell>{seat.id}</TableCell>
//                           <TableCell>
//                             <span className={`px-2 py-1 rounded text-xs ${
//                               seat.status === 'available' ? 'bg-green-100 text-green-800' :
//                               seat.status === 'occupied' ? 'bg-red-100 text-red-800' :
//                               seat.status === 'blocked' ? 'bg-gray-200 text-gray-800' :
//                               'bg-yellow-100 text-yellow-800'
//                             }`}>
//                               {seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}
//                             </span>
//                           </TableCell>
//                           <TableCell>{seat.type || 'Standard'}</TableCell>
//                           <TableCell>{seat.restrictions || 'None'}</TableCell>
//                           <TableCell>
//                             <Tooltip title="Edit Seat">
//                               <IconButton size="small" onClick={() => handleOpenDialog('editSeat', seat)}>
//                                 <EditIcon fontSize="small" />
//                               </IconButton>
//                             </Tooltip>
//                             <Tooltip title={seat.status === 'blocked' ? 'Unblock Seat' : 'Block Seat'}>
//                               <IconButton
//                                 size="small"
//                                 color={seat.status === 'blocked' ? 'primary' : 'default'}
//                                 onClick={() => handleOpenDialog('blockSeat', seat)}
//                               >
//                                 <BlockIcon fontSize="small" />
//                               </IconButton>
//                             </Tooltip>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </Paper>
//             </Grid>

//             {/* Blocked Seats */}
//             <Grid item xs={12} md={5}>
//               <Paper className="p-4">
//                 <Typography variant="h6" className="font-bold mb-4">Currently Blocked Seats</Typography>
//                 <TableContainer className="max-h-[400px]">
//                   <Table size="small">
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>Seat</TableCell>
//                         <TableCell>Reason</TableCell>
//                         <TableCell>Until</TableCell>
//                         <TableCell>Actions</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {seats.filter(s => s.status === 'blocked').map((seat) => (
//                         <TableRow key={seat.id}>
//                           <TableCell>{seat.id}</TableCell>
//                           <TableCell>{seat.blockReason || 'Administrative'}</TableCell>
//                           <TableCell>
//                             {seat.blockedUntil ? new Date(seat.blockedUntil).toLocaleDateString() : 'Indefinite'}
//                           </TableCell>
//                           <TableCell>
//                             <Tooltip title="Unblock Seat">
//                               <IconButton
//                                 size="small"
//                                 color="primary"
//                                 onClick={async () => {
//                                   await updateDoc(doc(db, 'seats', seat.id), {
//                                     status: 'available',
//                                     blockReason: null,
//                                     blockedUntil: null
//                                   });
//                                   setAlert({ open: true, message: 'Seat unblocked successfully', severity: 'success' });
//                                 }}
//                               >
//                                 <RefreshIcon fontSize="small" />
//                               </IconButton>
//                             </Tooltip>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                       {seats.filter(s => s.status === 'blocked').length === 0 && (
//                         <TableRow>
//                           <TableCell colSpan={4} className="text-center py-4 text-gray-500">
//                             No seats are currently blocked
//                           </TableCell>
//                         </TableRow>
//                       )}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>

//                 {/* Bulk Actions */}
//                 <div className="mt-6">
//                   <Typography variant="subtitle1" className="font-bold mb-2">Bulk Seat Management</Typography>
//                   <div className="grid grid-cols-2 gap-2">
//                     <Button
//                       variant="outlined"
//                       startIcon={<BlockIcon />}
//                       onClick={() => handleOpenDialog('bulkBlock')}
//                       className="text-left"
//                     >
//                       Block Multiple Seats
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       startIcon={<TimerIcon />}
//                       className="text-left"
//                     >
//                       Set Time Restrictions
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       startIcon={<PeopleIcon />}
//                       className="text-left"
//                     >
//                       Group Study Zones
//                     </Button>
//                     <Button
//                       variant="outlined"
//                       startIcon={<RefreshIcon />}
//                       className="text-left"
//                       onClick={async () => {
//                         const blockedSeats = seats.filter(s => s.status === 'blocked');
//                         for (const seat of blockedSeats) {
//                           await updateDoc(doc(db, 'seats', seat.id), {
//                             status: 'available',
//                             blockReason: null,
//                             blockedUntil: null
//                           });
//                         }
//                         setAlert({
//                           open: true,
//                           message: `Unblocked ${blockedSeats.setAlert({
//                             open: true,
//                             message: `Unblocked ${blockedSeats.length} seats successfully`,
//                             severity: 'success'
//                           })
//                         }}
//                       >
//                         Unblock All Seats
//                       </Button>
//                     </div>
//                   </div>
//                 </Paper>
//               </Grid>
//             </Grid>
//           );

//         case 2: // Analytics
//           return (
//             <Grid container spacing={3}>
//               {/* Usage by hour */}
//               <Grid item xs={12} md={8}>
//                 <Paper className="p-4">
//                   <Typography variant="h6" className="font-bold mb-4">Hourly Usage Pattern</Typography>
//                   <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={analyticsData.hourlyUsage}>
//                       <XAxis dataKey="hour" />
//                       <YAxis label={{ value: 'Occupancy %', angle: -90, position: 'insideLeft' }} />
//                       <RechartsTooltip />
//                       <Bar dataKey="usage" fill="#8884d8" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </Paper>
//               </Grid>

//               {/* Key stats */}
//               <Grid item xs={12} md={4}>
//                 <Paper className="p-4">
//                   <Typography variant="h6" className="font-bold mb-4">Key Metrics</Typography>
//                   <div className="space-y-4">
//                     <div>
//                       <Typography variant="body2" className="text-gray-600">Peak usage time</Typography>
//                       <Typography variant="h5">2:00 PM - 3:00 PM</Typography>
//                     </div>
//                     <div>
//                       <Typography variant="body2" className="text-gray-600">Average seat occupation time</Typography>
//                       <Typography variant="h5">2.3 hours</Typography>
//                     </div>
//                     <div>
//                       <Typography variant="body2" className="text-gray-600">No-show rate</Typography>
//                       <Typography variant="h5">12%</Typography>
//                     </div>
//                     <div>
//                       <Typography variant="body2" className="text-gray-600">Seats with highest demand</Typography>
//                       <Typography variant="h5">Window seats (87%)</Typography>
//                     </div>
//                   </div>
//                 </Paper>
//               </Grid>

//               {/* Heat Map */}
//               <Grid item xs={12}>
//                 <Paper className="p-4">
//                   <Typography variant="h6" className="font-bold mb-4">Seat Utilization Heat Map</Typography>
//                   <div className="flex justify-between items-center mb-4">
//                     <div className="text-sm text-gray-600">
//                       Color intensity indicates frequency of use. Darker blue = higher usage.
//                     </div>
//                     <FormControl variant="outlined" size="small" className="min-w-[120px]">
//                       <InputLabel>Floor</InputLabel>
//                       <Select
//                         value={selectedFloor}
//                         onChange={(e) => setSelectedFloor(e.target.value)}
//                         label="Floor"
//                       >
//                         {floors.map((floor) => (
//                           <MenuItem key={floor.id} value={floor.id}>
//                             {floor.name}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </div>
//                   <div className="bg-gray-50 p-4 rounded-lg">
//                     <HeatMap data={analyticsData.heatmapData} />
//                   </div>
//                   <div className="flex justify-between mt-4">
//                     <div className="flex items-center">
//                       <div className="w-4 h-4 bg-e6f7ff mr-1"></div>
//                       <Typography variant="caption">0-20%</Typography>
//                     </div>
//                     <div className="flex items-center">
//                       <div className="w-4 h-4 bg-91d5ff mr-1"></div>
//                       <Typography variant="caption">21-40%</Typography>
//                     </div>
//                     <div className="flex items-center">
//                       <div className="w-4 h-4 bg-40a9ff mr-1"></div>
//                       <Typography variant="caption">41-60%</Typography>
//                     </div>
//                     <div className="flex items-center">
//                       <div className="w-4 h-4 bg-1890ff mr-1"></div>
//                       <Typography variant="caption">61-80%</Typography>
//                     </div>
//                     <div className="flex items-center">
//                       <div className="w-4 h-4 bg-096dd9 mr-1"></div>
//                       <Typography variant="caption">81-100%</Typography>
//                     </div>
//                   </div>
//                 </Paper>
//               </Grid>

//               {/* User violation reports */}
//               <Grid item xs={12} md={6}>
//                 <Paper className="p-4">
//                   <Typography variant="h6" className="font-bold mb-4">User Violations Report</Typography>
//                   <TableContainer className="max-h-[300px]">
//                     <Table size="small">
//                       <TableHead>
//                         <TableRow>
//                           <TableCell>User ID</TableCell>
//                           <TableCell>Violations</TableCell>
//                           <TableCell>Status</TableCell>
//                           <TableCell>Action</TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {users.filter(u => u.warningCount && u.warningCount > 0).map((user) => (
//                           <TableRow key={user.id}>
//                             <TableCell>{user.id}</TableCell>
//                             <TableCell>{user.warningCount || 0}</TableCell>
//                             <TableCell>
//                               <span className={`px-2 py-1 rounded text-xs ${
//                                 user.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
//                               }`}>
//                                 {user.status === 'suspended' ? 'Suspended' : 'Warning'}
//                               </span>
//                             </TableCell>
//                             <TableCell>
//                               <Button
//                                 size="small"
//                                 variant="outlined"
//                                 onClick={() => handleOpenDialog('userDetails', user)}
//                               >
//                                 Details
//                               </Button>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </TableContainer>
//                 </Paper>
//               </Grid>

//               {/* Feedback summary */}
//               <Grid item xs={12} md={6}>
//                 <Paper className="p-4">
//                   <Typography variant="h6" className="font-bold mb-4">User Feedback Summary</Typography>
//                   <div className="bg-blue-50 p-4 rounded-lg mb-4">
//                     <Typography variant="body1" className="font-medium">Top issues reported:</Typography>
//                     <ol className="list-decimal pl-5 mt-2">
//                       <li>Noise levels in open areas (32 reports)</li>
//                       <li>Seat hogging without check-in (18 reports)</li>
//                       <li>Temperature issues in south wing (12 reports)</li>
//                       <li>Chair comfort in study rooms (8 reports)</li>
//                     </ol>
//                   </div>
//                   <Button
//                     variant="outlined"
//                     startIcon={<MessageIcon />}
//                     className="w-full"
//                   >
//                     View All Feedback Reports
//                   </Button>
//                 </Paper>
//               </Grid>
//             </Grid>
//           );

//         case 3: // Policies & Settings
//           return (
//             <Grid container spacing={3}>
//               {/* Usage Policies */}
//               <Grid item xs={12} md={6}>
//                 <Paper className="p-4">
//                   <Typography variant="h6" className="font-bold mb-4">Seat Allocation Policies</Typography>
//                   <div className="space-y-4">
//                     <div>
//                       <Typography variant="subtitle2" className="mb-1">Maximum Booking Duration</Typography>
//                       <div className="flex items-center">
//                         <TextField
//                           type="number"
//                           size="small"
//                           name="maxBookingHours"
//                           value={policies.maxBookingHours}
//                           onChange={handlePolicyChange}
//                           InputProps={{
//                             endAdornment: <Typography variant="body2" className="ml-2">hours</Typography>
//                           }}
//                           className="w-32"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <Typography variant="subtitle2" className="mb-1">Check-in Time Window</Typography>
//                       <div className="flex items-center">
//                         <TextField
//                           type="number"
//                           size="small"
//                           name="checkInTimeMinutes"
//                           value={policies.checkInTimeMinutes}
//                           onChange={handlePolicyChange}
//                           InputProps={{
//                             endAdornment: <Typography variant="body2" className="ml-2">minutes</Typography>
//                           }}
//                           className="w-32"
//                         />
//                       </div>
//                       <Typography variant="caption" className="text-gray-500">
//                         After booking, users must check in within this time window.
//                       </Typography>
//                     </div>

//                     <div>
//                       <Typography variant="subtitle2" className="mb-1">Allow Extensions</Typography>
//                       <FormControlLabel
//                         control={
//                           <Switch
//                             checked={policies.extensionAllowed}
//                             onChange={handlePolicyChange}
//                             name="extensionAllowed"
//                             color="primary"
//                           />
//                         }
//                         label="Enable extension requests"
//                       />
//                       {policies.extensionAllowed && (
//                         <div className="mt-2 ml-6">
//                           <TextField
//                             type="number"
//                             size="small"
//                             name="maxExtensionHours"
//                             value={policies.maxExtensionHours}
//                             onChange={handlePolicyChange}
//                             InputProps={{
//                               endAdornment: <Typography variant="body2" className="ml-2">hours max</Typography>
//                             }}
//                             className="w-32"
//                           />
//                         </div>
//                       )}
//                     </div>

//                     <div>
//                       <Typography variant="subtitle2" className="mb-1">Auto-Release Unused Seats</Typography>
//                       <FormControlLabel
//                         control={
//                           <Switch
//                             checked={policies.autoReleaseUnused}
//                             onChange={handlePolicyChange}
//                             name="autoReleaseUnused"
//                             color="primary"
//                           />
//                         }
//                         label="Automatically release seats if user doesn't check in"
//                       />
//                       {policies.autoReleaseUnused && (
//                         <div className="mt-2 ml-6">
//                           <TextField
//                             type="number"
//                             size="small"
//                             name="autoReleaseMinutes"
//                             value={policies.autoReleaseMinutes}
//                             onChange={handlePolicyChange}
//                             InputProps={{
//                               endAdornment: <Typography variant="body2" className="ml-2">minutes after booking</Typography>
//                             }}
//                             className="w-32"
//                           />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     className="mt-4"
//                     onClick={savePolicies}
//                   >
//                     Save Policy Changes
//                   </Button>
//                 </Paper>
//               </Grid>

//               {/* Violation Management */}
//               <Grid item xs={12} md={6}>
//                 <Paper className="p-4">
//                   <Typography variant="h6" className="font-bold mb-4">Violation Management</Typography>
//                   <div className="space-y-4">
//                     <div>
//                       <Typography variant="subtitle2" className="mb-1">Warnings Before Suspension</Typography>
//                       <TextField
//                         type="number"
//                         size="small"
//                         defaultValue={3}
//                         InputProps={{
//                           endAdornment: <Typography variant="body2" className="ml-2">warnings</Typography>
//                         }}
//                         className="w-32"
//                       />
//                     </div>

//                     <div>
//                       <Typography variant="subtitle2" className="mb-1">Suspension Duration</Typography>
//                       <TextField
//                         type="number"
//                         size="small"
//                         defaultValue={7}
//                         InputProps={{
//                           endAdornment: <Typography variant="body2" className="ml-2">days</Typography>
//                         }}
//                         className="w-32"
//                       />
//                     </div>

//                     <div>
//                       <Typography variant="subtitle2" className="mb-1">Violation Categories</Typography>
//                       <TableContainer className="max-h-[200px] mt-2">
//                         <Table size="small">
//                           <TableHead>
//                             <TableRow>
//                               <TableCell>Violation Type</TableCell>
//                               <TableCell>Warning Count</TableCell>
//                             </TableRow>
//                           </TableHead>
//                           <TableBody>
//                             <TableRow>
//                               <TableCell>No-show without cancellation</TableCell>
//                               <TableCell>1</TableCell>
//                             </TableRow>
//                             <TableRow>
//                               <TableCell>Seat hogging (leaving for >30 min)</TableCell>
//                               <TableCell>1</TableCell>
//                             </TableRow>
//                             <TableRow>
//                               <TableCell>Noise disruption</TableCell>
//                               <TableCell>1</TableCell>
//                             </TableRow>
//                             <TableRow>
//                               <TableCell>Occupying unreserved seat</TableCell>
//                               <TableCell>2</TableCell>
//                             </TableRow>
//                             <TableRow>
//                               <TableCell>Multiple bookings for one person</TableCell>
//                               <TableCell>2</TableCell>
//                             </TableRow>
//                           </TableBody>
//                         </Table>
//                       </TableContainer>
//                     </div>
//                   </div>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     className="mt-4"
//                   >
//                     Save Violation Settings
//                   </Button>
//                 </Paper>
//               </Grid>

//               {/* Notification Settings */}
//               <Grid item xs={12}>
//                 <Paper className="p-4">
//                   <Typography variant="h6" className="font-bold mb-4">Automated Notifications</Typography>
//                   <TableContainer>
//                     <Table size="small">
//                       <TableHead>
//                         <TableRow>
//                           <TableCell>Notification Type</TableCell>
//                           <TableCell>Email</TableCell>
//                           <TableCell>SMS</TableCell>
//                           <TableCell>Push</TableCell>
//                           <TableCell>Message</TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         <TableRow>
//                           <TableCell>Booking Confirmation</TableCell>
//                           <TableCell>
//                             <Switch defaultChecked size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <Switch defaultChecked size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <Switch defaultChecked size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <IconButton size="small">
//                               <EditIcon fontSize="small" />
//                             </IconButton>
//                           </TableCell>
//                         </TableRow>
//                         <TableRow>
//                           <TableCell>Check-in Reminder (15 min before)</TableCell>
//                           <TableCell>
//                             <Switch defaultChecked size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <Switch defaultChecked size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <Switch defaultChecked size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <IconButton size="small">
//                               <EditIcon fontSize="small" />
//                             </IconButton>
//                           </TableCell>
//                         </TableRow>
//                         <TableRow>
//                           <TableCell>Booking Expiry Warning (30 min before)</TableCell>
//                           <TableCell>
//                             <Switch size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <Switch defaultChecked size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <Switch defaultChecked size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <IconButton size="small">
//                               <EditIcon fontSize="small" />
//                             </IconButton>
//                           </TableCell>
//                         </TableRow>
//                         <TableRow>
//                           <TableCell>Waitlist Notification</TableCell>
//                           <TableCell>
//                             <Switch defaultChecked size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <Switch defaultChecked size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <Switch defaultChecked size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <IconButton size="small">
//                               <EditIcon fontSize="small" />
//                             </IconButton>
//                           </TableCell>
//                         </TableRow>
//                         <TableRow>
//                           <TableCell>Violation Warning</TableCell>
//                           <TableCell>
//                             <Switch defaultChecked size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <Switch size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <Switch defaultChecked size="small" />
//                           </TableCell>
//                           <TableCell>
//                             <IconButton size="small">
//                               <EditIcon fontSize="small" />
//                             </IconButton>
//                           </TableCell>
//                         </TableRow>
//                       </TableBody>
//                     </Table>
//                   </TableContainer>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     className="mt-4"
//                   >
//                     Save Notification Settings
//                   </Button>
//                 </Paper>
//               </Grid>
//             </Grid>
//           );

//         default:
//           return null;
//       }
//     };

//     // Dialogs for various actions
//     const renderDialog = () => {
//       switch (dialogType) {
//         case 'blockSeat':
//           return (
//             <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
//               <DialogTitle>Block Seat</DialogTitle>
//               <DialogContent>
//                 <div className="space-y-4 py-2">
//                   <FormControl fullWidth>
//                     <InputLabel>Select Seat</InputLabel>
//                     <Select
//                       name="id"
//                       value={formData.id || ''}
//                       onChange={handleInputChange}
//                       label="Select Seat"
//                     >
//                       {seats.filter(s => s.status !== 'blocked').map((seat) => (
//                         <MenuItem key={seat.id} value={seat.id}>
//                           Seat {seat.id}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                   <TextField
//                     label="Reason for Blocking"
//                     name="reason"
//                     value={formData.reason || ''}
//                     onChange={handleInputChange}
//                     fullWidth
//                   />
//                   <TextField
//                     label="Block Until (leave empty for indefinite)"
//                     name="endDate"
//                     type="date"
//                     value={formData.endDate || ''}
//                     onChange={handleInputChange}
//                     InputLabelProps={{
//                       shrink: true,
//                     }}
//                     fullWidth
//                   />
//                 </div>
//               </DialogContent>
//               <DialogActions>
//                 <Button onClick={handleCloseDialog}>Cancel</Button>
//                 <Button
//                   onClick={handleSubmit}
//                   variant="contained"
//                   color="primary"
//                   disabled={!formData.id}
//                 >
//                   Block Seat
//                 </Button>
//               </DialogActions>
//             </Dialog>
//           );

//         case 'warnUser':
//           return (
//             <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
//               <DialogTitle>Issue Warning to User</DialogTitle>
//               <DialogContent>
//                 <div className="space-y-4 py-2">
//                   <FormControl fullWidth>
//                     <InputLabel>Select User</InputLabel>
//                     <Select
//                       name="userId"
//                       value={formData.userId || ''}
//                       onChange={handleInputChange}
//                       label="Select User"
//                     >
//                       {users.map((user) => (
//                         <MenuItem key={user.id} value={user.id}>
//                           {user.name || user.id}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth>
//                     <InputLabel>Violation Type</InputLabel>
//                     <Select
//                       name="reason"
//                       value={formData.reason || ''}
//                       onChange={handleInputChange}
//                       label="Violation Type"
//                     >
//                       <MenuItem value="No-show without cancellation">No-show without cancellation</MenuItem>
//                       <MenuItem value="Seat hogging">Seat hogging (leaving for >30 min)</MenuItem>
//                       <MenuItem value="Noise disruption">Noise disruption</MenuItem>
//                       <MenuItem value="Occupying unreserved seat">Occupying unreserved seat</MenuItem>
//                       <MenuItem value="Multiple bookings">Multiple bookings for one person</MenuItem>
//                       <MenuItem value="Other">Other (specify)</MenuItem>
//                     </Select>
//                   </FormControl>
//                   {formData.reason === 'Other' && (
//                     <TextField
//                       label="Specify Reason"
//                       name="customReason"
//                       value={formData.customReason || ''}
//                       onChange={handleInputChange}
//                       fullWidth
//                     />
//                   )}
//                 </div>
//               </DialogContent>
//               <DialogActions>
//                 <Button onClick={handleCloseDialog}>Cancel</Button>
//                 <Button
//                   onClick={handleSubmit}
//                   variant="contained"
//                   color="warning"
//                   disabled={!formData.userId || !formData.reason}
//                 >
//                   Issue Warning
//                 </Button>
//               </DialogActions>
//             </Dialog>
//           );

//         case 'editPolicy':
//           return (
//             <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
//               <DialogTitle>Edit Usage Policies</DialogTitle>
//               <DialogContent>
//                 <div className="space-y-4 py-4">
//                   <Typography variant="subtitle1" className="font-bold">Time Limits</Typography>
//                   <div className="grid grid-cols-2 gap-4">
//                     <TextField
//                       label="Maximum Booking Hours"
//                       name="maxBookingHours"
//                       type="number"
//                       value={formData.maxBookingHours || 4}
//                       onChange={handleInputChange}
//                     />
//                     <TextField
//                       label="Check-in Window (minutes)"
//                       name="checkInTimeMinutes"
//                       type="number"
//                       value={formData.checkInTimeMinutes || 15}
//                       onChange={handleInputChange}
//                     />
//                   </div>

//                   <Typography variant="subtitle1" className="font-bold mt-2">Extensions</Typography>
//                   <FormControlLabel
//                     control={
//                       <Switch
//                         checked={formData.extensionAllowed || false}
//                         onChange={handleInputChange}
//                         name="extensionAllowed"
//                       />
//                     }
//                     label="Allow booking extensions"
//                   />
//                   {formData.extensionAllowed && (
//                     <TextField
//                       label="Maximum Extension Hours"
//                       name="maxExtensionHours"
//                       type="number"
//                       value={formData.maxExtensionHours || 2}
//                       onChange={handleInputChange}
//                       className="mt-2"
//                     />
//                   )}
//                 </div>
//               </DialogContent>
//               <DialogActions>
//                 <Button onClick={handleCloseDialog}>Cancel</Button>
//                 <Button
//                   onClick={handleSubmit}
//                   variant="contained"
//                   color="primary"
//                 >
//                   Save Changes
//                 </Button>
//               </DialogActions>
//             </Dialog>
//           );

//         default:
//           return null;
//       }
//     };

//     return (
//       <div className="p-4">
//         <Paper className="mb-4 p-4">
//           <div className="flex justify-between items-center">
//             <Typography variant="h5" className="font-bold">
//               Library Seat Management Admin
//             </Typography>
//             <div className="flex items-center">
//               <Badge badgeContent={violations.filter(v => v.status === 'active').length} color="error" className="mr-4">
//                 <NotificationsIcon />
//               </Badge>
//               <Button
//                 variant="outlined"
//                 color="error"
//                 startIcon={<LogoutIcon />}
//                 size="small"
//               >
//                 Logout
//               </Button>
//             </div>
//           </div>
//         </Paper>

//         <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//           <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
//             <Tab icon={<DashboardIcon />} label="Dashboard" />
//             <Tab icon={<EventIcon />} label="Seat Management" />
//             <Tab icon={<AssessmentIcon />} label="Analytics" />
//             <Tab icon={<SettingsIcon />} label="Policies & Settings" />
//           </Tabs>
//         </Box>

//         <Box sx={{ p: 2 }}>
//           {renderTabContent()}
//         </Box>

//         {renderDialog()}

//         <Snackbar
//           open={alert.open}
//           autoHideDuration={6000}
//           onClose={() => setAlert({ ...alert, open: false })}
//         >
//           <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity}>
//             {alert.message}
//           </Alert>
//         </Snackbar>
//       </div>
//     );
//   }

//   export default AdminDashboard;
