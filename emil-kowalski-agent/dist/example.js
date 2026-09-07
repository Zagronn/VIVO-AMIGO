"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emilAgent_js_1 = require("./emilAgent.js");
const rawComponent = `
export function Button({ children, onClick }) {
  return (
    <button onClick={onClick} className="bg-blue-500 text-white p-2 rounded">
      {children}
    </button>
  );
}
`;
async function run() {
    console.log('Emil Kowalski Agent reviewing component...\n');
    const polishedCode = await (0, emilAgent_js_1.reviewAndRefactorUI)(rawComponent);
    console.log('Polished component code:\n');
    console.log(polishedCode);
}
run().catch((error) => {
    console.error(error instanceof Error ? error.message : 'UI review failed');
    process.exitCode = 1;
});
