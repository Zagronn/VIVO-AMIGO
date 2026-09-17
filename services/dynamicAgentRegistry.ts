export type StrategicFleet = 'VERIFY' | 'CHECK' | 'VIRAL' | 'CYBER' | 'ANALYTICS';

export interface AgentTaskInput {
  taskName: string;
  [key: string]: unknown;
}

export interface AgentExecutionResult {
  agentId: number;
  fleet: StrategicFleet;
  role: string;
  taskName: string;
  executionMode: 'NVIDIA_NIM_READY' | 'INJECTED_EXECUTOR';
  status: 'SUCCESS';
  timestamp: string;
}

export interface RegisteredAgent {
  id: number;
  name: string;
  fleet: StrategicFleet;
  role: string;
  responsibility: string;
  nvidiaNimModel: string;
  executeTask: (input: AgentTaskInput) => Promise<AgentExecutionResult>;
}

export interface AgentExecutor {
  (agent: RegisteredAgent, input: AgentTaskInput): Promise<AgentExecutionResult>;
}

const MODEL = 'meta/llama-3.3-70b-instruct';
const FLEETS: StrategicFleet[] = ['VERIFY', 'CHECK', 'VIRAL', 'CYBER', 'ANALYTICS'];
const ROLE_CATALOG: Record<StrategicFleet, string[]> = {
  VERIFY: ['SAT registry lookup', 'PNC stolen-vehicle check', 'VIN OCR extraction', 'license-plate OCR extraction', 'DPI owner matching', 'registration document review', 'lien status screening', 'vehicle identity normalization', 'inspection seal eligibility', 'RENAP identity handoff'],
  CHECK: ['GPS geofence validation', 'OTP challenge dispatch', 'escrow hold verification', 'delivery evidence review', 'seller KYC checkpoint', 'buyer approval checkpoint', 'shipment state audit', 'contract signature check', 'dispute evidence intake', 'payout release gate'],
  VIRAL: ['WhatsApp share verification', 'Facebook post verification', 'Instagram story verification', 'TikTok campaign verification', 'hashtag evidence scan', 'promo video fingerprinting', 'public visibility check', 'campaign claim deduplication', 'doping credit ledgering', 'partner attribution audit'],
  CYBER: ['zero-trust policy audit', 'SQL injection detection', 'DDoS burst detection', 'vault isolation monitor', 'secret exposure scan', 'dependency risk review', 'API abuse detection', 'emergency lock coordinator', 'sandbox hotfix planner', 'penetration test runner'],
  ANALYTICS: ['GMV projection analysis', 'commission basis audit', 'listing conversion analysis', 'inventory velocity analysis', 'partner ROI reporting', 'fleet utilization analysis', 'trust funnel analysis', 'regional demand analysis', 'settlement reconciliation', 'executive metrics reporting']
};
const RESPONSIBILITIES: Record<StrategicFleet, string> = {
  VERIFY: 'validate official identity, vehicle documents, and registry evidence before trust status changes',
  CHECK: 'coordinate escrow, geofence, OTP, delivery, and approval gates without releasing funds early',
  VIRAL: 'verify consented campaign evidence and issue idempotent promotional rewards',
  CYBER: 'detect threats, isolate affected paths, and prepare reviewed security remediation',
  ANALYTICS: 'produce auditable operational and financial intelligence from approved aggregate data'
};

function fleetFor(id: number): StrategicFleet {
  return FLEETS[Math.floor((id - 1) / 50)];
}

function roleFor(id: number, fleet: StrategicFleet): string {
  const position = (id - 1) % 50;
  const catalogRole = ROLE_CATALOG[fleet][position % ROLE_CATALOG[fleet].length];
  return `${catalogRole} Specialist #${id.toString().padStart(3, '0')}`;
}

function executeForFleet(agent: RegisteredAgent, input: AgentTaskInput): AgentExecutionResult {
  if (agent.fleet === 'VERIFY' && !input.taskName.toUpperCase().includes('VERIFY')) throw new Error('VERIFY fleet requires a verification task');
  if (agent.fleet === 'CHECK' && !input.taskName.toUpperCase().includes('CHECK') && !input.taskName.toUpperCase().includes('ESCROW')) throw new Error('CHECK fleet requires a trust-gate task');
  return { agentId: agent.id, fleet: agent.fleet, role: agent.role, taskName: input.taskName, executionMode: 'NVIDIA_NIM_READY', status: 'SUCCESS', timestamp: new Date().toISOString() };
}

export class DynamicAgentRegistry {
  private readonly agents = new Map<number, RegisteredAgent>();

  constructor(private readonly executor?: AgentExecutor) {
    for (let id = 1; id <= 250; id++) {
      const fleet = fleetFor(id);
      const agent: RegisteredAgent = {
        id,
        name: `Nvidia-Agent-#${id.toString().padStart(3, '0')}`,
        fleet,
        role: roleFor(id, fleet),
        responsibility: RESPONSIBILITIES[fleet],
        nvidiaNimModel: MODEL,
        executeTask: async (input) => executeForFleet(agent, input)
      };
      this.agents.set(id, agent);
    }
  }

  public list(): RegisteredAgent[] {
    return [...this.agents.values()];
  }

  public get(id: number): RegisteredAgent | undefined {
    return this.agents.get(id);
  }

  public async dispatch(id: number, input: AgentTaskInput): Promise<AgentExecutionResult> {
    const agent = this.agents.get(id);
    if (!agent) throw new Error(`Agent #${id} not found in registry.`);
    if (!input?.taskName?.trim()) throw new Error('taskName is required');
    if (this.executor) {
      const result = await this.executor(agent, input);
      return { ...result, executionMode: 'INJECTED_EXECUTOR' };
    }
    return agent.executeTask(input);
  }
}

export const AGENT_COUNT = 250;