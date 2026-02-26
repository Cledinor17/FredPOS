"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { updatePassword, updateAvatar } from "../lib/authApi";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase()).join("") || "U";
}

export default function Topbar({
  business,
  title,
  userName,
  userEmail,
  onLogout,
}: {
  business: string;
  title: string;
  userName: string;
  userEmail: string;
  onLogout: () => void;
}) {
  const router = useRouter();
  const { refresh, activeBusiness } = useAuth();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const [pwOpen, setPwOpen] = useState(false);
  const [avOpen, setAvOpen] = useState(false);

  const role = useMemo(() => {
    const r = (activeBusiness as any)?.pivot?.role ?? (activeBusiness as any)?.role ?? null;
    return r ? String(r) : "";
  }, [activeBusiness]);

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    // Page de recherche (à créer quand tu veux)
    router.push(`/${business}/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="h-16 px-6 flex items-center gap-4">
      <div className="min-w-[180px]">
        <div className="text-xs text-slate-500">Business</div>
        <div className="font-extrabold text-slate-900">{title}</div>
      </div>

      {/* Search */}
      <form onSubmit={onSearchSubmit} className="flex-1">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔎 Rechercher : produit, client, facture, ticket…"
            className="w-full rounded-2xl border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </form>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 rounded-2xl border bg-white px-3 py-2 hover:bg-slate-50"
        >
          <div className="h-9 w-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            {initials(userName)}
          </div>
          <div className="text-left leading-tight hidden lg:block">
            <div className="text-sm font-bold text-slate-900">{userName}</div>
            <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
              {role ? `Rôle: ${role}` : userEmail}
            </div>
          </div>
          <span className="text-slate-500">▾</span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl border bg-white shadow-xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b">
              <div className="font-semibold text-slate-900">{userName}</div>
              <div className="text-xs text-slate-500 truncate">{userEmail}</div>
              {role ? <div className="text-xs text-indigo-700 font-semibold mt-1">Rôle: {role}</div> : null}
            </div>

            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  setOpen(false);
                  setAvOpen(true);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100"
              >
                🖼️ Mettre à jour l’avatar
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  setPwOpen(true);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100"
              >
                🔐 Changer le mot de passe
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 font-semibold"
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {pwOpen && (
        <ChangePasswordModal
          onClose={() => setPwOpen(false)}
          onSaved={async () => {
            await refresh();
          }}
        />
      )}

      {avOpen && (
        <AvatarModal
          onClose={() => setAvOpen(false)}
          onSaved={async () => {
            await refresh();
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Modals ---------------- */

function ModalShell({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[92%] max-w-lg rounded-3xl bg-white shadow-2xl border">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="font-extrabold text-slate-900">{title}</div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
            ✖️
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ChangePasswordModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [current, setCurrent] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr("");
    if (pwd.length < 8) return setErr("Le nouveau mot de passe doit avoir au moins 8 caractères.");
    if (pwd !== confirm) return setErr("La confirmation ne correspond pas.");
    setLoading(true);
    try {
      await updatePassword(current, pwd, confirm);
      await onSaved();
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Échec du changement de mot de passe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell title="Changer le mot de passe" onClose={onClose}>
      {err ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{err}</div> : null}

      <div className="space-y-3">
        <div>
          <label className="text-sm font-semibold text-slate-700">Mot de passe actuel</label>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="mt-1 w-full rounded-2xl border px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Nouveau mot de passe</label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="mt-1 w-full rounded-2xl border px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Confirmer</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-2xl border px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-2xl bg-indigo-600 text-white py-3 font-bold hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Mise à jour..." : "Mettre à jour"}
        </button>
      </div>
    </ModalShell>
  );
}

function AvatarModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr("");
    if (!file) return setErr("Choisis une image (PNG/JPG).");
    setLoading(true);
    try {
      await updateAvatar(file);
      await onSaved();
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Échec upload avatar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell title="Mettre à jour l’avatar" onClose={onClose}>
      {err ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{err}</div> : null}

      <div className="space-y-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-2xl border bg-white py-3 font-semibold hover:bg-slate-50"
        >
          📁 Choisir une image
        </button>

        {file ? (
          <div className="text-sm text-slate-700">
            Fichier : <span className="font-semibold">{file.name}</span>
          </div>
        ) : null}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-2xl bg-slate-900 text-white py-3 font-bold hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Upload..." : "Enregistrer"}
        </button>
      </div>
    </ModalShell>
  );
}