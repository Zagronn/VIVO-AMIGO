const { execFileSync } = require('node:child_process');
const { platform } = require('node:process');

module.exports = async function afterPack(context) {
  if (platform !== 'darwin') return;
  execFileSync('/usr/bin/xattr', ['-cr', context.appOutDir], { stdio: 'inherit' });
  console.log(`Cleared macOS extended attributes from ${context.appOutDir}`);
};
