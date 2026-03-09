# 🚗 DriveEase — Vehicle Renting System

A full-stack vehicle rental web application built with **Python Flask** and **MongoDB** as a micro project for a Non-Relational Databases course.

---

## 📋 Project Overview

DriveEase allows users to:
- Register and log in securely (passwords are bcrypt-hashed)
- Browse available vehicles with type/location filters
- Book vehicles with date selection and automatic price calculation
- View and manage their bookings
- Return rented vehicles

---

## 🗂️ Project Structure

```
Vehicle-Renting-System/
├── app.py                          # Flask entry point
├── requirements.txt
├── README.md
├── backend/
│   ├── database.py                 # MongoDB connection + seed data
│   └── routes/
│       ├── auth_routes.py          # POST /register, POST /login
│       ├── vehicle_routes.py       # GET /vehicles, POST /add_vehicle
│       └── booking_routes.py       # POST /book_vehicle, PUT /return_vehicle
├── frontend/
│   ├── index.html                  # Home page
│   ├── login.html                  # Login page
│   ├── register.html               # Registration page
│   ├── vehicles.html               # Browse & book vehicles
│   └── booking.html                # My bookings dashboard
├── css/
│   └── style.css
└── js/
    └── script.js
```

---

## 🛠️ Tech Stack

| Layer    | Technology      |
|----------|-----------------|
| Backend  | Python + Flask  |
| Database | MongoDB + PyMongo |
| Frontend | HTML + CSS + Vanilla JS |
| Security | bcrypt password hashing |

---

## ⚙️ Installation & Setup

### Step 1 — Install MongoDB
See the detailed guide below or follow official docs at https://www.mongodb.com/docs/manual/installation/

### Step 2 — Install Python dependencies
```bash
pip install -r requirements.txt
```

### Step 3 — Run the app
```bash
python app.py
```

### Step 4 — Open in browser
```
http://127.0.0.1:5000
```

---

## 🗄️ Database

- **Database name:** `vehicle_renting_system`
- **Collections:** `users`, `vehicles`, `bookings`
- Sample vehicles are auto-seeded on first run

---

## 🔌 API Endpoints

| Method | Endpoint             | Description           |
|--------|----------------------|-----------------------|
| POST   | /register            | Register new user     |
| POST   | /login               | User login            |
| GET    | /vehicles            | Get all vehicles      |
| POST   | /add_vehicle         | Add a vehicle         |
| POST   | /book_vehicle        | Create a booking      |
| PUT    | /return_vehicle      | Return a vehicle      |
| GET    | /my_bookings/<id>    | Get user bookings     |

---

## 📌 Notes
- Passwords are hashed using bcrypt — never stored in plain text
- Vehicle availability updates automatically on booking/return
- Total price is calculated based on number of days
