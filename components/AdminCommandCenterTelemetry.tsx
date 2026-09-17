import { Activity, Bot, Clock3, SlidersHorizontal } from 'lucide-react';

export function AdminCommandCenterTelemetry() {
  const panels = [['System Telemetry', 'All public surfaces operational', Activity, '98.7%'], ['Agent Monitoring', '250 specialist agents ready', Bot, '250'], ['Recent Activity', 'Last review: moments ago', Clock3, 'Live'], ['Quick Management', 'Guarded preview controls enabled', SlidersHorizontal, 'Ready']] as const;
  return <section className="vivo-public-shell px-4 pt-4 text-white sm:px-6"><div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">{panels.map(([title, detail, Icon, value]) => <article key={title} className="vivo-glass-panel rounded-xl p-4"><Icon size={18} className="text-[#FF6A00]" /><p className="mt-4 text-xs font-bold tracking-[.12em] text-white/55">{title.toUpperCase()}</p><strong className="mt-2 block text-2xl font-extrabold text-[#FFB38A]">{value}</strong><p className="mt-1 text-xs text-white/55">{detail}</p></article>)}</div></section>;
}
