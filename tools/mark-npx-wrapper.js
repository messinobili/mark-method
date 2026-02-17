#!/usr/bin/env node

/**
 * MARK Method - NPX Wrapper
 *
 * This wrapper ensures the CLI works correctly when invoked via npx.
 * It handles the path resolution for the main CLI script.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import and run the main CLI
const cliPath = join(__dirname, 'cli', 'mark-cli.js');

// Dynamic import to run the CLI
import(cliPath).catch((error) => {
  console.error('Failed to start MARK CLI:', error.message);
  process.exit(1);
});
