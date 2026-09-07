import { refineComponentUI } from './impeccableAgent.js';

const rawCardComponent = `
export function PricingCard({ title, price, features }) {
  return (
    <div className="border p-4 rounded shadow">
      <h2>{title}</h2>
      <p className="text-2xl">{price}</p>
      <ul>
        {features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
      <button className="bg-black text-white p-2 mt-4 rounded">Select Plan</button>
    </div>
  );
}
`;

async function main(): Promise<void> {
  console.log('Agent 2: Impeccable Design review started...\n');
  const impeccableCode = await refineComponentUI(rawCardComponent);
  console.log('Transformed component:\n');
  console.log(impeccableCode);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'UI refinement failed');
  process.exitCode = 1;
});