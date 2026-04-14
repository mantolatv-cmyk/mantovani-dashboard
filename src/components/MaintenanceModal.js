"use client";

import { useState } from "react";
import { X, Wrench, Loader2 } from "lucide-react";
import { sendToMaintenance } from "@/lib/firestore";
import { useEquipments } from "@/hooks/useEquipments";
import { useToast } from "@/components/Toast";
import { isFirebaseConfigured } from "@/lib/mockData";

export default function MaintenanceModal({ isOpen, onClose }) {
  const [equipamentoId, setEquipamentoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);
  const { equipments, loading: loadingEq } = useEquipments();
  const { addToast } = useToast();

  const isDemo = !isFirebaseConfigured();

  function getSelectedEquipment() {
    return equipments.find((eq) => eq.id === equipamentoId);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!equipamentoId) {
      addToast("Selecione um equipamento.", "error");
      return;
    }

    if (!quantidade || Number(quantidade) < 1) {
      addToast("Informe uma quantidade válida.", "error");
      return;
    }

    const eq = getSelectedEquipment();
    if (eq && Number(quantidade) > eq.disponivel) {
      addToast(`Estoque insuficiente. Disponível: ${eq.disponivel}`, "error");
      return;
    }

    if (isDemo) {
      addToast("Modo demonstração: conecte o Firebase para salvar.", "info");
      onClose();
      return;
    }

    setSaving(true);
    try {
      await sendToMaintenance({
        equipamentoId,
        equipamentoNome: eq?.nome || "",
        quantidade: Number(quantidade),
        observacao: observacao.trim(),
      });
      addToast(`"${eq?.nome}" enviado para manutenção!`, "success");
      setEquipamentoId("");
      setQuantidade(1);
      setObservacao("");
      onClose();
    } catch (error) {
      addToast(`Erro: ${error.message}`, "error");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800/50 shadow-2xl shadow-black/40 animate-in" id="maintenance-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Wrench size={18} className="text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              Enviar para Manutenção
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
          {/* Equipamento */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Equipamento
            </label>
            <select
              value={equipamentoId}
              onChange={(e) => setEquipamentoId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all appearance-none"
              id="maint-equipment-select"
            >
              <option value="">
                {loadingEq ? "Carregando..." : "Selecione um equipamento"}
              </option>
              {equipments.map((eq) => (
                <option
                  key={eq.id}
                  value={eq.id}
                  disabled={eq.disponivel === 0}
                >
                  {eq.nome} — Disponível: {eq.disponivel}
                  {eq.disponivel === 0 ? " (SEM ESTOQUE)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Quantidade
            </label>
            <input
              type="number"
              min="1"
              max={getSelectedEquipment()?.disponivel || 999}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all"
              id="maint-quantity-input"
            />
          </div>

          {/* Observação */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Observação / Problema
            </label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Descreva o problema ou motivo da manutenção..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all resize-none"
              id="maint-observation-input"
            />
          </div>

          {/* Info box */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <Wrench size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-amber-400/80 leading-relaxed">
              O equipamento será retirado do estoque disponível e entrará como <strong>"#1 Esperando Peças"</strong>.
              Você poderá alterar o status depois.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
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
              id="maint-submit-btn"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Wrench size={15} />
              )}
              {saving ? "Enviando..." : "Enviar para Manutenção"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
