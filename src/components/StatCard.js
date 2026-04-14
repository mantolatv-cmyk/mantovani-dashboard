"use client";

export default function StatCard({ icon: Icon, title, value, subtitle, color = "blue" }) {
  const colorMap = {
    blue: {
      bg: "from-blue-500/10 to-blue-600/5",
      border: "border-blue-500/20",
      icon: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/20",
      text: "text-blue-400",
    },
    green: {
      bg: "from-emerald-500/10 to-emerald-600/5",
      border: "border-emerald-500/20",
      icon: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-500/20",
      text: "text-emerald-400",
    },
    amber: {
      bg: "from-amber-500/10 to-amber-600/5",
      border: "border-amber-500/20",
      icon: "from-amber-500 to-amber-600",
      shadow: "shadow-amber-500/20",
      text: "text-amber-400",
    },
    violet: {
      bg: "from-violet-500/10 to-violet-600/5",
      border: "border-violet-500/20",
      icon: "from-violet-500 to-violet-600",
      shadow: "shadow-violet-500/20",
      text: "text-violet-400",
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br ${c.bg}
        border ${c.border}
        backdrop-blur-xl
        p-6
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:shadow-lg hover:${c.shadow}
        group
      `}
    >
      {/* Glow background */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${c.icon} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            {title}
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className={`text-sm mt-2 font-medium ${c.text}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`
            w-12 h-12 rounded-xl
            bg-gradient-to-br ${c.icon}
            flex items-center justify-center
            shadow-lg ${c.shadow}
            transition-transform duration-300
            group-hover:scale-110
          `}
        >
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}
