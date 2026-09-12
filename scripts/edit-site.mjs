#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { renderBrief, validateBrief } from './lib/site-brief.mjs';
import { renderEditorUi } from './lib/editor-ui.mjs';

const REQUEST_JSON_LIMIT = 128 * 1024;
const SITE_JSON_LIMIT = 1024 * 1024;
const IMAGE_LIMIT = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 4096;
const MAX_IMAGE_PIXELS = 16_000_000;
const HISTORY_LIMIT = 25;
const TOKEN_HEADER = 'x-site-editor-token';
const FIXED_RENDER_FILES = new Set(['site.json', 'styles.css', 'README.md']);
const API_ENDPOINTS = new Set(['/__api/state', '/__api/save', '/__api/undo', '/__api/redo', '/__api/image']);
const RASTER_MIME = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.webp', 'image/webp'],
]);
const FORBIDDEN_PATH_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function usage() {
  console.log(`
Masterminds Web Designer : Structured Site Visual Editor

Usage:
  node scripts/edit-site.mjs --dir=<generated-site> [--port=<port>]

Options:
  --dir=<path>    Generated structured site directory (required)
  --port=<port>   Loopback port (default: 4174)
  --help          Show this help

The editor is opt-in and separate from the existing read-only preview command.
`);
}

function parseArgs(args) {
  const options = { port: 4174 };
  const seen = new Set();
  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      if (args.length !== 1) throw new Error('Use --help on its own.');
      return { help: true };
    }
    const match = /^--(dir|port)=(.*)$/s.exec(arg);
    if (!match) throw new Error(`Unknown option '${arg}'. Options must use --key=value.`);
    const [, key, value] = match;
    if (seen.has(key)) throw new Error(`Duplicate option '--${key}'.`);
    seen.add(key);
    if (!value.trim()) throw new Error(`Option '--${key}' cannot be blank.`);
    options[key] = key === 'port' ? Number(value) : value;
  }
  if (!options.dir) throw new Error('Missing required option --dir.');
  if (!Number.isInteger(options.port) || options.port < 1 || options.port > 65535) {
    throw new Error(`Invalid port '${options.port}'. Use an integer from 1 to 65535.`);
  }
  return options;
}

function lstatOrNull(file) {
  try { return fs.lstatSync(file); }
  catch (error) { if (error?.code === 'ENOENT') return null; throw error; }
}

function canonicalPath(value) {
  const resolved = path.resolve(value);
  if (process.platform !== 'darwin') return resolved;
  for (const alias of ['/tmp', '/var', '/etc']) {
    if (resolved === alias || resolved.startsWith(`${alias}${path.sep}`)) {
      return path.join('/private', alias, resolved.slice(alias.length));
    }
  }
  return resolved;
}

function assertNoSymlinkPath(value, label, allowMissingLeaf = false) {
  const absolute = canonicalPath(value);
  const parsed = path.parse(absolute);
  let current = parsed.root;
  const pieces = absolute.slice(parsed.root.length).split(path.sep).filter(Boolean);
  for (let index = 0; index < pieces.length; index += 1) {
    current = path.join(current, pieces[index]);
    const stat = lstatOrNull(current);
    if (!stat && allowMissingLeaf && index === pieces.length - 1) continue;
    if (stat?.isSymbolicLink()) throw new Error(`${label} has a symbolic-link ancestor: ${current}`);
  }
  return absolute;
}

