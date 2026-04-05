# 🚀 HackSquad – Full Stack Hackathon Collaboration Platform

<p align="center">
  <b>Find teammates • Build together • Ship faster</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-3C873A?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-black?style=for-the-badge&logo=socket.io" />
  <img src="https://img.shields.io/badge/Auth-JWT-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

---

## 🧠 Overview

HackSquad is a **real-time hackathon collaboration platform** that helps developers:
- 👥 Discover and join teams
- 💬 Communicate instantly via live chat
- ⭐ Build credibility through peer reviews
- 🔔 Stay updated with real-time notifications

Built with a **scalable MERN architecture + Socket.IO**, it delivers a fast, responsive, and collaborative experience.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication
- Protected routes & middleware
- Secure API access

### 👤 User System
- Developer profiles
- Skill discovery & exploration

### 🤝 Team Collaboration
- Create / join / manage teams
- Team details & member tracking

### 💬 Real-Time Communication
- Socket.IO powered chat
- Instant team messaging

### 🔔 Notifications
- Live alerts for activity/events

### ⭐ Peer Reviews
- Rate teammates
- Build trust & credibility

---

## 🏗️ Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | React.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Realtime | Socket.IO |
| Auth | JWT |
| DevOps | Docker |

---

## 📁 Project Structure

```
hackteam-platform/

backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  uploads/
  server.js

frontend/
  public/
  src/
    components/
    pages/
    context/
    services/

docker-compose.yml
```

---

## ⚙️ Setup Guide

### 1️⃣ Clone Repo
```bash
git clone https://github.com/Lovleen-Shukla/hackteam-platform.git
cd hackteam-platform
```

---

### 2️⃣ Environment Variables

#### backend/.env
```
MONGO_URI=mongodb://localhost:27017/hacksquad
JWT_SECRET=your_secret_key
PORT=5000
```

#### frontend/.env
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

### 3️⃣ Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

### 4️⃣ Run App

#### 🚀 Docker (Recommended)
```bash
docker compose up --build
```

#### 💻 Local
```bash
# backend
cd backend
npm run dev

# frontend
cd frontend
npm start
```

---

## 🚀 How It Works

1. Register/Login  
2. Create or join a team  
3. Chat in real-time  
4. Collaborate & review teammates  

---

## 📌 Key Files

| File | Purpose |
|------|--------|
| server.js | Backend entry |
| db.js | DB connection |
| auth.js | JWT middleware |
| api.js | API handler |
| socket.js | Realtime logic |
| App.js | Frontend root |

---

## 🧪 Testing

```bash
npm test
```

---

## 🔮 Future Scope

- 🎥 Video / Voice chat  
- 🤖 AI teammate matching  
- 📅 Hackathon integrations  
- 📱 Mobile optimization  

---

## 📸 Demo / Screenshots

> Add screenshots or a demo link here for maximum impact

---

## 🤝 Contributing

PRs are welcome!

```bash
1. Fork repo
2. Create branch
3. Commit changes
4. Open PR
```

---

## 👨‍💻 Author

**Lovleen Shukla**  
🔗 GitHub: https://github.com/Lovleen-Shukla  

---

## ⭐ Support

If you like this project, give it a ⭐ and share it!

---

## 💡 Tip for Recruiters

This project demonstrates:
- Full-stack MERN development
- Real-time systems using WebSockets
- Scalable API design
- Authentication & security practices
