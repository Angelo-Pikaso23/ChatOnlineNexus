import { useEffect, useState } from "react";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/Login";
import ChatPrivate from "./components/ChatPrivate";
import Chat from "./components/Chat";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    dark ? root.classList.add("dark") : root.classList.remove("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center div-wht">
        Cargando...
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="h-screen flex overflow-hidden">
      <ChatPrivate
        currentUser={user}
        selectUser={setSelectedUser}
        dark={dark}
        setDark={setDark}
      />
      <main className="flex-1 h-full div-wht">
        {selectedUser ? (
          <Chat selectedUser={selectedUser}
            onCloseChat={() => setSelectedUser(null)} />
        ) : (
          <div className="h-full flex items-center justify-center text-muted">
            👈 Selecciona un chat
          </div>
        )}
      </main>
    </div>
  );
}
