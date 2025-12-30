import { auth, db } from "../config/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Login() {
  const login = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        name: user.displayName,
        photo: user.photoURL,
        online: true,
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Iniciar sesión</h2>
      <button onClick={login}>Entrar con Google</button>
    </div>
  );
}
