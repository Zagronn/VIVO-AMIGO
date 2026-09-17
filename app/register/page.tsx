import Link from 'next/link';
import { registerUser } from '@/actions/auth';
import { AuthForm } from '@/components/AuthForm';

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

      <p className="mt-6 text-center text-sm text-vivo-black/60">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-vivo-orange hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
