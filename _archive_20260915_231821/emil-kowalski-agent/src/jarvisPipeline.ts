import { callOpusDesignEngine } from './adapters/opusAdapter.js';
import { generateComponentTests } from './testeSkillAgent.js';

export interface JarvisPipelineResult {
  finalCode: string;
  testSuite: string;
}

export async function runJarvisPipelineWithOpus(rawComponentCode: string): Promise<JarvisPipelineResult> {
  if (typeof rawComponentCode !== 'string' || rawComponentCode.trim() === '') throw new Error('rawComponentCode is required');
  const polishedCode = await callOpusDesignEngine(rawComponentCode);
  const testSuite = await generateComponentTests(polishedCode);
  return { finalCode: polishedCode, testSuite };
}
