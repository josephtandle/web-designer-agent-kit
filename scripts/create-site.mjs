#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateServiceSite } from '../templates/service.mjs';
import { generatePortfolioSite } from '../templates/portfolio.mjs';
import { generateEventSite } from '../templates/event.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printUsage() {
  console.log(`
Masterminds Web Designer : Site Starter CLI (Zero-Dependency)

Usage:
  node scripts/create-site.mjs --target=<NEW_DIR> --style=<style> --name=<name> --headline=<headline> [--email=<email>]

Required Options:
  --target=<path>      Directory path for the new site
  --style=<type>       Site style: service | portfolio | event
  --name=<name>        Business or project owner name
  --headline=<headline> Main title or value proposition

Optional Options:
  --email=<email>      Valid contact email address for CTAs
  --help, -h           Show this help message

Example:
  node scripts/create-site.mjs --target=my-service-site --style=service --name="Apex Advisory" --headline="Strategic Growth Solutions" --email="contact@example.com"
`);
}

function parseArgs(args) {
  const options = {};
  const allowedFlags = new Set(['target', 'style', 'name', 'headline', 'email', 'help', 'h']);

  for (const arg of args) {
    if (arg === '-h' || arg === '--help') {
      options.help = true;
      continue;
    }

    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      let key, val;
      if (eqIdx !== -1) {
        key = arg.slice(2, eqIdx);
        val = arg.slice(eqIdx + 1);
      } else {
        key = arg.slice(2);
        val = 'true';
      }

      if (!allowedFlags.has(key)) {
        console.error(`Error: Unknown option '--${key}'.`);
        printUsage();
        process.exit(1);
      }
      options[key] = val;
    } else if (arg.startsWith('-')) {
      console.error(`Error: Unknown option '${arg}'.`);
      printUsage();
      process.exit(1);
    }
  }

  return options;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function checkSymlinkSafety(targetPath) {
  const resolvedTarget = path.resolve(targetPath);

  // Check if target itself or any existing parent directory is a symbolic link
  let current = resolvedTarget;
  while (current !== path.parse(current).root) {
    if (fs.existsSync(current)) {
      const lstat = fs.lstatSync(current);
      if (lstat.isSymbolicLink()) {
        console.error(`Error: Path '${current}' is a symbolic link. Symlink targets are refused for safety.`);
        process.exit(1);
      }
      const real = fs.realpathSync(current);
      if (real !== current) {
        console.error(`Error: Path '${current}' resolves through symbolic link '${real}'. Symlinks are refused for safety.`);
        process.exit(1);
      }
    }
    current = path.dirname(current);
  }
}

function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    printUsage();
    process.exit(0);
  }

  const { target, style, name, headline, email } = options;

  // Check required options
  if (!target || !style || !name || !headline) {
    console.error('Error: Missing required options (--target, --style, --name, --headline are required).');
    printUsage();
    process.exit(1);
  }

  // Validate style
  const validStyles = ['service', 'portfolio', 'event'];
  if (!validStyles.includes(style.toLowerCase())) {
    console.error(`Error: Invalid style '${style}'. Allowed styles are: service, portfolio, event.`);
    process.exit(1);
  }

  // Validate email if provided
  if (email && !validateEmail(email)) {
    console.error(`Error: Invalid email address '${email}'. Please provide a valid email address.`);
    process.exit(1);
  }

  const targetPath = path.resolve(target);
  checkSymlinkSafety(targetPath);

  // Check target directory existence and non-emptiness
  if (fs.existsSync(targetPath)) {
    const lstat = fs.lstatSync(targetPath);
    if (!lstat.isDirectory()) {
      console.error(`Error: Target path '${targetPath}' exists and is not a directory.`);
      process.exit(1);
    }
    const contents = fs.readdirSync(targetPath);
    if (contents.length > 0) {
      console.error(`Error: Target directory '${targetPath}' exists and is not empty. Overwrites are refused.`);
      process.exit(1);
    }
  } else {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  const siteData = { name, headline, email: email || '' };
  let siteOutput;

  switch (style.toLowerCase()) {
    case 'service':
      siteOutput = generateServiceSite(siteData);
      break;
    case 'portfolio':
      siteOutput = generatePortfolioSite(siteData);
      break;
    case 'event':
      siteOutput = generateEventSite(siteData);
      break;
  }

  fs.writeFileSync(path.join(targetPath, 'index.html'), siteOutput.indexHtml, 'utf8');
  fs.writeFileSync(path.join(targetPath, 'styles.css'), siteOutput.stylesCss, 'utf8');
  fs.writeFileSync(path.join(targetPath, 'brief.md'), siteOutput.briefMd, 'utf8');
  fs.writeFileSync(path.join(targetPath, 'README.md'), siteOutput.readmeMd, 'utf8');

  console.log(`
Site generated successfully!
  Location: ${targetPath}
  Style: ${style}
  Name: ${name}

To preview your new site locally, run:
  node scripts/preview.mjs --dir="${targetPath}" --port=3000
`);
}

main();
