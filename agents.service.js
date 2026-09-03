const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

class SwarmOrchestrator {
  constructor(configPath = './agents.config.yml') {
    const requestedPath = path.resolve(configPath);
    const fallbackPath = path.resolve('./swarm.config.yml');
    const activePath = fs.existsSync(requestedPath) ? requestedPath : fallbackPath;
    this.configPath = activePath;
    this.config = yaml.load(fs.readFileSync(activePath, 'utf8'));
    this.agents = new Map();
    this.consensusLog = [];
    this.executionLog = [];
    this.roundRobinOffsets = new Map();
    this.taskSequence = 0;
  }

  initializeSwarm() {
    const master = this.config.orchestration?.master_agent;
    const groups = this.config.orchestration?.sub_agents;
    if (!master?.id || !Array.isArray(groups)) throw new Error('invalid swarm configuration');

    this.agents.clear();
    this.consensusLog = [];
    this.executionLog = [];
    this.roundRobinOffsets.clear();
    this.agents.set(master.id, { ...master, status: 'ACTIVE_LEADER', executionMode: 'AUTONOMOUS' });
    let totalSpawned = 0;
    groups.forEach((group) => {
      for (let index = 1; index <= group.count; index++) {
        const agentId = `${group.group.toLowerCase()}_${index.toString().padStart(2, '0')}`;
        this.agents.set(agentId, { id: agentId, group: group.group, roles: group.roles, model: group.model, status: 'IDLE', executionMode: 'AUTONOMOUS' });
        totalSpawned++;
      }
    });
    const privilegedId = this.config.orchestration.autonomy?.privileged_sub_agent;
    const firstComplianceAgent = [...this.agents.values()].find((agent) => agent.group === 'VERI_SHIELD_COMPLIANCE');
    if (privilegedId && firstComplianceAgent) {
      this.agents.set(privilegedId, { ...firstComplianceAgent, id: privilegedId, role: 'devops_executor', status: 'IDLE', aliasOf: firstComplianceAgent.id });
    }
    return { totalAgents: totalSpawned + 1, subAgents: totalSpawned, masterAgent: master.id };
  }

  getAutonomousExecutionReport() {
    return {
      enabled: this.config.orchestration.autonomy?.enabled === true,
      mode: this.config.orchestration.autonomy?.mode || 'manual',
      masterAgent: this.config.orchestration.autonomy?.master_agent || null,
      privilegedSubAgent: this.config.orchestration.autonomy?.privileged_sub_agent || null,
      allowedActions: this.config.orchestration.autonomy?.allowed_actions || [],
      externalOperations: this.config.orchestration.autonomy?.external_operations || 'not_configured',
      executionLog: [...this.executionLog]
    };
  }

  recordExecution(action, status, details = {}) {
    const report = { action, status, details, recordedAt: Date.now() };
    this.executionLog.push(report);
    return report;
  }

  async dispatchTask(taskType, payload) {
    const master = this.agents.get(this.config.orchestration.master_agent.id);
    if (!master) throw new Error('swarm is not initialized');
    const normalizedTaskType = String(taskType).toUpperCase();
    const groupMatchers = {
      VERI_SHIELD_COMPLIANCE: ['VERI', 'RENAP', 'IDENTITY', 'KYC', 'FRAUD', 'SAT'],
      PAY_VIVO_FINANCE: ['PAY', 'ESCROW', 'LEDGER', 'SETTLEMENT'],
      CARGO_VIVO_LOGISTICS: ['CARGO', 'ROUTE', 'SHIPMENT', 'DELIVERY'],
      VIVO_POS_OPERATIONS: ['POS', 'QR', 'OFFLINE', 'INVOICE']
    };
    const group = this.config.orchestration.sub_agents.find((candidate) => groupMatchers[candidate.group]?.some((keyword) => normalizedTaskType.includes(keyword)));
    const candidates = group ? [...this.agents.values()].filter((agent) => agent.group === group.group && !agent.aliasOf) : [];
    const offset = group ? this.roundRobinOffsets.get(group.group) || 0 : 0;
    const assignedAgent = candidates.length ? candidates[offset % candidates.length] : null;
    if (group) this.roundRobinOffsets.set(group.group, offset + 1);
    const task = { taskId: `task_${++this.taskSequence}`, assignedBy: master.id, assignedTo: assignedAgent?.id || null, status: 'DISPATCHED', payload };
    this.consensusLog.push({ taskId: task.taskId, assignedBy: task.assignedBy, assignedTo: task.assignedTo, status: task.status, recordedAt: Date.now() });
    return task;
  }
}

module.exports = { SwarmOrchestrator };