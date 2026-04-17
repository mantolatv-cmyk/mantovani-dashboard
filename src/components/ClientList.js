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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((client) => (
            <div
              key={client.cpf || client.nome}
              className="rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-900/30 backdrop-blur-sm border border-slate-700/40 p-5 hover:shadow-lg hover:border-blue-500/30 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <User size={22} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {client.nome}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 opacity-80">
                      CPF: {client.cpf}
                    </p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/50 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-white leading-none">{client.totalLocacoes}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-1">Locações</span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="text-slate-500" />
                  <span className="text-xs text-slate-300 truncate" title={client.email}>
                    {client.email}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="text-slate-500" />
                  <span className="text-xs text-slate-300 font-medium">
                    {client.telefone}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 sm:col-span-2">
                  <MapPin size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-slate-400 leading-relaxed">
                    {client.endereco}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700/40">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-slate-500" />
                  <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                    Último aluguel: <span className="text-slate-300">{formatDate(client.ultimoAluguel)}</span>
                  </span>
                </div>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-xs font-semibold"
                  onClick={() => {
                    // Copiar para a área de transferência seria útil aqui, ou no futuro expandir
                    navigator.clipboard.writeText(`${client.nome} - Tel: ${client.telefone}`);
                  }}
                  title="Copiar contato resumido"
                >
                  <FileText size={12} />
                  Copiar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
