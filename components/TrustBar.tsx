import React from 'react';

interface TrustBarProps {
  assetClass: 'RETAIL' | 'AUTOMOTIVE' | 'REAL_ESTATE';
  amountGTQ: number;
}

const LABELS: Record<TrustBarProps['assetClass'], string> = {
  RETAIL: 'Kargo teslim kanıtı bekleyen escrow koruması',
  AUTOMOTIVE: 'SAT/noter devir kanıtı bekleyen parasal güvence',
  REAL_ESTATE: 'Tapu sicil kanıtı bekleyen yüksek meblağ koruması'
};

export const TrustBar = ({ assetClass, amountGTQ }: TrustBarProps) => {
  if (!Number.isFinite(amountGTQ) || amountGTQ < 0) throw new Error('amountGTQ must be non-negative');
  return <aside className="my-3 flex w-full items-center justify-between rounded-xl border border-[#10b981]/40 bg-[#002E5D]/90 p-3.5 text-white shadow-lg" role="status" aria-label="PAY VIVO escrow trust status"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10b981]/20 text-lg font-bold text-[#6ee7b7]" aria-hidden="true">Shield</div><div><div className="font-mono text-xs font-semibold uppercase tracking-wide text-[#6ee7b7]">PAY VIVO TRUST SECURED</div><div className="mt-0.5 text-xs text-slate-200">{LABELS[assetClass]}</div></div></div><div className="text-right"><div className="text-xs text-slate-400">Bloke edilecek bedel</div><div className="text-sm font-extrabold text-[#FF6B00]">Q {amountGTQ.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</div></div></aside>;
};