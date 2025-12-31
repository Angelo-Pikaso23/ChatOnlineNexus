import { useEffect, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  doc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  return timestamp.toDate().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ChatPrivate({ currentUser, selectUser }) {
  const [users, setUsers] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [unread, setUnread] = useState({});
  const [lastMessageAt, setLastMessageAt] = useState({});
  const [hovered, setHovered] = useState(null);
  const unsubscribers = useRef([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    unsubscribers.current.forEach((u) => u());
    unsubscribers.current = [];

    users.forEach((user) => {
      if (!user.uid || user.uid === currentUser.uid) return;

      const chatId =
        currentUser.uid > user.uid
          ? currentUser.uid + user.uid
          : user.uid + currentUser.uid;

      // Último mensaje
      const lastMsgQuery = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const unsubLast = onSnapshot(lastMsgQuery, (snap) => {
        setLastMessages((prev) => ({
          ...prev,
          [user.uid]: snap.empty ? null : snap.docs[0].data(),
        }));
      });

      // Mensajes no leídos
      const unreadQuery = query(
        collection(db, "chats", chatId, "messages"),
        where("receiverId", "==", currentUser.uid),
        where("read", "==", false)
      );
      const unsubUnread = onSnapshot(unreadQuery, (snap) => {
        setUnread((prev) => ({ ...prev, [user.uid]: snap.size }));
      });

      // Último mensaje timestamp
      const unsubChat = onSnapshot(doc(db, "chats", chatId), (snap) => {
        setLastMessageAt((prev) => ({
          ...prev,
          [user.uid]: snap.exists() ? snap.data().lastMessageAt : null,
        }));
      });

      unsubscribers.current.push(unsubLast, unsubUnread, unsubChat);
    });

    return () => {
      unsubscribers.current.forEach((u) => u());
      unsubscribers.current = [];
    };
  }, [users, currentUser.uid]);

  const orderedUsers = [...users]
    .filter((u) => u.uid !== currentUser.uid)
    .filter((u, i, arr) => arr.findIndex(x => x.uid === u.uid) === i)
    .sort((a, b) => {
      const tA = lastMessageAt[a.uid]?.seconds || 0;
      const tB = lastMessageAt[b.uid]?.seconds || 0;
      return tB - tA;
    });

  return (
    <div className="w-[320px] h-full flex flex-col div-wht border-r border-zinc-300 dark:border-zinc-800">

      {/* HEADER */}
      <div className="px-4 py-3 border-b border-zinc-300 dark:border-zinc-800 div-wht">
        <h2 className="text-primary font-semibold text-lg">Chats</h2>
      </div>


      {/* LISTA DE USUARIOS */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin div-wht">
        {orderedUsers.map((user, index) => {
          const lastMsg = lastMessages[user.uid];
          return (
            <div
              key={`${user.uid}-${index}`}
              onClick={() => selectUser(user)}
              onMouseEnter={() => setHovered(user.uid)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${hovered === user.uid ? "hover-light" : ""
                }`}
            >
              <img
                src={user.photo}
                className="w-11 h-11 rounded-full object-cover border border-zinc-400 dark:border-zinc-600"
              />

              <div className="flex-1 min-w-0">
                <p className="text-primary font-semibold truncate">{user.name}</p>
                <p className="text-muted truncate">{lastMsg?.text || "Sin mensajes"}</p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-muted">{lastMsg?.createdAt && formatTime(lastMsg.createdAt)}</span>
                {unread[user.uid] > 0 && (
                  <span className="bg-green-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium">
                    {unread[user.uid]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="border-t border-zinc-300 dark:border-zinc-800 p-3 space-y-2 div-wht">
        <button className="w-full text-left px-3 py-2 rounded-lg hover-light">⚙️ Ajustes</button>
        <button className="w-full text-left px-3 py-2 rounded-lg hover-light">👤 Perfil</button>
        <button className="w-full text-left px-3 py-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20">🚪 Cerrar sesión</button>
      </div>
    </div>
  );
}

