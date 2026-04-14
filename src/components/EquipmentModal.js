"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { addEquipment, updateEquipment } from "@/lib/firestore";
import { useToast } from "@/components/Toast";
import { isFirebaseConfigured } from "@/lib/mockData";

export default function EquipmentModal({ isOpen, onClose, equipment }) {
  const [nome, setNome] = useState("");
  const [totalComprado, setTotalComprado] = useState("");
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const isEditing = !!equipment;
  const isDemo = !isFirebaseConfigured();

  useEffect(() => {
    if (equipment) {
      setNome(equipment.nome || "");
      setTotalComprado(String(equipment.totalComprado || ""));
    } else {
      setNome("");
      setTotalComprado("");
    }
  }, [equipment, isOpen]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!nome.trim()) {
      addToast("Informe o nome do equipamento.", "error");
      return;
    }

    if (!totalComprado || Number(totalComprado) < 1) {
      addToast("Informe uma quantidade válida.", "error");
      return;
    }

    if (isDemo) {
      addToast("Modo demonstração: conecte o Firebase para salvar alterações.", "info");
      onClose();
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await updateEquipment(equipment.id, { nome: nome.trim(), totalComprado });
        addToast(`"${nome.trim()}" atualizado com sucesso!`, "success");
      } else {
        await addEquipment({ nome: nome.trim(), totalComprado });
        addToast(`"${nome.trim()}" adicionado ao estoque!`, "success");
      }
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
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800/50 shadow-2xl shadow-black/40 animate-in" id="equipment-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? "Editar Equipamento" : "Novo Equipamento"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Nome do Equipamento
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Betoneira 400L"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              id="equipment-name-input"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Quantidade Total Comprada
            </label>
            <input
              type="number"
              min="1"
              value={totalComprado}
              onChange={(e) => setTotalComprado(e.target.value)}
              placeholder="Ex: 10"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              id="equipment-quantity-input"
            />
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              id="equipment-save-btn"
            >
              {saving ? "Salvando..." : isEditing ? "Salvar Alterações" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
