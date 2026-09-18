import Link from 'next/link';
import { loginUser } from '@/actions/auth';
import { AuthForm } from '@/components/AuthForm';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-extrabold text-vivo-black">Sign in</h1>
      <p className="mt-1 text-sm text-vivo-black/60">
        Demo accounts: <span className="font-mono">demo@vivoamigo.com</span> / demo1234 (customer),{' '}
        <span className="font-mono">admin@vivoamigo.com</span> / admin1234 (admin).
      </p>

      <div className="mt-8">
        <AuthForm
          action={loginUser}
          fields={[
            { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
            { name: 'password', label: 'Password', type: 'password', autoComplete: 'current-password' },
          ]}
          submitLabel="Sign in"
          pendingLabel="Signing in…"
          next={searchParams.next}
        />
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-vivo-black/10"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-vivo-black/40">Or continue with</span>
        </div>
      </div>

      <GoogleSignInButton />

      <p className="mt-6 text-center text-sm text-vivo-black/60">
        No account?{' '}
        <Link href="/register" className="font-semibold text-vivo-orange hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
