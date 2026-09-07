import { generateComponentTests } from './testeSkillAgent.js';

const sampleButtonComponent = `
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function OneClickCheckoutBar({ priceGTQ, onSuccess }: { priceGTQ: number; onSuccess: (id: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess("TX-123");
    }, 500);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={loading}
      aria-label="Pay with One Click"
      className="px-4 py-2 bg-orange-500 text-white font-bold rounded"
    >
      {loading ? "Processing..." : \`Pay Q \${priceGTQ}\`}
    </motion.button>
  );
}
`;

async function main(): Promise<void> {
  console.log('Agent 3: Teste Skill test generation started...\n');
  const testSuite = await generateComponentTests(sampleButtonComponent);
  console.log('Generated test package:\n');
  console.log(testSuite);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Test generation failed');
  process.exitCode = 1;
});