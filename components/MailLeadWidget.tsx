import React from 'react';
import type { AIAnalyzedMail } from '../services/aiMailHandlerService';

interface MailLeadWidgetProps {
  lead: AIAnalyzedMail;
  onApprove?: (lead: AIAnalyzedMail) => void;
}

export const MailLeadWidget = ({ lead, onApprove }: MailLeadWidgetProps) => {
  return <article className="my-3 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#002E5D]/90 p-4 text-white shadow-xl" aria-label="AI mail lead"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FF6B00]/40 bg-[#FF6B00]/20 text-lg font-bold text-[#FF6B00]" aria-hidden="true">Mail</div><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#FF6B00] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">{lead.channel} / {lead.category}</span><span className="text-xs text-slate-300">Priority: {lead.priorityScore}/10</span></div><p className="mt-1 text-xs font-medium text-slate-200">{lead.aiSummary}</p></div></div>{lead.requiresHumanAction && <button type="button" onClick={() => onApprove?.(lead)} disabled={!onApprove} className="rounded-xl bg-[#10b981] px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50">Review &amp; approve</button>}</article>;
};