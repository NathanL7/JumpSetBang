import React, { useEffect, useState } from "react";
import { useAuth } from "./authContext";
import { useNavigate } from "react-router-dom";
import "./SocialPage.css";

function SocialPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Redirect to login if user is null
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch users
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5050/users");
        const data = await response.json();
        setUsers(data.filter((u) => u.username !== user?.username));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [user]);

  // Fetch messages
  useEffect(() => {
    if (!user || !selectedUser) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5050/messages/${user.username}/${selectedUser}`
        );
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);

    return () => clearInterval(interval);
  }, [user, selectedUser]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedUser) return;

    try {
      const response = await fetch("http://127.0.0.1:5050/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: user.username,
          receiver: selectedUser,
          contents: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage("");
      } else {
        console.error("Error sending message:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle joining an event
  const joinEvent = async (eventId, inviter) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5050/events/${eventId}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user.username,
            inviter: inviter,
          }),
        }
      );

      if (response.ok) {
        alert("You have successfully joined the event!");
      } else {
        const errorData = await response.json();
        alert(`Error joining event: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error joining event:", error);
      alert("An error occurred while joining the event.");
    }
  };

  // Render messages with different types
  const renderMessages = () =>
    messages.map((msg) => {
      const isSent = msg.sender === user.username;
      const time = new Date(msg.datetime).toLocaleString();
      let content;
      let backgroundColor = "";
      let messageKey = msg.message_id;

      try {
        const contentObj = JSON.parse(msg.contents);

        if (contentObj.type === "event_invitation") {
          const event = contentObj.event_details;
          content = (
            <>
              {isSent
                ? `You invited ${msg.receiver} to your event at ${event.location}`
                : `${msg.sender} invited you to their event at ${event.location}! ${
                    event.host === msg.sender
                      ? "(They are hosting)"
                      : `(Hosted by ${event.host})`
                  }`}
              {!isSent && (
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() => joinEvent(contentObj.event_id, msg.sender)}
                    className="join-button"
                  >
                    Join Event
                  </button>
                </div>
              )}
            </>
          );
          backgroundColor = "#f0f8ff";
        } else if (contentObj.type === "invitation_response") {
          content = isSent
            ? "You joined the event!"
            : `${msg.sender} joined your event!`;
          backgroundColor = "#f0f8ff";
        } else {
          // Unrecognized type, display contents as is
          content = msg.contents;
        }
      } catch (e) {
        // Contents is not JSON, display as is
        content = msg.contents;
      }

      return (
        <div
          key={messageKey}
          className={`message ${isSent ? "sent" : "received"}`}
          style={{ backgroundColor }}
        >
          <div className="message-content">{content}</div>
          <div className="message-time">{time}</div>
        </div>
      );
    });

  return (
    <div className="social-page">
      <div className="header">
        <h2>Messaging System</h2>
        {user && <div className="balance">Balance: ${user.total_budget}</div>}
      </div>
      <div className="messaging-container">
        <div className="users-list">
          <h3>Users</h3>
          {users.map((u) => (
            <div
              key={u.username}
              className={`user-item ${
                u.username === selectedUser ? "active" : ""
              }`}
              onClick={() => setSelectedUser(u.username)}
            >
              {u.name} ({u.username})
            </div>
          ))}
        </div>
        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="messages">{renderMessages()}</div>
              <form onSubmit={handleSendMessage}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  required
                />
                <button type="submit">Send</button>
              </form>
            </>
          ) : (
            <p>Select a user to start messaging</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SocialPage;
