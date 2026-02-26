"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "../../lib/authApi";
import { ApiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
type ErrorBody = { message?: unknown };
function getLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.body && typeof error.body === "object") {
      const body = error.body as ErrorBody;
      if (typeof body.message === "string" && body.message.length > 0) {
        return body.message;
      }
    }
    return error.message;
  }
  return "Echec de la connexion";
}
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      const data = await refresh();
      if (!data?.user) {
        setErr(
          "Connexion etablie, mais impossible de charger le profil (/api/me). Verifie le backend.",
        );
        return;
      }
      const isSafeNext =
        typeof next === "string" &&
        next.startsWith("/") &&
        !next.startsWith("//");
      if (isSafeNext) {
        router.replace(next);
        return;
      }
      const slug = data?.activeBusiness?.slug || data?.businesses?.[0]?.slug;
      router.replace(slug ? `/${slug}/dashboard` : "/");
    } catch (error: unknown) {
      setErr(getLoginErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      {" "}
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm"
      >
        {" "}
        <div className="space-y-2">
          {" "}
          <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>{" "}
          <p className="text-slate-500 text-sm">
            Entrez vos identifiants pour acceder a votre POS.
          </p>{" "}
        </div>{" "}
        {err && (
          <div className="border border-red-200 bg-red-50 text-red-600 text-sm rounded-lg p-3 animate-pulse">
            {" "}
            <i className="fas fa-exclamation-circle mr-2" /> {err}{" "}
          </div>
        )}{" "}
        <div className="space-y-4">
          {" "}
          <div>
            {" "}
            <label className="text-sm font-medium text-slate-700">
              Email
            </label>{" "}
            <input
              type="email"
              required
              className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="nom@exemple.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-medium text-slate-700">
              Mot de passe
            </label>{" "}
            <input
              type="password"
              required
              className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />{" "}
          </div>{" "}
        </div>{" "}
        <button
          className="w-full brand-primary-btn text-white font-semibold rounded-xl px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {" "}
          {loading ? (
            <span className="flex items-center justify-center">
              {" "}
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                viewBox="0 0 24 24"
              >
                {" "}
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />{" "}
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />{" "}
              </svg>{" "}
              Connexion en cours...{" "}
            </span>
          ) : (
            "Se connecter"
          )}{" "}
        </button>{" "}
      </form>{" "}
    </div>
  );
}
