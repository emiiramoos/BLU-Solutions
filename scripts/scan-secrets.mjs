import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pattern=['AKIA[0-9A-Z]{16}','gh[pousr]_[A-Za-z0-9]{30,}','github_pat_[A-Za-z0-9_]{40,}','sk-(proj-)?[A-Za-z0-9_-]{24,}','-----BEGIN [A-Z ]*PRIVATE KEY-----'].join('|');
const commits=execFileSync('git',['rev-list','--all'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean);
const findings=[];
function scan(args,label){
  try{
    const result=execFileSync('git',['grep','-I','-l','-E',...args,pattern],{cwd:root,encoding:'utf8',timeout:30000,stdio:['ignore','pipe','pipe']}).trim();
    if(result)findings.push(label+': '+result);
  }catch(error){if(error.status!==1)throw error;}
}
// Scan tracked working files and every reachable commit. Print paths, never secret values.
scan([], 'Working tree');
for(const commit of commits){
  try{const result=execFileSync('git',['grep','-I','-l','-E',pattern,commit],{cwd:root,encoding:'utf8',timeout:30000,stdio:['ignore','pipe','pipe']}).trim();if(result)findings.push(result);}
  catch(error){if(error.status!==1)throw error;}
}
function walk(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{const p=path.join(directory,entry.name);if(entry.isSymbolicLink())throw Error('Symlink not allowed in publication: '+p);return entry.isDirectory()?walk(p):[p]});}
const files=walk(path.join(root,'dist'));
for(const file of files){
  if(/(^|\/)(\.env(?:\.|$)|\.git(?:\/|$)|id_rsa)|\.(?:pem|key)$/i.test(file))findings.push('Private file in publication: '+path.relative(root,file));
  if(!/\.(?:html|css|js|json|webp|svg|woff2|pdf)$/.test(file)&&path.basename(file)!=='_headers')findings.push('Unexpected public file type: '+path.relative(root,file));
}
if(findings.length){console.error('Possible credentials or private files detected. Review and rotate credentials if real. History was not rewritten.\n'+findings.join('\n'));process.exitCode=1;}
else console.log(`Security scan passed: working files, ${commits.length} reachable commits and ${files.length} public files. Pattern-based scan; not a guarantee against every secret format.`);
