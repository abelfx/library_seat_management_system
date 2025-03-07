// LiveChatSupport.js
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ref, push, onValue, serverTimestamp } from "firebase/database";
import { db as database } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

const LiveChatSupport = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [supportAgents, setSupportAgents] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Issue types for dropdown
  const issueTypes = [
    "Booking Cancellation Dispute",
    "Seat Reservation Issue",
    "System Error During Booking",
    "Double Booking Problem",
    "Other Booking Related Issue",
  ];

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Create a chat session or connect to existing one
    const userChatRef = ref(database, `chats/${currentUser.uid}`);
    const supportRef = ref(database, "supportAgents");

    // Check for online support agents
    onValue(supportRef, (snapshot) => {
      const agents = snapshot.val();
      if (agents) {
        const onlineAgents = Object.entries(agents)
          .filter(([_, agent]) => agent.status === "online")
          .map(([id, agent]) => ({ id, ...agent }));
        setSupportAgents(onlineAgents);
        setIsConnected(onlineAgents.length > 0);
      }
    });

    // Load existing messages
    onValue(userChatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data.messages || {}).map(
          ([id, msg]) => ({
            id,
            ...msg,
          })
        );
        setMessages(messageList);

        // Set the issue if it exists
        if (data.issueType) {
          setSelectedIssue(data.issueType);
        }
      }
    });

    // Cleanup
    return () => {
      // Optional: Update user status when leaving chat
    };
  }, [currentUser, navigate]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = (e) => {
    e.preventDefault();

    if (message.trim() === "") return;

    // If this is the first message, create the chat with the issue type
    if (messages.length === 0) {
      const userChatRef = ref(database, `chats/${currentUser.uid}`);

      // Set initial chat data
      const initialChatData = {
        startedAt: serverTimestamp(),
        studentId: currentUser.uid,
        studentName: currentUser.displayName || "Anonymous Student",
        studentEmail: currentUser.email,
        issueType: selectedIssue,
        status: "active",
      };

      // Update chat data in database
      onValue(
        userChatRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            // Only set if the chat doesn't exist yet
            const updates = {};
            updates[`chats/${currentUser.uid}`] = initialChatData;

            // Also add to open tickets list for staff to see
            updates[`openTickets/${currentUser.uid}`] = {
              studentName: currentUser.displayName || "Anonymous Student",
              issueType: selectedIssue,
              startedAt: serverTimestamp(),
            };

            // Use update to set multiple paths at once
            import("firebase/database").then(({ update, getDatabase }) => {
              update(ref(getDatabase()), updates);
            });
          }
        },
        { onlyOnce: true }
      );
    }

    // Add message to chat
    const messagesRef = ref(database, `chats/${currentUser.uid}/messages`);
    push(messagesRef, {
      text: message,
      sentBy: currentUser.uid,
      senderName: currentUser.displayName || "You",
      timestamp: serverTimestamp(),
      isStaff: false,
    });

    setMessage("");
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!currentUser) {
    return <div className="p-4">Please log in to access support chat.</div>;
  }

  // If there are no messages yet, show the issue selection form
  if (messages.length === 0 && !selectedIssue) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Library Support Chat</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            What issue are you experiencing?
          </h2>
          <select
            value={selectedIssue}
            onChange={(e) => setSelectedIssue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            required
          >
            <option value="">Select an issue type</option>
            {issueTypes.map((issue) => (
              <option key={issue} value={issue}>
                {issue}
              </option>
            ))}
          </select>

          <button
            onClick={() => {}}
            disabled={!selectedIssue}
            className={`px-4 py-2 rounded ${
              selectedIssue
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-500"
            }`}
          >
            Start Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Library Support Chat</h1>

      <div className="flex items-center mb-4">
        <div
          className={`w-3 h-3 rounded-full mr-2 ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        <span>
          {isConnected ? "Support Staff Online" : "Waiting for Support Staff"}
        </span>
      </div>

      {selectedIssue && (
        <div className="bg-blue-50 p-2 rounded mb-4">
          <strong>Issue Type:</strong> {selectedIssue}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md h-96 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>
                No messages yet. Start the conversation by sending a message
                about your booking issue.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 max-w-3/4 ${
                  msg.isStaff ? "ml-0 mr-auto" : "ml-auto mr-0"
                }`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    msg.isStaff ? "bg-gray-100" : "bg-blue-100"
                  }`}
                >
                  <div className="font-semibold text-sm">{msg.senderName}</div>
                  <div>{msg.text}</div>
                  <div className="text-xs text-gray-500 text-right">
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="border-t p-4 flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 p-2 border rounded-l"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r"
            disabled={!selectedIssue}
          >
            Send
          </button>
        </form>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Support hours: Monday-Friday 8:00 AM - 8:00 PM</p>
        <p>
          For urgent issues outside these hours, please call: (555) 123-4567
        </p>
      </div>
    </div>
  );
};

export default LiveChatSupport;
