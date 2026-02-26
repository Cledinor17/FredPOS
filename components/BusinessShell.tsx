"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { RequireAuth } from "./RequireAuth";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { logout } from "../lib/authApi";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

export default function BusinessShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ business: string }>();
  const business = params?.business || "";

  const { user, clear } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = useMemo(() => (business ? business.toUpperCase() : "POS"), [business]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      clear();                 // ✅ important
      router.replace("/login");
    }
  }

  // Ferme le drawer mobile quand on change de page
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50">
        {/* Sidebar FIXE (desktop) */}
        <aside className="hidden md:block fixed left-0 top-0 z-30 h-screen w-72 border-r bg-white">
          <Sidebar />
        </aside>

        {/* Drawer (mobile) */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl border-r">
              <div className="h-14 px-3 border-b flex items-center justify-between">
                <div className="font-bold text-slate-900">Navigation</div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100"
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <Sidebar />

              <div className="p-3 border-t">
                <button
                  onClick={handleLogout}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white py-2.5 hover:bg-slate-800 font-semibold"
                >
                  🚪 Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenu : décalé à droite sur desktop */}
        <main className="md:pl-72">
          {/* Topbar desktop (sticky) */}
          <div className="hidden md:block sticky top-0 z-20 bg-slate-50/80 backdrop-blur border-b">
            <Topbar
              business={business}
              title={title}
              userName={user?.name ?? "Utilisateur"}
              userEmail={user?.email ?? ""}
              onLogout={handleLogout}
            />
          </div>

          {/* Topbar mobile */}
          <header className="md:hidden sticky top-0 z-40 bg-white border-b">
            <div className="h-14 px-3 flex items-center justify-between">
              <button
                onClick={() => setMobileOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white hover:bg-slate-50"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
                <span className="text-sm font-semibold">Menu</span>
              </button>

              <div className="text-right leading-tight">
                <div className="text-sm font-bold text-slate-900">{title}</div>
                <div className="text-[11px] text-slate-500">
                  {user?.name ? `👋 ${user.name}` : "Caisse prête ✅"}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                aria-label="Se déconnecter"
              >
                🚪
              </button>
            </div>
          </header>

          {/* Page */}
          <div className="min-h-screen p-4 md:p-6 overflow-y-auto">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}
