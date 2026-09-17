import Link from 'next/link';
import { loginUser } from '@/actions/auth';
import { AuthForm } from '@/components/AuthForm';

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

      <p className="mt-6 text-center text-sm text-vivo-black/60">
        No account?{' '}
        <Link href="/register" className="font-semibold text-vivo-orange hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
