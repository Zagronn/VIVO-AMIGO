import React from 'react';
import type { VivoVerifyInspection } from '../services/vivoVerifyEngine';

export const AdminInspectionStatusBadge = ({ inspection }: { inspection: VivoVerifyInspection }) => {
  const approved = inspection.status === 'APPROVED_SEALED';
  return (
    <span role="status" className={approved ? 'rounded border border-green-500/40 bg-green-900/30 px-2 py-1 text-xs font-bold text-green-300' : 'rounded border border-red-500/40 bg-red-900/30 px-2 py-1 text-xs font-bold text-red-300'}>
      {approved ? `VIVO-VERIFY sealed · ${inspection.inspectionId}` : `Inspection rejected · ${inspection.inspectionId}`}
    </span>
  );
};
