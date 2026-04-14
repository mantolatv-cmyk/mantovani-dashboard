"use client";

import { useRentals } from "@/hooks/useRentals";
import ClientList from "@/components/ClientList";

export default function ClientesPage() {
  // Puxa as locações (sem filtro de status, para pegar todo mundo que já alugou alguma vez)
  const { rentals, loading, error } = useRentals(null);

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-white tracking-tight"
          id="page-title"
        >
          Clientes Cadastrados
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Lista de todos os clientes extraída dos registros de locação.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          Erro ao carregar dados: {error}
        </div>
      )}

      {/* Client List */}
      <ClientList rentals={rentals} loading={loading} />
    </div>
  );
}
