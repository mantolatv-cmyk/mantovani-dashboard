"use client";

import { useRentals } from "@/hooks/useRentals";
import { useClients } from "@/hooks/useClients";
import ClientList from "@/components/ClientList";
import ClientModal from "@/components/ClientModal";
import { useState } from "react";

export default function ClientesPage() {
  const { rentals, loading: loadingRentals, error: errorRentals } = useRentals(null);
  const { dbClients, loading: loadingClients, error: errorClients, deleteClient } = useClients();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const loading = loadingRentals || loadingClients;
  const error = errorRentals || errorClients;

  const handleEdit = (client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedClient(null);
    setModalOpen(false);
  };

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-white tracking-tight"
            id="page-title"
          >
            Clientes Cadastrados
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão de clientes independentes e clientes do histórico de locação.
          </p>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-95"
        >
          <span className="text-lg leading-none mb-0.5">+</span>
          Novo Cliente
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          Erro ao carregar dados: {error}
        </div>
      )}

      {/* Client List */}
      <ClientList 
        rentals={rentals} 
        dbClients={dbClients} 
        loading={loading} 
        deleteClient={deleteClient}
        onEdit={handleEdit}
      />

      {/* Modal Novo/Editar Cliente */}
      <ClientModal 
        isOpen={modalOpen} 
        onClose={handleCloseModal} 
        onSuccess={handleCloseModal} 
        initialData={selectedClient}
      />
    </div>
  );
}
