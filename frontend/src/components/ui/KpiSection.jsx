import React from "react";

const KPISection = ({ kpis }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="relative rounded-2xl p-4 shadow-lg bg-gradient-to-b from-white to-purple-20 flex flex-col justify-between h-48 overflow-hidden"
        >
          {/* Top row: icon and badge */}
          <div className="flex items-center justify-between mb-3 z-10 relative">
            <div
              className="rounded-full p-4"
              style={{ backgroundColor: `${kpi.color || '#e0e7ff'}CC` }} // fallback color
            >
              {kpi.icon && <img src={kpi.icon} alt={kpi.label} className="h-6 w-6" />}
            </div>
            <span
              className={`$${
                kpi.changeType === "positive"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              } text-xs font-semibold px-2 py-0.5 rounded-full`}
            >
              {kpi.change}
            </span>
          </div>

          {/* Value and label */}
          <div className="z-10 relative">
            <h2 className="text-xl font-bold">{kpi.value}</h2>
            <p className="text-xs text-gray-500">{kpi.label}</p>
          </div>

          {/* Right aligned SVG curve */}
         <div className="absolute top-12 bottom-5 right-2 w-28 h-28 ">
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 100 60"
    fill={kpi.color || '#e0e7ff'}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id={`grad-${kpi.label}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={`${kpi.color || '#e0e7ff'}FF`} />
        <stop offset="100%" stopColor={`${kpi.color || '#e0e7ff'}15`} />
      </linearGradient>
    </defs>
    <path
      d="M0,40 C20,20 40,60 60,30 C80,0 100,40 100,60 L0,60 Z"
      fill={`url(#grad-${kpi.label})`}
    />
    <path
      d="M0,40 C20,20 40,60 60,30 C80,0 100,40 100,60"
      fill="none"
      stroke={kpi.color || '#e0e7ff'}
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</div>
        </div>
      ))}
    </div>
  );
};

export default KPISection;

