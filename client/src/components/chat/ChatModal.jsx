import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getMessages } from "../../apis/mesageApi";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

const ChatModal = ({ isOpen, onClose }) => {
  const { boardID } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSentTime, setLastSentTime] = useState(0);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:3001", {
      withCredentials: true,
    });

    socketRef.current.emit("joinBoard", boardID);

    socketRef.current.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on("deletedMessage", (deletedMessageId) => {
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
      socketRef.current?.disconnect();
    };
  }, [isOpen, boardID]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const currentTime = Date.now();
    if (!newMessage.trim() || !user || !socketRef.current || currentTime - lastSentTime < 2000) {
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
    // Optimistic update
    setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    
    if (socketRef.current) {
      socketRef.current.emit("deleteMessage", { messageId, boardId: boardID });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-[#1e1a16] to-[#372f26] shadow-2xl">
        <div className="h-full flex flex-col border-l border-yellow-600">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-yellow-600 bg-black/30">
            <h3 className="text-xl font-harry text-yellow-300">Hogwarts Chat</h3>
            <button
              onClick={onClose}
              className="text-yellow-300 hover:text-yellow-500 focus:outline-none"
              aria-label="Close chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="text-center text-yellow-300">Loading messages...</div>
            ) : error ? (
              <div className="text-center text-red-400">{error}</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-yellow-300">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender.username === user?.username;
                return (
                  <div key={message._id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`relative max-w-xs p-3 rounded-lg ${
                        isOwnMessage ? "bg-yellow-600 text-black" : "bg-gray-700 text-white"
                      }`}
                    >
                      {!isOwnMessage && (
                        <div className="font-semibold text-lg text-yellow-300">
                          {message.sender.name || message.sender.username || "Anonymous"}
                        </div>
                      )}
                      <div>{message.text}</div>
                      <div className="text-xs opacity-70 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                      {isOwnMessage && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteMessage(message._id)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            color: "black",
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-yellow-600 bg-black/30">
            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write your message..."
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold rounded-lg transition disabled:opacity-50"
                disabled={!newMessage.trim() || isLoading}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;