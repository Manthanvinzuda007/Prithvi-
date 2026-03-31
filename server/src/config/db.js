const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readDB(filename) {
  const filepath = path.join(DATA_DIR, `${filename}.json`);
  try {
    if (!fs.existsSync(filepath)) return [];
    const raw = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[DB] Failed to read ${filename}:`, err.message);
    return [];
  }
}

function writeDB(filename, data) {
  const filepath = path.join(DATA_DIR, `${filename}.json`);
  const tempPath = filepath + '.tmp';
  try {
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempPath, json, 'utf-8');
    fs.renameSync(tempPath, filepath);
    return true;
  } catch (err) {
    console.error(`[DB] Failed to write ${filename}:`, err.message);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    return false;
  }
}

function findOne(filename, predicate) {
  return readDB(filename).find(predicate) || null;
}

function findAll(filename, predicate) {
  const data = readDB(filename);
  return predicate ? data.filter(predicate) : data;
}

function insert(filename, record) {
  const data = readDB(filename);
  data.push(record);
  writeDB(filename, data);
  return record;
}

function update(filename, predicate, updater) {
  const data = readDB(filename);
  let count = 0;
  const updated = data.map(item => {
    if (predicate(item)) { count++; return { ...item, ...updater(item) }; }
    return item;
  });
  writeDB(filename, updated);
  return count;
}

function remove(filename, predicate) {
  const data = readDB(filename);
  const filtered = data.filter(item => !predicate(item));
  writeDB(filename, filtered);
  return data.length - filtered.length;
}

module.exports = { readDB, writeDB, findOne, findAll, insert, update, remove };
