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
  const currentUser = auth.currentUser;

  /* ==============================
     🛡️ PROTECCIÓN CRÍTICA
  ============================== */
  if (!currentUser || !selectedUser) {
    return (
      <div className="h-full flex items-center justify-center div-conv">
        <p className="text-muted">Selecciona un chat para comenzar</p>
      </div>
    );
  }

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesRef = useRef(null);

  /* ==============================
     CHAT ID SEGURO
  ============================== */
  const chatId =
    currentUser.uid > selectedUser.uid
      ? currentUser.uid + selectedUser.uid
      : selectedUser.uid + currentUser.uid;

  /* ==============================
     MENSAJES
  ============================== */
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

  /* ==============================
     SCROLL
  ============================== */
  const checkIfAtBottom = () => {
    if (!messagesRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
  };

  useEffect(() => {
    if (messagesRef.current && isAtBottom) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isAtBottom]);

  /* ==============================
     MARCAR COMO LEÍDOS
  ============================== */
  useEffect(() => {
    const markRead = async () => {
      const q = query(
        collection(db, "chats", chatId, "messages"),
        where("receiverId", "==", currentUser.uid),
        where("read", "==", false)
      );

      const snap = await getDocs(q);
      snap.forEach((d) =>
        updateDoc(doc(db, "chats", chatId, "messages", d.id), {
          read: true,
        })
      );
    };

    markRead();
  }, [chatId, currentUser.uid]);

  /* ==============================
     ENVIAR MENSAJE
  ============================== */
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

    await setDoc(
      doc(db, "chats", chatId),
      { lastMessageAt: Timestamp.now() },
      { merge: true }
    );

    setText("");
  };

  return (
    <div className="div-con-msg h-full relative flex flex-col items-center">

      {/* HEADER FLOTANTE */}
      <div className="
        div-wht shadow-sm
        rounded-full
        px-6 py-3
        flex items-center gap-3
        mt-4
        z-10
      ">
        <img
          src={selectedUser.photo}
          className="w-10 h-10 rounded-full"
        />
        <span className="font-semibold text-lg truncate max-w-[200px]">
          {selectedUser.name}
        </span>
      </div>

      {/* CONVERSACIÓN */}
      <div
        ref={messagesRef}
        onScroll={checkIfAtBottom}
        className="
          flex-1 w-full max-w-4xl
          div-conv shadow-sm
          rounded-3xl
          
          mt-[40px] mb-[90px]
          px-6 py-4
          overflow-y-auto
          scrollbar-thin
          space-y-4
        "
      >
        {messages.length === 0 && (
          <div className="text-center text-muted py-10">
            No hay mensajes aún
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.uid;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={isMe ? "div-msg-sender" : "div-msg"}>
                <p className="text-sm">{msg.text}</p>
                <p className="text-[10px] text-muted text-right mt-1">
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT FLOTANTE */}
      <form
        onSubmit={sendMessage}
        className="
    absolute bottom-4 left-1/2 -translate-x-1/2
    w-full max-w-4xl
    div-wht shadow-sm
    rounded-full
    px-4 py-3
    flex items-center gap-3
  "
      >

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="input-message"
        />

        <button
          type="submit"
          className="
            bg-[var(--accent)]
            text-white
            w-10 h-10
            rounded-full
            flex items-center justify-center
          "
        >
          ➤
        </button>
      </form>

      {/* BOTÓN BAJAR */}
      {!isAtBottom && (
  <button
    onClick={() => {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      setIsAtBottom(true);
    }}
    className="btn-scroll-bottom"
    title="Ir al final"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>
)}
    </div>
  );
}
