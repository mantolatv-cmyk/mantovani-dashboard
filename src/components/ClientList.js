"use client";

import { useState } from "react";
import { Search, User, Mail, Phone, MapPin, Calendar, FileText } from "lucide-react";

export default function ClientList({ rentals, dbClients, loading }) {
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const clientsMap = new Map();

  // 1. Inserir primeiro clientes explícitos do banco
  if (dbClients && dbClients.length > 0) {
    dbClients.forEach((client) => {
      // Se tiver CPF usamos como chave, caso contrário, pelo nome.
      const key = client.cpf || client.nome;
      if (key) {
        clientsMap.set(key, { ...client, isExplicit: true, totalLocacoes: 0 });
      }
    });
  }

  // 2. Extrair clientes dos rentals (atualizando totalLocacoes e ultimoAluguel)
  const sortedRentals = rentals ? [...rentals].reverse() : []; 
  
  sortedRentals.forEach((rental) => {
    if (rental.cliente && (rental.cliente.cpf || rental.cliente.nome)) {
      const key = rental.cliente.cpf || rental.cliente.nome;
      const existing = clientsMap.get(key) || { ...rental.cliente, totalLocacoes: 0 };
      
      clientsMap.set(key, {
        ...existing,
        // Atualizamos os dados cadastrais pelo rental (mais recente)
        nome: rental.cliente.nome || existing.nome,
        telefone: rental.cliente.telefone || existing.telefone,
        email: rental.cliente.email || existing.email,
        endereco: rental.cliente.endereco || existing.endereco,
        ultimoAluguel: rental.dataInicio,
        totalLocacoes: existing.totalLocacoes + 1,
      });
    }
  });

  const uniqueClients = Array.from(clientsMap.values()).sort((a, b) => 
    a.nome.localeCompare(b.nome)
  );

  // Filter
  const filtered = uniqueClients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.nome.toLowerCase().includes(term) ||
      c.cpf.includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.telefone.includes(term)
    );
  });

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500" id="client-list">
      
      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all font-medium"
            id="client-search"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/30 border border-slate-800/50">
          <span className="text-sm font-semibold text-white">
            {filtered.length} {filtered.length === 1 ? "cliente" : "clientes"}
          </span>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-slate-900/20 border border-slate-800/30">
          <User size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500 text-sm">
            {searchTerm 
              ? "Nenhum cliente encontrado para sua busca." 
              : "Nenhum cliente registrado ainda. Eles aparecerão aqui quando você realizar locações."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filtered.map((client) => (
            <div
              key={client.cpf || client.nome}
              className="group relative rounded-[2rem] bg-[#0f172a]/40 backdrop-blur-md border border-slate-800/50 p-6 hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-all duration-700" />

              {/* Header */}
              <div className="relative flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-lg group-hover:border-blue-500/30 transition-all duration-500">
                    <User size={26} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight group-hover:text-blue-50 transition-colors">
                      {client.nome}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-700/50">
                        CPF: {client.cpf}
                      </span>
                      {client.isExplicit && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-[10px] font-bold text-blue-400 uppercase tracking-widest border border-blue-500/20">
                          Cadastrado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-2">
                    <span className="text-sm font-black text-white">{client.totalLocacoes}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Contratos</span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/40 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center">
                    <Mail size={14} className="text-slate-500" />
                  </div>
                  <span className="text-xs text-slate-300 truncate font-medium" title={client.email}>
                    {client.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center">
                    <Phone size={14} className="text-slate-500" />
                  </div>
                  <span className="text-xs text-slate-300 font-bold">
                    {client.telefone}
                  </span>
                </div>
                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-slate-500" />
                  </div>
                  <span className="text-xs text-slate-400 leading-relaxed font-medium">
                    {client.endereco}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-800/50">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/30 border border-slate-800/50">
                  <Calendar size={13} className="text-slate-500" />
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Última Atividade: <span className="text-blue-400">{formatDate(client.ultimoAluguel)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700/50 transition-all duration-300 text-xs font-bold uppercase tracking-wider shadow-lg"
                    onClick={() => {
                      navigator.clipboard.writeText(`${client.nome} - Tel: ${client.telefone}`);
                    }}
                  >
                    <FileText size={14} />
                    Copiar
                  </button>
                  <button
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/20 transition-all duration-300 text-xs font-bold uppercase tracking-wider active:scale-95"
                    onClick={() => {
                      const params = new URLSearchParams({
                        nome: client.nome || "",
                        cpf: client.cpf || "",
                        email: client.email || "",
                        telefone: client.telefone || "",
                        endereco: client.endereco || "",
                      });
                      window.location.href = `/nova-locacao?${params.toString()}`;
                    }}
                  >
                    Nova Locação
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
