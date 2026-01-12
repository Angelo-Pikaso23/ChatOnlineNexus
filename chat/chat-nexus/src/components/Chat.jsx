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
	deleteDoc,
	doc,
	getDocs,
	where,
	setDoc,
	Timestamp,
} from "firebase/firestore";

/* ============================== FUNCIONES DE FECHA ============================== */
const formatTime = (timestamp) => {
	if (!timestamp || !timestamp.toDate) return "";
	return timestamp.toDate().toLocaleTimeString("es-MX", {
		hour: "2-digit",
		minute: "2-digit",
	});
};

const formatDate = (timestamp) => {
	if (!timestamp || !timestamp.toDate) return "";
	const now = new Date();
	const msgDate = timestamp.toDate();
	const diffDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));
	if (diffDays === 0) return "Hoy";
	if (diffDays === 1) return "Ayer";
	return `Hace ${diffDays} días`;
};

/* ============================== COMPONENTE CHAT ============================== */
export default function Chat({ selectedUser, onCloseChat }) {
	const currentUser = auth.currentUser;

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
	const [editingId, setEditingId] = useState(null);
	const [editText, setEditText] = useState("");
	const [blockedUsers, setBlockedUsers] = useState([]);

	const messagesRef = useRef(null);

	const chatId =
		currentUser.uid > selectedUser.uid
			? currentUser.uid + selectedUser.uid
			: selectedUser.uid + currentUser.uid;

	/* ============================== MENSAJES ============================== */
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

	/* ============================== SCROLL ============================== */
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

	/* ============================== MARCAR COMO LEÍDOS ============================== */
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

	/* ============================== ENVIAR MENSAJE ============================== */
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

	/* ============================== EDITAR / ELIMINAR ============================== */
	const deleteMessage = async (id) => {
		await deleteDoc(doc(db, "chats", chatId, "messages", id));
	};

	const editMessage = (msg) => {
		setEditingId(msg.id);
		setEditText(msg.text);
	};

	const saveEdit = async (id) => {
		if (!editText.trim()) return;
		await updateDoc(doc(db, "chats", chatId, "messages", id), {
			text: editText,
		});
		setEditingId(null);
		setEditText("");
	};

	/* ============================== BLOQUEAR USUARIO ============================== */
	const blockUser = (id) => {
		if (!blockedUsers.includes(id)) {
			setBlockedUsers((prev) => [...prev, id]);
		}
	};

	/* ============================== RENDER ============================== */
	let prevDate = null;

	return (
		<div className="div-con-msg h-full relative flex flex-col items-center">
			{/* HEADER FLOTANTE */}
			<div className="chat-header-wrapper">

				{/* BOTÓN SALIR */}
				<button
					className="chat-header-btn"
					onClick={onCloseChat}
					title="Salir del chat"
				>
					{/* SVG FLECHA */}
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M15 18l-6-6 6-6" />
					</svg>
				</button>

				{/* CONTENEDOR CENTRAL */}
				<div className="chat-header-center div-wht shadow-sm">
					<img
						src={selectedUser.photo}
						alt="user"
						className="chat-header-avatar"
					/>
					<span className="chat-header-name">
						{selectedUser.name}
					</span>
				</div>

				{/* MENÚ */}
				<div className="chat-header-menu">
					<button className="chat-header-btn">
						{/* SVG MENÚ */}
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						>
							<circle cx="12" cy="5" r="1" />
							<circle cx="12" cy="12" r="1" />
							<circle cx="12" cy="19" r="1" />
						</svg>
					</button>

					<div className="chat-header-dropdown">
						<button className="menu-item">Ver perfil</button>
						<button className="menu-item">Silenciar</button>
						<button
							className="menu-item"
							onClick={() => blockUser(selectedUser.uid)}
						>
							🚫 Bloquear
						</button>
					</div>
				</div>

			</div>

			{/* CONVERSACIÓN */}
			<div
				ref={messagesRef}
				onScroll={checkIfAtBottom}
				className="flex-1 w-full max-w-4xl div-conv shadow-sm rounded-3xl mt-[40px] mb-[90px] px-6 py-4 overflow-y-auto scrollbar-thin space-y-4"
			>
				{messages.length === 0 && (
					<div className="text-center text-muted py-10">
						No hay mensajes aún
					</div>
				)}

				{messages.map((msg) => {
					if (!msg.createdAt) return null;

					if (blockedUsers.includes(msg.senderId)) {
						return (
							<div key={msg.id} className="blocked-msg">
								Usuario bloqueado
							</div>
						);
					}

					const isMe = msg.senderId === currentUser.uid;
					const msgDateString = msg.createdAt.toDate().toDateString();
					const showDate = prevDate !== msgDateString;
					prevDate = msgDateString;

					return (
						<div
							key={msg.id}
							className={`flex ${isMe ? "justify-end" : "justify-start"} flex-col`}
						>
							{showDate && (
								<div className="date-separator">
									{formatDate(msg.createdAt)}
								</div>
							)}

							<div className={isMe ? "align-end" : "align-start"}>
								<div className={isMe ? "div-msg-sender" : "div-msg"}>
									{editingId === msg.id ? (
										<input
											value={editText}
											onChange={(e) => setEditText(e.target.value)}
											onBlur={() => saveEdit(msg.id)}
											onKeyDown={(e) =>
												e.key === "Enter" && saveEdit(msg.id)
											}
											className="input-message"
										/>
									) : (
										<p className="text-sm">{msg.text}</p>
									)}

									<p className="text-[10px] text-right mt-1 text-time">
										{formatTime(msg.createdAt)}
									</p>

									{isMe && (
										<div className="msg-actions">
											<button onClick={() => editMessage(msg)}>✏️</button>
											<button onClick={() => deleteMessage(msg.id)}>🗑️</button>
										</div>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* INPUT */}
			<form
				onSubmit={sendMessage}
				className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl div-wht shadow-sm rounded-full px-4 py-3 flex items-center gap-3"
			>
				<input
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Escribe un mensaje..."
					className="input-message flex-1"
				/>
				<button
					type="submit"
					className="bg-[var(--accent)] text-white w-10 h-10 rounded-full flex items-center justify-center"
				>
					➤
				</button>
			</form>

			{/* BOTÓN SCROLL */}
			{!isAtBottom && (
				<button
					onClick={() => {
						messagesRef.current.scrollTop =
							messagesRef.current.scrollHeight;
						setIsAtBottom(true);
					}}
					className="btn-scroll-bottom"
				>
					↓
				</button>
			)}
		</div>
	);
}
