"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Search, Package, Wrench } from "lucide-react";
import { deleteEquipment } from "@/lib/firestore";
import { useToast } from "@/components/Toast";
import { isFirebaseConfigured } from "@/lib/mockData";

export default function EquipmentTable({ equipments, loading, onEdit, onAdd, onMaintenance }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const { addToast } = useToast();

  const filtered = equipments.filter((eq) =>
    eq.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleDelete(id, nome) {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;

    if (!isFirebaseConfigured()) {
      addToast("Modo demonstração: conecte o Firebase para excluir itens.", "info");
      return;
    }

    setDeletingId(id);
    try {
      await deleteEquipment(id);
      addToast(`"${nome}" excluído com sucesso.`, "success");
    } catch (error) {
      addToast(`Erro ao excluir: ${error.message}`, "error");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Buscar equipamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
            id="equipment-search"
          />
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-blue-600 transition-all duration-200 active:scale-95"
          id="add-equipment-btn"
        >
          <Plus size={16} />
          Adicionar Equipamento
        </button>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500 text-sm">
            {searchTerm
              ? "Nenhum equipamento encontrado para essa busca."
              : "Nenhum equipamento cadastrado ainda."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800/40 bg-slate-900/20 backdrop-blur-sm shadow-xl shadow-black/20">
          <table className="w-full" id="equipment-table">
            <thead>
              <tr className="border-b border-slate-800/60 bg-slate-800/30">
                <th className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-6 py-5">
                  Equipamento
                </th>
                <th className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-6 py-5">
                  Patrimônio Total
                </th>
                <th className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-6 py-5">
                  Status de Estoque
                </th>
                <th className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-6 py-5">
                  Em Operação
                </th>
                <th className="text-right text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-6 py-5">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filtered.map((eq, index) => {
                const emUso = eq.totalComprado - eq.disponivel;
                const percentDisp =
                  eq.totalComprado > 0
                    ? (eq.disponivel / eq.totalComprado) * 100
                    : 0;

                return (
                  <tr
                    key={eq.id}
                    className="group hover:bg-blue-500/[0.03] transition-all duration-300"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all duration-300">
                          <Package size={18} className="text-slate-400 group-hover:text-blue-400" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white group-hover:text-blue-100 transition-colors">
                            {eq.nome}
                          </span>
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">ID: {eq.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-6 py-5">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-slate-800/50 border border-slate-700/30">
                        <span className="text-sm text-slate-300 font-bold font-mono">
                          {eq.totalComprado}
                        </span>
                      </div>
                    </td>
                    <td className="text-center px-6 py-5">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-black font-mono ${
                              eq.disponivel === 0
                                ? "text-red-500"
                                : eq.disponivel <= 2
                                ? "text-amber-500"
                                : "text-emerald-500"
                            }`}
                          >
                            {eq.disponivel}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">unid.</span>
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/20">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.5)] ${
                              percentDisp > 50
                                ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                                : percentDisp > 20
                                ? "bg-gradient-to-r from-amber-600 to-amber-400"
                                : "bg-gradient-to-r from-red-600 to-red-400"
                            }`}
                            style={{ width: `${percentDisp}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-6 py-5">
                      <span className="text-sm text-slate-400 font-bold font-mono bg-slate-800/30 px-2 py-1 rounded-md">
                        {emUso}
                      </span>
                    </td>
                    <td className="text-right px-6 py-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(eq)}
                          className="p-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-blue-600 shadow-sm transition-all duration-300 active:scale-90"
                          title="Editar Equipamento"
                          id={`edit-eq-${eq.id}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => onMaintenance && onMaintenance(eq)}
                          disabled={eq.disponivel === 0}
                          className="p-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-amber-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 active:scale-90"
                          title="Enviar para Manutenção"
                          id={`maint-eq-${eq.id}`}
                        >
                          <Wrench size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(eq.id, eq.nome)}
                          disabled={deletingId === eq.id}
                          className="p-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-red-600 disabled:opacity-20 transition-all duration-300 active:scale-90"
                          title="Remover do Inventário"
                          id={`delete-eq-${eq.id}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
