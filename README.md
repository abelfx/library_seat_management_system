# 📚 LibrarySeats - Library Seat Booking System

A modern, real-time library seat booking system built with Vite, React, and Firebase.

## 🌟 Features

### User Features

- **Authentication**
  - Email/Password login
  - Google Sign-in
  - Protected routes for authenticated users
- **Seat Management**

  - Real-time seat availability tracking
  - Floor-wise seat visualization
  - Status indicators (Available ✅, Reserved 🕒, Occupied 👤)
  - Favorite seats with notifications

- **Profile Management**
  - User profile with basic information
  - Booking history
  - Active reservations tracking

### Admin Features

- **Seat Administration**
  - Manage floors and zones
  - Add/remove seats
  - Monitor seat status
- **User Management**
  - View user details
  - Handle booking issues
  - Access usage analytics

## 🛠️ Technology Stack

- **Frontend**

  - Vite (React)
  - Tailwind CSS
  - Framer Motion
  - Lucide Icons

- **Backend**
  - Firebase Authentication
  - Cloud Firestore
  - Firebase Hosting

## 📱 UI Components

### Pages

1. **Landing Page**

   - Introduction to LibrarySeats
   - Feature showcase
   - Quick access to login/signup

2. **Authentication**

   - Login with email/password
   - Google sign-in integration
   - Password recovery
   - Email verification

3. **Home Dashboard**

   - Real-time floor overview
   - Seat availability statistics
   - Quick booking access
   - Favorite seats management

4. **Profile Page**
   - User information
   - Active bookings
   - Booking history
   - Account settings

### Features Implementation

#### Real-time Seat Tracking

```javascript
// Firestore Collections Structure
floors/
  ├── floorId/
  │   ├── name: string
  │   ├── zones/
  │   │   ├── zoneId/
  │   │   │   ├── name: string
  │   │   │   ├── seats/
  │   │   │   │   ├── seatId/
  │   │   │   │   │   ├── number: number
  │   │   │   │   │   ├── status: "available" | "reserved" | "occupied"
  │   │   │   │   │   ├── userId: string (if booked)
  │   │   │   │   │   ├── checkIn: timestamp
  │   │   │   │   │   └── checkOut: timestamp
```

#### Favorite Seats System

```javascript
favoriteSeats/
  ├── favoriteId/
  │   ├── userId: string
  │   ├── floorId: string
  │   ├── zoneId: string
  │   ├── seatNumber: number
  │   └── createdAt: timestamp
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
   \`\`\`bash
   git clone https://github.com/GDGAAU/Library_Seat_Booking_System.git
   cd Library_Seat_Booking_System
   \`\`\`

2. Install dependencies
   \`\`\`bash
   npm install
   \`\`\`

3. Set up Firebase configuration
   Create a \`.env\` file in the root directory:
   \`\`\`env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   \`\`\`

4. Run the development server
   \`\`\`bash
   npm run dev
   \`\`\`

## 📝 Project Structure

```
src/
├── components/        # Reusable UI components
├── firebase/         # Firebase configuration and utilities
├── pages/           # Application pages
│   ├── Auth/        # Authentication related pages
│   ├── home/        # Main dashboard
│   └── Profile/     # User profile
├── App.jsx          # Main application component
└── main.jsx        # Application entry point
```

## 🔒 Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Seat bookings
    match /floors/{floorId}/zones/{zoneId}/seats/{seatId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && !exists(/databases/$(database)/documents/bookings/$(request.auth.uid))
        || request.auth.token.admin == true;
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
