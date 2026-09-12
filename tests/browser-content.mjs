// Optional real-browser regression. Run: WEB_DESIGNER_PLAYWRIGHT_PATH=/absolute/playwright/index.mjs node tests/browser-content.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const imported=await import(process.env.WEB_DESIGNER_PLAYWRIGHT_PATH ? pathToFileURL(process.env.WEB_DESIGNER_PLAYWRIGHT_PATH).href : 'playwright');
const {chromium}=imported.default||imported;
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'web-designer-content-')));
const browser=await chromium.launch({headless:true});const records=[];
try {const page=await browser.newPage({reducedMotion:'reduce'});
 for(const style of ['service','portfolio','event']) {
 const site=path.join(output,style);
 execFileSync(process.execPath,[path.join(root,'scripts/create-site.mjs'),`--target=${site}`,`--style=${style}`,'--name=Northumberland Independent Architecture and Design Studio','--headline=Thoughtful spaces for the way you live, work and gather with the people who matter to you','--email=hello@northumberlandarchitectureanddesign.example']);
 for(const width of [320,375,768,1440]) {
  await page.setViewportSize({width,height:900});await page.goto(pathToFileURL(path.join(site,'index.html')).href);
  const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1Height:document.querySelector('h1').getBoundingClientRect().height,text:document.body.innerText}));
  const screenshot=path.join(output,`${style}-${width}.png`);await page.screenshot({path:screenshot,fullPage:true});records.push({style,...metrics,screenshot});
  assert.ok(metrics.scrollWidth<=width+1,`${style} overflow at ${width}: ${metrics.scrollWidth}`);
  assert.ok(metrics.text.includes('hello@northumberlandarchitectureanddesign.example'));
  if(style==='service'&&width===1440)assert.ok(metrics.h1Height<500,'Long headline displaces the desktop hero');
 }
 }
} finally {fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(records,null,2));await browser.close();console.log(`Browser evidence: ${output}`);}
