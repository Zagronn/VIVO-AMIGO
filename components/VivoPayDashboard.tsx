'use client';

import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, CreditCard, Globe2, Landmark, QrCode, Send, Smartphone, WalletCards, X } from 'lucide-react';
import { VivoBrandLogo } from './VivoBrandLogo';
import { useSiteConfig } from './siteConfig';

type PayAction = 'send' | 'receive' | 'topup' | 'bills' | 'qr' | 'withdraw' | 'card' | 'transfer';
type Movement = { title: string; meta: string; amount: string; icon: typeof Send };
const initialMovements: Movement[] = [{ title: 'Protected payment · VIVO AMIGO', meta: 'Today · Escrow purchase', amount: '- Q 1,280.00', icon: WalletCards }, { title: 'Transfer received', meta: 'Yesterday · VIVO PAY', amount: '+ Q 850.00', icon: ArrowDownLeft }, { title: 'CARGO VIVO', meta: '12 Sep · National shipment', amount: '- Q 48.00', icon: Send }];
const rates: Record<string, number> = { USD: 0.127, EUR: 0.117, GTQ: 1 };

export function VivoPayDashboard() {
  const { config } = useSiteConfig();
  const [balance, setBalance] = useState(12500);
  const [movements, setMovements] = useState(initialMovements);
  const [action, setAction] = useState<PayAction | null>(null);
  const [message, setMessage] = useState('');
  const [currency, setCurrency] = useState('GTQ');
  const close = () => { setAction(null); setMessage(''); };
  const complete = () => { setMessage('VIVO PAY is in public preview. No money was moved.'); };
  const openAction = (nextAction: PayAction) => { if (!config.modules.payPreview) setMessage('VIVO PAY preview is currently disabled by site administration.'); else setAction(nextAction); };

  return <main className="min-h-screen bg-[#EDF2F7] p-4 text-[#25262C] sm:p-6"><div className="mx-auto max-w-6xl space-y-6">
    <header className="flex items-center justify-between"><VivoBrandLogo variant="pay" light href="https://payvivoamigo.com" /><span className="rounded-full bg-[#25262C] px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-white">PROTECTED PAYMENTS</span></header>
    {message && <p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"><CheckCircle2 size={17} />{message}</p>}
    <section className="grid gap-4 sm:grid-cols-3"><CurrencyCard currency="GTQ" balance="12,500.00" label="Guatemalan quetzal" active={currency === 'GTQ'} onClick={() => setCurrency('GTQ')} /><CurrencyCard currency="USD" balance="1,240.00" label="US dollar" active={currency === 'USD'} onClick={() => setCurrency('USD')} /><CurrencyCard currency="EUR" balance="980.00" label="Euro" active={currency === 'EUR'} onClick={() => setCurrency('EUR')} /></section>
    <section className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]"><article className="rounded-lg bg-[#25262C] p-7 text-white shadow-sm"><p className="text-sm font-medium text-white/65">Available balance · {currency}</p><p className="mt-2 text-4xl font-extrabold tracking-tight">Q {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p><p className="mt-2 text-xs text-orange-100">Q 3,200.00 held in escrow</p><div className="mt-7 grid grid-cols-3 gap-2"><Action label="Send money" icon={Send} onClick={() => openAction('send')} /><Action label="Receive money" icon={ArrowDownLeft} onClick={() => openAction('receive')} /><Action label="Add funds" icon={WalletCards} onClick={() => openAction('topup')} /></div></article><article className="rounded-lg bg-gradient-to-br from-[#FF6A00] to-[#EB5A00] p-7 text-white shadow-sm"><p className="text-xs font-bold tracking-[0.16em] text-orange-100">VIVO PAY VISA</p><CreditCard className="mt-8" size={30} /><p className="mt-7 text-lg font-extrabold tracking-[0.18em]">•••• 4821</p><div className="mt-4 flex justify-between text-[10px] font-bold"><span>VIVO AMIGO</span><span>12/29</span></div></article></section>
    <section><div className="mb-4"><p className="text-xs font-bold tracking-[0.16em] text-[#FF6A00]">QUICK ACTIONS</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#FF6A00]">Your money, in one place</h1></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-5"><Action label="International transfer" icon={Globe2} onClick={() => openAction('transfer')} /><Action label="Top up phone" icon={Smartphone} onClick={() => openAction('topup')} /><Action label="Pay bills" icon={Landmark} onClick={() => openAction('bills')} /><Action label="QR codes" icon={QrCode} onClick={() => openAction('qr')} /><Action label="Withdraw money" icon={ArrowUpRight} onClick={() => openAction('withdraw')} /></div></section>
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold tracking-[0.16em] text-[#FF6A00]">ACTIVITY</p><h2 className="mt-1 text-xl font-extrabold">Recent transactions</h2><div className="mt-5 divide-y divide-gray-100">{movements.map(({ title, meta, amount, icon: Icon }) => <div key={`${title}-${meta}`} className="flex items-center justify-between gap-4 py-4"><span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-orange-50 text-[#FF6A00]"><Icon size={17} /></span><span><strong className="block text-sm">{title}</strong><small className="text-xs text-gray-500">{meta}</small></span></span><strong className={amount.startsWith('+') ? 'text-emerald-600' : ''}>{amount}</strong></div>)}</div></section>
    {action && <PayDialog action={action} onClose={close} onComplete={complete} />}
  </div></main>;
}

function CurrencyCard({ currency, balance, label, active, onClick }: { currency: string; balance: string; label: string; active: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className={`rounded-xl border p-4 text-left shadow-sm transition ${active ? 'border-[#FF6A00] bg-[#25262C] text-white' : 'border-gray-200 bg-white'}`}><span className="text-xs font-bold text-[#FF6A00]">{currency}</span><strong className="mt-3 block text-2xl font-extrabold">{balance}</strong><span className="mt-1 block text-xs opacity-60">{label}</span></button>; }
function Action({ label, icon: Icon, onClick }: { label: string; icon: typeof Send; onClick: () => void }) { return <button type="button" onClick={onClick} className="rounded-md bg-[#FF6A00] px-2 py-3 text-center text-[11px] font-bold text-white transition hover:scale-[1.02] hover:bg-[#EB5A00]"><Icon className="mx-auto mb-1" size={17} />{label}</button>; }

function PayDialog({ action, onClose, onComplete }: { action: PayAction; onClose: () => void; onComplete: () => void }) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sourceCurrency, setSourceCurrency] = useState('GTQ');
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const labels: Record<PayAction, string> = { send: 'Send money', receive: 'Receive money', topup: 'Add funds', bills: 'Pay bills', qr: 'QR payment', withdraw: 'Withdraw money', card: 'VIVO PAY cards', transfer: 'International transfer' };
  const requiresAmount = !['qr', 'card'].includes(action);
  const numericAmount = Number(amount) || 0;
  const fee = action === 'transfer' ? Math.max(1.5, numericAmount * 0.009) : 0;
  const conversionRate = rates[targetCurrency] / rates[sourceCurrency];
  const converted = Math.max(0, numericAmount - fee) * conversionRate;
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (requiresAmount && (!Number.isFinite(numericAmount) || numericAmount <= 0)) return; onComplete(); onClose(); };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={labels[action]}><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-2xl font-extrabold">{labels[action]}</h2><button type="button" onClick={onClose} className="rounded-full border border-gray-200 p-2"><X size={16} /></button></div>{!['qr', 'card'].includes(action) && <label className="mt-6 block text-xs font-bold text-gray-600">Recipient, email, or account<input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="name@example.com or account" className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 text-sm" required={['send', 'transfer'].includes(action)} /></label>}{requiresAmount && <label className="mt-4 block text-xs font-bold text-gray-600">Amount (GTQ)<input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="0.00" className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 text-sm" required /></label>}{action === 'transfer' && <><label className="mt-4 block text-xs font-bold text-gray-600">Send as<select value={targetCurrency} onChange={(event) => setTargetCurrency(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm"><option value="USD">USD · US dollar</option><option value="EUR">EUR · Euro</option><option value="GTQ">GTQ · Quetzal</option></select></label><div className="mt-4 rounded-lg bg-[#FFF1E8] p-4 text-sm"><div className="flex justify-between"><span>Fee</span><strong>Q {fee.toFixed(2)}</strong></div><div className="mt-2 flex justify-between"><span>Recipient gets</span><strong>{converted.toFixed(2)} {targetCurrency}</strong></div><p className="mt-2 text-xs text-black/55">Rate shown before confirmation.</p></div></>}<button type="submit" className="mt-5 w-full rounded-lg bg-[#FF6A00] px-4 py-3 text-sm font-bold text-white">Confirm {labels[action]}</button></form></div>;
}