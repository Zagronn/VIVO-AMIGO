import Link from 'next/link';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-extrabold tracking-tight ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vivo-orange text-white">
        V
      </span>
      <span className="text-lg notranslate" translate="no">
        VIVO <span className="text-vivo-orange">AMIGO</span>
      </span>
    </Link>
  );
}
