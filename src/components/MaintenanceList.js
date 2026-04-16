"use client";

import { useState } from "react";
import {
  Wrench,
  Clock,
  CheckCircle2,
  XOctagon,
  Package,
  ArrowLeftRight,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  Loader2,
  MessageSquare,
  Calendar,
} from "lucide-react";
import {
  updateMaintenanceStatus,
  returnFromMaintenance,
  writeOffEquipment,
} from "@/lib/firestore";
import { useToast } from "@/components/Toast";
import { isFirebaseConfigured } from "@/lib/mockData";
import { generateMaintenanceOS } from "@/lib/pdfGenerator";
import { FileDown } from "lucide-react";

const STATUS_CONFIG = {
  esperando_pecas: {
    label: "Esperando Peças",
    color: "amber",
    icon: Clock,
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    badgeBg: "bg-amber-500/15",
    badgeBorder: "border-amber-500/25",
    number: 1,
  },
  pronto: {
    label: "Pronto",
    color: "emerald",
    icon: CheckCircle2,
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    badgeBg: "bg-emerald-500/15",
    badgeBorder: "border-emerald-500/25",
    number: 2,
  },
  irreparavel: {
    label: "Irreparável",
    color: "red",
    icon: XOctagon,
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400",
    badgeBg: "bg-red-500/15",
    badgeBorder: "border-red-500/25",
    number: 3,
  },
};

