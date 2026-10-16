'use strict';
const fs = require('fs');
const path = require('path');
const resource = GetCurrentResourceName();
const root = GetResourcePath(resource);
const sourceRoot = path.join(root, 'custom_weapons', 'sources');
const generatedRoot = path.join(root, 'custom_weapons', 'generated');
const coreTemplatesRoot = path.join(root, 'templates');
const coreOutputRoot = path.join(root, 'data');
const coreNames = [
  'weapons.meta', 'weaponmachinepistol.meta', 'weapons_pistol_mk2.meta',
  'weapons_carbinerifle_mk2.meta', 'weapons_snspistol_mk2.meta',
  'weapon_ceramicpistol.meta', 'weaponheavypistol.meta',
  'weaponcompactrifle.meta', 'weaponvintagepistol.meta'
];

function walk(dir, prefix = '') {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const rel = prefix ? path.join(prefix, entry.name) : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full, rel));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.meta')) files.push(rel);
  }
  return files.sort();
}

function patchMeta(xml, fovs) {
  xml = xml.replace(/(<\?xml\b[^>]*\bencoding\s*=\s*['"])UTF\s*-\s*8(['"][^>]*\?>)/i, '$1UTF-8$2');
  const startRe = /<Item\b[^>]*\btype\s*=\s*["']CWeaponInfo["'][^>]*>/g;
  const tokenRe = /<\/?Item\b[^>]*>/g;
  const valueRe = /(<CameraFov\s+value\s*=\s*["'])([^"']+)(["'])/;
  const nameRe = /<Name>\s*(WEAPON_[A-Z0-9_]+)\s*<\/Name>/;
  const chunks = [], matched = new Set();
  let cursor = 0, count = 0, match;
  while ((match = startRe.exec(xml)) !== null) {
    chunks.push(xml.slice(cursor, match.index));
    tokenRe.lastIndex = startRe.lastIndex;
    let depth = 1, token;
    while (depth !== 0) {
      token = tokenRe.exec(xml);
      if (!token) throw new Error('Unclosed <Item type="CWeaponInfo"> element');
      if (/^<\/Item\b/.test(token[0])) depth -= 1;
      else if (!/\/\s*>$/.test(token[0])) depth += 1;
    }
    let block = xml.slice(match.index, tokenRe.lastIndex);
    const name = nameRe.exec(block);
    if (name && Object.prototype.hasOwnProperty.call(fovs, name[1])) {
      if (!valueRe.test(block)) throw new Error(`${name[1]} is missing CameraFov`);
      const val = Number(fovs[name[1]]).toFixed(6);
      block = block.replace(valueRe, (_all, p, old, s) => p + val + s);
      matched.add(name[1]);
      count++;
    }
    chunks.push(block);
    cursor = tokenRe.lastIndex;
    startRe.lastIndex = cursor;
  }
  chunks.push(xml.slice(cursor));
  return { xml: chunks.join(''), matched, count };
}

function saveIfChanged(dest, contents) {
  if (fs.existsSync(dest) && fs.readFileSync(dest, 'utf8') === contents) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, contents, 'utf8');
  return true;
}

function apply(rawConfig) {
  let config;
  try { config = JSON.parse(rawConfig); }
  catch (e) { console.error('[Twistus FOV] Invalid JSON config: ' + e.message); return; }
  try {
    const fovs = {};
    for (const [key, value] of Object.entries(config)) {
      if (!/^WEAPON_[A-Z0-9_]+$/.test(key) || !Number.isFinite(value) || value < 20 || value > 100)
        throw new Error('Invalid FOV value or weapon name: ' + key);
      fovs[key] = value;
    }
    const matches = new Set();
    let changed = 0, customCount = 0;
    for (const name of coreNames) {
      const source = path.join(coreTemplatesRoot, name);
      if (!fs.existsSync(source)) throw new Error('Missing template: ' + source);
      const patched = patchMeta(fs.readFileSync(source, 'utf8'), fovs);
      for (const key of patched.matched) matches.add(key);
      if (saveIfChanged(path.join(coreOutputRoot, name), patched.xml)) changed++;
    }
    const wanted = new Set();
    for (const rel of walk(sourceRoot)) {
      const source = path.join(sourceRoot, rel);
      const patched = patchMeta(fs.readFileSync(source, 'utf8'), fovs);
      if (patched.count === 0) continue;
      for (const key of patched.matched) matches.add(key);
      const dest = path.join(generatedRoot, rel);
      if (saveIfChanged(dest, patched.xml)) changed++;
      wanted.add(path.normalize(rel));
      customCount += patched.count;
    }
    for (const rel of walk(generatedRoot)) {
      if (!wanted.has(path.normalize(rel))) {
        fs.unlinkSync(path.join(generatedRoot, rel));
        changed++;
      }
    }
    for (const name of Object.keys(fovs)) {
      if (!matches.has(name))
        console.warn(`[Twistus FOV] Weapon ${name} was not found in the weapon metadata (check <Name> and add the file to custom_weapons/sources/).`);
    }
    console.log(`[Twistus FOV] Complete. Custom weapon entries: ${customCount}; updated files: ${changed}.`);
    if (changed > 0) console.log(`[Twistus FOV] Run: restart ${resource}; then have players reconnect. Check the ensure order.`);
  } catch (e) {
    console.error('[Twistus FOV] Error: ' + e.stack);
  }
}

on('twistus_fov:generate', apply);
