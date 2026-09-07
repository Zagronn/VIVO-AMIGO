"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const AgentDashboard_1 = require("./components/AgentDashboard");
function App() {
    return ((0, jsx_runtime_1.jsx)("main", { children: (0, jsx_runtime_1.jsx)(AgentDashboard_1.AgentDashboard, {}) }));
}
