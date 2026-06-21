# ⚡ VoteChain - MERN Stack E-Voting System

Welcome to **VoteChain**, a premium, secure, and modern E-Voting Portal designed using the MERN stack (MongoDB, Express, React, Node.js). 

This project provides a cryptographically secure voting process featuring real-time graphical result counts, admin nominee management (CRUD), role-based authorization, and a stunning dark-mode glassmorphism interface.

---

## 🚀 Key Features

- **Double-Voting Prevention**: Every voter profile tracks voting state atomically. Once cast, the ballot is finalized, preventing duplicate submissions.
- **Ballot Anonymity**: Voter logs are recorded as decoupled timestamps to maintain voter secrecy while preserving full ledger auditing logs.
- **Real-Time Data Visualization**: Dynamically displays election results using interactive SVG bar charts via **Recharts** for voters who have cast their ballots and administrators.
- **Role-Based Routing**: Restricts administrative controls (candidate creation, profile updates, and removals) to verified commission profiles.
- **Glassmorphism Interface**: An ultra-premium, dark-themed UI featuring custom typography, party-specific accent gradients, micro-animations, and full mobile-responsive layouts.

---

## 📁 Repository Structure

```
E-Voting-System/
├── backend/
│   ├── config/db.js               # MongoDB connection handler
│   ├── controllers/               # API endpoints processing auth & candidates
│   ├── middleware/authMiddleware.js # JWT verification and access checks
│   ├── models/                    # Mongoose database models (User, Candidate)
│   ├── routes/                    # Route binders mapping API paths
│   ├── .env                       # Environment parameters configuration
│   └── server.js                  # Application entry point
├── frontend/
│   ├── src/
│   │   ├── components/            # UI pieces (Navbar, Cards, Recharts Results)
│   │   ├── context/AuthContext.jsx # Global auth wrapper and API client
│   │   ├── pages/                 # Full views (Login, Register, Dash, Admin)
│   │   ├── App.jsx                # Router config and structure
│   │   ├── App.css                # Style sheet containing component structures
│   │   ├── index.css              # Global colors, designs, and resets
│   │   └── main.jsx               # React bootstrapping
│   ├── index.html                 # Main template index file
│   └── vite.config.js             # Vite configuration
└── README.md                      # Documentation
```

---

## 🛠️ Step-by-Step Setup

### Prerequisites
- **Node.js** (v18.x or above recommended)
- **MongoDB** (running locally on port `27017` or a MongoDB Atlas cloud URI)

### 1. Database & Backend Configuration
1. Go to the `backend/` folder.
2. Verify or update the environment configurations inside `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/evoting
   JWT_SECRET=your_jwt_secret_key_change_me
   ADMIN_SECRET_KEY=admin_registration_secret_key
   ```
   *(Note: The `ADMIN_SECRET_KEY` is required when registering a new Administrator account to prevent unauthorized accounts).*

### 2. Booting Backend Server
To install dependencies and start the backend development server:
```bash
cd backend
npm install
npm run dev
```
The server will boot in development mode on `http://localhost:5000`.

### 3. Booting Frontend Web Portal
Open a new shell, then install dependencies and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
The client portal will open on `http://localhost:5173`. Open this URL in your web browser.

---

## 🗳️ Testing & Workflow Verification

1. **Admin Setup**: 
   - Open the app and navigate to **Register Credentials**.
   - Select the **Administrator** role.
   - Enter your name, email, password, and the `admin_registration_secret_key` (matches the `ADMIN_SECRET_KEY` in `backend/.env`).
   - Click **Register**. You will be directed to the Admin Dashboard.
2. **Add Nominees**:
   - In the **Admin Panel**, add 2 or 3 candidates with their respective parties (e.g. "Alliance Blue Party", "Democratic Red Party", "Green Environmentalist Party").
3. **Register Voters**:
   - Logout from the Admin account.
   - Click **Register Credentials** and create a standard **Voter** account (do not select Administrator).
   - Once registered, you will enter the Voter Dashboard.
4. **Cast Ballot**:
   - You will see the list of candidates with **Cast Vote** actions.
   - Select a candidate and click **Cast Vote**. Confirm the browser warning modal.
   - The UI will immediately update: the voting buttons will disappear, a success receipt will display, and the interactive results chart will render showing the live tally!
5. **Double-Voting Guard Check**:
   - Refresh the page. You will see that you are still marked as **BALLOT RECORDED** and cannot vote again.
