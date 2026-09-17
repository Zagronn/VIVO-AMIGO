'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheck } from 'lucide-react';

interface FormData {
  name: string;
  phone: string;
  zone: string;
}

export const BydLeadForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', phone: '', zone: 'Zona 10' });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountGTQ: 195,
          transactionType: 'BYD_LEAD',
          sellerId: 'BYD_GUATEMALA_OFFICIAL',
          buyerId: formData.phone
        })
      });
      if (!response.ok) throw new Error('No se pudo registrar la solicitud.');

      const message = encodeURIComponent(`Hola BYD Guatemala! Soy ${formData.name} de ${formData.zone}. Quiero programar una prueba de manejo.`);
      window.open(`https://wa.me/50200000000?text=${message}`, '_blank', 'noopener,noreferrer');
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo enviar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div layout className="rounded-2xl border border-[#FF6A00] bg-[#111111] p-6 text-white">
      <h3 className="mb-2 text-xl font-bold text-[#FF6A00]">Prueba de Manejo BYD Eléctrico</h3>
      <p className="mb-4 text-xs text-gray-400">Agenda tu cita directa por WhatsApp sin compromisos.</p>
      <AnimatePresence mode="wait" initial={false}>
      {submitted ? (
        <motion.div key="lead-confirmed" role="status" initial={{ opacity: 0, height: 0, scale: 0.96 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="flex items-center gap-2 overflow-hidden font-bold text-green-400"><motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}><CircleCheck size={20} aria-hidden="true" /></motion.span>¡Solicitud enviada! Redirigiendo a WhatsApp...</motion.div>
      ) : (
        <motion.form key="lead-form" layout onSubmit={handleSubmit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="space-y-3 overflow-hidden">
          <label className="sr-only" htmlFor="byd-name">Nombre completo</label>
          <input id="byd-name" type="text" placeholder="Nombre completo" required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="w-full rounded-xl border border-gray-800 bg-[#1e1e1e] p-3 text-sm focus:border-[#FF6A00] focus:outline-none" />
          <label className="sr-only" htmlFor="byd-phone">Teléfono / WhatsApp</label>
          <input id="byd-phone" type="tel" placeholder="Teléfono / WhatsApp" required value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} className="w-full rounded-xl border border-gray-800 bg-[#1e1e1e] p-3 text-sm focus:border-[#FF6A00] focus:outline-none" />
          <label className="sr-only" htmlFor="byd-zone">Zona</label>
          <select id="byd-zone" value={formData.zone} onChange={(event) => setFormData({ ...formData, zone: event.target.value })} className="w-full rounded-xl border border-gray-800 bg-[#1e1e1e] p-3 text-sm text-white focus:border-[#FF6A00] focus:outline-none">
            {Array.from({ length: 21 }, (_, index) => <option key={index} value={`Zona ${index + 1}`}>Zona {index + 1}</option>)}
          </select>
          <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="w-full rounded-xl bg-[#25D366] py-3.5 text-center font-extrabold text-black shadow-lg transition-all hover:bg-[#20ba5a] disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Enviando solicitud...' : 'Solicitar Test Drive por WhatsApp'}
          </motion.button>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        </motion.form>
      )}
      </AnimatePresence>
    </motion.div>
  );
};
