'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createJobListing } from '@/actions/jobs';

const initialState = { success: false as boolean, error: '' as string | undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
      {pending ? 'Publishing…' : 'Post job'}
    </button>
  );
}

export function NewJobForm() {
  const [state, formAction] = useFormState(async (_prevState: typeof initialState, formData: FormData) => {
    const result = await createJobListing(formData);
    return result.success ? { success: true, error: undefined } : { success: false, error: result.error };
  }, initialState);

  return (
    <form action={formAction} className="glass-card space-y-4 p-6">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-vivo-black/70">
          Job title
        </label>
        <input id="title" name="title" required minLength={2} maxLength={200} className="input-field" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="company" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Company
          </label>
          <input id="company" name="company" required maxLength={160} className="input-field" />
        </div>
        <div>
          <label htmlFor="location" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Location
          </label>
          <input id="location" name="location" required maxLength={160} className="input-field" />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-vivo-black/70">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          required
          minLength={10}
          maxLength={8000}
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor="employmentType" className="mb-1 block text-sm font-medium text-vivo-black/70">
          Employment type
        </label>
        <select id="employmentType" name="employmentType" className="input-field" defaultValue="FULL_TIME">
          <option value="FULL_TIME">Full-time</option>
          <option value="PART_TIME">Part-time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERNSHIP">Internship</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="salaryMin" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Salary min (USD)
          </label>
          <input id="salaryMin" name="salaryMin" type="number" min="0" className="input-field" />
        </div>
        <div>
          <label htmlFor="salaryMax" className="mb-1 block text-sm font-medium text-vivo-black/70">
            Salary max (USD)
          </label>
          <input id="salaryMax" name="salaryMax" type="number" min="0" className="input-field" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input id="remote" name="remote" type="checkbox" className="h-4 w-4 rounded border-vivo-black/20" />
        <label htmlFor="remote" className="text-sm font-medium text-vivo-black/70">
          This is a remote position
        </label>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Job posted.</p>}

      <SubmitButton />
    </form>
  );
}
