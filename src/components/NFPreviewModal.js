"use client";

import { X, ExternalLink, Download } from "lucide-react";

export default function NFPreviewModal({ nota, onClose }) {
  if (!nota) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex-none p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <span className="text-blue-400 font-bold text-xs">NF</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Nota #{nota.numeroNota}
              </h2>
              <p className="text-xs text-slate-500">{nota.clienteNome}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={nota.arquivoUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Abrir em nova aba"
            >
              <ExternalLink size={20} />
            </a>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Fechar"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-slate-800/20 p-2 sm:p-4">
          <iframe
            src={`${nota.arquivoUrl}#toolbar=0`}
            className="w-full h-full rounded-xl border border-slate-700/50 bg-white"
            title={`Visualização Nota Fiscal ${nota.numeroNota}`}
          />
        </div>

        {/* Footer Info */}
        <div className="flex-none p-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between px-6">
           <span className="text-xs text-slate-500 italic">
             Dica: Use os controles do navegador no topo do PDF para Zoom.
           </span>
           <a
             href={nota.arquivoUrl}
             download
             className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
           >
             <Download size={14} />
             Baixar NF original
           </a>
        </div>
      </div>
    </div>
  );
}
