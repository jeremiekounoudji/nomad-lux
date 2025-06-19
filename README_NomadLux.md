
# 📱 Nomad Lux

**Nomad Lux** is a mobile-first property listing and booking platform with an Instagram-inspired layout. Users can browse top and nearby properties, like and share listings, and request bookings. Admins manage content, users, and bookings through a dedicated dashboard.

---

## 🔧 Tech Stack

### Frontend
- **Framework**: vite.js
- **UI Library**: Tailwind CSS + hero UI
- **State Management**: Zustand or Redux Toolkit
- **Media Handling**:  Firebase Storage
- **Date & Time**: date-fns
- **Map Integration**: Mapbox or Leaflet.js with OpenStreetMap

### Backend
-**Firebase**: database
- **Authentication**: Firebase Auth 
- **Storage**: Firebase Storage

---

## 📚 App Features

### 👤 Users
- View **Top Properties** (Story-like UI)
- View **Nearby Properties**
- Like and share properties
- Submit a property via 3-step form:
  1. **Host Details** (name, phone, email)
  2. **Property Info** (name, description, type, amenities, price/night, lat/lng, etc.)
  3. **Media Upload** (minimum 4 images and 1 video)
- View personal:
  - Listings
  - Bookings (with state: pending, accepted, rejected)
  - Liked properties
  - Profile page
  - Booking calendar
- Booking:
  - Select Check-in/Check-out Date & Time
  - Automatic total calculation
  - Cancel or pay booking

### 🛠 Admin Panel
- Approve/reject property submissions
- Manage:
  - Users
  - Bookings
  - Properties
  - Payment methods

---

## 🧱 Key Pages & Components

### Pages
- `/` – Home (Top + Nearby Properties)
- `/property/[id]` – Property Details
- `/add-property` – Property submission form
- `/profile` – User profile
- `/bookings` – Booking management
- `/liked` – Liked properties
- `/admin` – Admin dashboard

### Components
- `PropertyCard.tsx`
- `MediaCarousel.tsx`
- `StepForm.tsx`
- `DatePicker.tsx`
- `BookingCalendar.tsx`
- `NavbarBottom.tsx`
- `AdminPanel.tsx`

---

## 🗂 Suggested Folder Structure

```
/src
  /components
  /pages
  /lib
  /hooks
  /context
  /styles
```

---

## 🔒 Roles & Permissions

| Feature                  | Guest | User | Admin |
|--------------------------|:-----:|:----:|:-----:|
| View Listings            | ✅    | ✅   | ✅    |
| Like/Share               | ❌    | ✅   | ✅    |
| Book Property            | ❌    | ✅   | ✅    |
| Add Property             | ❌    | ✅   | ✅    |
| Approve Listings         | ❌    | ❌   | ✅    |
| View All Bookings        | ❌    | ✅   | ✅    |
| Manage Properties        | ❌    | ❌   | ✅    |
| Manage Users             | ❌    | ❌   | ✅    |
| Manage Payments          | ❌    | ❌   | ✅    |

---

## 📤 Property Submission Flow

1. User fills out 3-step form
2. Admin reviews and approves the submission
3. Property becomes live

---

## 💡 Booking Flow

1. User selects property
2. Picks check-in/out date
3. Auto-calculated price
4. Submits request
5. Host accepts/rejects
6. User proceeds with payment

---

## ✅ MVP Checklist

- [ ] Mobile-first layout
- [ ] 3-step Property Form
- [ ] Property Cards
- [ ] Detail Page
- [ ] Booking System + Calendar
- [ ] Likes and Shares
- [ ] Admin Dashboard
- [ ] Profile and Management pages

---

## 🚀 Future Features

- Filters & tags
- Google Maps view
- Notifications (email/push)
- PWA support

---
