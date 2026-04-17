"use client";

export default function StatCard({ icon: Icon, title, value, subtitle, color = "blue" }) {
  const colorMap = {
    blue: {
      bg: "bg-blue-500/5",
      border: "border-blue-500/20",
      icon: "from-blue-500 to-blue-600",
      glow: "bg-blue-500/20",
      text: "text-blue-400",
      shadow: "shadow-blue-500/10",
    },
    green: {
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
      icon: "from-emerald-500 to-emerald-600",
      glow: "bg-emerald-500/20",
      text: "text-emerald-400",
      shadow: "shadow-emerald-500/10",
    },
    amber: {
      bg: "bg-amber-500/5",
      border: "border-amber-500/20",
      icon: "from-amber-500 to-amber-600",
      glow: "bg-amber-500/20",
      text: "text-amber-400",
      shadow: "shadow-amber-500/10",
    },
    violet: {
      bg: "bg-violet-500/5",
      border: "border-violet-500/20",
      icon: "from-violet-500 to-violet-600",
      glow: "bg-violet-500/20",
      text: "text-violet-400",
      shadow: "shadow-violet-500/10",
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl
        ${c.bg} border ${c.border}
        backdrop-blur-xl p-7
        transition-all duration-500 ease-in-out
        hover:scale-[1.03] hover:shadow-2xl hover:${c.shadow}
        group
      `}
    >
      {/* Dynamic Glow Effect */}
      <div
        className={`absolute -top-12 -right-12 w-40 h-40 rounded-full ${c.glow} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none`}
      />

      <div className="relative flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div
            className={`
              w-12 h-12 rounded-2xl
              bg-gradient-to-br ${c.icon}
              flex items-center justify-center
              shadow-lg shadow-black/20
              transition-all duration-500
              group-hover:scale-110 group-hover:rotate-3
            `}
          >
            <Icon size={24} className="text-white" />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Status
            </span>
            <div className={`w-2 h-2 rounded-full ${c.glow} animate-pulse mt-1.5`} />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400/80 mb-1">
            {title}
          </h3>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-white tracking-tighter">
              {value}
            </p>
            {subtitle && (
              <p className={`text-xs font-bold uppercase tracking-wider ${c.text} opacity-80`}>
                / {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Bottom Line */}
      <div className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent w-full scale-x-0 group-hover:scale-x-100 transition-transform duration-700`} />
    </div>
  );
}
