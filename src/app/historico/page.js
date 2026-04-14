"use client";

import HistoryList from "@/components/HistoryList";
import { useHistory } from "@/hooks/useHistory";

export default function HistoricoPage() {
  const { history, loading, error } = useHistory();

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white tracking-tight"
            id="page-title"
          >
            Histórico
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro de todas as entregas e devoluções de equipamentos
          </p>
        </div>
        {!loading && (
          <div className="px-3 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/20">
            <span className="text-sm font-semibold text-slate-400">
              {history.length} registro{history.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          Erro ao carregar dados: {error}
        </div>
      )}

      {/* History */}
      <HistoryList history={history} loading={loading} />
    </div>
  );
}
