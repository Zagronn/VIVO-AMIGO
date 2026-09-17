'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useSpring } from 'framer-motion';
import { Building2, ChevronDown, ShieldCheck } from 'lucide-react';

interface BankCreditCalculatorProps {
  propertyPriceGTQ: number;
}

const ANNUAL_INTEREST_RATE = 0.08;

function AnimatedCurrency({ value }: { value: number }) {
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, { stiffness: 400, damping: 25 });
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useMotionValueEvent(springValue, 'change', (latest) => setDisplayValue(latest));

  return <motion.span layout className="font-black tabular-nums text-[#FF6A00]">Q{Number.isFinite(displayValue) ? displayValue.toFixed(2) : '0.00'}</motion.span>;
}

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
  const totalPayment = monthlyInstallment * termYears * 12;

  const handlePrequalification = () => {
    window.alert('Solicitud enviada a los bancos asociados.');
  };

  return (
    <motion.section layout initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="my-4 overflow-hidden rounded-2xl border border-black/5 bg-vivo-night-gradient p-5 text-white shadow-sm backdrop-blur-md dark:border-white/10">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-bold tracking-tight text-blue-200"><Building2 size={16} aria-hidden="true" />Calculadora de Crédito Bancario</h4>
        <span className="rounded border border-blue-300/25 bg-blue-200/10 px-2 py-0.5 text-[10px] text-blue-100">Banco Industrial / BAC</span>
      </div>
      <motion.div layout className="mb-4 grid grid-cols-2 gap-3 text-xs">
        <motion.div layout>
          <label className="mb-1 block text-gray-400" htmlFor="credit-down-payment">Enganche (% Peşinat):</label>
          <div className="relative"><select id="credit-down-payment" value={downPaymentPercent} onChange={(event) => setDownPaymentPercent(Number(event.target.value))} className="w-full appearance-none rounded-lg border border-white/10 bg-white/10 p-2 text-white outline-none transition focus:border-blue-300">
            <option value={10}>10%</option><option value={20}>20%</option><option value={30}>30%</option>
          </select><ChevronDown className="pointer-events-none absolute right-2 top-2.5 text-white/50" size={14} aria-hidden="true" /></div>
        </motion.div>
        <motion.div layout>
          <label className="mb-1 block text-gray-400" htmlFor="credit-term">Plazo (Vade Yılı):</label>
          <div className="relative"><select id="credit-term" value={termYears} onChange={(event) => setTermYears(Number(event.target.value))} className="w-full appearance-none rounded-lg border border-white/10 bg-white/10 p-2 text-white outline-none transition focus:border-blue-300">
            <option value={10}>10 Años</option><option value={15}>15 Años</option><option value={20}>20 Años</option>
          </select><ChevronDown className="pointer-events-none absolute right-2 top-2.5 text-white/50" size={14} aria-hidden="true" /></div>
        </motion.div>
      </motion.div>
      <motion.div layout transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="mb-4 flex items-center justify-between rounded-xl bg-white/10 p-3">
        <span className="text-xs text-gray-400">Cuota Mensual Estimada:</span>
        <span className="text-lg"><AnimatedCurrency value={monthlyInstallment} /> / mes</span>
      </motion.div>
      <motion.div layout transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="mb-4 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="text-xs text-gray-400">Total estimado del crédito:</span>
        <span className="text-sm"><AnimatedCurrency value={totalPayment} /></span>
      </motion.div>
      <p className="mb-3 text-[10px] text-gray-500">Estimación referencial al 8% anual; la aprobación y tasa final dependen del banco.</p>
      <motion.button type="button" onClick={handlePrequalification} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-blue-200"> <ShieldCheck size={15} aria-hidden="true" />Pre-Calificar Crédito en Línea</motion.button>
    </motion.section>
  );
};
