# ⚡ VoteChain — Secure MERN Stack E-Voting System

VoteChain is a modern, secure, and scalable **E-Voting Portal** built using the **MERN Stack** — **MongoDB**, **Express.js**, **React.js**, and **Node.js**.

It delivers a secure digital voting experience with **role-based authentication**, **double-voting prevention**, **real-time result visualization**, and a premium **glassmorphism UI**.

---

# 🔥 Key Features

## ✅ Secure Authentication & Authorization
- JWT-based login system  
- Role-based access for **Voters** and **Administrators**

## ✅ Double Voting Prevention
- Each voter can vote only once  
- Voting state is atomically stored in database  

## ✅ Anonymous Voting Ledger
- Ballot records are stored independently from user identity  
- Maintains secrecy while preserving audit logs  

## ✅ Admin Dashboard (Full CRUD)
Administrators can:
- Create elections  
- Add candidates  
- Update candidate details  
- Delete candidates  
- Monitor live results  

## ✅ Live Election Results
- Real-time vote count visualization  
- Interactive charts using **Recharts (SVG)**  

## ✅ Modern UI/UX
- Dark mode glassmorphism design  
- Mobile responsive  
- Smooth animations  
- Premium interface aesthetics  

---

# 🛠 Tech Stack

## Frontend
- React.js  
- Vite  
- React Router  
- Context API  
- Recharts  
- CSS3 / Glassmorphism UI  

## Backend
- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- JWT Authentication  
- REST APIs  

---

# 📁 Project Structure

```bash
E-Voting-System/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
└── README.md

---

⚙️ Installation & Setup

Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)

---

Backend Setup

cd backend
npm install
npm run dev

Create ".env" file:

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/evoting
JWT_SECRET=your_jwt_secret
ADMIN_SECRET_KEY=admin_secret_key

Backend runs at:

http://localhost:5000

---

Frontend Setup

cd frontend
npm install
npm run dev

Frontend runs at:

http://localhost:5173

---

🗳 Voting Workflow

1. Admin Registration

- Register as Administrator
- Provide valid admin secret key
- Access Admin Dashboard

2. Create Election & Candidates

Admin can:

- Create elections
- Add candidate photos
- Add party symbols

3. Voter Registration

- Register as Voter
- Login to dashboard

4. Cast Vote

- Choose election
- Select candidate
- Confirm vote

5. Instant Results

After voting:

- Ballot gets locked
- Vote recorded permanently
- Live chart appears

---

🔐 Security Highlights

- JWT authentication
- Protected API routes
- Role-based route guards
- Duplicate vote prevention
- Anonymous ballot ledger
- Secure admin registration

---

🚀 Future Improvements

- Blockchain-based vote storage
- Aadhaar / biometric verification
- OTP verification
- Email notifications
- AI-based fraud detection
- Deployment on cloud infrastructure

---

📌 GitHub Repository

🔗 GitHub: https://github.com/Manasa-Bhimireddy/E-Voting-System

🌐 Live Demo

Add deployment link here after hosting.

---

👨‍💻 Developer

Built with ❤️ by Bhimireddy Manasa

