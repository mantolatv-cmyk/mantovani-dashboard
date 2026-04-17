"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { HardHat, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      addToast("Bem-vindo de volta!", "success");
    } catch (error) {
      console.error("Erro de Autenticação:", error);
      let message = `Erro: ${error.code || "Acesso negado"}`;
      
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        message = "E-mail ou senha incorretos.";
      } else if (error.code === "auth/invalid-email") {
        message = "E-mail inválido.";
      } else if (error.code === "auth/network-request-failed") {
        message = "Falha na conexão. Verifique sua internet.";
      } else if (error.code === "auth/unauthorized-domain") {
        message = "Domínio não autorizado no Firebase.";
      }
      
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 relative overflow-hidden bg-grid-pattern">
      {/* Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-700">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-4 ring-1 ring-white/10">
            <HardHat size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            MANTOVANI
          </h1>
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] mt-1">
            Gestão de Patrimônio
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-[2.5rem] p-10 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white tracking-tight">Acesso ao Sistema</h2>
            <p className="text-xs text-slate-500 mt-1">Insira suas credenciais para gerenciar a frota</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                E-mail
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all font-bold shadow-inner"
                  placeholder="admin@mantovani.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Senha
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all font-bold shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-4 group"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Entrar no Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
              Versão Profissional
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-wider">
                Servidor Protegido
              </span>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-[11px] text-slate-600 font-medium">
          © 2026 Mantovani Locações. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
