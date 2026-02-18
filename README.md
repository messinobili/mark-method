# MARK - Marketing Agentic Resource Kit

AI-driven marketing methodology for B2B SaaS teams. The marketing equivalent of [BMAD](https://github.com/bmad-code-org/BMAD-METHOD).

## Quick Start

```bash
npx mark-method install
```

Select your AI assistant (Claude Code or Gemini CLI), answer a few questions, and you're ready to go.

## What is MARK?

MARK provides structured marketing workflows powered by AI agents. Each agent is a specialist:

| Agent | Name | Specialty | Key Workflows |
|-------|------|-----------|---------------|
| **PMM** | Parker | Product Marketing | `/messaging`, `/positioning`, `/battlecard`, `/one-pager` |
| **Content** | Casey | Content Marketing | `/blog`, `/whitepaper`, `/content-strategy` |
| **Demand** | Dana | Demand Generation | `/campaign-strategy`, `/email-sequence` |
| **Customer** | Cameron | Customer Marketing | `/case-study`, `/customer-research` |
| **Events** | Ellis | Event Marketing | `/webinar`, `/event-launch` |
| **CMO** | Morgan | Strategic Direction | `/portfolio-review`, `/planning` |
| **Critic** | Quinn | Quality Assurance | `/asset-review`, `/fact-check` |
| **Coordinator** | Riley | Cross-Functional | `/stakeholder-update`, `/cross-functional` |

## Philosophy

**AI guides, you decide.** MARK's workflows extract YOUR best marketing thinking through structured processes. The AI doesn't replace your expertise—it amplifies it.

- **Human-in-the-loop always** — Manual handoffs by design
- **Adversarial review** — Critical evaluation before anything high-stakes goes live
- **Scale-adaptive** — Quick workflows for simple tasks, full methodology for complex initiatives

## Installation

### Interactive (Recommended)

```bash
npx mark-method install
```

You'll be prompted to:
1. Select your AI platform (Claude Code, Gemini CLI, or both)
2. Enter your company name
3. Choose your role
4. Select your industry
5. Confirm artifact location

### Non-Interactive

```bash
npx mark-method install --platform claude --company "Acme Inc" --role pmm --yes
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--platform` | `claude`, `gemini`, or `both` | (prompt) |
| `--company` | Company name | (prompt) |
| `--role` | `cmo`, `pmm`, `content`, `demand`, `customer`, `events` | (prompt) |
| `--industry` | `b2b-saas`, `enterprise`, `consumer`, `fintech`, `healthtech` | (prompt) |
| `--artifacts` | Artifact folder path | `marketing` |
| `--yes` | Skip prompts | false |

## Usage

After installation, open your project in Claude Code or Gemini CLI and use slash commands.

> **Gemini CLI Note:** If you already have Gemini CLI open, restart it after installation for the commands to be recognized.

```
/messaging      Create a messaging framework
/battlecard     Build a competitive battlecard
/one-pager      Create a sales one-pager
/blog           Draft a blog post
/case-study     Create a customer story
/asset-review   Quality check any asset
```

### Marketing Phases

MARK organizes marketing work into four phases:

| Phase | Purpose | Example Workflows |
|-------|---------|-------------------|
| **1. Intelligence** | Understand the landscape | `/competitor-analysis`, `/customer-research`, `/win-loss` |
| **2. Strategy** | Set direction | `/messaging`, `/positioning`, `/gtm-strategy`, `/persona` |
| **3. Creation** | Build assets | `/battlecard`, `/one-pager`, `/blog`, `/whitepaper` |
| **4. Activation** | Enable and measure | `/launch`, `/enablement`, `/asset-review` |

### Artifact Organization

MARK creates organized folders for your marketing work:

```
marketing/
├── intelligence/   # Competitive intel, research, win/loss
├── strategy/       # Messaging, positioning, GTM plans
├── assets/         # Battlecards, one-pagers, content
└── campaigns/      # Campaign plans, launch checklists
```

### How File Creation Works

MARK agents create files **explicitly with user confirmation**. Files are never saved automatically or silently.

**The workflow:**
1. Agent generates the complete output and displays it for review
2. Agent asks: "Ready to save? I'll create the file at `[path]`"
3. Upon your confirmation, the agent creates the file
4. Agent confirms the actual path of the created file

**Why explicit file creation?**
- You always see content before it's saved
- No files are created without your approval
- You can request changes before saving
- You know exactly where files are being created

**Multi-asset workflows** (like `/enablement`) list all files that will be created and batch-create them with a single confirmation.

**Troubleshooting:**
- If a file wasn't created, the agent didn't receive confirmation to save
- Verify the target directory exists (MARK creates the `marketing/` structure on install)
- Check that your AI assistant has file creation permissions

## All Workflows

### PMM (Parker)
- `/messaging` — Messaging framework development
- `/positioning` — Competitive positioning
- `/battlecard` — Competitive battlecard
- `/one-pager` — Sales one-pager
- `/competitor-analysis` — Deep-dive competitor analysis
- `/gtm-strategy` — Go-to-market strategy
- `/launch` — Launch execution checklist
- `/enablement` — Sales enablement rollout
- `/win-loss` — Win/loss analysis
- `/persona` — Buyer persona definition

### Content (Casey)
- `/blog` — Blog post creation
- `/whitepaper` — Whitepaper/ebook creation
- `/content-strategy` — Content strategy and calendar
- `/trend-analysis` — Industry trend analysis

### Demand (Dana)
- `/campaign-strategy` — Campaign strategy development
- `/email-sequence` — Email nurture sequence
- `/campaign-launch` — Campaign execution tracking

### Customer (Cameron)
- `/case-study` — Customer case study
- `/customer-research` — Customer insight synthesis

### Events (Ellis)
- `/webinar` — Webinar planning
- `/event-launch` — Event execution

### CMO (Morgan)
- `/portfolio-review` — Marketing portfolio review
- `/planning` — Strategic marketing planning

### Critic (Quinn)
- `/asset-review` — Asset quality review
- `/fact-check` — Fact verification

### Coordinator (Riley)
- `/stakeholder-update` — Stakeholder status update
- `/cross-functional` — Cross-functional coordination

## Commands

```bash
# Check installation status
npx mark-method status

# Remove MARK
npx mark-method uninstall
```

## Platform Support

MARK supports both **Claude Code** and **Gemini CLI** with platform-specific implementations:

| Platform | How It Works | Files Installed |
|----------|--------------|-----------------|
| Claude Code | Skills with trigger frontmatter | `.claude/skills/mark/` + `CLAUDE.md` |
| Gemini CLI | TOML command files + skills | `.gemini/commands/` + `.gemini/skills/` + `GEMINI.md` |

### Platform Differences

**Claude Code** uses SKILL.md files with YAML frontmatter that defines triggers:
```yaml
---
triggers:
  - /messaging
  - /positioning
---
```

**Gemini CLI** uses separate `.toml` command files that reference skills:
```toml
description = "Create a messaging framework"
prompt = """You are Parker, the PMM Agent...
Read your skill definition:
@{.gemini/skills/pmm/SKILL.md}
..."""
```

Both platforms provide the same `/slash` command experience—the implementation just differs under the hood.

When you select "Both" during installation, MARK installs the appropriate files for each platform.

## Directory Structure

### Claude Code
```
your-project/
├── .claude/
│   └── skills/
│       └── mark/
│           ├── pmm/SKILL.md
│           ├── content/SKILL.md
│           ├── demand/SKILL.md
│           ├── customer/SKILL.md
│           ├── events/SKILL.md
│           ├── cmo/SKILL.md
│           ├── critic/SKILL.md
│           └── coordinator/SKILL.md
├── marketing/
│   ├── intelligence/
│   ├── strategy/
│   ├── assets/
│   └── campaigns/
├── CLAUDE.md
└── .mark-config.yaml
```

### Gemini CLI
```
your-project/
├── .gemini/
│   ├── commands/              # Slash command definitions
│   │   ├── messaging.toml
│   │   ├── battlecard.toml
│   │   ├── one-pager.toml
│   │   └── ... (27 commands)
│   └── skills/                # Agent skill definitions
│       ├── pmm/SKILL.md
│       ├── content/SKILL.md
│       └── ... (8 agents)
├── marketing/
│   ├── intelligence/
│   ├── strategy/
│   ├── assets/
│   └── campaigns/
├── GEMINI.md
└── .mark-config.yaml
```

## Customization

### Claude Code

Edit the SKILL.md files in `.claude/skills/mark/` to customize agent behavior, add workflows, or modify output formats.

To add a new workflow, add a section to the appropriate agent's SKILL.md:

```markdown
### /new-workflow - Workflow Name

[Workflow instructions...]

**Output:**
1. Display the completed content for user review
2. Ask: "Ready to save? I'll create the file at `marketing/[folder]/[filename].md`"
3. Upon confirmation, create the file using your file creation capability
4. Confirm file creation with the actual path created
```

Then add the trigger to the frontmatter:
```yaml
triggers:
  - /new-workflow
```

### Gemini CLI

For Gemini CLI, you need to:

1. **Add workflow instructions** to the agent's SKILL.md in `.gemini/skills/`

2. **Create a command file** in `.gemini/commands/new-workflow.toml`:
```toml
description = "Description of what this workflow does"
prompt = """You are [Agent Name], the [Role] Agent from MARK.

Read your skill definition:
@{.gemini/skills/[agent]/SKILL.md}

Now execute the /new-workflow workflow...

Begin by asking the user [first question]."""
```

## Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT

## Credits

Inspired by [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) and the structured agent methodology for software development.

---

Built for B2B SaaS marketing teams who want AI to amplify their expertise, not replace it.
