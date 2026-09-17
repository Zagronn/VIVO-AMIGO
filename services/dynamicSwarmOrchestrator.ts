export type AgentFleet = 'VERIFY' | 'CHECK' | 'VIRAL' | 'CYBER' | 'ANALYTICS';

export interface AgentTaskPayload {
  taskName: string;
  [key: string]: unknown;
}

export interface AgentTaskResult {
  agentId: number;
  status: 'SUCCESS';
  timestamp: string;
  taskName: string;
}

export interface SpecificAgent {
  id: number;
  name: string;
  fleet: AgentFleet;
  role: string;
  nvidiaNimModel: string;
  executeTask: (input: AgentTaskPayload) => Promise<AgentTaskResult>;
}

export interface DynamicSwarmOptions {
  executeTask?: (agent: SpecificAgent, input: AgentTaskPayload) => Promise<AgentTaskResult>;
}

const NVIDIA_NIM_MODEL = 'meta/llama-3.3-70b-instruct';

const SPECIALIST_ROLES: Record<number, string> = {
  1: 'SAT/PNC License Plate OCR Specialist',
  2: 'Tax Liability & Encumbrance Inspector',
  51: 'GPS Geofencing Proximity Verifier',
  52: '4-Digit Escrow OTP Dispatcher',
  101: 'TikTok/Social Viral Verifier (0% Fee)',
  151: 'Zero-Trust Penetration Tester',
  201: 'Navlungo Logistics Dispatcher'
};

function fleetForAgent(id: number): AgentFleet {
  if (id <= 50) return 'VERIFY';
  if (id <= 100) return 'CHECK';
  if (id <= 150) return 'VIRAL';
  if (id <= 200) return 'CYBER';
  return 'ANALYTICS';
}

function roleForAgent(id: number): string {
  return SPECIALIST_ROLES[id] || `Autonomous Specialist Agent Task #${id}`;
}

export class DynamicSwarmOrchestrator {
  private readonly agentRegistry = new Map<number, SpecificAgent>();
  private readonly executor?: DynamicSwarmOptions['executeTask'];

  constructor(options: DynamicSwarmOptions = {}) {
    this.executor = options.executeTask;
    this.initializeAll250Agents();
  }

  private initializeAll250Agents(): void {
    for (let id = 1; id <= 250; id++) {
      const agent: SpecificAgent = {
        id,
        name: `Nvidia-Agent-#${id.toString().padStart(3, '0')}`,
        fleet: fleetForAgent(id),
        role: roleForAgent(id),
        nvidiaNimModel: NVIDIA_NIM_MODEL,
        executeTask: async (payload) => ({ agentId: id, status: 'SUCCESS', timestamp: new Date().toISOString(), taskName: payload.taskName })
      };
      this.agentRegistry.set(id, agent);
    }
  }

  public getAgent(agentId: number): SpecificAgent | undefined {
    return this.agentRegistry.get(agentId);
  }

  public getAgents(): SpecificAgent[] {
    return [...this.agentRegistry.values()];
  }

  public async dispatchDynamicTask(agentId: number, taskData: AgentTaskPayload): Promise<AgentTaskResult> {
    if (!Number.isInteger(agentId) || agentId < 1 || agentId > 250) throw new Error(`Agent #${agentId} not found in cluster.`);
    if (!taskData || typeof taskData.taskName !== 'string' || taskData.taskName.trim() === '') throw new Error('taskName is required');
    const agent = this.agentRegistry.get(agentId);
    if (!agent) throw new Error(`Agent #${agentId} not found in cluster.`);
    if (this.executor) return this.executor(agent, taskData);
    return agent.executeTask(taskData);
  }
}
