// src/pages/StaffSupportDashboard.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ref, onValue, push, update, serverTimestamp } from "firebase/database";
import { db as database } from "../../firebase/firebase";

const StaffSupportDashboard = () => {
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    // Check if current user is staff
    const staffRef = ref(database, `staff/${currentUser?.uid}`);
    onValue(staffRef, (snapshot) => {
      if (!snapshot.exists()) {
        // Redirect non-staff users
        window.location.href = "/";
        return;
      }

      // Set staff status as online
      update(ref(database, `supportAgents/${currentUser.uid}`), {
        name: currentUser.displayName || "Library Staff",
        email: currentUser.email,
        status: "online",
        lastActive: serverTimestamp(),
      });

      // Load active chats/tickets
      const openTicketsRef = ref(database, "openTickets");
      onValue(openTicketsRef, (snapshot) => {
        const tickets = snapshot.val();
        if (tickets) {
          const ticketList = Object.entries(tickets).map(([id, ticket]) => ({
            id,
            ...ticket,
          }));
          setActiveChats(ticketList);
        } else {
          setActiveChats([]);
        }
      });
    });

    // Set staff offline on unmount
    return () => {
      if (currentUser) {
        update(ref(database, `supportAgents/${currentUser.uid}`), {
          status: "offline",
          lastActive: serverTimestamp(),
        });
      }
    };
  }, [currentUser]);

  // Load messages when a chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    const chatRef = ref(database, `chats/${selectedChat.id}/messages`);
    onValue(chatRef, (snapshot) => {
      const messages = snapshot.val();
      if (messages) {
        const messageList = Object.entries(messages).map(([id, msg]) => ({
          id,
          ...msg,
        }));
        setChatMessages(messageList);
      } else {
        setChatMessages([]);
      }
    });
  }, [selectedChat]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!selectedChat || newMessage.trim() === "") return;

    const messagesRef = ref(database, `chats/${selectedChat.id}/messages`);
    push(messagesRef, {
      text: newMessage,
      sentBy: currentUser.uid,
      senderName: currentUser.displayName || "Library Staff",
      timestamp: serverTimestamp(),
      isStaff: true,
    });

    setNewMessage("");
  };

  const closeTicket = () => {
    if (!selectedChat) return;

    // Update chat status
    update(ref(database, `chats/${selectedChat.id}`), {
      status: "closed",
      closedAt: serverTimestamp(),
      closedBy: currentUser.uid,
    });

    // Remove from open tickets
    update(ref(database, `openTickets/${selectedChat.id}`), null);

    // Add closing message
    const messagesRef = ref(database, `chats/${selectedChat.id}/messages`);
    push(messagesRef, {
      text: "This support chat has been closed. If you need further assistance, please start a new chat.",
      sentBy: "system",
      senderName: "System",
      timestamp: serverTimestamp(),
      isStaff: true,
      isSystemMessage: true,
    });

    setSelectedChat(null);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Staff Support Dashboard</h1>

      <div
        className="flex bg-white rounded-lg shadow-md"
        style={{ height: "calc(100vh - 200px)" }}
      >
        {/* Left sidebar with chat list */}
        <div className="w-1/3 border-r overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Active Support Requests</h2>
          </div>

          {activeChats.length === 0 ? (
            <p className="p-4 text-gray-500">No active support requests</p>
          ) : (
            activeChats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                  selectedChat?.id === chat.id ? "bg-blue-50" : ""
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <p className="font-medium">{chat.studentName}</p>
                <p className="text-sm text-gray-600 truncate">
                  {chat.issueType}
                </p>
                <p className="text-xs text-gray-500">
                  Started: {formatTimestamp(chat.startedAt)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Right side with chat messages */}
        <div className="w-2/3 flex flex-col">
          {selectedChat ? (
            <>
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="font-semibold">{selectedChat.studentName}</h2>
                  <p className="text-sm text-gray-600">
                    {selectedChat.issueType}
                  </p>
                </div>
                <button
                  onClick={closeTicket}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Close Ticket
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-3 max-w-3/4 ${
                      msg.isStaff ? "ml-auto mr-0" : "ml-0 mr-auto"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg ${
                        msg.isSystemMessage
                          ? "bg-gray-200 mx-auto text-center"
                          : msg.isStaff
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <div className="font-semibold text-sm">
                        {msg.senderName}
                      </div>
                      <div>{msg.text}</div>
                      <div className="text-xs text-gray-500 text-right">
                        {formatTimestamp(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="border-t p-4 flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="flex-1 p-2 border rounded-l"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a chat to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffSupportDashboard;
