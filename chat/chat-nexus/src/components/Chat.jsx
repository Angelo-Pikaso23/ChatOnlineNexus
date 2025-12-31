import { useEffect, useRef, useState } from "react";
import { auth, db } from "../config/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs,
  where,
  setDoc,
  Timestamp,    
} from "firebase/firestore";

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  return timestamp.toDate().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Chat({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const currentUser = auth.currentUser;

  const chatId =
    currentUser.uid > selectedUser.uid
      ? currentUser.uid + selectedUser.uid
      : selectedUser.uid + currentUser.uid;

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [chatId]);

  const checkIfAtBottom = () => {
    if (messagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
    }
  };

  useEffect(() => {
    if (messagesRef.current && isAtBottom) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isAtBottom]);

  useEffect(() => {
    const markRead = async () => {
      const q = query(
        collection(db, "chats", chatId, "messages"),
        where("receiverId", "==", currentUser.uid),
        where("read", "==", false)
      );
      const snap = await getDocs(q);
      snap.forEach((d) =>
        updateDoc(doc(db, "chats", chatId, "messages", d.id), { read: true })
      );
    };
    markRead();
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      senderId: currentUser.uid,
      receiverId: selectedUser.uid,
      createdAt: serverTimestamp(),
      read: false,
    });
    await setDoc(doc(db, "chats", chatId), { lastMessageAt: Timestamp.now() },    {    merge: true });
    setText("");
  };

  return (
    <div className="flex flex-col h-full div-wht relative">
      {/* HEADER */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-300 dark:border-zinc-800 div-wht">
        <img src={selectedUser.photo} className="w-10 h-10 rounded-full" />
        <span className="font-semibold text-primary truncate">{selectedUser.name}</span>
      </div>

      {/* MENSAJES */}
      <div
        ref={messagesRef}
        onScroll={checkIfAtBottom}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin div-conv"
      >
        {messages.length === 0 && (
          <div className="text-center text-muted py-6">No hay mensajes aún</div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.uid;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={isMe ? "div-msg-sender" : "div-msg"}>
                <p className="text-sm break-words">{msg.text}</p>
                <p className="text-[10px] text-muted text-right mt-1">{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTÓN SCROLL */}
      {!isAtBottom && (
        <button
          onClick={() => {
            if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            setIsAtBottom(true);
          }}
          className="absolute bottom-20 right-4 z-10 w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition"
        >
          ↓
        </button>
      )}

      {/* INPUT */}
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 px-3 py-3 border-t border-zinc-300 dark:border-zinc-800 div-gry"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2 rounded-full bg-gray-200 text-gray-900 placeholder-gray-600 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400 outline-none focus:ring-2 focus:ring-green-500"
        />
        <button type="submit" className="w-11 h-11 rounded-full bg-green-500 hover:bg-green-600 text-white">
          ➤
        </button>
      </form>
    </div>
  );
}