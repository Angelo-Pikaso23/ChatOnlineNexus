import { useEffect, useState } from "react";
import { auth, db } from "./config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Login from "./components/Login";
import ChatPrivate from "./components/ChatPrivate";
import Chat from "./components/Chat";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  // 🌗 Aplicar tema
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

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

  if (loading) return (
    <div className="h-screen flex items-center justify-center div-wht">
      Cargando...
    </div>
  );

  if (!user) return <Login />;

  return (
    <div className="h-screen flex flex-col div-wht">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-2 border-b div-wht">
        <h1 className="font-bold text-lg">💬 Chat Nexus</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setDark(v => !v)}
            className="btn-light"
          >
            {dark ? "☀️ Claro" : "🌙 Oscuro"}
          </button>
          <button onClick={logout} className="btn-danger">
            Salir
          </button>
        </div>
      </header>

      {/* CONTENIDO */}
      <div className="flex flex-1 overflow-hidden">
        <ChatPrivate currentUser={user} selectUser={setSelectedUser} />
        <div className="flex-1 div-wht">
          {selectedUser ? <Chat selectedUser={selectedUser} /> : (
            <div className="h-full flex items-center justify-center text-muted">
              👈 Selecciona un usuario
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
