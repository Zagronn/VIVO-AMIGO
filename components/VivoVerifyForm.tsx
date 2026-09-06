'use client';

import React, { useState } from 'react';

interface VerificationFormState {
  vinNumber: string;
  licensePlate: string;
  ownerDPI: string;
  registrationDocumentImage: string;
}

const EMPTY_FORM: VerificationFormState = { vinNumber: '', licensePlate: '', ownerDPI: '', registrationDocumentImage: '' };

export const VivoVerifyForm = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [listingId, setListingId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');

  const update = (field: keyof VerificationFormState, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const readDocument = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update('registrationDocumentImage', typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  };

  const verifyVehicle = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsVerifying(true);
    setMessage('');
    try {
      const response = await fetch('/api/v1/verify/vehicle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json() as { verified?: boolean; message?: string };
      setIsVerified(result.verified === true);
      setMessage(result.verified ? 'Documentos verificados. Puedes reservar tu inspección VIP.' : result.message || 'Revisa tus documentos.');
      if (result.verified) setListingId(`LISTING-${Date.now()}`);
    } catch {
      setIsVerified(false);
      setMessage('No pudimos completar la verificación. Inténtalo de nuevo.');
    } finally {
      setIsVerifying(false);
    }
  };

  const bookInspection = async () => {
    setBookingMessage('');
    try {
      const response = await fetch('/api/v1/verify/inspection', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId, vinNumber: form.vinNumber, licensePlate: form.licensePlate, appointmentDate, inspectionTier: 'VIP_MOBILE_INSPECTION' }) });
      const result = await response.json() as { booked?: boolean; message?: string };
      setBookingMessage(result.booked ? 'Inspección VIP solicitada. Un inspector móvil te contactará.' : result.message || 'No se pudo reservar la inspección.');
    } catch {
      setBookingMessage('No se pudo reservar la inspección. Inténtalo de nuevo.');
    }
  };

  return (
    <section className="mx-auto my-6 max-w-xl rounded-3xl border border-cyan-400/20 bg-[#07121A] p-6 text-white shadow-2xl" aria-labelledby="vivo-verify-title">
      <div className="mb-5 border-b border-white/10 pb-4">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-300">VIVO-VERIFY · Invisible Barrier</span>
        <h2 id="vivo-verify-title" className="mt-2 text-2xl font-bold">Verificación vehicular sin fricción</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">Validamos tus documentos en segundo plano antes de habilitar una inspección presencial.</p>
      </div>
      <form onSubmit={verifyVehicle} className="space-y-3">
        <input required value={form.vinNumber} onChange={(event) => update('vinNumber', event.target.value)} placeholder="VIN / Número de chasis" className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-cyan-300" />
        <input required value={form.licensePlate} onChange={(event) => update('licensePlate', event.target.value)} placeholder="Placa" className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-cyan-300" />
        <input required value={form.ownerDPI} onChange={(event) => update('ownerDPI', event.target.value)} placeholder="DPI del propietario" className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-cyan-300" />
        <label className="block rounded-xl border border-dashed border-cyan-300/30 bg-cyan-300/[0.04] p-4 text-xs text-slate-300">Documento de circulación<input required type="file" accept="image/*,.pdf" onChange={(event) => readDocument(event.target.files?.[0])} className="mt-2 block w-full text-xs" /></label>
        <button type="submit" disabled={isVerifying} className="w-full rounded-xl bg-cyan-300 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60">{isVerifying ? 'Verificando documentos...' : 'Verificar vehículo'}</button>
      </form>
      {message && <p className={`mt-4 text-xs ${isVerified ? 'text-emerald-300' : 'text-amber-200'}`} role="status">{message}</p>}
      {isVerified && <div className="mt-5 space-y-3 border-t border-white/10 pt-5"><label className="block text-xs text-slate-400">Reserva tu inspección VIP móvil<input type="datetime-local" required value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white" /></label><button type="button" onClick={bookInspection} disabled={!appointmentDate} className="w-full rounded-xl border border-amber-300/40 bg-amber-300/10 py-3 text-xs font-bold uppercase tracking-wider text-amber-200 disabled:opacity-40">Reservar inspección VIP</button>{bookingMessage && <p className="text-xs text-emerald-300" role="status">{bookingMessage}</p>}</div>}
    </section>
  );
};