/* import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Users({ currentUser, selectUser }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), snapshot => {
      setUsers(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsub();
  }, []);

  return (
    <div style={{ width: 250, borderRight: "1px solid #ccc", padding: 10 }}>
      <h3>Usuarios</h3>

      {users
        .filter(u => u.uid !== currentUser.uid)
        .map(user => (
          <div
            key={user.uid}
            onClick={() => selectUser(user)}
            style={{
              cursor: "pointer",
              padding: 8,
              marginBottom: 5,
              background: "#eee",
            }}
          >
            <img
            src={user.photo}
            width={35}
            style={{ borderRadius: "50%" }}
          />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: user.online ? "green" : "gray",
                display: "inline-block",
                marginRight: 8,
              }}
            />
            {user.name}
          </div>
        ))}
    </div>
  );
}
 */
import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Users({ currentUser, selectUser }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => d.data()));
    });
    return () => unsub();
  }, []);

  return (
    <div style={{ width: 250, borderRight: "1px solid #ccc", padding: 10 }}>
      <h3>Usuarios</h3>

      {users
        .filter((u) => u.uid !== currentUser.uid)
        .map((user) => (
          <div
            key={user.uid}
            onClick={() => selectUser(user)}
            style={{
              cursor: "pointer",
              padding: 8,
              marginBottom: 5,
              background: "#eee",
            }}
          >
            <img src={user.photo} width={35} style={{ borderRadius: "50%" }} />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: user.online ? "green" : "gray",
                display: "inline-block",
                marginRight: 8,
              }}
            />
            {user.name}
          </div>
        ))}
    </div>
  );
}
