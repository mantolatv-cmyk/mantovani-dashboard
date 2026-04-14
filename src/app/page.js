"use client";

import { Package, PackageCheck, FileText, TrendingUp } from "lucide-react";
import StatCard from "@/components/StatCard";
import RecentRentals from "@/components/RecentRentals";
import { useEquipments } from "@/hooks/useEquipments";
import { useRentals } from "@/hooks/useRentals";

export default function DashboardPage() {
  const { equipments, loading: loadingEq } = useEquipments();
  const { rentals: activeRentals, loading: loadingActive } = useRentals("ativa");
  const { rentals: recentRentals, loading: loadingRecent } = useRentals(null, 5);

  // Cálculos do dashboard
  const totalComprado = equipments.reduce((sum, eq) => sum + (eq.totalComprado || 0), 0);
  const totalDisponivel = equipments.reduce((sum, eq) => sum + (eq.disponivel || 0), 0);
  const totalAlugado = totalComprado - totalDisponivel;

  return (
    <div className="page-enter space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight" id="page-title">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Visão geral das operações — Mantovani Locações
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          title="Em Locação"
          value={loadingEq ? "..." : totalAlugado}
          subtitle="equipamentos alugados"
          color="blue"
        />
        <StatCard
          icon={PackageCheck}
          title="Em Estoque"
          value={loadingEq ? "..." : totalDisponivel}
          subtitle="disponíveis para locação"
          color="green"
        />
        <StatCard
          icon={FileText}
          title="Locações Ativas"
          value={loadingActive ? "..." : activeRentals.length}
          subtitle="contratos em aberto"
          color="amber"
        />
        <StatCard
          icon={Package}
          title="Total de Equipamentos"
          value={loadingEq ? "..." : equipments.length}
          subtitle="tipos cadastrados"
          color="violet"
        />
      </div>

      {/* Recent Rentals */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <div>
            <h2 className="text-base font-semibold text-white">
              Locações Recentes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Últimas 5 movimentações
            </p>
          </div>
        </div>
        <RecentRentals rentals={recentRentals} loading={loadingRecent} />
      </div>
    </div>
  );
}
