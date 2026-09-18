'use client';

import React, { useState, useEffect } from 'react';
import { recordShare } from '@/actions/rewards';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export function ShareButtons({ title, url: providedUrl }: ShareButtonsProps) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!providedUrl) {
      setCurrentUrl(window.location.href);
    } else {
      setCurrentUrl(providedUrl);
    }
  }, [providedUrl]);

  const handleShareAction = async (platform: 'WHATSAPP' | 'FACEBOOK' | 'NATIVE') => {
    setIsPending(true);
    try {
      const result = await recordShare(platform);
      if (!result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error: any) {
      alert(error.message || 'An error occurred while recording your share.');
    } finally {
      setIsPending(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: currentUrl,
        });
        await handleShareAction('NATIVE');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${currentUrl}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;

  if (!currentUrl) return null;

  return (
    <div className="flex items-center gap-3">
      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleShareAction('WHATSAPP')}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white transition hover:bg-green-600 hover:scale-110 shadow-sm"
        title="Share on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.//9.6 8.38 8.38 0 0 1-//7.6 0 8.38 8.38 0 0 1-.//9.6z" />
          <path d="M16.9 14.3L18 16.5" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
          <path d="M8.5 8.5h.01" />
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        </svg>
      </a>

      {/* Facebook */}
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleShareAction('FACEBOOK')}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 hover:scale-110 shadow-sm"
        title="Share on Facebook"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3v-4h-3V7a1 1 0 0 1 1-1h3z" />
        </svg>
      </a>

      {/* Native Share / Copy Link */}
      <button
        onClick={handleNativeShare}
        disabled={isPending}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-vivo-black text-white transition hover:bg-vivo-orange hover:scale-110 shadow-sm disabled:opacity-50"
        title={navigator.share ? "Share" : "Copy Link"}
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        )}
      </button>
    </div>
  );
}
