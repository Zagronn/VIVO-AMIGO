'use client';

import React, { useEffect } from 'react';
import { playSciFiSound } from './soundEffects';
import CiaInteractiveButton from './CiaInteractiveButton';

export interface TelemetryTargetUser {
  id: string;
  name: string;
  email: string;
  country: string;
  avatar: string;
  ipAddress: string;
  threatLevel: string;
}

interface UserProfileModalProps {
  user: TelemetryTargetUser | null;
  onClose: () => void;
}

export default function CiaTelemetryModal({ user, onClose }: UserProfileModalProps) {
  useEffect(() => {
    if (user) {
      // Pencere açıldığında CIA / Radar uyarı bip sesi çal
      playSciFiSound('radar');
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono text-[#ff5500]">
      <div className="border-2 border-[#ff5500] bg-black p-6 rounded-none max-w-lg w-full shadow-[0_0_30px_rgba(255,85,0,0.4)] relative">
        
        {/* Köşe Süslemeleri (CIA Terminal Havası) */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#ff5500]"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#ff5500]"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#ff5500]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#ff5500]"></div>

        <div className="flex justify-between items-center border-b border-[#ff5500]/40 pb-3 mb-4">
          <div>
            <h2 className="text-xs tracking-widest uppercase text-white">
              // TELEMETRY TARGET: {user.id}
            </h2>
            <p className="text-[10px] opacity-70">DECRYPTED PROFILE RECORD</p>
          </div>
          <CiaInteractiveButton label="CLOSE_X" onClick={onClose} variant="beep" className="py-1 px-2 text-xs" />
        </div>

        <div className="flex items-center space-x-4 my-4">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={user.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%23ff5500" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>'} 
              alt={user.name} 
              className="w-16 h-16 border border-[#ff5500] object-contain p-1 rounded-none grayscale hover:grayscale-0 transition-all bg-black/60"
            />
            <div className="absolute inset-0 border border-[#ff5500]/30 animate-pulse pointer-events-none"></div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider">{user.name}</h3>
            <p className="text-xs opacity-80">{user.email}</p>
            <p className="text-[10px] text-[#ff5500] mt-1">NODE: {user.country} | IP: {user.ipAddress}</p>
          </div>
        </div>

        <div className="border border-[#ff5500]/30 bg-black/50 p-3 my-4 space-y-2 text-xs">
          <div className="flex justify-between border-b border-[#ff5500]/20 pb-1">
            <span className="opacity-75">THREAT STATUS:</span>
            <span className="text-green-400 font-bold">{user.threatLevel}</span>
          </div>
          <div className="flex justify-between border-b border-[#ff5500]/20 pb-1">
            <span className="opacity-75">ENCRYPTION:</span>
            <span className="text-white">AES-256-SPORE</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75">ACTIVE STREAM:</span>
            <span className="text-white animate-pulse">LIVE SATELLITE LINK</span>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <CiaInteractiveButton
            label="EXECUTE DEEP SCAN"
            variant="radar"
            onClick={() => alert(`Target ${user.id} flagged for deep telemetry scan.`)}
          />
        </div>

      </div>
    </div>
  );
}
