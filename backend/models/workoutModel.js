const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../data/workouts.json');

function read() {
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, '[]');
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return [];
  }
}

function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getAll() {
  return read().sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt));
}

function create(fields) {
  const all = read();
  const workout = { id: makeId(), ...fields, createdAt: new Date().toISOString() };
  all.push(workout);
  write(all);
  return workout;
}

function remove(id) {
  const all = read();
  const idx = all.findIndex((w) => w.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  write(all);
  return true;
}

module.exports = { getAll, create, remove };
