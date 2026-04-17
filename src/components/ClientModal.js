"use client";

import { useState } from "react";
import { User, X, Loader2, UserPlus, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import { addCliente } from "@/lib/firestore";
import { useToast } from "@/components/Toast";
import { isFirebaseConfigured } from "@/lib/mockData";

const initialForm = {
  nome: "",
  cpf: "",
  email: "",
  telefone: "",
  endereco: "",
};

export default function ClientModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const isDemo = !isFirebaseConfigured();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.nome) {
      addToast("O nome do cliente é obrigatório.", "error");
      return;
    }

    if (isDemo) {
      addToast("Modo demonstração: conecte o Firebase para salvar clientes reais.", "info");
      onClose();
      return;
    }

    setSaving(true);
    try {
      await addCliente(form);
      addToast(`Cliente "${form.nome}" registrado com sucesso!`, "success");
      setForm(initialForm);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      addToast(`Erro ao registrar cliente: ${error.message}`, "error");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl my-auto rounded-2xl bg-slate-900 border border-slate-800/50 shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95" id="client-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <UserPlus size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Novo Cliente</h2>
              <p className="text-xs text-slate-500">Cadastre um cliente de forma independente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nome */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Nome Completo / Empresa *
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="nome"
                  required
                  value={form.nome}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all font-medium"
                  placeholder="Ex: Construtora Silva LTDA"
                />
              </div>
            </div>

            {/* CPF/CNPJ */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                CPF ou CNPJ
              </label>
              <div className="relative">
                <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="cpf"
                  value={form.cpf}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                  placeholder="(11) 90000-0000"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                E-mail
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                  placeholder="contato@empresa.com.br"
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Endereço Completo
              </label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-[14px] text-slate-500" />
                <textarea
                  name="endereco"
                  rows={2}
                  value={form.endereco}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium resize-none shadow-inner"
                  placeholder="Rua Exemplo, 123 - Bairro Novo, Cidade/SP - CEP: 00000-000"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Salvando..." : "Salvar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
