"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runJarvisPipelineWithOpus = runJarvisPipelineWithOpus;
const opusAdapter_js_1 = require("./adapters/opusAdapter.js");
const testeSkillAgent_js_1 = require("./testeSkillAgent.js");
async function runJarvisPipelineWithOpus(rawComponentCode) {
    if (typeof rawComponentCode !== 'string' || rawComponentCode.trim() === '')
        throw new Error('rawComponentCode is required');
    const polishedCode = await (0, opusAdapter_js_1.callOpusDesignEngine)(rawComponentCode);
    const testSuite = await (0, testeSkillAgent_js_1.generateComponentTests)(polishedCode);
    return { finalCode: polishedCode, testSuite };
}
