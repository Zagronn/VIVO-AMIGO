'use client';

import React from 'react';

interface InspectionBadgeProps {
  inspectionId: string;
  score: number;
  qrCodeUrl: string;
  pdfReportUrl: string;
}

export const InspectionBadge = ({ inspectionId, score, qrCodeUrl, pdfReportUrl }: InspectionBadgeProps) => {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));

  return (
    <div className="my-3 rounded-2xl border border-green-500/40 bg-[#111111] p-4 text-white" aria-label={`Ekspertiz onaylı, yüzde 100 şeffaflık, puan ${safeScore} de 100`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🛡️</span>
            <span className="text-sm font-bold text-green-400">Ekspertiz Onaylı / %100 Şeffaflık</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">Rapor ID: {inspectionId}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black tabular-nums text-[#FF6A00]">{safeScore}/100</span>
          <p className="text-[10px] text-gray-400">Güvenilirlik Puanı</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-3">
        <a href={pdfReportUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#FF6A00] underline" aria-label={`Resmi ekspertiz PDF raporunu incele: ${inspectionId}`}>
          Resmi Ekspertiz Raporu (PDF)
        </a>
        <img src={qrCodeUrl} alt={`QR doğrulama kodu: ${inspectionId}`} className="h-12 w-12 rounded-lg bg-white p-1" />
      </div>
    </div>
  );
};
