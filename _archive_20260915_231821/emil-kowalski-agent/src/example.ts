import { reviewAndRefactorUI } from './emilAgent.js';

const rawComponent = `
export function Button({ children, onClick }) {
  return (
    <button onClick={onClick} className="bg-blue-500 text-white p-2 rounded">
      {children}
    </button>
  );
}
`;

async function run(): Promise<void> {
  console.log('Emil Kowalski Agent reviewing component...\n');
  const polishedCode = await reviewAndRefactorUI(rawComponent);
  console.log('Polished component code:\n');
  console.log(polishedCode);
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'UI review failed');
  process.exitCode = 1;
});