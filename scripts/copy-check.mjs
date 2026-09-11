#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { regular } from './lib/safe-paths.mjs'
let file = null, json = false
for (const arg of process.argv.slice(2)) { if (arg === '--help' || arg === '-h') { console.log('Usage: node scripts/copy-check.mjs --file=PATH [--json]'); process.exit(0) } else if (arg.startsWith('--file=')) file = arg.slice(7).trim(); else if (arg === '--json') json = true; else { console.error(`Error: unknown option ${arg}`); process.exit(2) } }
if (!file) { console.error('Error: --file=PATH is required.'); process.exit(2) }
const path = resolve(file); if (!regular(path)) { console.error(`Error: input is missing or not a regular file: ${path}`); process.exit(2) }
const rules = [['em dash', /—/g], ['canned phrase: delve', /\bdelve(?:s|d|ing)?\b/gi], ['canned phrase: leverage', /\bleverage(?:s|d|ing)?\b/gi], ['canned phrase: seamless', /\bseamless(?:ly)?\b/gi], ['prompt residue: as an ai', /\bas an ai\b/gi], ['prompt residue: happy to help', /\bhappy to help\b/gi]]
function tagEnd(html, start) { let quote = null; for (let i = start + 1; i < html.length; i++) { const c = html[i]; if (quote) { if (c === quote) quote = null } else if (c === '"' || c === "'") quote = c; else if (c === '>') return i } return -1 }
function visible(html) { let i=0, line=1, text='', out=[]; const push=c=>text+=c, newline=()=>{ out.push({line,text}); text=''; line++ }; while(i<html.length) { if(html[i]==='\n'){newline();i++;continue} if(html.startsWith('<!--',i)){ const j=html.indexOf('-->',i+4); const part=html.slice(i,j<0?html.length:j+3); for(const c of part){if(c==='\n')newline()} i+=part.length;continue } if(html[i]==='<'){ const lower=html.slice(i).match(/^<\s*(script|style)\b/i), close=tagEnd(html,i); if(close<0){i++;continue} const tag=lower?.[1]?.toLowerCase(); let end=close+1; if(tag){const match=new RegExp(`<\\/\\s*${tag}\\s*>`,'i').exec(html.slice(end)); end=match?end+match.index+match[0].length:html.length} const part=html.slice(i,end); for(const c of part){if(c==='\n')newline()} push(' '); i=end;continue } push(html[i++]) } out.push({line,text}); return out }
function decode(value) { return value.replace(/&(mdash|amp|nbsp);/gi, (_, n) => ({ mdash:'—', amp:'&', nbsp:' ' }[n.toLowerCase()])).replace(/&#x([0-9a-f]+);|&#(\d+);/gi, (entity, h, d) => { const point = Number.parseInt(h || d, h ? 16 : 10); return Number.isSafeInteger(point) && point > 0 && point <= 0x10FFFF && !(point >= 0xD800 && point <= 0xDFFF) ? String.fromCodePoint(point) : entity }) }
const raw = readFileSync(path,'utf8'), lines = /\.html?$/i.test(path) ? visible(raw) : raw.split('\n').map((text,index)=>({line:index+1,text})), findings=[]
for (const row of lines) for (const [rule, regex] of rules) for (const match of decode(row.text).matchAll(regex)) findings.push({ line:row.line, rule, match:match[0], context:decode(row.text).trim().slice(0,100) })
const report = { file, checkedAt:new Date().toISOString(), findingsCount:findings.length, findings, advisory:true }
if(json) console.log(JSON.stringify(report,null,2)); else console.log(findings.length ? `Copy advisory: ${findings.length} visible issue(s).` : 'Copy advisory: clean.')
process.exit(findings.length ? 1 : 0)
