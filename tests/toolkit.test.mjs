import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,existsSync,mkdirSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const temp=()=>mkdtempSync(join(tmpdir(),'wd-toolkit-'));
const run=(script,args)=>spawnSync(process.execPath,[join(root,'scripts',script),...args],{encoding:'utf8',timeout:3000});
test('copy advisory finishes, locates visible cliches, and preserves source',()=>{
 const f=join(temp(),'copy.html');const source='<script>delve</script>\n<p>A seamless service. Leverage our help.</p>\n<p>Price $49, maybe ready in June.</p>';
 writeFileSync(f,source);const r=run('copy-check.mjs',[`--file=${f}`,'--json']);
 assert.equal(r.error,undefined,'Copy checker must terminate');assert.equal(r.status,1,r.stderr);
 const report=JSON.parse(r.stdout);assert.equal(report.findings.length,2);assert.ok(report.findings.every(x=>x.line===2));assert.equal(readFileSync(f,'utf8'),source);
});
test('copy advisory ignores markup and recognizes encoded visible punctuation',()=>{
 const f=join(temp(),'copy.html');writeFileSync(f,'<!-- leverage -->\n<style>.seamless{}</style>\n<a title="delve > leverage">Clear &mdash; concise</a>');
 const r=run('copy-check.mjs',[`--file=${f}`,'--json']);assert.equal(r.error,undefined);assert.equal(r.status,1);const report=JSON.parse(r.stdout);assert.equal(report.findings.length,1);assert.equal(report.findings[0].line,3);
});
test('capture refuses an existing destination without changing its contents',()=>{
 const dir=temp();const f=join(dir,'reference.json');writeFileSync(f,'participant original');const r=run('capture-reference.mjs',['https://example.com',`--target=${dir}`]);assert.notEqual(r.status,0);assert.equal(readFileSync(f,'utf8'),'participant original');
});
test('reference initialization refuses invalid URL, fake image and unknown arguments',()=>{
 const base=temp();const image=join(base,'fake.png');writeFileSync(image,'not an image');
 for(const args of [['--url=https://'],[`--image=${image}`],['--url=https://example.com','--bogus']]) {const dest=join(base,Math.random().toString(16).slice(2));const r=run('reference-project.mjs',[`--target=${dest}`,...args]);assert.notEqual(r.status,0);assert.equal(existsSync(dest),false);}
});
test('reference initialization rejects user symlink ancestors',()=>{
 const base=temp();const real=join(base,'real');mkdirSync(real);symlinkSync(real,join(base,'alias'),'dir');const r=run('reference-project.mjs',['--url=https://example.com',`--target=${join(base,'alias','project')}`]);assert.notEqual(r.status,0);assert.equal(existsSync(join(real,'project')),false);
});


test('image reference preserves image bytes and records pixels without guessing CSS viewport',()=>{
 const base=temp();const image=join(base,'reference.png');const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a4b8AAAAASUVORK5CYII=','base64');writeFileSync(image,bytes);const target=join(base,'ref');const result=run('reference-project.mjs',[`--target=${target}`,`--image=${image}`,'--mode=adapt']);assert.equal(result.status,0,result.stderr);const map=JSON.parse(readFileSync(join(target,'reference-map.json'),'utf8'));assert.equal(map.imageDimensions.width,1);assert.equal(map.imageDimensions.height,1);assert.equal(map.mode,'adapt');assert.ok(map.viewport===null || map.viewport==='unknown');assert.deepEqual(readFileSync(join(target,map.sourceImage)),bytes);assert.ok(existsSync(join(target,'reference-compare.html')));
});


test('reference project includes the full interactive comparator rather than a placeholder',()=>{
 const target=join(temp(),'ref');assert.equal(run('reference-project.mjs',[`--target=${target}`,'--url=https://example.com']).status,0);assert.equal(readFileSync(join(target,'reference-compare.html'),'utf8'),readFileSync(join(root,'skills/masterminds-web-designer/tools/reference-compare.html'),'utf8'));
});

test("copy help is available without a file and malformed character references stay advisory",()=>{
 for(const flag of ["--help","-h"]){const r=run("copy-check.mjs",[flag]);assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/usage/i)}
 const f=join(temp(),"copy.html");const text="<p>Clear &#99999999; and &#x110000; text.</p>";writeFileSync(f,text);const r=run("copy-check.mjs",["--file="+f,"--json"]);assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).advisory,true);assert.equal(readFileSync(f,"utf8"),text);
});
