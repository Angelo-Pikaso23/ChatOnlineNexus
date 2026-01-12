import { useState } from "react";

// Función para formatear fechas
const formatDate = (date) => {
  const now = new Date();
  const msgDate = new Date(date);
  const diffDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  return `Hace ${diffDays} días`;
};

export default function Chat({ messages, userId, blockedUsers }) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const deleteMessage = (id) => {
    // Aquí tu lógica para eliminar del estado/Firestore
    console.log("Eliminar mensaje", id);
  };

  const editMessage = (msg) => {
    setEditingId(msg.id);
    setEditText(msg.text);
  };

  const saveEdit = (id) => {
    // Guardar edición en estado/Firestore
    console.log("Guardar mensaje editado", id, editText);
    setEditingId(null);
    setEditText("");
  };

  const blockUser = (userId) => {
    console.log("Bloquear usuario", userId);
    // Agregar a tu lista de bloqueados
  };

  let prevDate = null;

  return (
    <div className="div-con-msg">
      {messages.map((msg) => {
        if (blockedUsers.includes(msg.senderId)) {
          return (
            <div key={msg.id} className="blocked-msg">
              Usuario bloqueado
            </div>
          );
        }

        const showDate = prevDate !== new Date(msg.date).toDateString();
        prevDate = new Date(msg.date).toDateString();

        const isSender = msg.senderId === userId;
        return (
          <div key={msg.id}>
            {showDate && (
              <div className="date-separator">{formatDate(msg.date)}</div>
            )}
            <div className={isSender ? "div-msg-sender" : "div-msg"}>
              {editingId === msg.id ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => saveEdit(msg.id)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(msg.id)}
                  className="input-message"
                />
              ) : (
                msg.text
              )}

              {isSender && (
                <div className="msg-actions">
                  <button onClick={() => editMessage(msg)}>✏️</button>
                  <button onClick={() => deleteMessage(msg.id)}>🗑️</button>
                </div>
              )}

              {!isSender && (
                <div className="msg-actions">
                  <button onClick={() => blockUser(msg.senderId)}>🚫</button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
