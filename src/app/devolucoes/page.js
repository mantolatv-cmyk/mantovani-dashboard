"use client";

import ReturnsList from "@/components/ReturnsList";
import { useRentals } from "@/hooks/useRentals";

export default function DevolucoesPage() {
  const { rentals, loading, error } = useRentals("ativa");

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight" id="page-title">
            Devoluções
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie as devoluções de equipamentos em locação
          </p>
        </div>
        {!loading && (
          <div className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <span className="text-sm font-semibold text-blue-400">
              {rentals.length} {rentals.length === 1 ? "ativa" : "ativas"}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          Erro ao carregar dados: {error}
        </div>
      )}

      {/* Returns List */}
      <ReturnsList rentals={rentals} loading={loading} />
    </div>
  );
}
