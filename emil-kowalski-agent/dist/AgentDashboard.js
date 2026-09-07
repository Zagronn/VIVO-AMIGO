"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDashboard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const framer_motion_1 = require("framer-motion");
const lucide_react_1 = require("lucide-react");
const initialAgents = [
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
const AgentDashboard = () => {
    const [inputCode, setInputCode] = (0, react_1.useState)('export function ActionButton({ label }) {\n  return <button className="p-2 bg-blue-500">{label}</button>;\n}');
    const [activeTab, setActiveTab] = (0, react_1.useState)('code');
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(false);
    const [outputCode, setOutputCode] = (0, react_1.useState)('');
    const [testCode, setTestCode] = (0, react_1.useState)('');
    const [agents, setAgents] = (0, react_1.useState)(initialAgents);
    const updateAgentStatus = (id, status) => setAgents((current) => current.map((agent) => agent.id === id ? { ...agent, status } : agent));
    const runPipeline = async () => {
        if (isProcessing)
            return;
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
    return (0, jsx_runtime_1.jsx)("main", { className: "min-h-screen bg-[#0B0F17] p-6 font-sans text-slate-100 selection:bg-indigo-500/30 md:p-10", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-7xl", children: [(0, jsx_runtime_1.jsxs)("header", { className: "mb-8 flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "grid h-10 w-10 place-items-center rounded-xl border border-indigo-500/40 bg-indigo-600/20 text-lg", children: "A" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h1", { className: "flex items-center gap-2 text-xl font-bold text-white", children: ["JARVIS AGENT ECOSYSTEM ", (0, jsx_runtime_1.jsx)("span", { className: "rounded-full border border-indigo-500/30 bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-indigo-300", children: "v2.5 Pro Engine" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-400", children: "Emil Kowalski \u00B7 Impeccable Design \u00B7 Teste Skill Pipeline" })] })] }), (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.button, { type: "button", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: runPipeline, disabled: isProcessing, className: `flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold shadow-lg transition-all ${isProcessing ? 'cursor-not-allowed border-white/5 bg-slate-800 text-slate-500' : 'border-indigo-400/30 bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-500'}`, children: [isProcessing ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Play, { className: "h-4 w-4 fill-current" }), isProcessing ? 'Pipeline Çalışıyor...' : 'Ajan Boru Hattını Çalıştır'] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-12", children: [(0, jsx_runtime_1.jsxs)("section", { className: "space-y-4 lg:col-span-4", children: [(0, jsx_runtime_1.jsxs)("h2", { className: "mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Terminal, { className: "h-4 w-4 text-indigo-400" }), " Ajan Orkestrasyonu"] }), agents.map((agent) => (0, jsx_runtime_1.jsx)(framer_motion_1.motion.div, { layout: true, className: `rounded-2xl border p-4 transition-all ${agent.status === 'running' ? 'border-indigo-500/50 bg-indigo-950/40 shadow-lg shadow-indigo-500/10' : agent.status === 'completed' ? 'border-emerald-500/30 bg-slate-900/80' : 'border-white/5 bg-slate-900/40'}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("span", { className: "grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-[10px] font-bold", children: agent.icon }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-bold text-white", children: agent.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-400", children: agent.role })] })] }), agent.status === 'running' ? (0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-5 w-5 animate-spin text-indigo-400" }) : agent.status === 'completed' ? (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-emerald-400" }) : (0, jsx_runtime_1.jsx)("span", { className: "mt-2 h-2 w-2 rounded-full bg-slate-600" })] }) }, agent.id))] }), (0, jsx_runtime_1.jsxs)("section", { className: "space-y-4 lg:col-span-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-white/10 bg-slate-900/60 p-4", children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400", htmlFor: "agent-input", children: "Girdi Bile\u015Feni (Ham Kod)" }), (0, jsx_runtime_1.jsx)("textarea", { id: "agent-input", value: inputCode, onChange: (event) => setInputCode(event.target.value), rows: 4, className: "w-full resize-none rounded-xl border border-white/10 bg-[#070A11] p-3 font-mono text-xs text-indigo-200 outline-none transition-colors focus:border-indigo-500/50" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "min-h-[320px] rounded-2xl border border-white/10 bg-slate-900/60 p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-4 flex items-center justify-between border-b border-white/10 pb-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setActiveTab('code'), className: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${activeTab === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Code2, { className: "h-3.5 w-3.5" }), " Cilalanm\u0131\u015F Kod"] }), (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setActiveTab('tests'), className: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${activeTab === 'tests' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.TestTube2, { className: "h-3.5 w-3.5" }), " Test Paketi"] })] }), outputCode && (0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-1 font-mono text-[11px] text-emerald-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { className: "h-3 w-3" }), " Impeccable Refactored"] })] }), (0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { mode: "wait", children: activeTab === 'code' ? (0, jsx_runtime_1.jsx)(framer_motion_1.motion.pre, { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 }, className: "overflow-x-auto rounded-xl border border-white/5 bg-[#070A11] p-4 font-mono text-xs leading-relaxed text-slate-200", children: outputCode || '// Ajan boru hattı çalıştırıldığında optimize edilmiş kod burada görünecek...' }, "code") : (0, jsx_runtime_1.jsx)(framer_motion_1.motion.pre, { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 }, className: "overflow-x-auto rounded-xl border border-white/5 bg-[#070A11] p-4 font-mono text-xs leading-relaxed text-emerald-200/90", children: testCode || '// Ajan 3 tarafından üretilen test paketi burada görünecek...' }, "tests") })] })] })] })] }) });
};
exports.AgentDashboard = AgentDashboard;
