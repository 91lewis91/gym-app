const DB_NAME = 'lewis-gym';
const DB_VERSION = 1;
let _db = null;

async function openDB() {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      const stores = {
        workouts:  { keyPath: 'id', autoIncrement: true, indexes: [['date','date'], ['programId','programId']] },
        sets:      { keyPath: 'id', autoIncrement: true, indexes: [['workoutId','workoutId'], ['exerciseId','exerciseId']] },
        metrics:   { keyPath: 'id', autoIncrement: true, indexes: [['date','date']] },
        nutrition: { keyPath: 'id', autoIncrement: true, indexes: [['date','date']] },
        cycling:   { keyPath: 'id', autoIncrement: true, indexes: [['date','date']] }
      };
      for (const [name, cfg] of Object.entries(stores)) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: cfg.keyPath, autoIncrement: cfg.autoIncrement });
          for (const [iName, iKey] of cfg.indexes) store.createIndex(iName, iKey);
        }
      }
    };
    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(store, mode, fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}

const DB = {
  add:    (store, data)    => tx(store, 'readwrite', s => s.add(data)),
  put:    (store, data)    => tx(store, 'readwrite', s => s.put(data)),
  delete: (store, id)      => tx(store, 'readwrite', s => s.delete(id)),
  getAll: (store)          => tx(store, 'readonly',  s => s.getAll()),
  getByIndex: (store, idx, val) => tx(store, 'readonly', s => s.index(idx).getAll(val)),

  async saveWorkout(w) {
    const id = await this.add('workouts', w);
    return id;
  },

  async getWorkouts() {
    const ws = await this.getAll('workouts');
    return ws.sort((a, b) => b.date - a.date);
  },

  async saveSets(sets) {
    for (const s of sets) await this.add('sets', s);
  },

  async getSetsForWorkout(workoutId) {
    return this.getByIndex('sets', 'workoutId', workoutId);
  },

  async getAllSets() {
    return this.getAll('sets');
  },

  // Returns the sets from the most recent workout that included exerciseId
  async getLastSetsForExercise(exerciseId) {
    const all = await this.getAll('sets');
    const mine = all.filter(s => s.exerciseId === exerciseId);
    if (!mine.length) return [];
    const maxWid = Math.max(...mine.map(s => s.workoutId));
    return mine.filter(s => s.workoutId === maxWid).sort((a, b) => a.setNumber - b.setNumber);
  },

  async saveMetric(m) {
    return this.add('metrics', { ...m, date: m.date || Date.now() });
  },

  async getMetrics() {
    const ms = await this.getAll('metrics');
    return ms.sort((a, b) => a.date - b.date);
  },

  async getTodayMetric() {
    const all = await this.getAll('metrics');
    const today = todayMidnight();
    return all.find(m => new Date(m.date).setHours(0,0,0,0) === today) || null;
  },

  async saveNutrition(entry) {
    return this.add('nutrition', { ...entry, date: entry.date || Date.now() });
  },

  async updateNutrition(entry) {
    return this.put('nutrition', entry);
  },

  async deleteNutrition(id) {
    return this.delete('nutrition', id);
  },

  async getTodayNutrition() {
    const all = await this.getAll('nutrition');
    const today = todayMidnight();
    return all.filter(n => new Date(n.date).setHours(0,0,0,0) === today);
  },

  async saveCycling(session) {
    return this.add('cycling', { ...session, date: session.date || Date.now() });
  },

  async getCyclingSessions() {
    const all = await this.getAll('cycling');
    return all.sort((a, b) => b.date - a.date);
  }
};

function todayMidnight() {
  const d = new Date();
  d.setHours(0,0,0,0);
  return d.getTime();
}
