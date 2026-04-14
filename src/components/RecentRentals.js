"use client";

import { FileText, Calendar, DollarSign, User } from "lucide-react";

export default function RecentRentals({ rentals, loading }) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={40} className="mx-auto text-slate-700 mb-3" />
        <p className="text-slate-500 text-sm">Nenhuma locação registrada.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" id="recent-rentals">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800/50">
            <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Cliente
            </th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Equipamento
            </th>
            <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Período
            </th>
            <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Valor
            </th>
            <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rentals.map((rental, index) => (
            <tr
              key={rental.id}
              className={`
                border-b border-slate-800/30 last:border-b-0
                hover:bg-slate-800/30 transition-colors duration-150
                ${index % 2 === 0 ? "bg-slate-900/20" : ""}
              `}
            >
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                    <User size={13} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {rental.cliente?.nome || "—"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {rental.cliente?.cpf || ""}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <p className="text-sm text-slate-300">
                  {rental.equipamentoNome || "—"}
                </p>
                <p className="text-[11px] text-slate-500">
                  Qtd: {rental.quantidade || 1}
                </p>
              </td>
              <td className="text-center px-4 py-3.5">
                <div className="flex items-center justify-center gap-1.5">
                  <Calendar size={12} className="text-slate-500" />
                  <span className="text-xs text-slate-400">
                    {formatDate(rental.dataInicio)} → {formatDate(rental.dataFim)}
                  </span>
                </div>
              </td>
              <td className="text-right px-4 py-3.5">
                <span className="text-sm font-semibold text-emerald-400">
                  {formatCurrency(rental.valorTotal)}
                </span>
              </td>
              <td className="text-center px-4 py-3.5">
                <span
                  className={`
                    inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold
                    ${
                      rental.status === "ativa"
                        ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                        : "bg-slate-700/30 text-slate-400 border border-slate-600/30"
                    }
                  `}
                >
                  {rental.status === "ativa" ? "Ativa" : "Encerrada"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