export default function MaintenanceList({ maintenances, loading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [processingId, setProcessingId] = useState(null);
  const { addToast } = useToast();

  const isDemo = !isFirebaseConfigured();

  function formatDate(dateValue) {
    if (!dateValue) return "—";
    const date = dateValue instanceof Date ? dateValue : dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Filter
  const filtered = maintenances.filter((m) => {
    const matchesSearch = m.equipamentoNome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "todos" || m.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Group by status
  const grouped = {
    esperando_pecas: filtered.filter((m) => m.status === "esperando_pecas"),
    pronto: filtered.filter((m) => m.status === "pronto"),
    irreparavel: filtered.filter((m) => m.status === "irreparavel"),
  };

  // Counters
  const counts = {
    esperando_pecas: maintenances.filter((m) => m.status === "esperando_pecas").length,
    pronto: maintenances.filter((m) => m.status === "pronto").length,
    irreparavel: maintenances.filter((m) => m.status === "irreparavel").length,
  };

  async function handleStatusChange(item, newStatus) {
    if (isDemo) {
      addToast("Modo demonstração: conecte o Firebase para salvar alterações.", "info");
      return;
    }
    setProcessingId(item.id);
    try {
      await updateMaintenanceStatus(item.id, newStatus);
      addToast(`Status de "${item.equipamentoNome}" atualizado para "${STATUS_CONFIG[newStatus].label}".`, "success");
    } catch (error) {
      addToast(`Erro: ${error.message}`, "error");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReturnToStock(item) {
    if (isDemo) {
      addToast("Modo demonstração: conecte o Firebase para salvar alterações.", "info");
      return;
    }
    if (!confirm(`Devolver "${item.equipamentoNome}" (${item.quantidade} un.) ao estoque?`)) return;
    setProcessingId(item.id);
    try {
      await returnFromMaintenance(item.id);
      addToast(`"${item.equipamentoNome}" devolvido ao estoque com sucesso!`, "success");
    } catch (error) {
      addToast(`Erro: ${error.message}`, "error");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleWriteOff(item) {
    if (isDemo) {
      addToast("Modo demonstração: conecte o Firebase para salvar alterações.", "info");
      return;
    }
    if (
      !confirm(
        `ATENÇÃO: Dar baixa permanente em "${item.equipamentoNome}" (${item.quantidade} un.)? Isso irá deduzir do total comprado.`
      )
    )
      return;
    setProcessingId(item.id);
    try {
      await writeOffEquipment(item.id);
      addToast(`"${item.equipamentoNome}" — baixa permanente registrada.`, "success");
    } catch (error) {
      addToast(`Erro: ${error.message}`, "error");
    } finally {
      setProcessingId(null);
    }
  }
  
  async function handleGenerateOS(item) {
    try {
      addToast(`Gerando Ordem de Serviço para "${item.equipamentoNome}"...`, "info");
      const blob = await generateMaintenanceOS(item);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      addToast(`Erro ao gerar PDF: ${error.message}`, "error");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" id="maintenance-list">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div
              key={key}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${cfg.bg} border ${cfg.border}`}
            >
              <Icon size={18} className={cfg.text} />
              <div>
                <p className="text-xs text-slate-500 font-medium">{cfg.label}</p>
                <p className={`text-lg font-bold ${cfg.text}`}>{counts[key]}</p>
              </div>
              <div className={`ml-auto w-7 h-7 rounded-lg ${cfg.badgeBg} border ${cfg.badgeBorder} flex items-center justify-center`}>
                <span className={`text-xs font-bold ${cfg.text}`}>{cfg.number}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por equipamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
            id="maintenance-search"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          {[
            { value: "todos", label: "Todos" },
            { value: "esperando_pecas", label: "Esperando" },
            { value: "pronto", label: "Prontos" },
            { value: "irreparavel", label: "Irreparáveis" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${
                  filterStatus === opt.value
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-500 hover:text-slate-300 border border-slate-700/30 hover:bg-slate-800/40"
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Wrench size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500 text-sm">
            {searchTerm || filterStatus !== "todos"
              ? "Nenhum registro encontrado para esse filtro."
              : "Nenhum equipamento em manutenção."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Render by status group */}
          {Object.entries(grouped).map(([statusKey, items]) => {
            if (items.length === 0) return null;
            const cfg = STATUS_CONFIG[statusKey];
            const StatusIcon = cfg.icon;

            return (
              <div key={statusKey}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${cfg.bg} border ${cfg.border}`}>
                    <StatusIcon size={14} className={cfg.text} />
                    <span className={`text-sm font-semibold ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${cfg.badgeBg} ${cfg.text}`}>
                      #{cfg.number}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-slate-800/60" />
                  <span className="text-xs text-slate-600">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`
                        rounded-2xl border p-5 bg-slate-900/50 backdrop-blur-sm
                        transition-all duration-200 hover:shadow-lg
                        ${cfg.border} hover:shadow-${cfg.color}-500/5
                      `}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                            <Package size={18} className={cfg.text} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {item.equipamentoNome}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Qtd: {item.quantidade} — Desde {formatDate(item.criadoEm)}
                            </p>
                            {item.numeroEquipamento && (
                              <p className="text-[10px] text-amber-500/70 font-mono mt-1">
                                Série: {item.numeroEquipamento}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleGenerateOS(item)}
                            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                            title="Gerar Ordem de Serviço (PDF)"
                          >
                            <FileDown size={16} />
                          </button>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.badgeBg} ${cfg.text} border ${cfg.badgeBorder}`}
                          >
                            #{cfg.number} {cfg.label}
                          </span>
                        </div>
                      </div>

                      {/* Observation */}
                      {item.observacao && (
                        <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/20">
                          <MessageSquare size={13} className="text-slate-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {item.observacao}
                          </p>
                        </div>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-2 mb-4 text-[11px] text-slate-500">
                        <Calendar size={12} />
                        <span>Atualizado em {formatDate(item.atualizadoEm)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/50">
                        {/* Change status dropdown buttons */}
                        {item.status === "esperando_pecas" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(item, "pronto")}
                              disabled={processingId === item.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50 active:scale-95"
                            >
                              <CheckCircle2 size={13} />
                              Marcar Pronto
                            </button>
                            <button
                              onClick={() => handleStatusChange(item, "irreparavel")}
                              disabled={processingId === item.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50 active:scale-95"
                            >
                              <XOctagon size={13} />
                              Irreparável
                            </button>
                          </>
                        )}

                        {item.status === "pronto" && (
                          <button
                            onClick={() => handleReturnToStock(item)}
                            disabled={processingId === item.id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium shadow-lg shadow-blue-500/15 hover:shadow-blue-500/30 hover:from-blue-500 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 active:scale-95"
                          >
                            {processingId === item.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <ArrowLeftRight size={15} />
                            )}
                            Devolver ao Estoque
                          </button>
                        )}

                        {item.status === "irreparavel" && (
                          <button
                            onClick={() => handleWriteOff(item)}
                            disabled={processingId === item.id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium shadow-lg shadow-red-500/15 hover:shadow-red-500/30 hover:from-red-500 hover:to-red-600 transition-all duration-200 disabled:opacity-50 active:scale-95"
                          >
                            {processingId === item.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                            Dar Baixa Permanente
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
