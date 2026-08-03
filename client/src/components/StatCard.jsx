const StatCard = ({ icon: Icon, title, value, subtitle, color = "indigo" }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
  };

  return (
    <div className="card card-hover p-5 relative overflow-hidden group">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-slate-300 group-hover:bg-indigo-500 transition-colors" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl transition-colors ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
