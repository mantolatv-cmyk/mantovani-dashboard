"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Package,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react";
import { useEquipments } from "@/hooks/useEquipments";
import { createRental, updateRentalContractUrl } from "@/lib/firestore";
import { uploadContract } from "@/lib/storage";
import { generateContractPDF } from "@/lib/pdfGenerator";
import { useToast } from "@/components/Toast";
import { isFirebaseConfigured } from "@/lib/mockData";

const initialForm = {
  clienteNome: "",
  clienteCpf: "",
  clienteEmail: "",
  clienteTelefone: "",
  clienteEndereco: "",
  equipamentoId: "",
  numeroEquipamento: "",
  quantidade: 1,
  dataInicio: "",
  dataFim: "",
  valorTotal: "",
};

export default function RentalForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const { equipments, loading: loadingEq } = useEquipments();
  const { addToast } = useToast();
  const isDemo = !isFirebaseConfigured();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function getSelectedEquipment() {
    return equipments.find((eq) => eq.id === form.equipamentoId);
  }

  function validate() {
    if (!form.clienteNome.trim()) return "Informe o nome do cliente.";
    if (!form.clienteCpf.trim()) return "Informe o CPF do cliente.";
    if (!form.clienteEmail.trim()) return "Informe o e-mail do cliente.";
    if (!form.clienteTelefone.trim()) return "Informe o telefone do cliente.";
    if (!form.clienteEndereco.trim()) return "Informe o endereço do cliente.";
    if (!form.equipamentoId) return "Selecione um equipamento.";
    if (!form.quantidade || Number(form.quantidade) < 1)
      return "Informe uma quantidade válida.";
    if (!form.dataInicio) return "Informe a data de início.";
    if (!form.dataFim) return "Informe a data de fim.";
    if (form.dataFim < form.dataInicio)
      return "A data de fim deve ser posterior à data de início.";
    if (!form.valorTotal || Number(form.valorTotal) <= 0)
      return "Informe o valor da locação.";

    const eq = getSelectedEquipment();
    if (eq && Number(form.quantidade) > eq.disponivel) {
      return `Estoque insuficiente. Disponível: ${eq.disponivel}`;
    }

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const error = validate();
    if (error) {
      addToast(error, "error");
      return;
    }

    if (isDemo) {
      addToast("Modo demonstração: Gerando apenas o contrato PDF localmente. O banco de dados não será alterado.", "info");

      setSubmitting(true);
      try {
        const eq = getSelectedEquipment();
        const rentalData = {
          ...form,
          equipamentoNome: eq?.nome || "",
        };

        const pdfBlob = await generateContractPDF(rentalData);
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contrato_demo_${form.clienteNome.replace(/\s+/g, "_").toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addToast("Contrato PDF de demonstração gerado com sucesso!", "success");
        setForm(initialForm);
      } catch (pdfError) {
        console.error("Erro ao gerar PDF:", pdfError);
        addToast("Erro ao gerar o contrato em PDF.", "error");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    try {
      const eq = getSelectedEquipment();

      const rentalData = {
        ...form,
        equipamentoNome: eq?.nome || "",
      };

      // 1. Cria a locação + deduz estoque
      const rentalId = await createRental(rentalData);
      addToast("Locação registrada com sucesso!", "success");

      // 2. Gera o PDF do contrato
      try {
        const pdfBlob = await generateContractPDF(rentalData);

        // 3. Download do PDF para o operador PRIMEIRO
        // Assim, se o Firebase Storage não estiver ativado ou travar, o usuário já tem o contrato!
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contrato_${form.clienteNome.replace(/\s+/g, "_").toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        addToast("Contrato gerado com sucesso! Iniciando salvamento na nuvem...", "success");

        // 4. Faz upload do contrato para o Storage (Com timeout de 8 segundos para evitar hang)
        try {
          const contractUrl = await Promise.race([
            uploadContract(form.clienteNome, pdfBlob),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout_Upload")), 8000))
          ]);
          // 5. Atualiza a URL do contrato na locação
          await updateRentalContractUrl(rentalId, contractUrl);
          addToast("Contrato salvo na nuvem com sucesso!", "success");
        } catch (uploadError) {
          console.warn("Storage upload error/timeout:", uploadError);
          // Falha silenciosa ou apenas avisa (Pois o PDF local já foi baixado)
          addToast("O contrato não foi salvo na nuvem (Storage desativado ou timeout).", "info");
        }
      } catch (pdfError) {
        console.error("Erro ao gerar/salvar PDF:", pdfError);
        addToast(
          "Locação criada, mas houve um erro ao gerar o contrato. Tente novamente.",
          "error"
        );
      }

      // Limpa formulário
      setForm(initialForm);
    } catch (error) {
      addToast(`Erro: ${error.message}`, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" id="rental-form">
      {/* Dados do Cliente */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800/50 p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <User size={16} className="text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Dados do Cliente
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nome */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Nome Completo
            </label>
            <div className="relative">
              <User
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                name="clienteNome"
                value={form.clienteNome}
                onChange={handleChange}
                placeholder="Nome do cliente"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                id="client-name-input"
              />
            </div>
          </div>

          {/* CPF */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              CPF
            </label>
            <div className="relative">
              <CreditCard
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                name="clienteCpf"
                value={form.clienteCpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                id="client-cpf-input"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="email"
                name="clienteEmail"
                value={form.clienteEmail}
                onChange={handleChange}
                placeholder="email@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                id="client-email-input"
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Telefone
            </label>
            <div className="relative">
              <Phone
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                name="clienteTelefone"
                value={form.clienteTelefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                id="client-phone-input"
              />
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Endereço
            </label>
            <div className="relative">
              <MapPin
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                name="clienteEndereco"
                value={form.clienteEndereco}
                onChange={handleChange}
                placeholder="Rua, número, bairro, cidade"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                id="client-address-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dados da Locação */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800/50 p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Package size={16} className="text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Dados da Locação
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Equipamento */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Equipamento
            </label>
            <select
              name="equipamentoId"
              value={form.equipamentoId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all appearance-none"
              id="equipment-select"
            >
              <option value="">
                {loadingEq ? "Carregando..." : "Selecione um equipamento"}
              </option>
              {equipments.map((eq) => (
                <option
                  key={eq.id}
                  value={eq.id}
                  disabled={eq.disponivel === 0}
                  className={eq.disponivel === 0 ? "text-slate-600" : ""}
                >
                  {eq.nome} — Disponível: {eq.disponivel}
                  {eq.disponivel === 0 ? " (SEM ESTOQUE)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Número do Equipamento/Unidade */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Número da Unidade / Plaqueta
            </label>
            <div className="relative">
              <Package
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                name="numeroEquipamento"
                value={form.numeroEquipamento}
                onChange={handleChange}
                placeholder="Ex: MK-1234 ou Série #45"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                id="unit-number-input"
              />
            </div>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Quantidade
            </label>
            <input
              type="number"
              name="quantidade"
              min="1"
              max={getSelectedEquipment()?.disponivel || 999}
              value={form.quantidade}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              id="quantity-input"
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Valor Total (R$)
            </label>
            <div className="relative">
              <DollarSign
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="number"
                name="valorTotal"
                min="0"
                step="0.01"
                value={form.valorTotal}
                onChange={handleChange}
                placeholder="0,00"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                id="total-value-input"
              />
            </div>
          </div>

          {/* Data Início */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Data de Início
            </label>
            <div className="relative">
              <Calendar
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="date"
                name="dataInicio"
                value={form.dataInicio}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                id="start-date-input"
              />
            </div>
          </div>

          {/* Data Fim */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Data de Término
            </label>
            <div className="relative">
              <Calendar
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="date"
                name="dataFim"
                value={form.dataFim}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                id="end-date-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => setForm(initialForm)}
          className="px-6 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all"
        >
          Limpar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:from-emerald-500 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          id="submit-rental-btn"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <FileText size={16} />
              Confirmar Locação e Gerar Contrato
            </>
          )}
        </button>
      </div>
    </form>
  );
}
