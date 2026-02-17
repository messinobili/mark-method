/**
 * MARK Method - Status Command
 *
 * Shows the current MARK installation status and configuration.
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import yaml from 'yaml';

export async function status() {
  const configPath = '.mark-config.yaml';

  if (!await fs.pathExists(configPath)) {
    console.log(chalk.yellow('\nMARK is not installed in this directory.'));
    console.log(chalk.dim('Run: npx mark-method install\n'));
    return;
  }

  const config = yaml.parse(await fs.readFile(configPath, 'utf-8'));

  console.log(chalk.cyan.bold('\nMARK Installation Status\n'));

  // Configuration
  console.log(chalk.cyan('Configuration:'));
  console.log(`  Version:   ${config.version}`);
  console.log(`  Platform:  ${formatPlatform(config.platform)}`);
  console.log(`  Company:   ${config.company}`);
  console.log(`  Role:      ${formatRole(config.role)}`);
  console.log(`  Industry:  ${formatIndustry(config.industry)}`);
  console.log(`  Artifacts: ./${config.artifacts_path}/`);
  console.log(`  Installed: ${formatDate(config.installed_at)}`);
  console.log('');

  // Skill directories
  console.log(chalk.cyan('Skills Status:'));

  if (config.platform === 'claude' || config.platform === 'both') {
    const claudeSkillsExist = await fs.pathExists('.claude/skills/mark');
    const claudeSkillCount = claudeSkillsExist
      ? (await fs.readdir('.claude/skills/mark')).filter(f => !f.startsWith('.')).length
      : 0;
    console.log(`  Claude Code: ${claudeSkillsExist
      ? chalk.green(`✓ Installed (${claudeSkillCount} agents)`)
      : chalk.red('✗ Missing')}`);
  }

  if (config.platform === 'gemini' || config.platform === 'both') {
    // Gemini skills are directly in .gemini/skills/ (not under mark/)
    const geminiSkillsExist = await fs.pathExists('.gemini/skills');
    const geminiSkillCount = geminiSkillsExist
      ? (await fs.readdir('.gemini/skills')).filter(f => !f.startsWith('.')).length
      : 0;
    console.log(`  Gemini CLI:  ${geminiSkillsExist
      ? chalk.green(`✓ Installed (${geminiSkillCount} agents)`)
      : chalk.red('✗ Missing')}`);

    // Also check commands
    const geminiCommandsExist = await fs.pathExists('.gemini/commands');
    const geminiCommandCount = geminiCommandsExist
      ? (await fs.readdir('.gemini/commands')).filter(f => f.endsWith('.toml')).length
      : 0;
    console.log(`  Commands:    ${geminiCommandsExist
      ? chalk.green(`✓ Installed (${geminiCommandCount} commands)`)
      : chalk.red('✗ Missing')}`);
  }
  console.log('');

  // Context files
  console.log(chalk.cyan('Context Files:'));
  if (config.platform === 'claude' || config.platform === 'both') {
    const claudeMdExists = await fs.pathExists('CLAUDE.md');
    console.log(`  CLAUDE.md:   ${claudeMdExists
      ? chalk.green('✓ Present')
      : chalk.red('✗ Missing')}`);
  }
  if (config.platform === 'gemini' || config.platform === 'both') {
    const geminiMdExists = await fs.pathExists('GEMINI.md');
    console.log(`  GEMINI.md:   ${geminiMdExists
      ? chalk.green('✓ Present')
      : chalk.red('✗ Missing')}`);
  }
  console.log('');

  // Artifacts directories
  console.log(chalk.cyan('Artifact Directories:'));
  const artifactDirs = ['intelligence', 'strategy', 'assets', 'campaigns'];
  for (const dir of artifactDirs) {
    const dirPath = `${config.artifacts_path}/${dir}`;
    const exists = await fs.pathExists(dirPath);
    const fileCount = exists
      ? (await fs.readdir(dirPath)).filter(f => !f.startsWith('.')).length
      : 0;
    console.log(`  ${dir.padEnd(12)} ${exists
      ? chalk.green(`✓ ${fileCount} files`)
      : chalk.red('✗ Missing')}`);
  }
  console.log('');

  // Available workflows
  console.log(chalk.cyan('Quick Reference - Workflows:'));
  console.log(chalk.dim('  PMM:        /messaging, /positioning, /battlecard, /one-pager'));
  console.log(chalk.dim('  Content:    /blog, /whitepaper, /content-strategy'));
  console.log(chalk.dim('  Demand:     /campaign-strategy, /email-sequence'));
  console.log(chalk.dim('  Customer:   /case-study, /customer-research'));
  console.log(chalk.dim('  Events:     /webinar, /event-launch'));
  console.log(chalk.dim('  CMO:        /portfolio-review, /planning'));
  console.log(chalk.dim('  Critic:     /asset-review, /fact-check'));
  console.log(chalk.dim('  Coordinator: /stakeholder-update, /cross-functional'));
  console.log('');
}

function formatPlatform(platform) {
  const map = {
    'claude': 'Claude Code',
    'gemini': 'Gemini CLI',
    'both': 'Both (Claude Code + Gemini CLI)'
  };
  return map[platform] || platform;
}

function formatRole(role) {
  const map = {
    'cmo': 'CMO',
    'pmm': 'PMM',
    'content': 'Content Marketing',
    'demand': 'Demand Gen',
    'customer': 'Customer Marketing',
    'events': 'Events',
    'other': 'Other'
  };
  return map[role] || role;
}

function formatIndustry(industry) {
  const map = {
    'b2b-saas': 'B2B SaaS',
    'enterprise': 'Enterprise Software',
    'consumer': 'Consumer Tech',
    'fintech': 'Fintech',
    'healthtech': 'Healthcare Tech',
    'other': 'Other'
  };
  return map[industry] || industry;
}

function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}
