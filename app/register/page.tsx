import Link from 'next/link';
import { registerUser } from '@/actions/auth';
import { AuthForm } from '@/components/AuthForm';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { ShareButtons } from '@/components/ShareButtons';

export default function RegisterPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold text-vivo-black">Create your account</h1>
      <p className="mt-1 text-sm text-vivo-black/60">Join VIVO AMIGO to shop and leave reviews.</p>

      <div className="mt-8">
        <AuthForm
          action={registerUser}
          fields={[
            { name: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
            { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
            { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
          ]}
          submitLabel="Create account"
          pendingLabel="Creating account…"
          next={searchParams.next}
        />
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-vivo-black/10"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-vivo-black/40">Or sign up with</span>
        </div>
      </div>

      <GoogleSignInButton />

      <div className="mt-12 p-6 rounded-2xl bg-vivo-cream border border-vivo-orange/20 text-center">
        <h3 className="font-bold text-vivo-black">Start with a discount! 🎁</h3>
        <p className="mt-2 text-xs text-vivo-black/60">Share VIVO AMIGO now and get up to 3% off your first order!</p>
        <div className="mt-4 flex justify-center">
          <ShareButtons title="Join the VIVO AMIGO ecosystem!" />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-vivo-black/60">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-vivo-orange hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
