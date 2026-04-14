"use client";

import { useState, useMemo } from "react";
import { Plus, Search, FileText, Download, Trash2, Receipt } from "lucide-react";
import { useNotasFiscais } from "@/hooks/useNotasFiscais";
import { useRentals } from "@/hooks/useRentals";
import NotaFiscalModal from "@/components/NotaFiscalModal";

export default function NotasFiscaisPage() {
  const { notas, loading: loadingNotas, handleAddNota, handleDeleteNota } = useNotasFiscais();
  // Fetch rentals to get clients
  const { rentals, loading: loadingRentals } = useRentals(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive unique clients map exactly like ClientList.js does
  const clientsMap = useMemo(() => {
    const map = new Map();
    if (!rentals) return map;
    
    // Reverse to get latest contact info
    const sortedRentals = [...rentals].reverse();
    sortedRentals.forEach((rental) => {
      if (rental.cliente && rental.cliente.cpf) {
        map.set(rental.cliente.cpf, {
          ...rental.cliente,
        });
      }
    });
    return map;
  }, [rentals]);

  const filteredNotas = notas.filter((nota) => {
    const term = searchTerm.toLowerCase();
    return (
      nota.clienteNome?.toLowerCase().includes(term) ||
      nota.numeroNota?.toLowerCase().includes(term) ||
      nota.clienteCpf?.includes(term)
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const handleSaveNota = async (data, arquivoBlob) => {
    await handleAddNota(data, arquivoBlob);
  };

  const dataLoading = loadingNotas || loadingRentals;

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="text-blue-500" />
            Notas Fiscais
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão de NFs e faturamento vinculados aos clientes.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={dataLoading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50"
        >
          <Plus size={18} />
          Nova Nota Fiscal
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por cliente, CPF ou número da nota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/30 border border-slate-800/50">
          <span className="text-sm font-semibold text-white">
            {filteredNotas.length} {filteredNotas.length === 1 ? "nota" : "notas"}
          </span>
        </div>
      </div>

      {/* Content */}
      {dataLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : filteredNotas.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-slate-900/20 border border-slate-800/30">
          <Receipt size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500 text-sm">
            {searchTerm 
              ? "Nenhuma nota fiscal encontrada para sua busca." 
              : "Nenhuma nota registrada ainda."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nota Fiscal</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cliente</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Emissão</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor (R$)</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredNotas.map((nota) => (
                <tr key={nota.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <FileText size={18} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          #{nota.numeroNota}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">NF-e</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-slate-300">{nota.clienteNome}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{nota.clienteCpf}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-400">{formatDate(nota.dataEmissao)}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-green-400">
                      {nota.valor ? `R$ ${Number(nota.valor).toFixed(2).replace(".",",")}` : "-"}
                    </p>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {nota.arquivoUrl && (
                        <a
                          href={nota.arquivoUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Fazer Download da NF"
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                        >
                          <Download size={18} />
                        </a>
                      )}
                      
                      <button
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir esta Nota Fiscal?")) {
                            handleDeleteNota(nota.id);
                          }
                        }}
                        title="Remover"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nova Nota */}
      <NotaFiscalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientsMap={clientsMap}
        onSuccess={handleSaveNota}
      />
    </div>
  );
}
