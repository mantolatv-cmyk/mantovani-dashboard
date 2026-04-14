"use client";

import { useState } from "react";
import {
  User,
  Package,
  Calendar,
  DollarSign,
  RotateCcw,
  FileText,
  ExternalLink,
  Loader2,
  Inbox,
} from "lucide-react";
import { returnRental } from "@/lib/firestore";
import { useToast } from "@/components/Toast";
import { isFirebaseConfigured } from "@/lib/mockData";

export default function ReturnsList({ rentals, loading }) {
  const [returningId, setReturningId] = useState(null);
  const { addToast } = useToast();

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  }

  function formatCurrency(value) {
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function isOverdue(dataFim) {
    if (!dataFim) return false;
    const today = new Date().toISOString().split("T")[0];
    return dataFim < today;
  }

  async function handleReturn(rental) {
    if (
      !confirm(
        `Confirma a devolução do equipamento "${rental.equipamentoNome}" do cliente "${rental.cliente?.nome}"?`
      )
    )
      return;

    if (!isFirebaseConfigured()) {
      addToast("Modo demonstração: conecte o Firebase para registrar devoluções e alterar dados.", "info");
      return;
    }

    setReturningId(rental.id);
    try {
      await returnRental(rental.id);
      addToast(
        `Devolução de "${rental.equipamentoNome}" registrada com sucesso!`,
        "success"
      );
    } catch (error) {
      addToast(`Erro: ${error.message}`, "error");
    } finally {
      setReturningId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className="text-center py-20">
        <Inbox size={56} className="mx-auto text-slate-700 mb-4" />
        <p className="text-slate-400 text-base font-medium mb-1">
          Nenhuma locação ativa
        </p>
        <p className="text-slate-600 text-sm">
          Quando houver locações em aberto, elas aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" id="returns-list">
      {rentals.map((rental) => {
        const overdue = isOverdue(rental.dataFim);

        return (
          <div
            key={rental.id}
            className={`
              rounded-2xl border p-5
              bg-slate-900/50 backdrop-blur-sm
              transition-all duration-200 hover:shadow-lg
              ${
                overdue
                  ? "border-red-500/30 hover:shadow-red-500/5"
                  : "border-slate-800/50 hover:shadow-blue-500/5"
              }
            `}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    overdue ? "bg-red-500/10" : "bg-blue-500/10"
                  }`}
                >
                  <User
                    size={18}
                    className={overdue ? "text-red-400" : "text-blue-400"}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {rental.cliente?.nome || "—"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    CPF: {rental.cliente?.cpf || "—"}
                  </p>
                </div>
              </div>
              {overdue && (
                <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25">
                  Atrasada
                </span>
              )}
            </div>

            {/* Details */}
            <div className="space-y-2.5 mb-5">
              <div className="flex items-center gap-2.5">
                <Package size={14} className="text-slate-500" />
                <span className="text-sm text-slate-300">
                  {rental.equipamentoNome} — Qtd: {rental.quantidade}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar size={14} className="text-slate-500" />
                <span className="text-xs text-slate-400">
                  {formatDate(rental.dataInicio)} → {formatDate(rental.dataFim)}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <DollarSign size={14} className="text-slate-500" />
                <span className="text-sm font-semibold text-emerald-400">
                  {formatCurrency(rental.valorTotal)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50">
              <button
                onClick={() => handleReturn(rental)}
                disabled={returningId === rental.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-medium shadow-lg shadow-amber-500/15 hover:shadow-amber-500/30 hover:from-amber-500 hover:to-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                id={`return-btn-${rental.id}`}
              >
                {returningId === rental.id ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <RotateCcw size={15} />
                )}
                {returningId === rental.id
                  ? "Processando..."
                  : "Registrar Devolução"}
              </button>

              {rental.contratoUrl && (
                <a
                  href={rental.contratoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/60 text-sm transition-all"
                  title="Ver contrato"
                >
                  <FileText size={15} />
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
