import StatCard from "@/components/dashboard/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentSales from "@/components/dashboard/RecentSales";
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventes du jour"
          value="$1,240.50"
          note="+12% vs hier"
          noteTone="good"
          iconClass="fa-solid fa-dollar-sign"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Commandes"
          value="45"
          note="8 en attente"
          noteTone="info"
          iconClass="fa-solid fa-shopping-bag"
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Rupture Stock"
          value="3"
          valueClass="text-red-500"
          note="Articles à commander"
          noteTone="muted"
          iconClass="fa-solid fa-exclamation-triangle"
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        <StatCard
          title="Nouveaux Clients"
          value="12"
          note="Ce mois-ci"
          noteTone="warn"
          iconClass="fa-solid fa-user-plus"
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 text-lg">Performance Hebdomadaire</h3>
          <SalesChart />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <RecentSales />
        </div>
      </div>
    </div>
  );
}
