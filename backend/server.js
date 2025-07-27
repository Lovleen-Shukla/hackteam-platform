// backend/server.js (COMPLETE AND CORRECTED for Rate Limiting)
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Ensure models are available for direct use if needed in server.js (e.g., for socket.io message saving)
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/reviews', require('./routes/reviews')); 

// Rate limiting
// =============================================================================
// ADJUSTED RATE LIMIT FOR DEVELOPMENT
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600 
});
app.use('/api/', limiter); // Apply rate limiting to all /api routes
// =============================================================================

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // <--- ADD THIS LINE

// Database connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackteam';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));



// =============================================================================
// API ROUTES
// =============================================================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
// =============================================================================

// Socket.io connection handling
io.on('connection', (socket) => {
  //console.log('User connected:', socket.id);

  socket.on('join_team', (teamId) => {
    socket.join(teamId);
    //console.log(`User joined team room: ${teamId}`);
  });

  socket.on('leave_team', (teamId) => {
    socket.leave(teamId);
   // console.log(`User left team room: ${teamId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const message = new Message({
        team: data.teamId,
        sender: data.senderId,
        content: data.content,
        type: data.type || 'text'
      });

      await message.save();
      await message.populate('sender', 'username profile.firstName profile.lastName profile.avatar');

      io.to(data.teamId).emit('new_message', message);
    } catch (error) {
      console.error('Error sending message via socket:', error);
    }
  });

  socket.on('disconnect', () => {
    //console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware (good to keep at the end)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});