import { useEffect, useRef, useState } from "react";
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
  Timestamp,  // Importar Timestamp para timestamp inmediato
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

/* 🕒 FORMATO DE HORA */
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
  const bottomRef = useRef(null);

  const currentUser = auth.currentUser;

  const chatId =
    currentUser.uid > selectedUser.uid  // <-- CORREGIDO: Usar selectedUser.uid (no 'user')
      ? currentUser.uid + selectedUser.uid
      : selectedUser.uid + currentUser.uid;

  /* 📩 ESCUCHAR MENSAJES */
  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [chatId]);

  /* ⬇️ SCROLL AUTOMÁTICO */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ✅ MARCAR COMO LEÍDOS */
  useEffect(() => {
    const markAsRead = async () => {
      const q = query(
        collection(db, "chats", chatId, "messages"),
        where("receiverId", "==", currentUser.uid),
        where("read", "==", false)
      );

      const snap = await getDocs(q);
      snap.forEach((docu) => {
        updateDoc(doc(db, "chats", chatId, "messages", docu.id), {
          read: true,
        });
      });
    };

    markAsRead();
  }, [chatId]);

  /* ✉️ ENVIAR MENSAJE */
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

    // Actualizar lastMessageAt con timestamp inmediato (sin delay)
    await setDoc(doc(db, "chats", chatId), {
      lastMessageAt: Timestamp.now(),  // Timestamp inmediato para ordenamiento sin "salto"
    }, { merge: true });

    setText("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">

      {/* 🔝 HEADER */}
      <div
        className="flex items-center gap-3 px-4 py-3
        bg-white dark:bg-gray-800
        border-b dark:border-gray-700"
      >
        <img
          src={selectedUser.photo}
          alt="avatar"
          className="w-10 h-10 rounded-full flex-shrink-0"
        />

        {/* 🔹 NOMBRE RECORTADO */}
        <span
          className="font-semibold text-gray-800 dark:text-white
          truncate max-w-[180px]"
          title={selectedUser.name}
        >
          {selectedUser.name}
        </span>
      </div>

      {/* 💬 MENSAJES */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.uid;

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow
                ${isMe
                    ? "bg-green-400 text-black dark:bg-green-500"
                    : "bg-white dark:bg-gray-700 text-black dark:text-white"
                  }`}
              >
                <p className="text-sm break-words">{msg.text}</p>

                <p className="text-[10px] text-right opacity-60 mt-1">
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* ✍️ INPUT */}
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 px-3 py-2
        bg-gray-200 dark:bg-gray-800"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mensaje..."
          className="flex-1 px-4 py-2 rounded-full
          bg-white dark:bg-gray-700
          text-black dark:text-white
          outline-none"
        />

        <button
          type="submit"
          className="w-11 h-11 rounded-full
          bg-green-500 hover:bg-green-600
          text-white flex items-center justify-center"
        >
          ➤
        </button>
      </form>
    </div>
  );
}