import { useEffect, useState } from "react";
import { auth, db } from "./config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import Login from "./components/Login";
import ChatPrivate from "./components/ChatPrivate";
import Chat from "./components/Chat";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        await setDoc(
          doc(db, "users", u.uid),
          { online: true, lastSeen: serverTimestamp() },
          { merge: true }
        );
      } else {
        setUser(null);
        setSelectedUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await setDoc(
      doc(db, "users", user.uid),
      { online: false, lastSeen: serverTimestamp() },
      { merge: true }
    );
    await signOut(auth);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-xl dark:bg-gray-900 dark:text-white">
        Cargando...
      </div>
    );

  if (!user) return <Login />;

  return (
    <div className={dark ? "dark" : ""}>
      <div className="h-screen bg-gray-100 dark:bg-gray-900 flex flex-col overflow-hidden">


        {/* HEADER */}
        <header
          className="flex items-center justify-between px-4 py-2
  bg-white dark:bg-gray-800 border-b dark:border-gray-700
  sticky top-0 z-50"
        >


          <h1 className="font-bold text-lg text-gray-800 dark:text-white">
            💬 Chat Nexus
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="px-3 py-1 rounded
              bg-gray-200 dark:bg-gray-700
              text-black dark:text-white"
            >
              {dark ? "☀️ Claro" : "🌙 Oscuro"}
            </button>

            <button
              onClick={logout}
              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Salir
            </button>
          </div>
        </header>

        {/* CONTENIDO */}
        <div className="flex flex-1 overflow-hidden">

          {/* LISTA USUARIOS */}
          <ChatPrivate
            currentUser={user}
            selectUser={setSelectedUser}
          />

          {/* CHAT */}
          <div className="flex-1">
            {selectedUser ? (
              <Chat
                currentUser={user}
                selectedUser={selectedUser}
              />
            ) : (
              <div className="h-full flex items-center justify-center
                text-gray-500 dark:text-gray-400">
                👈 Selecciona un usuario
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}