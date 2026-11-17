import { execSync } from 'child_process';

const message = process.argv.slice(2).join(' ').trim() || `Update website - ${new Date().toLocaleString()}`;

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    // If commit fails because there are no changes, continue
    if (cmd.includes('commit') && err.status === 1) {
      console.log('No new changes to commit.');
      return;
    }
    throw err;
  }
}

try {
  console.log(`\n========================================`);
  console.log(`🚀 Syncing changes to GitHub & Vercel...`);
  console.log(`Commit Message: "${message}"`);
  console.log(`========================================\n`);

  run('git add .');
  run(`git commit -m "${message.replace(/"/g, '\\"')}"`);
  run('git push origin main');

  console.log(`\n========================================`);
  console.log(`✓ Changes successfully pushed to GitHub!`);
  console.log(`⚡ Vercel has automatically started building & deploying your latest update.`);
  console.log(`========================================\n`);
} catch (error) {
  console.error('\n❌ Failed to push changes:', error.message);
  process.exit(1);
}
