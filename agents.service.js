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
  }

  initializeSwarm() {
    const master = this.config.orchestration?.master_agent;
    const groups = this.config.orchestration?.sub_agents;
    if (!master?.id || !Array.isArray(groups)) throw new Error('invalid swarm configuration');

    this.agents.set(master.id, { ...master, status: 'ACTIVE_LEADER' });
    let totalSpawned = 0;
    groups.forEach((group) => {
      for (let index = 1; index <= group.count; index++) {
        const agentId = `${group.group.toLowerCase()}_${index.toString().padStart(2, '0')}`;
        this.agents.set(agentId, { id: agentId, group: group.group, roles: group.roles, model: group.model, status: 'IDLE' });
        totalSpawned++;
      }
    });
    return { totalAgents: totalSpawned + 1, subAgents: totalSpawned, masterAgent: master.id };
  }

  async dispatchTask(taskType, payload) {
    const master = this.agents.get(this.config.orchestration.master_agent.id);
    if (!master) throw new Error('swarm is not initialized');
    const group = this.config.orchestration.sub_agents.find((candidate) => taskType.toUpperCase().startsWith(candidate.group.split('_')[0]));
    const assignedAgent = group ? [...this.agents.values()].find((agent) => agent.group === group.group) : null;
    return { taskId: `task_${Date.now()}`, assignedBy: master.id, assignedTo: assignedAgent?.id || null, status: 'DISPATCHED', payload };
  }
}

module.exports = { SwarmOrchestrator };