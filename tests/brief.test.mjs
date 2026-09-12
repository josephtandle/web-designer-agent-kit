import {fileURLToPath} from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const cli=new URL('../scripts/create-site.mjs',import.meta.url);
test('full brief populates every page with shared navigation and supplied facts',()=>{
 const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'wd-brief-')));
 const input={schemaVersion:1,name:'Harbor Textile Studio',navigation:[{label:'Home',href:'index.html'},{label:'Work',href:'work/index.html'}],footer:{text:'Made by Harbor',links:[]},pages:[{path:'index.html',title:'Harbor Textile Studio',description:'Textiles and paper work by Harbor.',sections:[{id:'welcome',type:'hero-split',title:'Woven stories for everyday rooms',body:'Handwoven in my studio.'},{id:'services',type:'services-rows',title:'What I make',items:[{title:'Chair weaving',body:'Repairs use the existing frame.'}]}]},{path:'work/index.html',title:'Work by Harbor',description:'Supplied studio work.',sections:[{id:'work',type:'hero-editorial',title:'Woven Study Two',body:'Indigo cotton, 2025.'},{id:'contact',type:'contact-band',title:'Start a conversation',action:{label:'Email Harbor',href:'mailto:studio@harbor.example'}}]}]};
 const brief=path.join(root,'input.json');fs.writeFileSync(brief,JSON.stringify(input));
 const out=path.join(root,'site'); const run=spawnSync(process.execPath,[fileURLToPath(cli),`--target=${out}`,`--brief=${brief}`],{encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
 const home=fs.readFileSync(path.join(out,'index.html'),'utf8'),work=fs.readFileSync(path.join(out,'work/index.html'),'utf8');
 assert.match(home,/Chair weaving/); assert.match(work,/Indigo cotton, 2025/); assert.match(work,/studio@harbor.example/);
 assert.match(work,/\.\.\/styles.css/);assert.match(work,/aria-current="page"/); assert.match(home,/work\/index.html/);
 assert.equal(JSON.parse(fs.readFileSync(path.join(out,'site.json'))).name,input.name);
});

const minimal=()=>({schemaVersion:1,name:'Example workshop',pages:[{path:'index.html',title:'Example workshop',description:'A supplied description.',sections:[{id:'hero',type:'hero-split',title:'Careful work',body:'Repairs may take up to 20 days.'}]}]});
function generate(input){const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'wd-invalid-'))); const source=path.join(root,'brief.json'),target=path.join(root,'site'); fs.writeFileSync(source,JSON.stringify(input));const run=spawnSync(process.execPath,[fileURLToPath(cli),`--target=${target}`,`--brief=${source}`],{encoding:'utf8'});return{...run,target};}
test('invalid structured values are rejected before creating a destination',()=>{
 const bad=[b=>b.pages[0].path='../index.html',b=>b.pages[0].path='%2e%2e/index.html',b=>b.pages[0].path='styles.css',b=>b.pages[0].path='scripts/index.html',b=>b.pages.push({...b.pages[0]}),b=>b.pages[0].sections[0].action={label:'Go',href:'javascript:alert(1)'},b=>b.pages[0].sections[0].image={src:'//remote.example/photo.png',alt:'A photo'},b=>b.brand={accent:'red;display:none'},b=>b.pages[0].sections[0].unknown='Silently lost fact',b=>b.pages[0].sections[0].items=[{title:'Offer',unsupported:'Lost fact'}],b=>b.pages[0].sections[0].action={label:'Go',href:'https://user:secret@example.com'},b=>b.pages[0].sections[0].action={label:'Go',href:'%6aavascript:alert(1)'},b=>b.pages[0].sections[0].action={label:'Go',href:'%2e%2e/private.html'}];
 for(const mutate of bad){const input=minimal();mutate(input);const result=generate(input);assert.notEqual(result.status,0,JSON.stringify(input));assert.equal(fs.existsSync(result.target),false,result.stderr);}
});
test('participant markup is escaped and qualifications remain exact',()=>{const input=minimal(); input.name='<script>alert("name")</script>';input.pages[0].sections[0].body='Repairs may take up to 20 days. <img src=x onerror=alert(1)>';const result=generate(input);assert.equal(result.status,0,result.stderr);const html=fs.readFileSync(path.join(result.target,'index.html'),'utf8');assert.match(html,/Repairs may take up to 20 days\./);assert.doesNotMatch(html,/<script>alert/);assert.doesNotMatch(html,/<img src=x/);assert.match(html,/&lt;img/);});
test('cross-page links and missing fragments are checked before write',()=>{for(const href of ['missing/index.html','index.html#missing']){const input=minimal();input.navigation=[{label:'Missing',href}];const result=generate(input);assert.notEqual(result.status,0);assert.equal(fs.existsSync(result.target),false);}});
