// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import Sidebar from "../../components/Sidebar";
// import ChatWindow from "../../components/ChatWindow";
// import MessageInput from "../../components/MessageInput";
// import { Menu } from "lucide-react";
// import { Contact, Message } from "../../types/index";
// import { socket } from "../../lib/socket";
// import { api } from "../../lib/api";

// export default function ChatPage() {
//   const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [aiMessages, setAiMessages] = useState<Message[]>([]);
//   const [currentUser, setCurrentUser] = useState<Contact | null>(null);
//   const [showSidebar, setShowSidebar] = useState(false);

//   const AI_CONTACT: Contact = {
//     id: -9999,
//     name: "AI Assistant",
//     lastMsg: "Ask the AI anything",
//     time: "",
//     online: true,
//     isAI: true,
//   };

//   const selectedRef = useRef<Contact | null>(null);
//   const currentRef = useRef<Contact | null>(null);

//   const router = useRouter();

//   useEffect(() => {
//     selectedRef.current = selectedContact;
//   }, [selectedContact]);

//   useEffect(() => {
//     currentRef.current = currentUser;
//   }, [currentUser]);

//   // 🔐 AUTH + SOCKET
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user") || "{}");
//     const token = localStorage.getItem("token");

//     if (!token || !user.id) {
//       router.push("/login");
//       return;
//     }

//     setCurrentUser({
//       id: user.id,
//       name: user.username,
//       lastMsg: "",
//       time: "",
//       online: true,
//     });

//     socket.connect();
//     socket.emit("join", user.id);

//     const handleMsg = (msg: Message) => {
//       const selected = selectedRef.current;
//       const current = currentRef.current;

//       if (!selected || !current) return;

//       const valid =
//         (msg.sender_id === selected.id && msg.receiver_id === current.id) ||
//         (msg.sender_id === current.id && msg.receiver_id === selected.id);

//       if (valid) {
//         setMessages((prev) => [...prev, msg]);
//       }
//     };

//     // 🗑️ HANDLE MESSAGE DELETION
//     const handleMessageDeleted = (deletedMsg: Message) => {
//       const selected = selectedRef.current;
//       const current = currentRef.current;

//       if (!selected || !current) return;

//       const valid =
//         (deletedMsg.sender_id === selected.id && deletedMsg.receiver_id === current.id) ||
//         (deletedMsg.sender_id === current.id && deletedMsg.receiver_id === selected.id);

//       if (valid) {
//         setMessages((prev) =>
//           prev.map((msg) =>
//             msg.id === deletedMsg.id ? { ...msg, ...deletedMsg } : msg
//           )
//         );
//       }
//     };

//     socket.on("receive_message", handleMsg);
//     socket.on("message_sent", handleMsg);
//     socket.on("message_deleted", handleMessageDeleted);

//     return () => {
//       socket.off("receive_message", handleMsg);
//       socket.off("message_sent", handleMsg);
//       socket.off("message_deleted", handleMessageDeleted);
//       socket.disconnect();
//     };
//   }, [router]);

//   // 🔄 REFRESH MESSAGES
//   const refreshMessages = async () => {
//     if (!selectedContact || !currentUser) return;

//     if (selectedContact.isAI) {
//       setMessages(aiMessages);
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");

//       const res = await api.get(
//         `/messages/history/${currentUser.id}/${selectedContact.id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       setMessages(res.data);
//     } catch (err) {
//       console.error("Refresh failed:", err);
//       setMessages([]);
//     }
//   };

//   useEffect(() => {
//     if (selectedContact?.isAI) {
//       setMessages(aiMessages);
//     }
//   }, [selectedContact, aiMessages]);

//   // 📥 AUTO LOAD HISTORY
//   useEffect(() => {
//     refreshMessages();
//   }, [selectedContact, currentUser]);

//   // 💬 SEND MESSAGE (FINAL VERSION WITH file_type AND audio_url)
//   const handleSendMessage = async (payload: any) => {
//     if (!selectedContact || !currentUser) return;

//     const messageData = {
//       sender_id: currentUser.id,
//       receiver_id: selectedContact.id,
//       message_text: payload.message_text || "",
//       file_url: payload.file_url || null,
//       file_type: payload.file_type || null, // ✅ ADDED
//       audio_url: payload.audio_url || null, // ✅ ADDED FOR VOICE MESSAGES
//     };

//     if (selectedContact.isAI) {
//       const userMessage: Message = {
//         id: Date.now(),
//         sender_id: currentUser.id,
//         receiver_id: selectedContact.id,
//         message_text: payload.message_text || "",
//         created_at: new Date().toISOString(),
//       };

//       setAiMessages((prev) => [...prev, userMessage]);
//       setMessages((prev) => [...prev, userMessage]);

//       try {
//   const response = await api.post("/ai/chat", {
//     prompt: payload.message_text,
//     userId: currentUser.id,
//   });

//   // Access the 'message_text' property inside the 'data' object returned by your controller
//   const assistantMessage: Message = {
//     id: Date.now() + 1,
//     sender_id: 0,
//     receiver_id: currentUser.id,
//     message_text: response.data.data.message_text, // Updated this line
//     created_at: new Date().toISOString(),
//   };

