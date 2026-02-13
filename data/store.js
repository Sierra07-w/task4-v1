const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const useMongo = !!process.env.MONGO_URI;

let UserModel, WorkoutModel;
if (useMongo) {
  try {
    UserModel = require('../models/User');
    WorkoutModel = require('../models/Workout');
  } catch (e) {
    // ignore
  }
}

async function createLowdb(){
  const { Low } = require('lowdb');
  const { JSONFile } = require('lowdb/node');
  const dbDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  const file = path.join(dbDir, 'db.json');
  const adapter = new JSONFile(file);
  const db = new Low(adapter);
  await db.read();
  db.data ||= { workouts: [], users: [], lastId: { workouts: 0, users: 0 } };
  await db.write();
  return db;
}

// Expose a uniform API for users and workouts
const store = {
  async init(){
    if (!useMongo) {
      this.db = await createLowdb();
    }
  },
  user: {
    async findOne(query){
      if (useMongo) return UserModel.findOne(query).exec();
      const db = store.db; await db.read();
      return db.data.users.find(u => (query.username && u.username === query.username) || (query.email && u.email === query.email)) || null;
    },
    async create(doc){
      if (useMongo) return UserModel.create(doc);
      const db = store.db; await db.read();
      const id = ++db.data.lastId.users; const user = Object.assign({ _id: String(id) }, doc); db.data.users.push(user); await db.write(); return user;
    },
    async deleteMany(){
      if (useMongo) return UserModel.deleteMany();
      const db = store.db; await db.read(); db.data.users = []; db.data.lastId.users = 0; await db.write();
    }
  },
  workout: {
    async find(filter = {}){
      if (useMongo) return WorkoutModel.find(filter).sort({ date: -1 }).limit(100).exec();
      const db = store.db; await db.read(); return db.data.workouts.slice().sort((a,b)=> new Date(b.date)-new Date(a.date));
    },
    async findById(id){
      if (useMongo) return WorkoutModel.findById(id).exec();
      const db = store.db; await db.read(); return db.data.workouts.find(w => w._id === id) || null;
    },
    async insert(doc){
      if (useMongo) return WorkoutModel.create(doc);
      const db = store.db; await db.read(); const id = ++db.data.lastId.workouts; const item = Object.assign({ _id: String(id) }, doc); db.data.workouts.push(item); await db.write(); return item;
    },
    async insertMany(arr){
      if (useMongo) return WorkoutModel.insertMany(arr);
      const db = store.db; await db.read(); for (const doc of arr){ const id = ++db.data.lastId.workouts; db.data.workouts.push(Object.assign({ _id: String(id) }, doc)); } await db.write(); return db.data.workouts;
    },
    async findByIdAndUpdate(id, updates){
      if (useMongo) return WorkoutModel.findByIdAndUpdate(id, updates, { new: true }).exec();
      const db = store.db; await db.read(); const idx = db.data.workouts.findIndex(w => w._id === id); if (idx === -1) return null; db.data.workouts[idx] = Object.assign({}, db.data.workouts[idx], updates); await db.write(); return db.data.workouts[idx];
    },
    async findByIdAndDelete(id){
      if (useMongo) return WorkoutModel.findByIdAndDelete(id).exec();
      const db = store.db; await db.read(); const idx = db.data.workouts.findIndex(w => w._id === id); if (idx === -1) return null; const [item] = db.data.workouts.splice(idx,1); await db.write(); return item;
    },
    async deleteMany(){
      if (useMongo) return WorkoutModel.deleteMany();
      const db = store.db; await db.read(); db.data.workouts = []; db.data.lastId.workouts = 0; await db.write();
    }
  }
};

module.exports = store;
