export default function ProfileModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="div-wht rounded-xl w-[320px] p-5 animate-scale-in">
        <h3 className="font-bold text-lg mb-4">👤 Perfil</h3>

        <div className="flex flex-col items-center gap-3">
          <img
            src={user.photoURL}
            className="w-20 h-20 rounded-full"
          />
          <p className="font-semibold">{user.displayName}</p>
          <p className="text-muted text-sm">{user.email}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full btn-light"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
