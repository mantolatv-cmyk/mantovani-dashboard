"use client";

import { useState } from "react";
import EquipmentTable from "@/components/EquipmentTable";
import EquipmentModal from "@/components/EquipmentModal";
import MaintenanceModal from "@/components/MaintenanceModal";
import { useEquipments } from "@/hooks/useEquipments";

export default function EstoquePage() {
  const { equipments, loading, error } = useEquipments();
  const [modalOpen, setModalOpen] = useState(false);
  const [editEquipment, setEditEquipment] = useState(null);
  const [maintModalOpen, setMaintModalOpen] = useState(false);

  function handleAdd() {
    setEditEquipment(null);
    setModalOpen(true);
  }

  function handleEdit(equipment) {
    setEditEquipment(equipment);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditEquipment(null);
  }

  function handleMaintenance(equipment) {
    setMaintModalOpen(true);
  }

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight" id="page-title">
          Estoque
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie o inventário de equipamentos
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          Erro ao carregar dados: {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm p-6">
        <EquipmentTable
          equipments={equipments}
          loading={loading}
          onEdit={handleEdit}
          onAdd={handleAdd}
          onMaintenance={handleMaintenance}
        />
      </div>

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        equipment={editEquipment}
      />

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={maintModalOpen}
        onClose={() => setMaintModalOpen(false)}
      />
    </div>
  );
}
