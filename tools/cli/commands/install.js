/**
 * MARK Method - Install Command
 *
 * Installs MARK skills and configuration into the current project.
 * Supports Claude Code, Gemini CLI, or both platforms.
 */

import { select, text, confirm, intro, outro, spinner, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function dirname(p) {
  return path.dirname(p);
}

export async function install(options) {
  intro(chalk.cyan.bold('MARK - Marketing Agentic Resource Kit'));

  console.log(chalk.dim('AI-driven marketing methodology for B2B SaaS teams\n'));

  // Check if already installed
  if (await fs.pathExists('.mark-config.yaml')) {
    const existing = yaml.parse(await fs.readFile('.mark-config.yaml', 'utf-8'));
    console.log(chalk.yellow(`MARK is already installed (${existing.platform} platform).`));
    const shouldReinstall = await confirm({
      message: 'Do you want to reinstall?'
    });
    if (isCancel(shouldReinstall) || !shouldReinstall) {
      outro('Installation cancelled.');
      return;
    }
  }

  // Collect configuration
  const config = await collectConfig(options);

  if (!config) {
    outro('Installation cancelled.');
    return;
  }

  // Show summary
  console.log('\n' + chalk.cyan('Installation Summary:'));
  console.log(`  ${chalk.dim('Platform:')} ${formatPlatform(config.platform)}`);
  console.log(`  ${chalk.dim('Company:')} ${config.company}`);
  console.log(`  ${chalk.dim('Role:')} ${formatRole(config.role)}`);
  console.log(`  ${chalk.dim('Industry:')} ${formatIndustry(config.industry)}`);
  console.log(`  ${chalk.dim('Artifacts:')} ./${config.artifacts_path}/\n`);

  // Confirm installation
  if (!options.yes) {
    const confirmed = await confirm({
      message: 'Proceed with installation?'
    });
    if (isCancel(confirmed) || !confirmed) {
      outro('Installation cancelled.');
      return;
    }
  }

  // Run installation
  const s = spinner();

  try {
    s.start('Creating directories...');
    await createDirectories(config);
    s.stop(chalk.green('✓') + ' Directories created');

    s.start('Installing skills and commands...');
    const installResult = await copySkillsSafe(config);
    config.installed_files = installResult.manifest;
    s.stop(chalk.green('✓') + ' Skills and commands installed');
    if (installResult.suffixed.length > 0) {
      console.log(chalk.yellow(`  ${installResult.suffixed.length} existing file(s) preserved — package versions installed with suffix:`));
      for (const item of installResult.suffixed) {
        console.log(chalk.dim(`    ${item.original} → ${item.suffixed}`));
      }
    }

    s.start('Generating context files...');
    await generateContextFiles(config);
    s.stop(chalk.green('✓') + ' Context files generated');

    s.start('Saving configuration...');
    await saveConfig(config);
    s.stop(chalk.green('✓') + ' Configuration saved');

  } catch (error) {
    s.stop(chalk.red('✗') + ' Installation failed');
    console.error(chalk.red('\nError:'), error.message);
    if (options.debug) {
      console.error(error.stack);
    }
    process.exit(1);
  }

  outro(chalk.green.bold('MARK installed successfully!'));

  // Show next steps
  console.log('\n' + chalk.cyan('Next Steps:'));
  if (config.platform === 'claude' || config.platform === 'both') {
    console.log('  1. Open your project in Claude Code');
  }
  if (config.platform === 'gemini' || config.platform === 'both') {
    console.log('  1. Open your project in Gemini CLI');
  }
  console.log('  2. Try a workflow: /messaging or /battlecard');
  console.log('  3. Check status: npx mark-method status');
  console.log('');

  // Show available agents
  console.log(chalk.cyan('Available Agents:'));
  console.log('  Parker (PMM)      - /messaging, /positioning, /battlecard, /one-pager');
  console.log('  Casey (Content)   - /blog, /whitepaper, /content-strategy');
  console.log('  Dana (Demand)     - /campaign-strategy, /email-sequence');
  console.log('  Cameron (Customer) - /case-study, /customer-research');
  console.log('  Ellis (Events)    - /webinar, /event-launch');
  console.log('  Morgan (CMO)      - /portfolio-review, /planning');
  console.log('  Quinn (Critic)    - /asset-review, /fact-check');
  console.log('  Riley (Coordinator) - /stakeholder-update, /cross-functional');
  console.log('');
}

async function collectConfig(options) {
  const config = {
    version: '1.0.0',
    installed_at: new Date().toISOString()
  };

  // Platform selection
  if (options.platform) {
    config.platform = options.platform;
  } else {
    const platform = await select({
      message: 'Which AI assistant are you using?',
      options: [
        { value: 'claude', label: 'Claude Code', hint: 'Anthropic\'s CLI assistant' },
        { value: 'gemini', label: 'Gemini CLI', hint: 'Google\'s CLI assistant' },
        { value: 'both', label: 'Both', hint: 'Install for both platforms' }
      ]
    });
    if (isCancel(platform)) return null;
    config.platform = platform;
  }

  // Company name
  if (options.company) {
    config.company = options.company;
  } else {
    const company = await text({
      message: 'What company are you creating marketing for?',
      placeholder: 'e.g., Acme Corp',
      validate: (value) => {
        if (!value || value.trim() === '') {
          return 'Company name is required';
        }
      }
    });
    if (isCancel(company)) return null;
    config.company = company;
  }

  // User role
  if (options.role) {
    config.role = options.role;
  } else {
    const role = await select({
      message: 'What is your role?',
      options: [
        { value: 'pmm', label: 'PMM', hint: 'Product Marketing Manager' },
        { value: 'cmo', label: 'CMO', hint: 'Chief Marketing Officer' },
        { value: 'content', label: 'Content Marketing' },
        { value: 'demand', label: 'Demand Gen' },
        { value: 'customer', label: 'Customer Marketing' },
        { value: 'events', label: 'Events' },
        { value: 'other', label: 'Other' }
      ],
      initialValue: 'pmm'
    });
    if (isCancel(role)) return null;
    config.role = role;
  }

  // Industry
  if (options.industry) {
    config.industry = options.industry;
  } else {
    const industry = await select({
      message: 'What industry?',
      options: [
        { value: 'b2b-saas', label: 'B2B SaaS', hint: 'Optimized for this' },
        { value: 'enterprise', label: 'Enterprise Software' },
        { value: 'consumer', label: 'Consumer Tech' },
        { value: 'fintech', label: 'Fintech' },
        { value: 'healthtech', label: 'Healthcare Tech' },
        { value: 'other', label: 'Other' }
      ],
      initialValue: 'b2b-saas'
    });
    if (isCancel(industry)) return null;
    config.industry = industry;
  }

  // Artifacts path
  if (options.artifacts) {
    config.artifacts_path = options.artifacts;
  } else {
    const artifacts = await text({
      message: 'Where should marketing artifacts be saved?',
      initialValue: 'marketing',
      placeholder: 'marketing'
    });
    if (isCancel(artifacts)) return null;
    config.artifacts_path = artifacts || 'marketing';
  }

  return config;
}

async function createDirectories(config) {
  const dirs = [
    `${config.artifacts_path}/intelligence`,
    `${config.artifacts_path}/strategy`,
    `${config.artifacts_path}/assets`,
    `${config.artifacts_path}/campaigns`
  ];

  // Platform-specific directories
  if (config.platform === 'claude' || config.platform === 'both') {
    dirs.push('.claude/skills/mark');
  }
  if (config.platform === 'gemini' || config.platform === 'both') {
    // Gemini uses skills directly (no mark subdirectory) + commands directory
    dirs.push('.gemini/skills');
    dirs.push('.gemini/commands');
  }

  for (const dir of dirs) {
    await fs.ensureDir(dir);
  }
}

async function copySkillsSafe(config) {
  const packageRoot = path.resolve(__dirname, '../../../');
  const skillsSource = path.join(packageRoot, 'src/skills');
  const commandsSource = path.join(packageRoot, 'src/commands');
  const suffix = 'mark-method';

  if (!await fs.pathExists(skillsSource)) {
    throw new Error(`Skills source not found at ${skillsSource}`);
  }

  // Load manifest from previous install (if reinstalling)
  const previousManifest = config.installed_files || [];
  const newManifest = [];
  const suffixedItems = [];

  // Copy a source item to the right destination, respecting existing files
  async function copyWithCollisionCheck(srcPath, destPath, suffixedPath) {
    const destExists = await fs.pathExists(destPath);
    const ownedByUs = previousManifest.includes(destPath);

    if (!destExists) {
      // No conflict — install normally
      await fs.copy(srcPath, destPath);
      newManifest.push(destPath);
    } else if (ownedByUs) {
      // We installed this previously — safe to update
      await fs.copy(srcPath, destPath);
      newManifest.push(destPath);
    } else {
      // Existing file/dir NOT ours — install with suffix to coexist
      await fs.copy(srcPath, suffixedPath);
      newManifest.push(suffixedPath);
      suffixedItems.push({ original: destPath, suffixed: suffixedPath });
    }
  }

  // --- Skills (directories) ---
  const skillEntries = await fs.readdir(skillsSource);

  if (config.platform === 'claude' || config.platform === 'both') {
    for (const entry of skillEntries) {
      const srcPath = path.join(skillsSource, entry);
      if (!(await fs.stat(srcPath)).isDirectory()) continue;

      const destPath = `.claude/skills/mark/${entry}`;
      const suffixedPath = `.claude/skills/mark/${entry}-${suffix}`;
      await copyWithCollisionCheck(srcPath, destPath, suffixedPath);
    }
  }

  if (config.platform === 'gemini' || config.platform === 'both') {
    for (const entry of skillEntries) {
      const srcPath = path.join(skillsSource, entry);
      if (!(await fs.stat(srcPath)).isDirectory()) continue;

      const destPath = `.gemini/skills/${entry}`;
      const suffixedPath = `.gemini/skills/${entry}-${suffix}`;
      await copyWithCollisionCheck(srcPath, destPath, suffixedPath);
    }

    // --- Commands (files) ---
    if (await fs.pathExists(commandsSource)) {
      const commandEntries = await fs.readdir(commandsSource);
      for (const entry of commandEntries) {
        const srcPath = path.join(commandsSource, entry);
        if (!(await fs.stat(srcPath)).isFile()) continue;

        const ext = path.extname(entry);
        const baseName = path.basename(entry, ext);
        const destPath = `.gemini/commands/${entry}`;
        const suffixedPath = `.gemini/commands/${baseName}-${suffix}${ext}`;
        await copyWithCollisionCheck(srcPath, destPath, suffixedPath);
      }
    }
  }

  return { manifest: newManifest, suffixed: suffixedItems };
}

async function generateContextFiles(config) {
  const packageRoot = path.resolve(__dirname, '../../../');

  const templateVars = {
    company_name: config.company,
    user_role: formatRole(config.role),
    industry: formatIndustry(config.industry),
    artifacts_path: config.artifacts_path
  };

  // Generate CLAUDE.md (append or create)
  if (config.platform === 'claude' || config.platform === 'both') {
    const claudeTemplatePath = path.join(packageRoot, 'src/templates/CLAUDE.md.template');
    if (await fs.pathExists(claudeTemplatePath)) {
      let template = await fs.readFile(claudeTemplatePath, 'utf-8');
      template = replaceTemplateVars(template, templateVars);

      const claudeMdPath = 'CLAUDE.md';
      if (await fs.pathExists(claudeMdPath)) {
        const existing = await fs.readFile(claudeMdPath, 'utf-8');
        if (!existing.includes('<!-- BEGIN MARK METHOD -->')) {
          await fs.appendFile(claudeMdPath, '\n\n' + template);
        }
      } else {
        await fs.writeFile(claudeMdPath, template);
      }
    }
  }

  // Generate GEMINI.md (append or create)
  if (config.platform === 'gemini' || config.platform === 'both') {
    const geminiTemplatePath = path.join(packageRoot, 'src/templates/GEMINI.md.template');
    if (await fs.pathExists(geminiTemplatePath)) {
      let template = await fs.readFile(geminiTemplatePath, 'utf-8');
      template = replaceTemplateVars(template, templateVars);

      const geminiMdPath = 'GEMINI.md';
      if (await fs.pathExists(geminiMdPath)) {
        const existing = await fs.readFile(geminiMdPath, 'utf-8');
        if (!existing.includes('<!-- BEGIN MARK METHOD -->')) {
          await fs.appendFile(geminiMdPath, '\n\n' + template);
        }
      } else {
        await fs.writeFile(geminiMdPath, template);
      }
    }
  }
}

function replaceTemplateVars(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

async function saveConfig(config) {
  await fs.writeFile('.mark-config.yaml', yaml.stringify(config));
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