//   setAiMessages((prev) => [...prev, assistantMessage]);
//   setMessages((prev) => [...prev, assistantMessage]);
// } catch (err) {
//         console.error("AI response failed:", err);
//         const errorMessage: Message = {
//           id: Date.now() + 2,
//           sender_id: 0,
//           receiver_id: currentUser.id,
//           message_text: "Sorry, I couldn't reach the AI assistant right now.",
//           created_at: new Date().toISOString(),
//         };

//         setAiMessages((prev) => [...prev, errorMessage]);
//         setMessages((prev) => [...prev, errorMessage]);
//       }

//       return;
//     }

//     socket.emit("send_message", messageData);
//     // ✅ Removed optimistic update - message will come via socket event
//   };

//   // 🚪 LOGOUT
//   const handleLogout = () => {
//     localStorage.clear();
//     socket.disconnect();
//     router.push("/login");
//   };

//   if (!currentUser) {
//     return <div className="p-10 text-center">Loading...</div>;
//   }

//   return (
//     <div className="flex h-screen w-screen overflow-hidden">
//       {/* SIDEBAR - DESKTOP */}
//       <div className="hidden md:flex md:w-[30%] md:min-w-[300px] md:flex-col">
//         <Sidebar onSelectContact={setSelectedContact} />
//       </div>

//       {/* SIDEBAR - MOBILE OVERLAY */}
//       {showSidebar && (
//         <>
//           {/* Backdrop */}
//           <div
//             className="fixed inset-0 md:hidden bg-black bg-opacity-50 z-30"
//             onClick={() => setShowSidebar(false)}
//           />
//           {/* Sidebar */}
//           <div className="fixed left-0 top-0 h-full w-[75%] max-w-[300px] md:hidden z-40">
//             <Sidebar onSelectContact={(contact) => {
//               setSelectedContact(contact);
//               setShowSidebar(false);
//             }} />
//           </div>
//         </>
//       )}

//       <div className="flex-1 flex flex-col bg-[#efeae2] md:w-[70%]">
//         {/* HEADER */}
//         <div className="flex justify-between items-center bg-white p-3 border-b gap-2">
//           <div className="flex items-center gap-2 flex-1 min-w-0">
//             <button
//               onClick={() => setShowSidebar(!showSidebar)}
//               className="md:hidden p-1 hover:bg-gray-100 rounded"
//             >
//               <Menu size={24} />
//             </button>
//             <h2 className="font-semibold text-sm sm:text-base truncate">
//               {selectedContact ? selectedContact.name : "Chat"}
//             </h2>
//           </div>

//           <button
//             onClick={handleLogout}
//             className="bg-red-500 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm rounded whitespace-nowrap"
//           >
//             Logout
//           </button>
//         </div>

//         {selectedContact ? (
//           <>
//             <ChatWindow
//               contact={selectedContact}
//               messages={messages}
//               currentUserId={currentUser.id}
//               refreshMessages={refreshMessages}
//             />

