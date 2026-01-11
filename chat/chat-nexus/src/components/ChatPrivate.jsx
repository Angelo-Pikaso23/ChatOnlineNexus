import { useEffect, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../config/firebase";
import ProfileModal from "./ProfileModal";

export default function ChatPrivate({ currentUser, selectUser, dark, setDark }) {
  const [users, setUsers] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [lastMessageAt, setLastMessageAt] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);

  // 🔹 control sidebar
  const [isOpen, setIsOpen] = useState(true);

  const unsubscribers = useRef([]);

  /* ==============================
     AUTO ABRIR EN DESKTOP
  ============================== */
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");

    const syncSidebar = () => {
      if (media.matches) setIsOpen(true);
    };

    syncSidebar();
    media.addEventListener("change", syncSidebar);
    return () => media.removeEventListener("change", syncSidebar);
  }, []);

  /* ==============================
     USUARIOS
  ============================== */
  useEffect(() => {
    return onSnapshot(collection(db, "users"), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  /* ==============================
     ÚLTIMO MENSAJE
  ============================== */
  useEffect(() => {
    unsubscribers.current.forEach(u => u());
    unsubscribers.current = [];

    users.forEach(user => {
      if (!user.uid || user.uid === currentUser.uid) return;

      const chatId =
        currentUser.uid > user.uid
          ? currentUser.uid + user.uid
          : user.uid + currentUser.uid;

      const lastMsgQuery = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const unsubMsg = onSnapshot(lastMsgQuery, snap => {
        setLastMessages(prev => ({
          ...prev,
          [user.uid]: snap.empty ? null : snap.docs[0].data(),
        }));
      });

      const unsubChat = onSnapshot(doc(db, "chats", chatId), snap => {
        setLastMessageAt(prev => ({
          ...prev,
          [user.uid]: snap.exists() ? snap.data().lastMessageAt : null,
        }));
      });

      unsubscribers.current.push(unsubMsg, unsubChat);
    });

    return () => unsubscribers.current.forEach(u => u());
  }, [users, currentUser.uid]);

  /* ==============================
     LOGOUT
  ============================== */
  const logout = async () => {
    await setDoc(
      doc(db, "users", currentUser.uid),
      { online: false, lastSeen: serverTimestamp() },
      { merge: true }
    );
    await signOut(auth);
  };

  const orderedUsers = users
    .filter(u => u.uid && u.uid !== currentUser.uid)
    .sort((a, b) => {
      const tA = lastMessageAt[a.uid]?.seconds || 0;
      const tB = lastMessageAt[b.uid]?.seconds || 0;
      return tB - tA;
    });

  return (
    <aside
      className={`
        h-full flex flex-col
    bg-[var(--bg-secondary)]
    border-r border-[var(--hover-light)]
    transition-all duration-300
    overflow-hidden
    ${isOpen ? "w-[320px]" : "w-[64px]"}
    md:w-[320px]
      `}
    >
      {/* ==============================
          HEADER
      ============================== */}
      <header
        className={`
      flex items-center justify-between
      border-b border-[var(--hover-light)]
      ${isOpen ? "px-4 py-3" : "justify-center px-0 py-2"}
    `}
      >
        {isOpen && <span className="header-title">Chats</span>}

        {/* BOTÓN PARA OCULTAR / MOSTRAR */}
        <button
          onClick={() => setIsOpen(v => !v)}
          className={`
        btn-light
        flex items-center justify-center
        w-10 h-10
      `}
        >
          {isOpen ? "←" : "☰"}
        </button>
      </header>

      {/* ==============================
          LISTA DE CHATS
      ============================== */}
      <div
        className={`
          flex-1 m-3 p-2
          div-wht rounded-2xl shadow-sm
          overflow-y-auto scrollbar-thin space-y-1
          transition-all duration-300 ease-in-out

          ${isOpen
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-4 pointer-events-none"}

          md:opacity-100 md:translate-x-0 md:pointer-events-auto
        `}
      >
        {orderedUsers.map(user => (
          <div
            key={user.uid}
            onClick={() => selectUser(user)}
            className="chat-item"
          >
            <img src={user.photo} className="w-10 h-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className=" font-semibold truncate">{user.name}</p>
              <p className="text-muted truncate">
                {lastMessages[user.uid]?.text || "Sin mensajes"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ==============================
          MENÚ INFERIOR
      ============================== */}
      {isOpen && (
        <div
          className=" button-container mx-auto mb-4"
          style={{
            width: "90%",
            height: "50px",
          }}
        >
          <button className="button-cht-m" onClick={() => setDark(v => !v)}>
            {dark ? "☀️" : "🌙"}
          </button>
          <button className="button-cht-m" onClick={() => setProfileOpen(true)}>
            👤
          </button>
          <button className="button-cht-m">
            ➕
          </button>
          <button className="button-cht-m" onClick={logout}>
            🚪
          </button>
        </div>
      )}
      {profileOpen && (
        <ProfileModal
          user={currentUser}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </aside>
  );
}