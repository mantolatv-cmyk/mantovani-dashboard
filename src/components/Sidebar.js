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
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/estoque", label: "Estoque", icon: Package },
  { href: "/clientes", label: "Clientes", icon: User },
  { href: "/nova-locacao", label: "Nova Locação", icon: FilePlus },
  { href: "/devolucoes", label: "Devoluções", icon: RotateCcw },
  { href: "/manutencao", label: "Manutenção", icon: Wrench },
  { href: "/historico", label: "Histórico", icon: ClipboardList },
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
          bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
          border-r border-slate-800/50
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <HardHat size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Mantovani
                </h1>
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
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
        <nav className="flex-1 p-4 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600 px-3 mb-3">
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
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-600/15 text-blue-400 shadow-sm shadow-blue-500/5 border border-blue-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
                  }
                `}
                id={`nav-${item.href.replace("/", "") || "dashboard"}`}
              >
                <Icon
                  size={19}
                  className={`
                    transition-colors duration-200
                    ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}
                  `}
                />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="px-3 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Sistema de Gestão
            </p>
            <p className="text-xs text-slate-400 mt-0.5">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
