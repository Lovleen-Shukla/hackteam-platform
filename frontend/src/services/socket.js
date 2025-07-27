// src/services/socket.js
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {};
  }

  connect(token) {
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinTeam(teamId) {
    if (this.socket) {
      this.socket.emit('join_team', teamId);
    }
  }

  leaveTeam(teamId) {
    if (this.socket) {
      this.socket.emit('leave_team', teamId);
    }
  }

  sendMessage(teamId, message) {
    if (this.socket) {
      this.socket.emit('send_message', {
        teamId,
        senderId: localStorage.getItem('userId'),
        content: message.content,
        type: message.type
      });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user_joined', callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user_left', callback);
    }
  }

  onTeamUpdate(callback) {
    if (this.socket) {
      this.socket.on('team_update', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}



const socketInstance = new SocketService(); // ✅ named export
export default socketInstance;
