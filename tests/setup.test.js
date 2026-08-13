const { execSync } = require('child_process');

describe('Setup Assistant CLI Diagnostics (npm run setup:check)', () => {
  it('setup-check.js script should execute cleanly and return exit code 0', () => {
    const output = execSync('node scripts/setup-check.js', { encoding: 'utf8' });
    expect(output).toContain('VERIVOICE SYSTEM SETUP CHECK');
    expect(output).toContain('Node.js Version:');
    expect(output).not.toContain('super_secret_pass_123'); // Ensure secrets are hidden
  });
});
