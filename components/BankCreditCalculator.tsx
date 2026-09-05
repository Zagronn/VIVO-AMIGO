'use client';

import React, { useMemo, useState } from 'react';

interface BankCreditCalculatorProps {
  propertyPriceGTQ: number;
}

const ANNUAL_INTEREST_RATE = 0.08;

export const BankCreditCalculator = ({ propertyPriceGTQ }: BankCreditCalculatorProps) => {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [termYears, setTermYears] = useState(20);
  const safePropertyPrice = Number.isFinite(propertyPriceGTQ) && propertyPriceGTQ > 0 ? propertyPriceGTQ : 0;

  const monthlyInstallment = useMemo(() => {
    const loanAmount = safePropertyPrice * (1 - downPaymentPercent / 100);
    const monthlyInterestRate = ANNUAL_INTEREST_RATE / 12;
    const totalMonths = termYears * 12;
    const growth = Math.pow(1 + monthlyInterestRate, totalMonths);
    return growth === 1 ? loanAmount / totalMonths : (loanAmount * monthlyInterestRate * growth) / (growth - 1);
  }, [downPaymentPercent, safePropertyPrice, termYears]);

  const handlePrequalification = () => {
    window.alert('Solicitud enviada a los bancos asociados.');
  };

  return (
    <div className="my-4 rounded-2xl border border-blue-500/30 bg-[#111111] p-5 text-white">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-bold text-blue-400">Calculadora de Crédito Bancario</h4>
        <span className="rounded border border-blue-500/30 bg-blue-900/40 px-2 py-0.5 text-[10px] text-blue-300">Banco Industrial / BAC</span>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="mb-1 block text-gray-400" htmlFor="credit-down-payment">Enganche (% Peşinat):</label>
          <select id="credit-down-payment" value={downPaymentPercent} onChange={(event) => setDownPaymentPercent(Number(event.target.value))} className="w-full rounded-lg border border-gray-800 bg-[#1e1e1e] p-2 text-white">
            <option value={10}>10%</option><option value={20}>20%</option><option value={30}>30%</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-gray-400" htmlFor="credit-term">Plazo (Vade Yılı):</label>
          <select id="credit-term" value={termYears} onChange={(event) => setTermYears(Number(event.target.value))} className="w-full rounded-lg border border-gray-800 bg-[#1e1e1e] p-2 text-white">
            <option value={10}>10 Años</option><option value={15}>15 Años</option><option value={20}>20 Años</option>
          </select>
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between rounded-xl bg-[#1e1e1e] p-3">
        <span className="text-xs text-gray-400">Cuota Mensual Estimada:</span>
        <span className="text-lg font-black tabular-nums text-[#FF6A00]">Q{Number.isFinite(monthlyInstallment) ? monthlyInstallment.toFixed(2) : '0.00'} / mes</span>
      </div>
      <p className="mb-3 text-[10px] text-gray-500">Estimación referencial al 8% anual; la aprobación y tasa final dependen del banco.</p>
      <button type="button" onClick={handlePrequalification} className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-blue-700">Pre-Calificar Crédito en Línea</button>
    </div>
  );
};
