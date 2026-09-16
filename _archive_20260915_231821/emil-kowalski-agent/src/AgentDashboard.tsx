import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Code2, Loader2, Play, Sparkles, Terminal, TestTube2 } from 'lucide-react';

type AgentState = 'idle' | 'running' | 'completed';

interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: AgentState;
  icon: string;
}

const initialAgents: AgentStatus[] = [
  { id: '0', name: 'JARVIS', role: 'Orchestrator & Maestro', status: 'idle', icon: 'Robot' },
  { id: '1', name: 'Emil Kowalski Agent', role: 'Micro-interactions & Physics', status: 'idle', icon: 'Motion' },
  { id: '2', name: 'Impeccable Design Agent', role: 'Visual Polish & Pixel-Perfection', status: 'idle', icon: 'Design' },
  { id: '3', name: 'Teste Skill Agent', role: 'Automated QA & Vitest/Playwright', status: 'idle', icon: 'QA' }
];

const polishedCode = `import { motion } from 'framer-motion';

export function ActionButton({ label }: { label: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-blue-500/20"
    >
      {label}
    </motion.button>
  );
}`;

const generatedTests = `import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('ActionButton', () => {
  it('renders an accessible button label', () => {
    render(<ActionButton label="Click Me" />);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
});`;

export const AgentDashboard = () => {
  const [inputCode, setInputCode] = useState('export function ActionButton({ label }) {\n  return <button className="p-2 bg-blue-500">{label}</button>;\n}');
  const [activeTab, setActiveTab] = useState<'code' | 'tests'>('code');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputCode, setOutputCode] = useState('');
  const [testCode, setTestCode] = useState('');
  const [agents, setAgents] = useState(initialAgents);

  const updateAgentStatus = (id: string, status: AgentState) => setAgents((current) => current.map((agent) => agent.id === id ? { ...agent, status } : agent));

  const runPipeline = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setOutputCode('');
    setTestCode('');
    setAgents(initialAgents);
    updateAgentStatus('0', 'running');
    await Promise.resolve();
    updateAgentStatus('1', 'running');
    updateAgentStatus('1', 'completed');
    updateAgentStatus('2', 'running');
    setOutputCode(polishedCode.replace('ActionButton', inputCode.includes('ActionButton') ? 'ActionButton' : 'PolishedComponent'));
    updateAgentStatus('2', 'completed');
    updateAgentStatus('3', 'running');
    setTestCode(generatedTests);
    updateAgentStatus('3', 'completed');
    updateAgentStatus('0', 'completed');
    setIsProcessing(false);
  };

  return <main className="min-h-screen bg-[#0B0F17] p-6 font-sans text-slate-100 selection:bg-indigo-500/30 md:p-10"><div className="mx-auto max-w-7xl"><header className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl border border-indigo-500/40 bg-indigo-600/20 text-lg">A</div><div><h1 className="flex items-center gap-2 text-xl font-bold text-white">JARVIS AGENT ECOSYSTEM <span className="rounded-full border border-indigo-500/30 bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-indigo-300">v2.5 Pro Engine</span></h1><p className="text-xs text-slate-400">Emil Kowalski · Impeccable Design · Teste Skill Pipeline</p></div></div><motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={runPipeline} disabled={isProcessing} className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold shadow-lg transition-all ${isProcessing ? 'cursor-not-allowed border-white/5 bg-slate-800 text-slate-500' : 'border-indigo-400/30 bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-500'}`}>{isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}{isProcessing ? 'Pipeline Çalışıyor...' : 'Ajan Boru Hattını Çalıştır'}</motion.button></header><div className="grid grid-cols-1 gap-6 lg:grid-cols-12"><section className="space-y-4 lg:col-span-4"><h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400"><Terminal className="h-4 w-4 text-indigo-400" /> Ajan Orkestrasyonu</h2>{agents.map((agent) => <motion.div key={agent.id} layout className={`rounded-2xl border p-4 transition-all ${agent.status === 'running' ? 'border-indigo-500/50 bg-indigo-950/40 shadow-lg shadow-indigo-500/10' : agent.status === 'completed' ? 'border-emerald-500/30 bg-slate-900/80' : 'border-white/5 bg-slate-900/40'}`}><div className="flex items-start justify-between"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-[10px] font-bold">{agent.icon}</span><div><h3 className="text-sm font-bold text-white">{agent.name}</h3><p className="text-xs text-slate-400">{agent.role}</p></div></div>{agent.status === 'running' ? <Loader2 className="h-5 w-5 animate-spin text-indigo-400" /> : agent.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <span className="mt-2 h-2 w-2 rounded-full bg-slate-600" />}</div></motion.div>)}</section><section className="space-y-4 lg:col-span-8"><div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="agent-input">Girdi Bileşeni (Ham Kod)</label><textarea id="agent-input" value={inputCode} onChange={(event) => setInputCode(event.target.value)} rows={4} className="w-full resize-none rounded-xl border border-white/10 bg-[#070A11] p-3 font-mono text-xs text-indigo-200 outline-none transition-colors focus:border-indigo-500/50" /></div><div className="min-h-[320px] rounded-2xl border border-white/10 bg-slate-900/60 p-4"><div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3"><div className="flex items-center gap-2"><button type="button" onClick={() => setActiveTab('code')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${activeTab === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}><Code2 className="h-3.5 w-3.5" /> Cilalanmış Kod</button><button type="button" onClick={() => setActiveTab('tests')} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${activeTab === 'tests' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}><TestTube2 className="h-3.5 w-3.5" /> Test Paketi</button></div>{outputCode && <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-400"><Sparkles className="h-3 w-3" /> Impeccable Refactored</span>}</div><AnimatePresence mode="wait">{activeTab === 'code' ? <motion.pre key="code" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="overflow-x-auto rounded-xl border border-white/5 bg-[#070A11] p-4 font-mono text-xs leading-relaxed text-slate-200">{outputCode || '// Ajan boru hattı çalıştırıldığında optimize edilmiş kod burada görünecek...'}</motion.pre> : <motion.pre key="tests" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="overflow-x-auto rounded-xl border border-white/5 bg-[#070A11] p-4 font-mono text-xs leading-relaxed text-emerald-200/90">{testCode || '// Ajan 3 tarafından üretilen test paketi burada görünecek...'}</motion.pre>}</AnimatePresence></div></section></div></div></main>;
};