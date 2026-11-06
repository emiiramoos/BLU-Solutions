import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'docs/asset-manifest.json');
const previous = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
function walk(directory) {
  return fs.readdirSync(directory, {withFileTypes:true}).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const files = walk(path.join(root, 'dist')).sort().map(file => {
  const data = fs.readFileSync(file);
  return {path:path.relative(root,file), bytes:data.length, sha256:createHash('sha256').update(data).digest('hex')};
});
fs.writeFileSync(manifestPath, JSON.stringify({source:previous.source, revision:'Procurement collections and depth introduction', files}, null, 2) + '\n');
console.log(`Updated manifest: ${files.length} files.`);
