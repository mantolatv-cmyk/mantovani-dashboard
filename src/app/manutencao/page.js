"use client";

import { useState } from "react";
import { Wrench, Plus } from "lucide-react";
import MaintenanceList from "@/components/MaintenanceList";
import MaintenanceModal from "@/components/MaintenanceModal";
import { useMaintenance } from "@/hooks/useMaintenance";

export default function ManutencaoPage() {
  const { maintenances, loading, error } = useMaintenance();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white tracking-tight"
            id="page-title"
          >
            Manutenção
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie equipamentos em manutenção, reparos e baixas
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="text-sm font-semibold text-amber-400">
                {maintenances.length} em manutenção
              </span>
            </div>
          )}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-medium shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:from-amber-500 hover:to-amber-600 transition-all duration-200 active:scale-95"
            id="send-to-maintenance-btn"
          >
            <Plus size={16} />
            Enviar para Manutenção
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          Erro ao carregar dados: {error}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Legenda:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-[10px] font-bold text-amber-400">#1</span>
          <span className="text-xs text-slate-400">Esperando Peças</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-[10px] font-bold text-emerald-400">#2</span>
          <span className="text-xs text-slate-400">Pronto</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-red-500/15 border border-red-500/25 flex items-center justify-center text-[10px] font-bold text-red-400">#3</span>
          <span className="text-xs text-slate-400">Irreparável</span>
        </div>
      </div>

      {/* Maintenance List */}
      <MaintenanceList maintenances={maintenances} loading={loading} />

      {/* Modal */}
      <MaintenanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
