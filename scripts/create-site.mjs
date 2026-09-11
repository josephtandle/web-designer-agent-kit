#!/usr/bin/env node

import fs from 'node:fs';
import { platform } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateServiceSite } from '../templates/service.mjs';
import { generatePortfolioSite } from '../templates/portfolio.mjs';
import { generateEventSite } from '../templates/event.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VALUE_FLAGS = new Set(['target', 'style', 'name', 'headline', 'email']);
const STYLES = new Set(['service', 'portfolio', 'event']);

function usage() {
  console.log(`\nMasterminds Web Designer : Site Starter CLI (Zero-Dependency)\n\nUsage:\n  node scripts/create-site.mjs --target=<NEW_DIR> --style=<service|portfolio|event> [--name=<name>] [--headline=<headline>] [--email=<email>]\n\nEvery value option must use --key=value. Values cannot be blank.\n`);
}

function fail(message) { console.error(`Error: ${message}`); process.exit(1); }

function parseArgs(args) {
  const options = {};
  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      if (args.length !== 1) fail('Use --help on its own.');
      return { help: true };
    }
    if (!arg.startsWith('--')) fail(`Unknown positional argument '${arg}'.`);
    const match = /^--([a-z]+)=(.*)$/s.exec(arg);
    if (!match) fail(`Option '${arg}' must use --key=value.`);
    const [, key, value] = match;
    if (!VALUE_FLAGS.has(key)) fail(`Unknown option '--${key}'.`);
    if (Object.hasOwn(options, key)) fail(`Duplicate option '--${key}'.`);
    if (!value.trim()) fail(`Option '--${key}' cannot be blank or whitespace.`);
    options[key] = value;
  }
  return options;
}

function canonicalTarget(input) {
  const resolved = path.resolve(input);
  if (process.platform !== 'darwin') return resolved;
  for (const alias of ['/tmp', '/var', '/etc']) {
    if (resolved === alias || resolved.startsWith(`${alias}/`)) return path.join('/private', alias, resolved.slice(alias.length));
  }
  return resolved;
}

function lstatOrNull(candidate) {
  try { return fs.lstatSync(candidate); }
  catch (error) { if (error?.code === 'ENOENT') return null; throw error; }
}

function rejectSymlinkInPath(target) {
  const parsed = path.parse(target);
  let current = parsed.root;
  for (const part of target.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    const stat = lstatOrNull(current);
    if (stat?.isSymbolicLink()) fail(`Target path '${target}' includes symbolic link '${current}'. Choose a real directory path.`);
  }
}

function validateEmail(email) {
  return !email || (!/[\x00-\x1F\x7F\s?#]/.test(email) && /^[^\s@?#]+@[^\s@?#]+\.[^\s@?#]+$/.test(email));
}

function commandQuote(value) {
  const text = String(value);
  if (platform() === 'win32') return `'${text.replace(/'/g, "''")}'`;
  return `'${text.replace(/'/g, `'\\''`)}'`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) { usage(); return; }
  if (!options.target || !options.style) { usage(); fail('Missing required options (--target and --style are required).'); }
  const style = options.style.toLowerCase();
  if (!STYLES.has(style)) fail(`Invalid style '${options.style}'. Allowed styles are: service, portfolio, event.`);
  if (!validateEmail(options.email)) fail('Invalid email address.');
  const target = canonicalTarget(options.target);
  const previewSource = path.join(__dirname, 'preview.mjs');
  if (!lstatOrNull(previewSource)?.isFile()) fail(`Preview script is unavailable at '${previewSource}'. No files were created.`);
  rejectSymlinkInPath(target);
  const targetStat = lstatOrNull(target);
  if (targetStat && !targetStat.isDirectory()) fail(`Target path '${target}' exists and is not a directory.`);
  if (targetStat && fs.readdirSync(target).length) fail(`Target directory '${target}' exists and is not empty. Overwrites are refused.`);
  const data = { name: options.name || 'Sample Studio', headline: options.headline || 'A useful new perspective', email: options.email || '' };
  const output = style === 'service' ? generateServiceSite(data) : style === 'portfolio' ? generatePortfolioSite(data) : generateEventSite(data);
  if (!targetStat) fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'index.html'), output.indexHtml, 'utf8');
  fs.writeFileSync(path.join(target, 'styles.css'), output.stylesCss, 'utf8');
  fs.writeFileSync(path.join(target, 'brief.md'), output.briefMd, 'utf8');
  fs.writeFileSync(path.join(target, 'README.md'), output.readmeMd, 'utf8');
  fs.mkdirSync(path.join(target, 'scripts'));
  fs.copyFileSync(previewSource, path.join(target, 'scripts', 'preview.mjs'));
  console.log(`\nSite generated successfully!\n  Location: ${target}\n  Style: ${style}\n  Name: ${data.name}\n\nTo preview your new site locally, run:\n  node ${commandQuote(path.join(target, 'scripts', 'preview.mjs'))} --dir=${commandQuote(target)} --port=3000\n`);
}

main();
