"use client";

import { useState, useEffect } from "react";
import { X, RotateCcw, Loader2, Info } from "lucide-react";
import { returnRental } from "@/lib/firestore";
import { useToast } from "@/components/Toast";
import { isFirebaseConfigured } from "@/lib/mockData";

export default function ReturnModal({ isOpen, onClose, rental, onReturnSuccess }) {
  const [quantidade, setQuantidade] = useState(1);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const isDemo = !isFirebaseConfigured();
  
  const qtdOriginal = rental ? (Number(rental.quantidade) || 1) : 1;
  const qtdDevolvida = rental ? (Number(rental.quantidadeDevolvida) || 0) : 0;
  const saldoRestante = qtdOriginal - qtdDevolvida;

  useEffect(() => {
    if (isOpen) {
      setQuantidade(saldoRestante);
    }
  }, [isOpen, saldoRestante]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!quantidade || Number(quantidade) < 1 || Number(quantidade) > saldoRestante) {
      addToast(`Informe uma quantidade válida (máximo ${saldoRestante}).`, "error");
      return;
    }

    if (isDemo) {
      addToast("Modo demonstração: conecte o Firebase para registrar devoluções parciais.", "info");
      onClose();
      return;
    }

    setSaving(true);
    try {
      await returnRental(rental.id, Number(quantidade));
      addToast(
        `Devolução de ${quantidade}x "${rental.equipamentoNome}" registrada com sucesso!`,
        "success"
      );
      if (onReturnSuccess) onReturnSuccess();
      onClose();
    } catch (error) {
      addToast(`Erro: ${error.message}`, "error");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen || !rental) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800/50 shadow-2xl shadow-black/40 animate-in" id="return-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <RotateCcw size={18} className="text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              Registrar Devolução
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <p className="text-sm text-slate-300">
              Equipamento: <span className="font-semibold text-white">{rental.equipamentoNome}</span>
            </p>
            <p className="text-sm text-slate-400">
              Locatário: {rental.cliente?.nome || "Não informado"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-2">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-1">Locado</p>
              <p className="text-lg font-bold text-slate-300">{qtdOriginal}</p>
            </div>
             <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-slate-500 mb-1">Saldo a Devolver</p>
              <p className="text-lg font-bold text-amber-400">{saldoRestante}</p>
            </div>
          </div>

          {/* Quantidade a devolver */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Quantidade desta devolução
            </label>
            <input
              type="number"
              min="1"
              max={saldoRestante}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all text-center"
              id="return-quantity-input"
            />
          </div>

          {/* Info box */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
            <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              O valor do contrato se mantém inalterado. A quantidade acima será devolvida ao estoque. Se o saldo for zerado, a locação será dada como encerrada.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/50 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-medium shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:from-amber-500 hover:to-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <RotateCcw size={15} />
              )}
              {saving ? "Registrando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
