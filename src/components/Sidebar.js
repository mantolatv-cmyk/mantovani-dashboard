"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FilePlus,
  RotateCcw,
  Wrench,
  ClipboardList,
  User,
  Menu,
  X,
  HardHat,
  Receipt,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/estoque", label: "Estoque", icon: Package },
  { href: "/clientes", label: "Clientes", icon: User },
  { href: "/nova-locacao", label: "Nova Locação", icon: FilePlus },
  { href: "/devolucoes", label: "Devoluções", icon: RotateCcw },
  { href: "/manutencao", label: "Manutenção", icon: Wrench },
  { href: "/historico", label: "Histórico", icon: ClipboardList },
  { href: "/notas-fiscais", label: "Notas Fiscais", icon: Receipt },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Botão mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-300 hover:text-white transition-colors"
        aria-label="Abrir menu"
        id="sidebar-toggle"
      >
        <Menu size={22} />
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 w-[260px]
          bg-[#0a0d14] border-r border-slate-800/40
          flex flex-col shadow-2xl shadow-black/50
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Decorative Background Glow */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative p-6 border-b border-slate-800/50 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <HardHat size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Mantovani
                </h1>
                <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-widest">
                  Locações
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-4 mb-4 mt-2">
            Menu Principal
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-300
                  ${
                    isActive
                      ? "text-white bg-blue-600/10 border border-blue-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                  }
                `}
                id={`nav-${item.href.replace("/", "") || "dashboard"}`}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                )}
                
                <Icon
                  size={18}
                  className={`
                    transition-all duration-300
                    ${isActive ? "text-blue-400 scale-110" : "text-slate-500 group-hover:text-slate-300"}
                  `}
                />
                <span className={isActive ? "font-semibold" : "font-medium"}>
                  {item.label}
                </span>
                
                {isActive && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800/50 bg-slate-900/20">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/30 border border-slate-700/30 shadow-inner">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
              <LayoutDashboard size={14} className="text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Sistema v1.0
              </p>
              <p className="text-[9px] text-blue-400/60 font-medium">Online & Sincronizado</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
