"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
  _id: string;
  sender: { username: string };
  recipient: { username: string };
  content: string;
  timestamp: string;
}

interface User {
  _id: string;
  username: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");

  const [token, setToken] = useState("");
  const [name, setName] = useState<any>("");
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    setName(username);
    if (storedToken) {
      setToken(storedToken);
      fetchUsers(storedToken);
      fetchMessages(storedToken);
    } else {
      router.push("/login");
    }
  }, []);

  const fetchUsers = async (authToken: string) => {
    const username = localStorage.getItem("username");
    try {
      const response = await axios.get("/api/users/list", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // Exclude the current logged-in user from the list
      const filteredUsers = response.data.filter(
        (user: User) => user.username !== username
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchMessages = async (authToken: string) => {
    try {
      const response = await axios.get("/api/messages/list", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      alert("Please select a recipient");
      return;
    }
    try {
      await axios.post(
        "/api/messages/send",
        { recipientId: selectedUser, content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage("");
      fetchMessages(token);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <header className="bg-neutral-900 p-4 flex items-center justify-between shadow-md">
        <h1 className="text-2xl font-bold">Chat App</h1>
        <div className="flex gap-2 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            viewBox="0 0 24 24"
            width="24px"
            height="24px"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <h2 className="text-xl">{name}</h2>
        </div>
      </header>
      <main className="flex-grow flex overflow-hidden">
        <aside className="w-64 bg-neutral-800 p-4 overflow-y-auto flex flex-col justify-between shadow-lg">
          <div>
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <ul>
              {users.map((user) => (
                <li
                  key={user._id}
                  className={`cursor-pointer p-2 rounded ${
                    selectedUser === user._id
                      ? "bg-blue-600"
                      : "hover:bg-neutral-700"
                  }`}
                  onClick={() => setSelectedUser(user._id)}
                >
                  {user.username}
                </li>
              ))}
            </ul>
          </div>
          <Link href="/login">
            <div className="flex gap-2 items-center cursor-pointer hover:text-blue-500 transition-colors duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
              >
                <path d="M10 9v6h4v5h-9V4h9v5h-4zm7.071-3.071L15.657 8.343 18.314 11H8v2h10.314l-2.657 2.657 1.414 1.414 5.657-5.657-5.657-5.657z" />
              </svg>
              <span>Log Out</span>
            </div>
          </Link>
        </aside>
        <section className="flex-grow flex flex-col p-4">
          <div className="flex-grow overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.sender.username === name
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`p-4 rounded-2xl max-w-xs ${
                    message.sender.username === name
                      ? "bg-blue-500 text-white"
                      : "bg-neutral-700 text-gray-300"
                  }`}
                >
                  <span className="font-bold">
                    {message.sender.username !== name &&
                      message.sender.username + ": "}
                  </span>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow bg-neutral-700 text-white p-4 rounded-l-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-4 rounded-r-2xl hover:bg-blue-700 transition-colors duration-300"
            >
              Send
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
