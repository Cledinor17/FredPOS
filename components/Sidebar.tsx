"use client";

import Link from "next/link";
import { logout } from "../lib/authApi";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useParams, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Undo2,
  Package,
  Boxes,
  Barcode,
  Users,
  UserCircle2,
  Truck,
  FileText,
  CreditCard,
  Landmark,
  BarChart3,
  Settings,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Store,
} from "lucide-react";

type NavItem = { label: string; href: (b: string) => string; icon?: any; badge?: string };

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function NavLink({ item, business }: { item: NavItem; business: string }) {
  const pathname = usePathname();
  const href = item.href(business);
  const active = pathname === href || pathname?.startsWith(href + "/");

  const Icon = item.icon;

  return (
    <Link
      href={href}
      className={cx(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
        active
          ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
          : "text-slate-700 hover:bg-slate-100"
      )}
    >
      {Icon ? (
        <Icon className={cx("h-4 w-4", active ? "text-indigo-700" : "text-slate-500 group-hover:text-slate-700")} />
      ) : null}

      <span className="font-medium">{item.label}</span>

      {item.badge ? (
        <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-slate-900 text-white">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group" open={defaultOpen}>
      <summary className="list-none cursor-pointer select-none flex items-center gap-2 px-2 py-2 text-xs font-semibold text-slate-500">
        <Icon className="h-4 w-4 text-slate-400" />
        <span className="uppercase tracking-wide">{title}</span>
        <ChevronDown className="ml-auto h-4 w-4 text-slate-400 transition group-open:rotate-180" />
      </summary>
      <div className="space-y-1 px-2 pb-2">{children}</div>
    </details>
  );
}

export default function Sidebar() {
const router = useRouter();
const { user, activeBusiness, clear } = useAuth();

// rôle (pivot.role) si dispo
const role =
  (activeBusiness as any)?.pivot?.role ??
  (activeBusiness as any)?.role ??
  null;

async function handleLogout() {
  try {
    await logout();
  } finally {
    clear();              // <-- important
    router.replace("/login");
  }
}
  const params = useParams<{ business: string }>();
  const business = params?.business || "";

  // Menu POS (complet + groupé)
  const dashboard: NavItem[] = [
    { label: "Tableau de bord", href: (b) => `/${b}/dashboard`, icon: LayoutDashboard },
  ];

  const sales: NavItem[] = [
    { label: "Nouvelle vente (POS)", href: (b) => `/${b}/pos`, icon: ShoppingCart, badge: "Rapide" },
    { label: "Tickets / Ventes", href: (b) => `/${b}/sales`, icon: Receipt },
    { label: "Retours & Remboursements", href: (b) => `/${b}/returns`, icon: Undo2 },
  ];

  const products: NavItem[] = [
    { label: "Catalogue produits", href: (b) => `/${b}/products`, icon: Package },
    { label: "Catégories", href: (b) => `/${b}/categories`, icon: Boxes },
    { label: "Stock & Inventaire", href: (b) => `/${b}/inventory`, icon: Boxes },
    { label: "Codes-barres / Étiquettes", href: (b) => `/${b}/labels`, icon: Barcode },
  ];

  const people: NavItem[] = [
    { label: "Clients", href: (b) => `/${b}/customers`, icon: Users },
    { label: "Fidélité", href: (b) => `/${b}/loyalty`, icon: UserCircle2 },
    { label: "Fournisseurs", href: (b) => `/${b}/suppliers`, icon: Truck },
  ];

  const docs: NavItem[] = [
    { label: "Devis / Documents", href: (b) => `/${b}/documents`, icon: FileText },
    { label: "Proformas", href: (b) => `/${b}/proformas`, icon: FileText },
    { label: "Factures", href: (b) => `/${b}/invoices`, icon: FileText },
  ];

  const finance: NavItem[] = [
    { label: "Paiements", href: (b) => `/${b}/payments`, icon: CreditCard },
    { label: "Caisse (mouvements)", href: (b) => `/${b}/cash-drawer`, icon: CreditCard },
    { label: "Comptabilité", href: (b) => `/${b}/accounting`, icon: Landmark },
    { label: "Périodes comptables", href: (b) => `/${b}/accounting/periods`, icon: Landmark },
  ];

  const reports: NavItem[] = [
    { label: "Rapports ventes", href: (b) => `/${b}/reports/sales`, icon: BarChart3 },
    { label: "Rapports stock", href: (b) => `/${b}/reports/inventory`, icon: BarChart3 },
    { label: "Créances clients (AR)", href: (b) => `/${b}/reports/ar`, icon: BarChart3 },
    { label: "Bilan & Résultat", href: (b) => `/${b}/reports/finance`, icon: BarChart3 },
  ];

  const admin: NavItem[] = [
    { label: "Paramètres", href: (b) => `/${b}/settings`, icon: Settings },
    { label: "Utilisateurs & Rôles", href: (b) => `/${b}/settings/users`, icon: ShieldCheck },
    { label: "Audit & Sécurité", href: (b) => `/${b}/audit`, icon: ShieldCheck },
    { label: "Aide", href: (b) => `/${b}/help`, icon: HelpCircle },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header sidebar */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Store className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-slate-900 text-base">
              {business ? business.toUpperCase() : "POS"}
            </div>
            <div className="text-xs text-slate-500">Bon retour 👋 On vend, on encaisse, on avance.</div>
          
  {/* Connecté en tant que
  <div className="font-semibold text-slate-900">
    {user?.name ?? "Utilisateur"}
  </div>
  {user?.email ? (
    <div className="text-xs text-slate-500 truncate">{user.email}</div>
  ) : null}
  {role ? (
    <div className="mt-1 inline-flex text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
      Rôle : {String(role)}
    </div>
  ) : null} */}

            
          </div>
          
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-2 space-y-3">
          {/* Accès rapide */}
          <div className="space-y-1 px-2">
            {dashboard.map((it) => (
              <NavLink key={it.label} item={it} business={business} />
            ))}
          </div>

          <Section title="Ventes" icon={ShoppingCart} defaultOpen>
            {sales.map((it) => (
              <NavLink key={it.label} item={it} business={business} />
            ))}
          </Section>

          <Section title="Produits" icon={Package} defaultOpen>
            {products.map((it) => (
              <NavLink key={it.label} item={it} business={business} />
            ))}
          </Section>

          <Section title="Clients & Fournisseurs" icon={Users} defaultOpen>
            {people.map((it) => (
              <NavLink key={it.label} item={it} business={business} />
            ))}
          </Section>

          <Section title="Documents" icon={FileText} defaultOpen>
            {docs.map((it) => (
              <NavLink key={it.label} item={it} business={business} />
            ))}
          </Section>

          <Section title="Finance" icon={Landmark} defaultOpen={false}>
            {finance.map((it) => (
              <NavLink key={it.label} item={it} business={business} />
            ))}
          </Section>

          <Section title="Rapports" icon={BarChart3} defaultOpen={false}>
            {reports.map((it) => (
              <NavLink key={it.label} item={it} business={business} />
            ))}
          </Section>

          <Section title="Administration" icon={Settings} defaultOpen={false}>
            {admin.map((it) => (
              <NavLink key={it.label} item={it} business={business} />
            ))}
          </Section>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-3 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>POS System</span>
          <span className="font-semibold text-indigo-700">v1</span>
        </div>
      </div>
    </div>
  );
}