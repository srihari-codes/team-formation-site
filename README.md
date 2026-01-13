# 🚀 Groupify: The Ultimate Mutual-Choice Team Formation System

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Groupify** is a sophisticated, secure, and automated team formation platform designed for educational institutions. It solves the "team formation problem" by enabling students to mutually select teammates through a secure, batch-isolated environment with real-time matching logic.

---

## ✨ Key Features

### 🛡️ Secure Authentication Matrix
- **ERP Integration**: Direct bridge to institutional ERP systems for session-based authentication.
- **Three-Factor Auth**: Roll number + ERP Password -> Captcha Verification -> OTP Verification.
- **Brute Force Protection**: IP-based temporary blocking and request tracking.

### 🎯 Intelligent Team Formation
- **Mutual Consent Logic**: Teams of 3 are automatically formed ONLY when all members mutually select each other.
- **Batch Isolation**: Students can only see and interact with peers from their own academic batch.
- **Edit Limits**: Prevent selection spamming with configurable edit attempt quotas.

### 🍌 The Banana Protocol (Admin Suite)
- **Live Monitoring**: Real-time dashboard showing student matrix, unassigned students, and formed teams.
- **Phase Control**: Instant toggling of selection windows per batch.
- **Manual Overrides**: Admin-level manual team creation to bypass mutual consent when necessary.
- **Data Liberation**: One-click Excel export for all formed teams, formatted for immediate administrative use.

---

## 🛠️ Technical Architecture

### Backend (The Engines)
- **Node.js & Express**: High-performance API server.
- **Mongoose**: Robust Object Data Modeling for MongoDB.
- **JWT Security**: Multi-tier token system (Temp Tokens for OTP, Access Tokens for Session).
- **Security Hardening**: `helmet`, `hpp`, `mongo-sanitize`, and deep recursive input sanitization.

### Frontend (The Interface)
- **Vite-powered React**: Lightning-fast UI development and HMR.
- **TypeScript**: End-to-end type safety for API responses and component props.
- **Cyber-Glow UI**: A modern, dark-themed aesthetic with interactive micro-animations.
- **React Context**: Centralized authentication and state management.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- ERP Credentials (for authentication bridge)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/srihari-codes/team-formation-site.git
   cd team-formation-site
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file based on the environment variables section below
   node index.js
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## ⚙️ Environment Variables

### Backend (`/backend/.env`)
| Variable | Description |
| :--- | :--- |
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | 256-bit secret for session tokens |
| `TEMP_SECRET` | Secret for one-time OTP tokens |
| `ADMIN_KEY` | Secret key for access to `/banana` |
| `PORT` | API Port (default: 3000) |

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request or open an issue for feature requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚖️ License

Distributed under the Proprietary License. See `LICENSE` for more information.
Copyright (c) 2026 srihari-codes. All Rights Reserved.

---

<p align="center">
  Built with ❤️ by <b>srihari-codes</b>
</p>