function assertContained(root, relativePath, label) {
  if (typeof relativePath !== 'string' || !relativePath || relativePath.includes('\\') || relativePath.includes('\0')) {
    throw new Error(`${label} is not a safe relative path.`);
  }
  const normalized = path.posix.normalize(relativePath);
  if (normalized !== relativePath || normalized.startsWith('../') || normalized.startsWith('/') || normalized === '..') {
    throw new Error(`${label} escapes the site root: ${relativePath}`);
  }
  const absolute = path.resolve(root, ...relativePath.split('/'));
  const relation = path.relative(root, absolute);
  if (relation.startsWith('..') || path.isAbsolute(relation)) throw new Error(`${label} escapes the site root.`);
  return absolute;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function rendererPlan(brief) {
  const result = renderBrief(brief);
  if (!result || typeof result !== 'object' || !result.files || typeof result.files !== 'object') {
    throw new Error('Structured renderer returned an invalid file plan.');
  }
  const expected = new Set([...FIXED_RENDER_FILES, ...result.brief.pages.map((page) => page.path)]);
  const keys = Object.keys(result.files);
  if (keys.length !== expected.size || keys.some((key) => !expected.has(key)) || [...expected].some((key) => !Object.hasOwn(result.files, key))) {
    throw new Error('Structured renderer attempted an unexpected or incomplete file plan.');
  }
  for (const [relativePath, content] of Object.entries(result.files)) {
    assertContained('.', relativePath, 'Rendered output path');
    if (typeof content !== 'string') throw new Error(`Rendered output '${relativePath}' is not text.`);
  }
  if (Buffer.byteLength(result.files['site.json'], 'utf8') > SITE_JSON_LIMIT) {
    throw new Error(`Rendered site.json exceeds the ${SITE_JSON_LIMIT}-byte limit.`);
  }
  return { brief: result.brief, files: result.files };
}

function readSource(sourceFile) {
  const stat = lstatOrNull(sourceFile);
  if (!stat?.isFile() || stat.isSymbolicLink()) throw new Error('site.json must be a regular, non-symbolic-link file.');
  if (stat.size > SITE_JSON_LIMIT) throw new Error(`site.json exceeds the ${SITE_JSON_LIMIT}-byte limit.`);
  const raw = fs.readFileSync(sourceFile, 'utf8');
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch (error) { throw new Error(`site.json is invalid JSON: ${error.message}`); }
  return { raw, brief: validateBrief(parsed) };
}

function labelWords(value) {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('-', ' ').replace(/^./, (letter) => letter.toUpperCase());
}

function fieldKind(key, parentKey) {
  if (key === 'src' && parentKey === 'image') return 'image-src';
  if (key === 'body' || key === 'description' || (key === 'text' && parentKey === 'footer')) return 'multiline';
  return 'text';
}

function editableFields(brief) {
  const fields = [];
  const add = (segments, value, label, kind = 'text', pagePath = '') => {
    if (typeof value === 'string') fields.push({ path: segments.join('.'), value, label, kind, pagePath });
  };
  add(['name'], brief.name, 'Site name');
  brief.navigation?.forEach((item, index) => {
    add(['navigation', index, 'label'], item.label, `Navigation ${index + 1}: label`);
    add(['navigation', index, 'href'], item.href, `Navigation ${index + 1}: destination`);
  });
  if (brief.footer) {
    add(['footer', 'text'], brief.footer.text, 'Footer: text', 'multiline');
    brief.footer.links?.forEach((item, index) => {
      add(['footer', 'links', index, 'label'], item.label, `Footer link ${index + 1}: label`);
      add(['footer', 'links', index, 'href'], item.href, `Footer link ${index + 1}: destination`);
    });
  }
  brief.pages.forEach((page, pageIndex) => {
    const pageLabel = page.title || page.path;
    add(['pages', pageIndex, 'title'], page.title, `${pageLabel}: page title`, 'text', page.path);
    add(['pages', pageIndex, 'description'], page.description, `${pageLabel}: description`, 'multiline', page.path);
    page.sections.forEach((section, sectionIndex) => {
      const prefix = ['pages', pageIndex, 'sections', sectionIndex];
      const sectionLabel = `${pageLabel} · ${section.type} ${sectionIndex + 1}`;
      for (const key of ['eyebrow', 'title', 'body']) {
        add([...prefix, key], section[key], `${sectionLabel}: ${labelWords(key)}`, fieldKind(key, 'section'), page.path);
      }
      for (const key of ['src', 'alt']) {
        add([...prefix, 'image', key], section.image?.[key], `${sectionLabel}: image ${key}`, fieldKind(key, 'image'), page.path);
      }
      for (const key of ['label', 'href']) {
        add([...prefix, 'action', key], section.action?.[key], `${sectionLabel}: action ${key}`, 'text', page.path);
      }
      section.items?.forEach((item, itemIndex) => {
        const itemPrefix = [...prefix, 'items', itemIndex];
        for (const key of ['title', 'body', 'label', 'value', 'href', 'author', 'role', 'time', 'price']) {
          add([...itemPrefix, key], item[key], `${sectionLabel} · item ${itemIndex + 1}: ${labelWords(key)}`, fieldKind(key, 'item'), page.path);
        }
        for (const key of ['src', 'alt']) {
          add([...itemPrefix, 'image', key], item.image?.[key], `${sectionLabel} · item ${itemIndex + 1}: image ${key}`, fieldKind(key, 'image'), page.path);
        }
      });
    });
  });
  return fields;
}

function setEditableValue(brief, allowedPaths, dottedPath, value) {
  if (typeof dottedPath !== 'string' || !allowedPaths.has(dottedPath)) throw new Error(`Field path '${dottedPath}' is not editable.`);
  if (typeof value !== 'string') throw new Error(`Field '${dottedPath}' requires a string value.`);
  const segments = dottedPath.split('.');
  if (segments.some((segment) => !segment || FORBIDDEN_PATH_KEYS.has(segment) || !/^(?:0|[1-9]\d*|[A-Za-z][A-Za-z0-9]*)$/.test(segment))) {
    throw new Error(`Field path '${dottedPath}' is unsafe.`);
  }
  let target = brief;
  for (const segment of segments.slice(0, -1)) {
    if (!Object.hasOwn(target, segment) || (typeof target[segment] !== 'object') || target[segment] === null) {
      throw new Error(`Field path '${dottedPath}' no longer exists.`);
    }
    target = target[segment];
  }
  const leaf = segments.at(-1);
  if (!Object.hasOwn(target, leaf) || typeof target[leaf] !== 'string') throw new Error(`Field path '${dottedPath}' is not a string leaf.`);
  target[leaf] = value;
}

function approvedRasterPaths(brief) {
  const approved = new Set();
  for (const field of editableFields(brief)) {
    if (field.kind !== 'image-src' || /^https:\/\//i.test(field.value)) continue;
    let value = field.value.split(/[?#]/, 1)[0];
    if (value.startsWith('/')) value = value.slice(1);
    const normalized = path.posix.normalize(value);
    if (normalized && normalized !== '.' && !normalized.startsWith('../') && !normalized.startsWith('/')) approved.add(normalized);
  }
  return approved;
}

function assertEditorImageSources(brief) {
  for (const field of editableFields(brief)) {
    if (field.kind !== 'image-src' || /^https:\/\//i.test(field.value)) continue;
    const sourcePath = field.value.split(/[?#]/, 1)[0];
    const extension = path.posix.extname(sourcePath).toLowerCase();
    if (RASTER_MIME.has(extension)) continue;
    const displayedExtension = extension ? `'${extension}'` : 'no file extension';
    throw Object.assign(new Error(
      `Editor image field '${field.path}' references local source '${field.value}' with unsupported extension ${displayedExtension}. `
      + 'Preserve the original image, create an approved PNG, JPEG, WebP, or GIF copy, update this source in the model, and regenerate into a new output directory.',
    ), { statusCode: 400 });
  }
}

function pngDimensions(bytes) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 45 || !bytes.subarray(0, 8).equals(signature)) return null;
  if (bytes.readUInt32BE(8) !== 13 || bytes.toString('ascii', 12, 16) !== 'IHDR') return null;
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  const bitDepth = bytes[24];
  const colorType = bytes[25];
  const validDepths = new Map([[0, new Set([1, 2, 4, 8, 16])], [2, new Set([8, 16])], [3, new Set([1, 2, 4, 8])], [4, new Set([8, 16])], [6, new Set([8, 16])]]);
  if (!width || !height || !validDepths.get(colorType)?.has(bitDepth) || bytes[26] !== 0 || bytes[27] !== 0 || bytes[28] > 1) return null;
  let offset = 8;
  let sawIdat = false;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const end = offset + 12 + length;
    if (end > bytes.length) return null;
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') sawIdat = true;
    if (type === 'IEND') return length === 0 && sawIdat && end === bytes.length ? { width, height } : null;
    offset = end;
  }
  return null;
}

function jsonResponse(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  res.end(body);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let length = 0;
    let failed = false;
    req.on('data', (chunk) => {
      if (failed) return;
      length += chunk.length;
      if (length > limit) {
        failed = true;
        reject(Object.assign(new Error(`Request body exceeds ${limit} bytes.`), { statusCode: 413 }));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => { if (!failed) resolve(Buffer.concat(chunks)); });
    req.on('error', (error) => { if (!failed) reject(error); });
  });
}

async function readJson(req) {
  const contentType = String(req.headers['content-type'] || '').split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') throw Object.assign(new Error('Content-Type must be application/json.'), { statusCode: 415 });
  const bytes = await readBody(req, REQUEST_JSON_LIMIT);
  try { return JSON.parse(bytes.toString('utf8') || '{}'); }
  catch { throw Object.assign(new Error('Request body is not valid JSON.'), { statusCode: 400 }); }
}

class EditorSession {
  constructor(root) {
    this.root = assertNoSymlinkPath(root, 'Site root');
    const rootStat = lstatOrNull(this.root);
    if (!rootStat?.isDirectory()) throw new Error(`Site root does not exist or is not a directory: ${this.root}`);
    this.sourceFile = assertNoSymlinkPath(path.join(this.root, 'site.json'), 'site.json');
    const source = readSource(this.sourceFile);
    assertEditorImageSources(source.brief);
    const plan = rendererPlan(source.brief);
    this.planKeys = Object.keys(plan.files).sort();
    this.brief = plan.brief;
    this.outputHashes = new Map();
    this.undoStack = [];
    this.redoStack = [];
    this.assertPlanMatchesDisk(plan.files, source.raw);
    this.sourceHash = sha256(source.raw);
    this.createOriginalSnapshot(source.raw);
  }

  assertOutputPaths() {
    assertNoSymlinkPath(this.root, 'Site root');
    assertNoSymlinkPath(this.sourceFile, 'site.json');
    for (const relativePath of this.planKeys) {
      const file = assertContained(this.root, relativePath, 'Generated output');
      assertNoSymlinkPath(path.dirname(file), `Output parent for ${relativePath}`);
      const stat = lstatOrNull(file);
      if (!stat?.isFile() || stat.isSymbolicLink()) throw new Error(`Generated output is missing or unsafe: ${relativePath}`);
    }
  }

  assertPlanMatchesDisk(files, sourceRaw) {
    this.assertOutputPaths();
    const keys = Object.keys(files).sort();
    if (keys.length !== this.planKeys.length || keys.some((key, index) => key !== this.planKeys[index])) {
      throw new Error('Rendered file plan changed unexpectedly.');
    }
    for (const relativePath of this.planKeys) {
      const disk = relativePath === 'site.json' ? sourceRaw : fs.readFileSync(assertContained(this.root, relativePath, 'Generated output'), 'utf8');
      if (disk !== files[relativePath]) throw new Error(`Generated output does not match site.json: ${relativePath}`);
      this.outputHashes.set(relativePath, sha256(disk));
    }
  }

  createOriginalSnapshot(sourceRaw) {
    const historyDir = assertNoSymlinkPath(path.join(this.root, '.site-editor-history'), 'Editor history', true);
    const existing = lstatOrNull(historyDir);
    if (existing && !existing.isDirectory()) throw new Error('Editor history path is not a directory.');
    if (!existing) fs.mkdirSync(historyDir, { mode: 0o700 });
    fs.chmodSync(historyDir, 0o700);
    const snapshot = assertNoSymlinkPath(path.join(historyDir, 'original-site.json'), 'Original snapshot', true);
    const snapshotStat = lstatOrNull(snapshot);
    if (snapshotStat) {
      if (!snapshotStat.isFile() || snapshotStat.isSymbolicLink()) throw new Error('Original snapshot is not a regular file.');
      return;
    }
    fs.writeFileSync(snapshot, sourceRaw, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  }

  verifyIntegrity(expectedSourceHash = this.sourceHash) {
    this.assertOutputPaths();
    const sourceBytes = fs.readFileSync(this.sourceFile);
    if (!safeEqual(sha256(sourceBytes), expectedSourceHash) || !safeEqual(expectedSourceHash, this.sourceHash)) {
      throw Object.assign(new Error('site.json changed outside this editor. Restart before saving.'), { statusCode: 409 });
    }
    for (const relativePath of this.planKeys) {
      const file = assertContained(this.root, relativePath, 'Generated output');
      const actual = sha256(fs.readFileSync(file));
      if (!safeEqual(actual, this.outputHashes.get(relativePath))) {
        throw Object.assign(new Error(`Generated output changed outside this editor: ${relativePath}`), { statusCode: 409 });
      }
    }
  }

  state() {
    return {
      sourceHash: this.sourceHash,
      fields: editableFields(this.brief),
      pages: this.brief.pages.map((page) => ({ title: page.title, path: page.path, previewUrl: `/__preview__/${page.path}` })),
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
    };
  }

  save(payload) {
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.changes) || typeof payload.sourceHash !== 'string') {
      throw Object.assign(new Error('Save requires sourceHash and a changes array.'), { statusCode: 400 });
    }
    if (!payload.changes.length || payload.changes.length > 200) throw Object.assign(new Error('Save requires 1 to 200 field changes.'), { statusCode: 400 });
    this.verifyIntegrity(payload.sourceHash);
    const next = structuredClone(this.brief);
    const allowed = new Set(editableFields(this.brief).map((field) => field.path));
    const seen = new Set();
    for (const change of payload.changes) {
      if (!change || typeof change !== 'object' || seen.has(change.path)) throw Object.assign(new Error('Each changed field must appear exactly once.'), { statusCode: 400 });
      seen.add(change.path);
      setEditableValue(next, allowed, change.path, change.value);
    }
    const validated = validateBrief(next);
    assertEditorImageSources(validated);
    this.commit(validated);
    this.undoStack.push(structuredClone(this.brief));
    if (this.undoStack.length > HISTORY_LIMIT) this.undoStack.shift();
    this.brief = validated;
    this.redoStack = [];
    return this.state();
  }

  history(action, sourceHash) {
    if (typeof sourceHash !== 'string') throw Object.assign(new Error(`${action} requires sourceHash.`), { statusCode: 400 });
    this.verifyIntegrity(sourceHash);
    const from = action === 'undo' ? this.undoStack : this.redoStack;
    const to = action === 'undo' ? this.redoStack : this.undoStack;
    if (!from.length) throw Object.assign(new Error(`Nothing to ${action}.`), { statusCode: 409 });
    const next = from.at(-1);
    this.commit(next);
    from.pop();
    to.push(structuredClone(this.brief));
    if (to.length > HISTORY_LIMIT) to.shift();
    this.brief = structuredClone(next);
    return this.state();
  }

  commit(candidate) {
    const plan = rendererPlan(candidate);
    const keys = Object.keys(plan.files).sort();
    if (keys.length !== this.planKeys.length || keys.some((key, index) => key !== this.planKeys[index])) {
      throw new Error('Edit would change the approved generated file plan.');
    }
    this.verifyIntegrity();
    const stageRoot = fs.mkdtempSync(path.join(path.dirname(this.root), `.site-editor-stage-${path.basename(this.root)}-`));
    const staged = path.join(stageRoot, 'new');
    const backup = path.join(stageRoot, 'old');
    const replaced = [];
    let removeStage = true;
    try {
      for (const relativePath of this.planKeys) {
        const stageFile = assertContained(staged, relativePath, 'Staged output');
        fs.mkdirSync(path.dirname(stageFile), { recursive: true, mode: 0o700 });
        fs.writeFileSync(stageFile, plan.files[relativePath], { encoding: 'utf8', flag: 'wx', mode: 0o600 });
      }
      this.verifyIntegrity();
      for (const relativePath of this.planKeys) {
        const target = assertContained(this.root, relativePath, 'Generated output');
        const backupFile = assertContained(backup, relativePath, 'Backup output');
        const stageFile = assertContained(staged, relativePath, 'Staged output');
        fs.mkdirSync(path.dirname(backupFile), { recursive: true, mode: 0o700 });
        fs.renameSync(target, backupFile);
        try {
          fs.renameSync(stageFile, target);
          replaced.push(relativePath);
        } catch (error) {
          try {
            fs.renameSync(backupFile, target);
          } catch (restoreError) {
            error.restoreError = restoreError;
          }
          throw error;
        }
      }
    } catch (error) {
      const restorationErrors = [];
      if (error.restoreError) restorationErrors.push(error.restoreError);
      for (const relativePath of replaced.reverse()) {
        const target = assertContained(this.root, relativePath, 'Generated output');
        const backupFile = assertContained(backup, relativePath, 'Backup output');
        try {
          const targetStat = lstatOrNull(target);
          if (targetStat) {
            if (!targetStat.isFile() || targetStat.isSymbolicLink()) throw new Error(`Cannot safely replace failed output '${relativePath}'.`);
            fs.unlinkSync(target);
          }
          const backupStat = lstatOrNull(backupFile);
          if (!backupStat?.isFile() || backupStat.isSymbolicLink()) throw new Error(`Backup is unavailable for '${relativePath}'.`);
          fs.renameSync(backupFile, target);
          const restoredStat = lstatOrNull(target);
          if (!restoredStat?.isFile() || restoredStat.isSymbolicLink()) throw new Error(`Restoration could not be verified for '${relativePath}'.`);
        } catch (restoreError) {
          restorationErrors.push(restoreError);
        }
      }
      if (restorationErrors.length) {
        removeStage = false;
        const details = restorationErrors.map((restoreError) => restoreError.message).join('; ');
        throw new Error(`Save failed and rollback was incomplete. Recovery files were preserved at ${stageRoot}. Original error: ${error.message}. Restoration error: ${details}`);
      }
      throw new Error(`No edit was saved: ${error.message}`);
    } finally {
      if (removeStage) fs.rmSync(stageRoot, { recursive: true, force: true });
    }
    this.sourceHash = sha256(plan.files['site.json']);
    this.outputHashes = new Map(this.planKeys.map((relativePath) => [relativePath, sha256(plan.files[relativePath])]));
  }

  storeImage(bytes) {
    this.verifyIntegrity();
    const dimensions = pngDimensions(bytes);
    if (!dimensions) throw Object.assign(new Error('Image must be a complete browser-encoded PNG.'), { statusCode: 415 });
    if (dimensions.width > MAX_IMAGE_DIMENSION || dimensions.height > MAX_IMAGE_DIMENSION || dimensions.width * dimensions.height > MAX_IMAGE_PIXELS) {
      throw Object.assign(new Error(`Image dimensions exceed ${MAX_IMAGE_DIMENSION}px or ${MAX_IMAGE_PIXELS} pixels.`), { statusCode: 413 });
    }
    const digest = sha256(bytes);
    const relativePath = `editor-assets/${digest}.png`;
    const directory = assertNoSymlinkPath(path.join(this.root, 'editor-assets'), 'Editor asset directory', true);
    const directoryStat = lstatOrNull(directory);
    if (directoryStat && !directoryStat.isDirectory()) throw new Error('Editor asset directory is not a directory.');
    if (!directoryStat) fs.mkdirSync(directory, { mode: 0o700 });
    const file = assertNoSymlinkPath(path.join(directory, `${digest}.png`), 'Editor asset', true);
    const existing = lstatOrNull(file);
    if (existing) {
      if (!existing.isFile() || existing.isSymbolicLink() || !safeEqual(sha256(fs.readFileSync(file)), digest)) {
        throw Object.assign(new Error('Existing content-addressed editor asset is invalid.'), { statusCode: 409 });
      }
    } else {
      const temporary = path.join(directory, `.${digest}.${crypto.randomBytes(8).toString('hex')}.tmp`);
      fs.writeFileSync(temporary, bytes, { flag: 'wx', mode: 0o600 });
      try { fs.renameSync(temporary, file); }
      finally { if (lstatOrNull(temporary)) fs.unlinkSync(temporary); }
    }
    return { path: relativePath, width: dimensions.width, height: dimensions.height };
  }

  publicFile(relativePath) {
    let requested = relativePath;
    if (!requested || requested.endsWith('/')) requested += 'index.html';
    requested = path.posix.normalize(requested);
    const publicGenerated = new Set(this.planKeys.filter((file) => file.endsWith('.html') || file === 'styles.css'));
    const raster = approvedRasterPaths(this.brief);
    if (!publicGenerated.has(requested) && !raster.has(requested)) return null;
    const extension = path.posix.extname(requested).toLowerCase();
    const contentType = requested.endsWith('.html') ? 'text/html; charset=utf-8' : requested === 'styles.css' ? 'text/css; charset=utf-8' : RASTER_MIME.get(extension);
    if (!contentType) return null;
    const file = assertContained(this.root, requested, 'Preview asset');
    assertNoSymlinkPath(file, 'Preview asset');
    const stat = lstatOrNull(file);
    if (!stat?.isFile() || stat.isSymbolicLink()) return null;
    if (requested.startsWith('editor-assets/')) {
      const namedHash = path.posix.basename(requested, '.png');
      if (!/^[a-f0-9]{64}$/.test(namedHash) || !safeEqual(sha256(fs.readFileSync(file)), namedHash)) return null;
    }
    return { file, stat, contentType };
  }
}

function authorizeApi(req, expectedOrigin, token) {
  if (req.method !== 'POST') throw Object.assign(new Error('API endpoints require POST.'), { statusCode: 405 });
  if (req.headers.origin !== expectedOrigin) throw Object.assign(new Error('Exact editor Origin required.'), { statusCode: 403 });
  if (!safeEqual(req.headers[TOKEN_HEADER] || '', token)) throw Object.assign(new Error('Valid editor token required.'), { statusCode: 403 });
}

function createServer(session, port, token) {
  const exactHost = `127.0.0.1:${port}`;
  const exactOrigin = `http://${exactHost}`;
  return http.createServer(async (req, res) => {
    try {
      if (req.headers.host !== exactHost) throw Object.assign(new Error('Exact loopback Host required.'), { statusCode: 421 });
      const url = new URL(req.url, exactOrigin);
      if (url.search) throw Object.assign(new Error('Query parameters are not accepted.'), { statusCode: 400 });
      if (url.pathname === '/__editor__/' && (req.method === 'GET' || req.method === 'HEAD')) {
        const nonce = crypto.randomBytes(18).toString('base64url');
        const body = renderEditorUi({ nonce });
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Length': Buffer.byteLength(body),
          'Cache-Control': 'no-store',
          'Content-Security-Policy': `default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; connect-src 'self'; frame-src 'self'; img-src 'self' data:`,
          'Referrer-Policy': 'no-referrer',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
        });
        res.end(req.method === 'HEAD' ? undefined : body);
        return;
      }
      if (API_ENDPOINTS.has(url.pathname)) {
        authorizeApi(req, exactOrigin, token);
        if (url.pathname === '/__api/image') {
          if (String(req.headers['content-type'] || '').toLowerCase() !== 'image/png') throw Object.assign(new Error('Image upload must be image/png.'), { statusCode: 415 });
          const bytes = await readBody(req, IMAGE_LIMIT);
          jsonResponse(res, 200, session.storeImage(bytes));
          return;
        }
        const payload = await readJson(req);
        if (url.pathname === '/__api/state') jsonResponse(res, 200, session.state());
        else if (url.pathname === '/__api/save') jsonResponse(res, 200, session.save(payload));
        else if (url.pathname === '/__api/undo') jsonResponse(res, 200, session.history('undo', payload.sourceHash));
        else jsonResponse(res, 200, session.history('redo', payload.sourceHash));
        return;
      }
      if (url.pathname.startsWith('/__api/')) throw Object.assign(new Error('Unknown API endpoint.'), { statusCode: 404 });
      if (url.pathname.startsWith('/__preview__/') && (req.method === 'GET' || req.method === 'HEAD')) {
        let relativePath;
        try { relativePath = decodeURIComponent(url.pathname.slice('/__preview__/'.length)); }
        catch { throw Object.assign(new Error('Invalid preview path encoding.'), { statusCode: 400 }); }
        if (relativePath.split('/').some((segment) => segment.startsWith('.') || segment === '..')) throw Object.assign(new Error('Preview path is forbidden.'), { statusCode: 403 });
        const asset = session.publicFile(relativePath);
        if (!asset) throw Object.assign(new Error('Preview file is not approved.'), { statusCode: 404 });
        res.writeHead(200, {
          'Content-Type': asset.contentType,
          'Content-Length': asset.stat.size,
          'Cache-Control': 'no-store',
          'Content-Security-Policy': asset.contentType.startsWith('text/html') ? "default-src 'none'; base-uri 'none'; form-action 'none'; script-src 'none'; style-src 'self'; img-src 'self' https:; connect-src 'none'; object-src 'none'; frame-src 'none'" : "default-src 'none'",
          'Referrer-Policy': 'no-referrer',
          'X-Content-Type-Options': 'nosniff',
        });
        if (req.method === 'HEAD') res.end();
        else fs.createReadStream(asset.file).pipe(res);
        return;
      }
      throw Object.assign(new Error('Not found.'), { statusCode: 404 });
    } catch (error) {
      if (!res.headersSent) jsonResponse(res, error.statusCode || 500, { error: error.message || 'Internal editor error.' });
      else res.destroy();
    }
  });
}

function main() {
  let options;
  try { options = parseArgs(process.argv.slice(2)); }
  catch (error) { console.error(`Error: ${error.message}`); usage(); process.exitCode = 1; return; }
  if (options.help) { usage(); return; }
  try {
    const session = new EditorSession(options.dir);
    const token = crypto.randomBytes(32).toString('base64url');
    const server = createServer(session, options.port, token);
    server.on('error', (error) => { console.error(`Editor server error: ${error.message}`); process.exitCode = 1; });
    server.listen(options.port, '127.0.0.1', () => {
      console.log(`\nVisual editor: http://127.0.0.1:${options.port}/__editor__/#${token}`);
      console.log(`Site directory: ${session.root}`);
      console.log('Loopback only. Keep this one-session URL private. Press Ctrl+C to stop.\n');
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
