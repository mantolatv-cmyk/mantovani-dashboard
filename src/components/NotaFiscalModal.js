"use client";

import { useState } from "react";
import { X, UploadCloud, AlertCircle, FileText, CheckCircle2 } from "lucide-react";

export default function NotaFiscalModal({ isOpen, onClose, onSuccess, clientsMap }) {
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [numeroNota, setNumeroNota] = useState("");
  const [valor, setValor] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clienteSelecionado || !numeroNota || !arquivo) {
      setError("Preencha o cliente, número da nota e anexe o arquivo.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const clientInfo = clientsMap.get(clienteSelecionado);
      
      const notaData = {
        clienteNome: clientInfo.nome,
        clienteCpf: clientInfo.cpf,
        numeroNota,
        valor: valor || 0,
        dataEmissao: new Date().toISOString().split("T")[0],
      };

      await onSuccess(notaData, arquivo);
      handleClose();
    } catch (err) {
      setError(err.message || "Erro ao salvar a nota fiscal.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setClienteSelecionado("");
    setNumeroNota("");
    setValor("");
    setArquivo(null);
    setError("");
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={!loading ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[100vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-300 mx-auto">
        
        {/* Header */}
        <div className="flex-none p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Nova Nota Fiscal</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Anexe e vincule uma NF a um cliente.</p>
          </div>
          <button
            title="Fechar"
            onClick={handleClose}
            className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 fancy-scrollbar">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-500">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form id="nota-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Cliente */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Cliente <span className="text-red-400">*</span>
              </label>
              <select
                value={clienteSelecionado}
                onChange={(e) => setClienteSelecionado(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none"
                required
              >
                <option value="">Selecione um cliente...</option>
                {Array.from(clientsMap.values()).sort((a,b) => a.nome.localeCompare(b.nome)).map(c => (
                  <option key={c.cpf} value={c.cpf}>{c.nome} (CPF: {c.cpf})</option>
                ))}
              </select>
            </div>

            {/* Número da Nota e Valor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Número da Nota <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={numeroNota}
                  onChange={(e) => setNumeroNota(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                  placeholder="Ex: 12345"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Valor R$ <span className="text-slate-500 text-xs">(Opcional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Upload File */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">
                Arquivo (PDF ou Imagem) <span className="text-red-400">*</span>
              </label>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setArquivo(e.target.files[0])}
                  className="hidden"
                  id="nota-upload"
                  required
                />
                <label
                  htmlFor="nota-upload"
                  className={`
                    w-full flex tracking-wide flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                    ${arquivo 
                      ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10' 
                      : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600'}
                  `}
                >
                  {arquivo ? (
                    <>
                      <CheckCircle2 size={32} className="text-green-400 mb-3" />
                      <p className="text-white font-medium text-center truncate w-full px-4 text-sm">{arquivo.name}</p>
                      <p className="text-xs text-green-400/80 mt-1">Pronto para envio</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                        <UploadCloud size={24} className="text-blue-400" />
                      </div>
                      <p className="text-sm text-slate-300 font-medium">Clique para selecionar</p>
                      <p className="text-xs text-slate-500 mt-1">PDF, PNG ou JPG (Max. 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex-none p-5 sm:p-6 border-t border-slate-800 bg-slate-900/80 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="nota-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <FileText size={18} />
                Salvar Nota
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
