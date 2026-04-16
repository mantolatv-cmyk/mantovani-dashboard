"use client";

import { useState } from "react";
import {
  ArrowUpFromLine,
  ArrowDownToLine,
  Package,
  User,
  Calendar,
  Search,
  Filter,
  History,
  FileText,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { generateContractPDF } from "@/lib/pdfGenerator";

export default function HistoryList({ history, loading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos"); // "todos" | "entrega" | "devolucao"
  const [regeneratingId, setRegeneratingId] = useState(null);
  const { addToast } = useToast();

  async function handleRegeneratePDF(entry) {
    if (!entry.rawData) {
      addToast("Dados incompletos para gerar contrato.", "error");
      return;
    }

    setRegeneratingId(entry.id);
    try {
      const pdfBlob = await generateContractPDF(entry.rawData);

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contrato_${entry.clienteNome.replace(/\s+/g, "_").toLowerCase()}_copia.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addToast("Contrato (2ª via) gerado com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao re-gerar PDF:", err);
      addToast(`Erro ao gerar contrato: ${err.message}`, "error");
    } finally {
      setRegeneratingId(null);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  }

  function formatDateFull(dateStr) {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr + "T12:00:00");
      return date.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return formatDate(dateStr);
    }
  }

  // Agrupamento por mês
  function groupByMonth(entries) {
    const groups = {};
    entries.forEach((entry) => {
      if (!entry.data) return;
      const key = entry.data.substring(0, 7); // "YYYY-MM"
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });
    return groups;
  }

  function getMonthLabel(yearMonth) {
    try {
      const [year, month] = yearMonth.split("-");
      const date = new Date(Number(year), Number(month) - 1, 1);
      const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      return label.charAt(0).toUpperCase() + label.slice(1);
    } catch {
      return yearMonth;
    }
  }

  // Filtros
  const filtered = history.filter((entry) => {
    const matchesSearch =
      entry.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.equipamentoNome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "todos" || entry.tipo === filterType;
    return matchesSearch && matchesFilter;
  });

  const grouped = groupByMonth(filtered);
  const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // Contadores
  const totalEntregas = history.filter((e) => e.tipo === "entrega").length;
  const totalDevolucoes = history.filter((e) => e.tipo === "devolucao").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" id="history-list">
      {/* Stats mini cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/8 border border-blue-500/15">
          <ArrowUpFromLine size={18} className="text-blue-400" />
          <div>
            <p className="text-xs text-slate-500 font-medium">Entregas</p>
            <p className="text-lg font-bold text-blue-400">{totalEntregas}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
          <ArrowDownToLine size={18} className="text-amber-400" />
          <div>
            <p className="text-xs text-slate-500 font-medium">Devoluções</p>
            <p className="text-lg font-bold text-amber-400">{totalDevolucoes}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-500/8 border border-slate-500/15">
          <History size={18} className="text-slate-400" />
          <div>
            <p className="text-xs text-slate-500 font-medium">Total</p>
            <p className="text-lg font-bold text-slate-300">{history.length}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Buscar por cliente ou equipamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
            id="history-search"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          {[
            { value: "todos", label: "Todos" },
            { value: "entrega", label: "Entregas" },
            { value: "devolucao", label: "Devoluções" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${
                  filterType === opt.value
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

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <History size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500 text-sm">
            {searchTerm || filterType !== "todos"
              ? "Nenhuma movimentação encontrada para esse filtro."
              : "Nenhuma movimentação registrada ainda."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedMonths.map((month) => (
            <div key={month}>
              {/* Month Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40">
                  <span className="text-sm font-semibold text-slate-300">
                    {getMonthLabel(month)}
                  </span>
                </div>
                <div className="flex-1 h-px bg-slate-800/60" />
                <span className="text-xs text-slate-600">
                  {grouped[month].length} registro{grouped[month].length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Entries */}
              <div className="relative pl-6 space-y-3">
                {/* Timeline line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-800/60" />

                {grouped[month].map((entry) => {
                  const isEntrega = entry.tipo === "entrega";

                  return (
                    <div
                      key={entry.id}
                      className={`
                        relative flex items-start gap-4 p-4 rounded-xl
                        border transition-all duration-200
                        hover:shadow-lg
                        ${
                          isEntrega
                            ? "bg-blue-500/5 border-blue-500/15 hover:shadow-blue-500/5"
                            : "bg-amber-500/5 border-amber-500/15 hover:shadow-amber-500/5"
                        }
                      `}
                    >
                      {/* Timeline dot */}
                      <div
                        className={`
                          absolute -left-6 top-5 w-[9px] h-[9px] rounded-full border-2
                          ${
                            isEntrega
                              ? "bg-blue-500 border-blue-400 shadow-sm shadow-blue-500/50"
                              : "bg-amber-500 border-amber-400 shadow-sm shadow-amber-500/50"
                          }
                        `}
                      />

                      {/* Icon */}
                      <div
                        className={`
                          flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                          ${isEntrega ? "bg-blue-500/15" : "bg-amber-500/15"}
                        `}
                      >
                        {isEntrega ? (
                          <ArrowUpFromLine size={18} className="text-blue-400" />
                        ) : (
                          <ArrowDownToLine size={18} className="text-amber-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`
                              px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                              ${
                                isEntrega
                                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                                  : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                              }
                            `}
                          >
                            {isEntrega ? "Entrega" : "Devolução"}
                          </span>
                          <div className="flex items-center gap-1 text-slate-500">
                            <Calendar size={11} />
                            <span className="text-[11px]">
                              {formatDateFull(entry.data)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                          <div className="flex items-center gap-1.5">
                            <User size={13} className="text-slate-500" />
                            <span className="text-sm text-slate-300 font-medium">
                              {entry.clienteNome}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Package size={13} className="text-slate-500" />
                            <span className="text-sm text-slate-400">
                              {entry.equipamentoNome}
                              {entry.numeroEquipamento && (
                                <span className="text-xs text-slate-500 font-mono ml-2 px-1.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/50">
                                  #{entry.numeroEquipamento}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions/Quantity */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-3">
                        {isEntrega && (
                          <button
                            onClick={() => handleRegeneratePDF(entry)}
                            disabled={regeneratingId === entry.id}
                            className={`
                              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all
                              ${regeneratingId === entry.id 
                                ? "bg-slate-700 text-slate-500 cursor-not-allowed" 
                                : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 active:scale-95"
                              }
                            `}
                            title="Gerar Contrato (2ª Via)"
                          >
                            {regeneratingId === entry.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <FileText size={12} />
                            )}
                            {regeneratingId === entry.id ? "Gerando..." : "Contrato"}
                          </button>
                        )}
                        
                        <div className="text-right">
                          <p className="text-[10px] text-slate-600 uppercase tracking-wider font-medium mb-0.5">
                            Qtd
                          </p>
                          <span
                            className={`
                              inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold
                              ${
                                isEntrega
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }
                            `}
                          >
                            {entry.quantidade}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