//             <MessageInput onSendMessage={handleSendMessage} />
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center text-gray-400">
//             Select a user to start chat
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import ChatWindow from "../../components/ChatWindow";
import MessageInput from "../../components/MessageInput";
import DeleteModal from "../../components/deleteModal";
import { Menu } from "lucide-react";
import { Contact, Message } from "../../types/index";
import { socket } from "../../lib/socket";
import { api } from "../../lib/api";

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<Contact | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const AI_CONTACT: Contact = {
    id: -9999,
    name: "AI Assistant",
    lastMsg: "Ask the AI anything",
    time: "",
    online: true,
    isAI: true,
  };

  const selectedRef = useRef<Contact | null>(null);
  const currentRef = useRef<Contact | null>(null);

  const router = useRouter();

  useEffect(() => {
    selectedRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    currentRef.current = currentUser;
  }, [currentUser]);

  // 🔐 AUTH + SOCKET
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    if (!token || !user.id) {
      router.push("/login");
      return;
    }

    setCurrentUser({
      id: user.id,
      name: user.username,
      lastMsg: "",
      time: "",
      online: true,
    });

    socket.connect();
    socket.emit("join", user.id);

    const handleMsg = (msg: Message) => {
      const selected = selectedRef.current;
      const current = currentRef.current;

      if (!selected || !current) return;

      const valid =
        (msg.sender_id === selected.id && msg.receiver_id === current.id) ||
        (msg.sender_id === current.id && msg.receiver_id === selected.id);

      if (valid) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleDeleted = (data: { messageId: number }) => {
      if (!data?.messageId) return;
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
    };

    socket.on("receive_message", handleMsg);
    socket.on("message_sent", handleMsg);
    socket.on("message_deleted", handleDeleted);

    return () => {
      socket.off("receive_message", handleMsg);
      socket.off("message_sent", handleMsg);
      socket.off("message_deleted", handleDeleted);
      socket.disconnect();
    };
  }, [router]);

  // 🔄 REFRESH MESSAGES
  const refreshMessages = async () => {
    if (!selectedContact || !currentUser) return;

    if (selectedContact.isAI) {
      setMessages(aiMessages);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await api.get(
        `/messages/history/${currentUser.id}/${selectedContact.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages(res.data);
    } catch (err) {
      console.error("Refresh failed:", err);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (selectedContact?.isAI) {
      setMessages(aiMessages);
    }
  }, [selectedContact, aiMessages]);

  // 📥 AUTO LOAD HISTORY
  useEffect(() => {
    refreshMessages();
  }, [selectedContact, currentUser]);

  // 💬 SEND MESSAGE
  const handleSendMessage = async (payload: any) => {
    if (!selectedContact || !currentUser) return;

    const messageData = {
      sender_id: currentUser.id,
      receiver_id: selectedContact.id,
      message_text: payload.message_text || "",
      file_url: payload.file_url || null,
      file_type: payload.file_type || null, 
      audio_url: payload.audio_url || null, 
    };

    if (selectedContact.isAI) {
      const userMessage: Message = {
        id: Date.now(),
        sender_id: currentUser.id,
        receiver_id: selectedContact.id,
        message_text: payload.message_text || "",
        created_at: new Date().toISOString(),
      };

      setAiMessages((prev) => [...prev, userMessage]);
      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await api.post("/ai/chat", {
          prompt: payload.message_text,
          userId: currentUser.id,
        });

        const assistantMessage: Message = {
          id: Date.now() + 1,
          sender_id: 0,
          receiver_id: currentUser.id,
          message_text: response.data.data.message_text,
          created_at: new Date().toISOString(),
        };

        setAiMessages((prev) => [...prev, assistantMessage]);
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error("AI response failed:", err);
        const errorMessage: Message = {
          id: Date.now() + 2,
          sender_id: 0,
          receiver_id: currentUser.id,
          message_text: "Sorry, I couldn't reach the AI assistant right now.",
          created_at: new Date().toISOString(),
        };

        setAiMessages((prev) => [...prev, errorMessage]);
        setMessages((prev) => [...prev, errorMessage]);
      }
      return;
    }

    socket.emit("send_message", messageData);
  };

  //Delete feature 


  // Inside ChatPage Component
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

const handleDeleteForMe = async () => {
  if (!selectedMsg) return;
  setIsDeleting(true);
  try {
    await api.put(`/messages/delete-for-me/${selectedMsg.id}`, { userId: currentUser.id });
    setMessages((prev) => prev.filter((m) => m.id !== selectedMsg.id));
    setIsDeleteModalOpen(false);
  } catch (err) {
    console.error("Delete for me failed", err);
  } finally {
    setIsDeleting(false);
  }
};

const handleDeleteForEveryone = async () => {
  if (!selectedMsg) return;
  setIsDeleting(true);
  try {
    await api.put(`/messages/delete-for-everyone/${selectedMsg.id}`);
    
    // Emit to other user via socket
    socket.emit("delete_message", {
      messageId: selectedMsg.id,
      receiverId: selectedMsg.receiver_id,
      senderId: selectedMsg.sender_id
    });

    // Update local UI
    setMessages((prev) => prev.filter((m) => m.id !== selectedMsg.id));
    setIsDeleteModalOpen(false);
  } catch (err) {
    console.error("Delete for everyone failed", err);
  } finally {
    setIsDeleting(false);
  }
};

const handleDeleteRequest = (message: Message) => {
  setSelectedMsg(message);
  setIsDeleteModalOpen(true);
};

  // 🚪 LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    socket.disconnect();
    router.push("/login");
  };

  if (!currentUser) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* SIDEBAR - DESKTOP */}
      <div className="hidden md:flex md:w-[30%] md:min-w-[300px] md:flex-col">
        <Sidebar onSelectContact={setSelectedContact} />
      </div>

      {/* SIDEBAR - MOBILE OVERLAY */}
      {showSidebar && (
        <>
          <div
            className="fixed inset-0 md:hidden bg-black bg-opacity-50 z-30"
            onClick={() => setShowSidebar(false)}
          />
          <div className="fixed left-0 top-0 h-full w-[75%] max-w-[300px] md:hidden z-40">
            <Sidebar onSelectContact={(contact) => {
              setSelectedContact(contact);
              setShowSidebar(false);
            }} />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col bg-[#efeae2] md:w-[70%]">
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-3 border-b gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden p-1 hover:bg-gray-100 rounded"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-semibold text-sm sm:text-base truncate">
              {selectedContact ? selectedContact.name : "Chat"}
            </h2>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm rounded whitespace-nowrap"
          >
            Logout
          </button>
        </div>

        {selectedContact ? (
          <>
            <ChatWindow
              contact={selectedContact}
              messages={messages}
              currentUserId={currentUser.id}
              refreshMessages={refreshMessages}
              onDeleteRequest={handleDeleteRequest}
            />
            <DeleteModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onDeleteForEveryone={handleDeleteForEveryone}
              onDeleteForMe={handleDeleteForMe}
              isLoading={isDeleting}
              canDeleteForEveryone={
                !!currentUser && selectedMsg?.sender_id === currentUser.id
              }
            />
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a user to start chat
          </div>
        )}
      </div>
    </div>
  );
}