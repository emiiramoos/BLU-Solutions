import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const errors = [];
const catalog = JSON.parse(fs.readFileSync(path.join(dist, 'assets/catalog.json'), 'utf8'));
function localReference(value, from) {
  if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) return;
  const clean = decodeURIComponent(value.split(/[?#]/)[0]);
  if (!clean) return;
  const target = path.resolve(clean.startsWith('/') ? dist : path.dirname(from), clean.replace(/^\//, ''));
  if (!target.startsWith(dist + path.sep) || !fs.existsSync(target)) errors.push(`${path.relative(root, from)}: ${value}`);
}
if (catalog.length !== 482) errors.push(`Se esperaban 482 referencias; hay ${catalog.length}.`);
for (const [i, product] of catalog.entries()) {
  for (const key of ['name', 'category', 'area', 'description', 'image']) {
    if (!product[key]) errors.push(`Referencia ${i + 1}: falta ${key}.`);
  }
  localReference(product.image, path.join(dist, 'index.html'));
}
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const files = walk(dist);
for (const file of files) {
  const buffer = fs.readFileSync(file);
  if (!buffer.length) errors.push(`Archivo vacío: ${path.relative(root, file)}`);
  if (file.endsWith('.pdf') && buffer.subarray(0, 5).toString() !== '%PDF-') errors.push(`PDF inválido: ${file}`);
  if (file.endsWith('.webp') && (buffer.subarray(0, 4).toString() !== 'RIFF' || buffer.subarray(8, 12).toString() !== 'WEBP')) errors.push(`WebP inválido: ${file}`);
  if (/\.(html|css|js)$/.test(file)) {
    const source = buffer.toString('utf8');
    for (const match of source.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']|url\(\s*["']?([^\s)'";]+)|(?:fetch\(\s*|(?:src|image)\s*[:=]\s*)["']([^"']+)["']/g)) {
      localReference(match[1] || match[2] || match[3], file);
    }
  }
}
const manifestFile = path.join(root, 'docs/asset-manifest.json');
if (fs.existsSync(manifestFile)) {
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  if (manifest.files.length !== files.length) errors.push('El número de archivos difiere del manifiesto.');
  for (const entry of manifest.files) {
    const file = path.resolve(root, entry.path);
    if (!fs.existsSync(file)) { errors.push(`Falta ${entry.path}`); continue; }
    const data = fs.readFileSync(file);
    if (data.length !== entry.bytes || createHash('sha256').update(data).digest('hex') !== entry.sha256) errors.push(`Contenido distinto al respaldo: ${entry.path}`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`OK: ${catalog.length} referencias, ${files.length} archivos, enlaces locales y huellas SHA-256 verificados.`);
