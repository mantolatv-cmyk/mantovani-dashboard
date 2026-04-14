"use client";

import RentalForm from "@/components/RentalForm";

export default function NovaLocacaoPage() {
  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight" id="page-title">
          Nova Locação
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Preencha os dados para registrar uma nova locação e gerar o contrato
        </p>
      </div>

      {/* Form */}
      <RentalForm />
    </div>
  );
}
