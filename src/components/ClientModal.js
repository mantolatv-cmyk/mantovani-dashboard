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
      <div className="fixed inset-0 bg-[#05070a]/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl my-auto rounded-[2.5rem] bg-[#0f172a] border border-slate-800/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95" id="client-modal">
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between p-8 border-b border-slate-800/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <UserPlus size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Novo Cliente</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-0.5">Gestão de Patrimônio Mantovani</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700/50"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="md:col-span-2 space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                Nome Completo ou Razão Social
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  name="nome"
                  required
                  value={form.nome}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all font-bold shadow-inner"
                  placeholder="Ex: Construtora Silva LTDA"
                />
              </div>
            </div>

            {/* CPF/CNPJ */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                CPF ou CNPJ
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <CreditCard size={18} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  name="cpf"
                  value={form.cpf}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all font-bold shadow-inner"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                WhatsApp de Contato
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Phone size={18} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all font-bold shadow-inner"
                  placeholder="(11) 90000-0000"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                E-mail para Faturamento
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all font-bold shadow-inner"
                  placeholder="contato@empresa.com.br"
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-2.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                Endereço de Entrega
              </label>
              <div className="relative group">
                <div className="absolute top-4 left-4 pointer-events-none">
                  <MapPin size={18} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <textarea
                  name="endereco"
                  rows={2}
                  value={form.endereco}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all font-bold resize-none shadow-inner"
                  placeholder="Rua Exemplo, 123 - Bairro Novo, Cidade/SP"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 mt-10 pt-8 border-t border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              {saving ? "Processando..." : "Confirmar Cadastro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
