import { Icon } from "@/components/layout/Icon";
import type { DashboardStat } from "@/types/incident";

export function StatCard({ stat }: { stat: DashboardStat }) {
  return <article className="stat-card"><div className={`stat-icon ${stat.tone}`}><Icon name={stat.icon} size={21}/></div><div className="stat-copy"><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.note}</small></div></article>;
}
