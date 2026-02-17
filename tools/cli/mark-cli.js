#!/usr/bin/env node

/**
 * MARK Method - Main CLI Entry Point
 *
 * Commands:
 *   install   - Install MARK into your project
 *   status    - Check MARK installation status
 *   uninstall - Remove MARK from your project
 */

import { Command } from 'commander';
import { install } from './commands/install.js';
import { status } from './commands/status.js';
import { uninstall } from './commands/uninstall.js';

const program = new Command();

program
  .name('mark')
  .description('MARK - Marketing Agentic Resource Kit')
  .version('1.0.0');

program
  .command('install')
  .description('Install MARK into your project')
  .option('--platform <platform>', 'Platform: claude, gemini, or both')
  .option('--company <name>', 'Company name')
  .option('--role <role>', 'User role')
  .option('--industry <industry>', 'Industry')
  .option('--artifacts <path>', 'Artifacts path')
  .option('--yes', 'Skip prompts, use defaults')
  .option('--debug', 'Show debug output')
  .action(install);

program
  .command('status')
  .description('Check MARK installation status')
  .action(status);

program
  .command('uninstall')
  .description('Remove MARK from your project')
  .option('--yes', 'Skip confirmation')
  .action(uninstall);

// Default to install if no command specified
if (process.argv.length === 2) {
  process.argv.push('install');
}

program.parse();
