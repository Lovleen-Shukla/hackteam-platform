// src/components/Chat/ChatBox.js (COMPLETE & VERIFIED)
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, XCircle } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import socketService from '../../services/socket';
import { messagesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../Common/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ChatBox = ({ teamId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!teamId || !user) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await messagesAPI.getMessages(teamId, { limit: 50 });
        setMessages(response.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        setError('Failed to load messages. Please try again.');
        toast.error('Failed to load chat messages.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    socketService.joinTeam(teamId);

    const handleNewMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.leaveTeam(teamId);
      socketService.removeAllListeners();
    };
  }, [teamId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageData = {
      content: newMessage.trim(),
      senderId: user.id,
      type: 'text',
    };

    socketService.sendMessage(teamId, messageData);
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prevMsg) => prevMsg + emojiObject.emoji);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] bg-gray-900 rounded-lg">
        <Loader size={32} color="text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-gray-900 rounded-lg text-red-400">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="text-primary mt-2">Reload Chat</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-xl shadow-inner border border-gray-700/50">
      {/* Messages Display Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Start a conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-end gap-3 ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender._id !== user.id && (
                <img
                  src={msg.sender.profile?.avatar || `https://ui-avatars.com/api/?name=${msg.sender.username}&background=random`}
                  alt={msg.sender.username}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div
                className={`flex flex-col p-3 rounded-lg max-w-[70%] ${
                  msg.sender._id === user.id
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-lighttext rounded-bl-none'
                }`}
              >
                {msg.sender._id !== user.id && (
                  <span className="text-sm font-semibold mb-1 text-blue-200">
                    {msg.sender.profile?.firstName || msg.sender.username}
                  </span>
                )}
                <p className="text-base break-words">{msg.content}</p>
                <span className={`text-xs mt-1 ${msg.sender._id === user.id ? 'text-blue-200/80' : 'text-gray-400'}`}>
                  {format(new Date(msg.createdAt), 'h:mm a')}
                </span>
              </div>
              {msg.sender._id === user.id && (
                <img
                  src={user.profile?.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" width="100%" height={300} />
          </motion.div>
        )}
      </AnimatePresence>


      {/* Message Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700/50 flex items-center gap-3 rounded-b-xl">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-400 hover:text-primary transition-colors"
          title="Pick an emoji"
        >
          {showEmojiPicker ? <XCircle className="h-6 w-6" /> : <Smile className="h-6 w-6" />}
        </button>
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-primary transition-colors"
          title="Attach file (coming soon)"
          disabled
        >
          <Paperclip className="h-6 w-6" />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 p-3 focus:outline-none focus:ring-2 focus:ring-secondary"
        />
        <button
          type="submit"
          className="p-3 bg-primary rounded-lg text-white hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newMessage.trim()}
          title="Send message"
        >
          <Send className="h-6 w-6" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox; // <--- This line is critical!