'use client';

import { useMemo, useState } from 'react';

type AssetType = 'VEHICLE' | 'PROPERTY' | 'DEVICE';

type Preset = {
  label: string;
  icon: string;
  estimatedValue: number;
  targetValue: number;
};

const presets: Record<AssetType, Preset> = {
  VEHICLE: { label: 'Auto Swap', icon: '🚗', estimatedValue: 25_000, targetValue: 60_000 },
  PROPERTY: { label: 'Home Flex', icon: '🏠', estimatedValue: 250_000, targetValue: 450_000 },
  DEVICE: { label: 'Tech Trade', icon: '📱', estimatedValue: 1_500, targetValue: 4_500 }
};

const formatGTQ = (value: number) => `Q ${Math.max(0, value).toLocaleString('en-US')}`;

export const VivoTradeInEngine = () => {
  const [assetType, setAssetType] = useState<AssetType>('VEHICLE');
  const [estimatedValue, setEstimatedValue] = useState(presets.VEHICLE.estimatedValue);
  const [targetValue, setTargetValue] = useState(presets.VEHICLE.targetValue);
  const [status, setStatus] = useState('Listo para simular tu renovación.');

  const calculation = useMemo(() => {
    const downPayment = Math.max(0, estimatedValue);
    const requiredLoan = Math.max(0, targetValue - downPayment);
    const monthlyPayment = Math.round((requiredLoan * 1.12) / 36);
    return { downPayment, requiredLoan, monthlyPayment };
  }, [estimatedValue, targetValue]);

  const selectAsset = (type: AssetType) => {
    setAssetType(type);
    setEstimatedValue(presets[type].estimatedValue);
    setTargetValue(presets[type].targetValue);
    setStatus('Valores de referencia actualizados.');
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-4 py-8 text-[#111111] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl bg-[#111111] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.16em]">
                <span className="rounded-full bg-[#FF6A00] px-3 py-1">VERI-SHIELD · TRADE-IN</span>
                <span className="rounded-full border border-white/20 px-3 py-1 text-white/70">vivoamigo.com</span>
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">Dinámico. Transparente. Tuyo.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">Convierte tu activo actual en el primer paso para una nueva oportunidad, con una simulación clara en Quetzales.</p>
            </div>
            <div className="rounded-2xl bg-[#FF6A00] p-5 text-white lg:max-w-xs">
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-white/75">VIVO PAY · 36 meses</p>
              <strong className="mt-2 block text-3xl font-extrabold">{formatGTQ(calculation.monthlyPayment)}</strong>
              <span className="text-xs text-white/80">pago mensual estimado</span>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <div className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#FF6A00]">01 · Elige el activo</p>
              <h2 className="mt-2 text-2xl font-extrabold">¿Qué quieres renovar?</h2>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#F8F9FA] p-1">
              {(Object.keys(presets) as AssetType[]).map((type) => (
                <button key={type} type="button" onClick={() => selectAsset(type)} className={`rounded-xl px-2 py-3 text-xs font-extrabold transition ${assetType === type ? 'bg-[#FF6A00] text-white shadow' : 'text-black/55 hover:bg-white'}`}>
                  <span className="block text-lg" aria-hidden="true">{presets[type].icon}</span>
                  {presets[type].label}
                </button>
              ))}
            </div>
            <label className="block text-sm font-bold" htmlFor="estimated-value">Valor de tu activo <span className="font-normal text-black/45">(GTQ)</span>
              <input id="estimated-value" type="number" min="0" value={estimatedValue} onChange={(event) => setEstimatedValue(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-black/10 bg-[#F8F9FA] px-4 py-3 text-lg font-extrabold outline-none focus:border-[#FF6A00]" />
            </label>
            <p className="text-xs leading-5 text-black/45">La valoración final se confirma con VERI-SHIELD, registros SAT y la inspección correspondiente.</p>
            <label className="block text-sm font-bold" htmlFor="target-value">Valor del nuevo activo <span className="font-normal text-black/45">(GTQ)</span>
              <input id="target-value" type="number" min="0" value={targetValue} onChange={(event) => setTargetValue(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-black/10 bg-[#F8F9FA] px-4 py-3 text-lg font-extrabold outline-none focus:border-[#FF6A00]" />
            </label>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#FF6A00]">02 · Tu simulación VIVO PAY</p>
            <h2 className="mt-2 text-2xl font-extrabold">El número antes del siguiente paso.</h2>
            <div className="mt-8 space-y-4 text-sm">
              <div className="flex justify-between border-b border-black/10 pb-4"><span className="text-black/55">Peşinat por tu activo actual</span><strong>{formatGTQ(calculation.downPayment)}</strong></div>
              <div className="flex justify-between border-b border-black/10 pb-4"><span className="text-black/55">Crédito estimado restante</span><strong className="text-[#FF6A00]">{formatGTQ(calculation.requiredLoan)}</strong></div>
              <div className="flex justify-between border-b border-black/10 pb-4"><span className="text-black/55">Pago mensual · 36 meses</span><strong className="text-[#16A34A]">{formatGTQ(calculation.monthlyPayment)}</strong></div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => setStatus('Solicitud iniciada. Un asesor VIVO PAY te contactará para validar tu perfil.')} className="rounded-full bg-[#FF6A00] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#EB5C00]">Iniciar con VIVO PAY <span className="ml-3">→</span></button>
              <a href="/wallet" className="rounded-full border-2 border-[#FF6A00] px-5 py-3 text-center text-sm font-extrabold text-[#EB5C00] hover:bg-[#FBF7AA]">Ver billetera</a>
            </div>
            <p role="status" className="mt-4 text-xs text-black/50">{status}</p>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl bg-[#2563EB] p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-blue-100">CARGO VIVO · entrega protegida</p><p className="mt-2 text-sm text-white/85">Cuando tu operación avance, coordinamos la entrega del vehículo, propiedad o dispositivo con seguimiento de ruta.</p></div>
          <a href="/cargo" className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#2563EB]">Ver rutas →</a>
        </section>
      </div>
    </main>
  );
};
