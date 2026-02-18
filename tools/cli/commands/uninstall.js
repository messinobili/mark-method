/**
 * MARK Method - Uninstall Command
 *
 * Removes MARK skills and configuration from the current project.
 * Does NOT remove marketing artifacts (user content).
 */

import { confirm, intro, outro, spinner, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    console.log('  • MARK section from CLAUDE.md (other content preserved)');
  }
  if (config.platform === 'gemini' || config.platform === 'both') {
    const manifest = config.installed_files || [];
    const geminiManifest = manifest.filter(p => p.startsWith('.gemini/'));
    if (geminiManifest.length > 0) {
      for (const filePath of geminiManifest) {
        console.log(`  • ${filePath}`);
      }
    } else {
      console.log('  • MARK skills from .gemini/skills/');
      console.log('  • MARK commands from .gemini/commands/');
    }
    console.log('  • MARK section from GEMINI.md (other content preserved)');
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
      const manifest = config.installed_files || [];
      const geminiManifest = manifest.filter(p => p.startsWith('.gemini/'));

      if (geminiManifest.length > 0) {
        // Manifest-based removal — only remove files we installed
        for (const filePath of geminiManifest) {
          await fs.remove(filePath);
        }
      } else {
        // Legacy fallback for pre-manifest installs
        const geminiAgents = ['pmm', 'content', 'demand', 'customer', 'events', 'cmo', 'critic', 'coordinator'];
        for (const agent of geminiAgents) {
          await fs.remove(`.gemini/skills/${agent}`);
          await fs.remove(`.gemini/skills/${agent}-mark-method`);
        }

        // Remove only MARK command files (NOT the whole directory)
        const packageRoot = path.resolve(__dirname, '../../../');
        const commandsSource = path.join(packageRoot, 'src/commands');
        if (await fs.pathExists(commandsSource) && await fs.pathExists('.gemini/commands')) {
          const sourceCommands = await fs.readdir(commandsSource);
          for (const cmd of sourceCommands) {
            const ext = path.extname(cmd);
            const baseName = path.basename(cmd, ext);
            await fs.remove(`.gemini/commands/${cmd}`);
            await fs.remove(`.gemini/commands/${baseName}-mark-method${ext}`);
          }
        }
      }

      // Clean up empty .gemini subdirectories and .gemini itself
      for (const subdir of ['.gemini/skills', '.gemini/commands']) {
        if (await fs.pathExists(subdir)) {
          const remaining = await fs.readdir(subdir);
          if (remaining.filter(f => !f.startsWith('.')).length === 0) {
            await fs.remove(subdir);
          }
        }
      }
      const geminiDir = '.gemini';
      if (await fs.pathExists(geminiDir)) {
        const remaining = await fs.readdir(geminiDir);
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

    // Remove MARK sections from context files (or delete if MARK is the only content)
    s.start('Removing context files...');
    if (config.platform === 'claude' || config.platform === 'both') {
      await removeMarkSection('CLAUDE.md');
    }
    if (config.platform === 'gemini' || config.platform === 'both') {
      await removeMarkSection('GEMINI.md');
    }
    s.stop(chalk.green('✓') + ' Context files cleaned up');

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

/**
 * Remove the MARK section from a context file.
 * If the file contains only the MARK section, delete it entirely.
 * If the file contains other content, strip only the MARK section.
 */
async function removeMarkSection(filePath) {
  if (!await fs.pathExists(filePath)) return;

  const content = await fs.readFile(filePath, 'utf-8');
  const beginMarker = '<!-- BEGIN MARK METHOD -->';
  const endMarker = '<!-- END MARK METHOD -->';

  const beginIndex = content.indexOf(beginMarker);
  const endIndex = content.indexOf(endMarker);

  if (beginIndex === -1) {
    // No MARK markers found — check for legacy installs (pre-marker)
    if (content.includes('MARK (Marketing Agentic Resource Kit)')) {
      // Legacy install without markers — remove the whole file only if it looks
      // like it's entirely MARK content (starts with the MARK header)
      if (content.trimStart().startsWith('# MARK Marketing Context')) {
        await fs.remove(filePath);
      }
      // Otherwise leave it alone — we can't safely determine boundaries
    }
    return;
  }

  // Strip from beginMarker through endMarker (inclusive)
  const before = content.substring(0, beginIndex);
  const after = endIndex !== -1
    ? content.substring(endIndex + endMarker.length)
    : '';

  const remaining = (before + after).replace(/\n{3,}/g, '\n\n').trim();

  if (remaining.length === 0) {
    await fs.remove(filePath);
  } else {
    await fs.writeFile(filePath, remaining + '\n');
  }
}
