import { useEffect, useState, useRef } from "react";
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

/* 🕒 FORMATO DE HORA */
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
  const [lastMessageAt, setLastMessageAt] = useState({});  // Nuevo estado para ordenamiento confiable
  const [hovered, setHovered] = useState(null);

  const unsubscribers = useRef([]);

  /* 👥 OBTENER USUARIOS */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  /* 📩 ÚLTIMO MENSAJE + 🔴 NO LEÍDOS + 🕒 LAST MESSAGE AT */
  useEffect(() => {
    // Limpiar listeners viejos
    unsubscribers.current.forEach((u) => u());
    unsubscribers.current = [];

    users.forEach((user) => {
      if (user.uid === currentUser.uid) return;

      const chatId =
        currentUser.uid > user.uid
          ? currentUser.uid + user.uid
          : user.uid + currentUser.uid;

      /* 🔹 ÚLTIMO MENSAJE (para texto y hora) */
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

      /* 🔹 MENSAJES NO LEÍDOS */
      const unreadQuery = query(
        collection(db, "chats", chatId, "messages"),
        where("receiverId", "==", currentUser.uid),
        where("read", "==", false)
      );

      const unsubUnread = onSnapshot(unreadQuery, (snap) => {
        setUnread((prev) => ({
          ...prev,
          [user.uid]: snap.size,
        }));
      });

      /* 🔹 LAST MESSAGE AT (para ordenamiento confiable) */
      const chatDocRef = doc(db, "chats", chatId);
      const unsubChat = onSnapshot(chatDocRef, (docSnap) => {
        setLastMessageAt((prev) => ({
          ...prev,
          [user.uid]: docSnap.exists() ? docSnap.data().lastMessageAt : null,
        }));
      });

      unsubscribers.current.push(unsubLast, unsubUnread, unsubChat);
    });

    return () => {
      unsubscribers.current.forEach((u) => u());
      unsubscribers.current = [];
    };
  }, [users, currentUser.uid]);

  return (
    <div style={styles.sidebar}>
      {/* 🔝 HEADER */}
      <div style={styles.header}>Usuarios</div>

      {/* 👥 LISTA */}
      <div style={styles.userList}>
        {users
          .filter((u) => u.uid !== currentUser.uid)
          .sort((a, b) => {
            const timeA = lastMessageAt[a.uid]?.seconds || 0;  // Usar lastMessageAt para ordenamiento
            const timeB = lastMessageAt[b.uid]?.seconds || 0;
            return timeB - timeA;
          })
          .map((user) => {
            const lastMsg = lastMessages[user.uid];
            const isHover = hovered === user.uid;

            return (
              <div
                key={user.id}
                onClick={() => selectUser(user)}
                onMouseEnter={() => setHovered(user.uid)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  ...styles.user,
                  ...(isHover ? styles.userHover : {}),
                }}
              >
                <img src={user.photo} alt="avatar" style={styles.avatar} />

                <div style={{ flex: 1 }}>
                  <div style={styles.name}>{user.name}</div>
                  <div style={styles.lastMessage}>
                    {lastMsg?.text || "Sin mensajes"}
                  </div>
                </div>

                <div style={styles.right}>
                  <div style={styles.time}>
                    {lastMsg?.createdAt &&
                      formatTime(lastMsg.createdAt)}
                  </div>

                  {unread[user.uid] > 0 && (
                    <span style={styles.badge}>
                      {unread[user.uid]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* 🔻 FOOTER */}
      <div style={styles.footer}>
        <div style={styles.option}>⚙️ Ajustes</div>
        <div style={styles.option}>👤 Perfil</div>
        <div style={{ ...styles.option, color: "#ff5c5c" }}>
          🗑️ Cerrar sesión
        </div>
      </div>
    </div>
  );
}

/* 🎨 ESTILOS */
const styles = {
  sidebar: {
    width: 320,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundImage:
      "linear-gradient(139deg, #242832 0%, #251c28 100%)",
    borderRight: "1px solid #2f3340",
  },

  header: {
    padding: 12,
    fontWeight: "bold",
    color: "#fff",
    borderBottom: "1px solid #42434a",
  },

  userList: {
    flex: 1,
    overflowY: "auto",
    padding: 10,
  },

  user: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 8,
    cursor: "pointer",
    borderRadius: 8,
    marginBottom: 6,
    background: "#242832",
    color: "#7e8590",
    transition: "all 0.25s ease",
  },

  userHover: {
    background: "#5353ff",
    color: "#fff",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
  },

  name: {
    fontWeight: 600,
    fontSize: 14,
  },

  lastMessage: {
    fontSize: 12,
    opacity: 0.8,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 160,
  },

  right: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
  },

  time: {
    fontSize: 11,
    opacity: 0.7,
  },

  badge: {
    background: "#25d366",
    color: "#fff",
    borderRadius: "50%",
    minWidth: 20,
    height: 20,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    padding: 10,
    borderTop: "1px solid #42434a",
    background: "#1e222b",
    position: "sticky",
    bottom: 0,
  },

  option: {
    padding: 8,
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    color: "#7e8590",
    transition: "all 0.3s",
  },
};