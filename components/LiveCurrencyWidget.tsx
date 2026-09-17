'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PayVivoRatesEngine } from '../services/payVivoRatesEngine';

type Currency = 'USD' | 'EUR' | 'TRY' | 'CNY';

interface LiveCurrencyWidgetProps { websocketUrl?: string; }

export const LiveCurrencyWidget = ({ websocketUrl = process.env.NEXT_PUBLIC_FX_WEBSOCKET_URL }: LiveCurrencyWidgetProps) => {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [connection, setConnection] = useState<'CONNECTING' | 'LIVE' | 'UNAVAILABLE'>('CONNECTING');
  const [amountGTQ, setAmountGTQ] = useState(1000);
  const [currency, setCurrency] = useState<Currency>('USD');

  useEffect(() => {
    if (!websocketUrl || typeof WebSocket === 'undefined') { setConnection('UNAVAILABLE'); return; }
    const socket = new WebSocket(websocketUrl);
    socket.onopen = () => setConnection('LIVE');
    socket.onmessage = (event) => {
      try { const payload = JSON.parse(event.data) as { rates?: Record<string, number> }; if (payload.rates) setRates(payload.rates); } catch { setConnection('UNAVAILABLE'); }
    };
    socket.onerror = () => setConnection('UNAVAILABLE');
    socket.onclose = () => setConnection('UNAVAILABLE');
    return () => socket.close();
  }, [websocketUrl]);

  const comparison = useMemo(() => { try { return new PayVivoRatesEngine().calculateComparison(amountGTQ, currency); } catch { return null; } }, [amountGTQ, currency]);
  const coverage = Object.keys(rates).length;

  return <section className="rounded-3xl border border-[#002E5D]/20 bg-[#002E5D] p-5 text-white" aria-label="Live FX and PayVivo transfer rates"><div className="flex items-center justify-between gap-3"><div><p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#27AE60]">PAY VIVO · LIVE FX</p><h2 className="mt-1 text-lg font-extrabold">Wise-style transparent transfer</h2></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${connection === 'LIVE' ? 'bg-[#27AE60] text-white' : 'bg-white/10 text-white/60'}`}>{connection === 'LIVE' ? `${coverage}+ currencies` : 'FX feed unavailable'}</span></div><div className="mt-4 grid grid-cols-4 gap-2">{(['USD', 'EUR', 'TRY', 'CNY'] as Currency[]).map((item) => <button type="button" key={item} onClick={() => setCurrency(item)} className={`rounded-xl border px-2 py-2 text-xs font-bold ${currency === item ? 'border-[#FF6B00] bg-[#FF6B00] text-white' : 'border-white/10 bg-white/5 text-white/70'}`}>{item}</button>)}</div><div className="mt-4 flex gap-2"><input type="number" min="1" value={amountGTQ} onChange={(event) => setAmountGTQ(Number(event.target.value))} className="min-w-0 flex-1 rounded-xl bg-white/10 p-3 text-sm text-white outline-none" aria-label="Amount in GTQ" /><div className="rounded-xl bg-white/10 px-3 py-3 text-xs font-bold">{comparison ? `${(comparison.amountGTQ * comparison.conversionRate).toFixed(2)} ${currency}` : '—'}</div></div>{comparison && <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-white/70"><span>PAY VIVO: ${comparison.payVivoFeeUSD} USD</span><span>Bank avg: ${comparison.avgBankFeeUSD} USD</span><span className="col-span-2 font-bold text-[#27AE60]">Estimated comparison: ~${comparison.userSavingsUSD} USD</span></div>}<p className="mt-3 text-[10px] text-white/50">Provider feed required for live rates; comparison uses the configured snapshot until connected.</p></section>;
};