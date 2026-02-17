/**
 * MARK Method - Uninstall Command
 *
 * Removes MARK skills and configuration from the current project.
 * Does NOT remove marketing artifacts (user content).
 */

import { confirm, intro, outro, spinner, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import yaml from 'yaml';

export async function uninstall(options) {
  intro(chalk.cyan.bold('MARK Uninstall'));

  const configPath = '.mark-config.yaml';

  if (!await fs.pathExists(configPath)) {
    outro(chalk.yellow('MARK is not installed in this directory.'));
    return;
  }

  const config = yaml.parse(await fs.readFile(configPath, 'utf-8'));

  // Show what will be removed
  console.log('\n' + chalk.cyan('The following will be removed:'));
  if (config.platform === 'claude' || config.platform === 'both') {
    console.log('  • .claude/skills/mark/ (skills directory)');
    console.log('  • CLAUDE.md (context file)');
  }
  if (config.platform === 'gemini' || config.platform === 'both') {
    console.log('  • .gemini/skills/ (skills directory)');
    console.log('  • .gemini/commands/ (command files)');
    console.log('  • GEMINI.md (context file)');
  }
  console.log('  • .mark-config.yaml (configuration)');
  console.log('');
  console.log(chalk.dim(`Note: ${config.artifacts_path}/ directory will NOT be removed (contains your work).`));
  console.log('');

  // Confirm
  if (!options.yes) {
    const confirmed = await confirm({
      message: 'Proceed with uninstall?'
    });
    if (isCancel(confirmed) || !confirmed) {
      outro('Uninstall cancelled.');
      return;
    }
  }

  const s = spinner();

  try {
    // Remove skills
    s.start('Removing skills...');
    if (config.platform === 'claude' || config.platform === 'both') {
      await fs.remove('.claude/skills/mark');
      // Clean up empty parent directories
      const claudeSkillsDir = '.claude/skills';
      if (await fs.pathExists(claudeSkillsDir)) {
        const remaining = await fs.readdir(claudeSkillsDir);
        if (remaining.filter(f => !f.startsWith('.')).length === 0) {
          await fs.remove(claudeSkillsDir);
        }
      }
      const claudeDir = '.claude';
      if (await fs.pathExists(claudeDir)) {
        const remaining = await fs.readdir(claudeDir);
        if (remaining.filter(f => !f.startsWith('.')).length === 0) {
          await fs.remove(claudeDir);
        }
      }
    }
    if (config.platform === 'gemini' || config.platform === 'both') {
      // Remove MARK agent skills from .gemini/skills/
      const geminiAgents = ['pmm', 'content', 'demand', 'customer', 'events', 'cmo', 'critic', 'coordinator'];
      for (const agent of geminiAgents) {
        await fs.remove(`.gemini/skills/${agent}`);
      }

      // Remove MARK commands from .gemini/commands/
      await fs.remove('.gemini/commands');

      // Clean up empty .gemini directory
      const geminiDir = '.gemini';
      if (await fs.pathExists(geminiDir)) {
        const remaining = await fs.readdir(geminiDir);
        // Check if only empty directories remain
        let isEmpty = true;
        for (const item of remaining) {
          if (item.startsWith('.')) continue;
          const itemPath = `${geminiDir}/${item}`;
          const stat = await fs.stat(itemPath);
          if (stat.isFile() || (stat.isDirectory() && (await fs.readdir(itemPath)).length > 0)) {
            isEmpty = false;
            break;
          }
        }
        if (isEmpty) {
          await fs.remove(geminiDir);
        }
      }
    }
    s.stop(chalk.green('✓') + ' Skills and commands removed');

    // Remove context files
    s.start('Removing context files...');
    if (config.platform === 'claude' || config.platform === 'both') {
      await fs.remove('CLAUDE.md');
    }
    if (config.platform === 'gemini' || config.platform === 'both') {
      await fs.remove('GEMINI.md');
    }
    s.stop(chalk.green('✓') + ' Context files removed');

    // Remove config
    s.start('Removing configuration...');
    await fs.remove('.mark-config.yaml');
    s.stop(chalk.green('✓') + ' Configuration removed');

  } catch (error) {
    s.stop(chalk.red('✗') + ' Uninstall failed');
    console.error(chalk.red('\nError:'), error.message);
    process.exit(1);
  }

  outro(chalk.green.bold('MARK uninstalled successfully.'));

  console.log(chalk.dim(`\nYour marketing artifacts in ${config.artifacts_path}/ were preserved.`));
  console.log(chalk.dim('To reinstall: npx mark-method install\n'));
}
