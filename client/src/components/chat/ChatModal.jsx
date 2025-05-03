import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getMessages } from "../../apis/mesageApi";
import { 
  IconButton, 
  Avatar, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button,
  Tooltip,
  Badge,
  CircularProgress
} from "@mui/material";
import { 
  Delete as DeleteIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Circle as CircleIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Custom styled components with Hogwarts theme
const MessagePaper = styled(Paper)(({ theme, isown }) => ({
  padding: theme.spacing(1.5),
  borderRadius: isown ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
  maxWidth: '75%',
  backgroundColor: isown 
    ? 'rgba(210, 180, 140, 0.9)' // Parchment color for own messages
    : 'rgba(55, 47, 38, 0.9)', // Dark brown for others' messages
  color: isown 
    ? '#1e1a16' // Dark text for own messages
    : '#f8f1e5', // Light parchment text for others
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  transition: 'all 0.2s ease',
  border: isown 
    ? '1px solid rgba(210, 180, 140, 0.5)'
    : '1px solid rgba(110, 90, 70, 0.5)',
}));

const NameText = styled(Typography)(({ theme }) => ({
  color: 'rgba(238, 221, 187, 0.7)', // Subtle gold for names
  fontSize: '0.75rem',
  fontWeight: 500,
  marginBottom: theme.spacing(0.5),
  fontStyle: 'italic',
}));

const TimeText = styled(Typography)(({ theme }) => ({
  color: 'rgba(238, 221, 187, 0.6)', // Lighter gold for timestamps
  fontSize: '0.65rem',
  textAlign: 'right',
  marginTop: theme.spacing(0.5),
}));

const ChatModal = ({ isOpen, onClose }) => {
  const { boardID } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSentTime, setLastSentTime] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const socket = io(import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:3001", {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: user?.accessToken
      }
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket server");
      setSocketConnected(true);
      socket.emit("joinBoard", boardID);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setSocketConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("Connection error. Please refresh the page.");
    });

    socket.on("newMessage", (message) => {
      console.log("Received new message:", message);
      setMessages((prev) => [...prev, message].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      ));
    });

    socket.on("deletedMessage", (deletedMessageId) => {
      console.log("Received deleted message ID:", deletedMessageId);
      setMessages((prev) => prev.filter((msg) => msg._id !== deletedMessageId));
    });

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const messages = await getMessages(boardID);
        setMessages(messages);
        setError(null);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError("Failed to load messages. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("newMessage");
      socket.off("deletedMessage");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isOpen, boardID, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const currentTime = Date.now();
    if (!newMessage.trim() || !user || !socketRef.current || currentTime - lastSentTime < 1000) {
      return;
    }
    setLastSentTime(currentTime);

    const messageData = {
      boardId: boardID,
      sender: {
        _id: user.uid,
        name: user.name || "Anonymous",
        username: user.username,
        avatar: user.photoURL || "",
      },
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      socketRef.current.emit("sendMessage", messageData);
      setNewMessage("");
      setError(null);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (socketRef.current) {
      socketRef.current.emit("deleteMessage", { messageId, boardId: boardID });
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <Box
        onClick={onClose}
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(2px)',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
          maxWidth: 450,
          background: 'linear-gradient(to bottom, #1e1a16, #372f26)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
          borderLeft: '1px solid #d2b48c',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: '#d2b48c',
            borderBottom: '1px solid #d2b48c',
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontFamily: '"Harry Potter", cursive',
              textShadow: '1px 1px 2px #000'
            }}
          >
            Hogwarts Chat
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            
            <IconButton 
              onClick={onClose} 
              sx={{ 
                color: '#d2b48c',
                '&:hover': {
                  color: '#f8f1e5',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
          }}
        >
          {isLoading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%' 
            }}>
              <CircularProgress sx={{ color: '#d2b48c' }} />
            </Box>
          ) : error ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: '#ff6b6b'
            }}>
              <Typography>{error}</Typography>
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'rgba(210, 180, 140, 0.7)'
            }}>
              <Typography>No messages yet. Start the conversation!</Typography>
            </Box>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender.username === user?.username;
              return (
                <Box
                  key={message._id}
                  sx={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <MessagePaper isown={isOwnMessage ? 1 : 0}>
                    {!isOwnMessage && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Avatar
                          src={message.sender.avatar}
                          sx={{ 
                            width: 24, 
                            height: 24,
                            border: '1px solid rgba(210, 180, 140, 0.5)'
                          }}
                        />
                        <NameText>
                          {message.sender.name || message.sender.username || "Anonymous"}
                        </NameText>
                      </Box>
                    )}
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                      {message.text}
                    </Typography>
                    <TimeText>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </TimeText>
                    {isOwnMessage && (
                      <Tooltip title="Delete message">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteMessage(message._id)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            color: 'rgba(30, 26, 22, 0.7)',
                            '&:hover': {
                              color: '#d32f2f',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </MessagePaper>
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2,
            borderTop: '1px solid #d2b48c',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          {error && (
            <Typography 
              variant="caption" 
              sx={{ 
                mb: 1, 
                display: 'block',
                color: '#ff6b6b'
              }}
            >
              {error}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write your message..."
              disabled={isLoading || !socketConnected}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: 'rgba(55, 47, 38, 0.7)',
                  color: '#f8f1e5',
                  '& fieldset': {
                    borderColor: 'rgba(210, 180, 140, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(210, 180, 140, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(210, 180, 140, 0.7)',
                  },
                },
                '& .MuiInputBase-input': {
                  py: 1.5,
                },
              }}
              inputProps={{
                maxLength: 500,
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!newMessage.trim() || isLoading || !socketConnected}
              sx={{
                minWidth: 'auto',
                px: 2,
                borderRadius: 1,
                backgroundColor: '#d2b48c',
                color: '#1e1a16',
                '&:hover': {
                  backgroundColor: 'rgba(210, 180, 140, 0.8)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(210, 180, 140, 0.3)',
                },
              }}
              endIcon={<SendIcon fontSize="small" />}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatModal;