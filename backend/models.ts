import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// ── SCHEMAS ──────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  displayName: { type: String },
  photoURL: { type: String },
  balance: { type: Number, default: 10000 },
  createdAt: { type: Date, default: Date.now }
});

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'completed' },
  timestamp: { type: Date, default: Date.now }
});

const tradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assetId: { type: String, required: true },
  assetName: { type: String, required: true },
  type: { type: String, enum: ['buy', 'sell'], required: true },
  amount: { type: Number, required: true },       // dollar amount invested (margin)
  units: { type: Number, required: true },         // units purchased
  lots: { type: Number, default: 1 },              // number of lots
  multiplier: { type: Number, default: 1 },        // contract multiplier (e.g. 100 for gold)
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number },
  profit: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  timestamp: { type: Date, default: Date.now },
  closedAt: { type: Date }
});

const kycSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  email:       { type: String, required: true },
  fullName:    { type: String, required: true },
  dob:         { type: String, required: true },
  country:     { type: String, required: true },
  idType:      { type: String, enum: ['passport', 'national_id', 'drivers_license'], required: true },
  idNumber:    { type: String, required: true },
  idPhotoUrl:  { type: String },           // base64 or URL
  selfieUrl:   { type: String },
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt:  { type: Date },
});

const customAssetSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  volatility: { type: Number, required: true },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const manipulationSchema = new mongoose.Schema({
  assetId: { type: String, required: true, unique: true },
  direction: { type: String, enum: ['up', 'down', 'normal'], default: 'normal' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }
});

// ── LOCAL JSON FALLBACK MOCK SYSTEM ──────────────────────────────────────────
const DB_FILE = path.join(process.cwd(), 'db.json');

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

class MockQuery {
  private promise: Promise<any[]>;
  constructor(promise: Promise<any[]>) {
    this.promise = promise;
  }
  sort(sortObj: any) {
    this.promise = this.promise.then(items => {
      const key = Object.keys(sortObj)[0];
      const order = sortObj[key]; // 1 or -1
      return [...items].sort((a, b) => {
        let valA = a[key];
        let valB = b[key];
        if (valA instanceof Date) valA = valA.getTime();
        if (valB instanceof Date) valB = valB.getTime();
        if (typeof valA === 'string' && !isNaN(Date.parse(valA))) valA = new Date(valA).getTime();
        if (typeof valB === 'string' && !isNaN(Date.parse(valB))) valB = new Date(valB).getTime();
        if (valA < valB) return order === 1 ? -1 : 1;
        if (valA > valB) return order === 1 ? 1 : -1;
        return 0;
      });
    });
    return this;
  }
  limit(n: number) {
    this.promise = this.promise.then(items => items.slice(0, n));
    return this;
  }
  then(onfulfilled?: (value: any[]) => any, onrejected?: (reason: any) => any) {
    return this.promise.then(onfulfilled, onrejected);
  }
  catch(onrejected?: (reason: any) => any) {
    return this.promise.catch(onrejected);
  }
}

class MockModel {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  getCollection() {
    const db = readDb();
    if (!db[this.name]) {
      db[this.name] = [];
    }
    return db[this.name];
  }

  saveCollection(items: any[]) {
    const db = readDb();
    db[this.name] = items;
    writeDb(db);
  }

  find(query?: any) {
    const p = Promise.resolve().then(() => {
      let items = this.getCollection();
      if (query) {
        items = items.filter((item: any) => {
          for (const key in query) {
            const queryVal = query[key];
            if (queryVal && typeof queryVal === 'object') {
              if (queryVal.$lte !== undefined) {
                const itemTime = new Date(item[key]).getTime();
                const compareTime = new Date(queryVal.$lte).getTime();
                if (itemTime > compareTime) return false;
              }
            } else if (item[key] !== queryVal) {
              return false;
            }
          }
          return true;
        });
      }
      return items.map((item: any) => this.wrapDoc(item));
    });
    return new MockQuery(p);
  }

  async findOne(query: any) {
    const res = await this.find(query);
    return res[0] || null;
  }

  async findById(id: any) {
    const items = this.getCollection();
    const item = items.find((item: any) => String(item._id) === String(id));
    return item ? this.wrapDoc(item) : null;
  }

  async create(doc: any) {
    const items = this.getCollection();
    const newDoc = {
      _id: doc._id || Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      ...doc
    };
    items.push(newDoc);
    this.saveCollection(items);
    return this.wrapDoc(newDoc);
  }

  async findOneAndUpdate(query: any, update: any, options?: any) {
    const items = this.getCollection();
    let doc = items.find((item: any) => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });

    if (!doc && options?.upsert) {
      const newDoc = {
        _id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        ...query,
        ...update,
      };
      items.push(newDoc);
      this.saveCollection(items);
      return this.wrapDoc(newDoc);
    }

    if (doc) {
      Object.assign(doc, update);
      this.saveCollection(items);
      return this.wrapDoc(doc);
    }
    return null;
  }

  async findByIdAndUpdate(id: any, update: any, options?: any) {
    const items = this.getCollection();
    const doc = items.find((item: any) => String(item._id) === String(id));
    if (doc) {
      if (update.$set) {
        Object.assign(doc, update.$set);
      } else {
        Object.assign(doc, update);
      }
      this.saveCollection(items);
      return this.wrapDoc(doc);
    }
    return null;
  }

  async deleteOne(query: any) {
    let items = this.getCollection();
    const initialLen = items.length;
    items = items.filter((item: any) => {
      for (const key in query) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
    this.saveCollection(items);
    return { deletedCount: initialLen - items.length };
  }

  async deleteMany(query: any) {
    let items = this.getCollection();
    const initialLen = items.length;
    items = items.filter((item: any) => {
      for (const key in query) {
        const queryVal = query[key];
        if (queryVal && typeof queryVal === 'object') {
          if (queryVal.$lte !== undefined) {
            const itemTime = new Date(item[key]).getTime();
            const compareTime = new Date(queryVal.$lte).getTime();
            if (itemTime <= compareTime) return false;
          }
        } else if (item[key] === queryVal) {
          return false;
        }
      }
      return true;
    });
    this.saveCollection(items);
    return { deletedCount: initialLen - items.length };
  }

  wrapDoc(item: any) {
    if (!item) return null;
    const model = this;
    const doc = { ...item };
    Object.defineProperty(doc, 'save', {
      enumerable: false,
      value: async function() {
        const items = model.getCollection();
        const index = items.findIndex((i: any) => String(i._id) === String(doc._id));
        if (index !== -1) {
          items[index] = { ...doc };
          model.saveCollection(items);
        } else {
          items.push({ ...doc });
          model.saveCollection(items);
        }
        return doc;
      }
    });
    return doc;
  }
}

function createSmartModel(modelName: string, mongooseModel: any) {
  const mock = new MockModel(modelName);
  return new Proxy(mongooseModel, {
    get(target, prop, receiver) {
      const isConnected = mongoose.connection.readyState === 1;
      if (isConnected) {
        return Reflect.get(target, prop, receiver);
      } else {
        const mockProp = Reflect.get(mock, prop);
        if (typeof mockProp === 'function') {
          return mockProp.bind(mock);
        }
        return mockProp;
      }
    }
  });
}

// ── MODEL EXPORTS ────────────────────────────────────────────────────────────
const userModel = mongoose.model('User', userSchema);
export const User = createSmartModel('User', userModel) as any;

const transactionModel = mongoose.model('Transaction', transactionSchema);
export const Transaction = createSmartModel('Transaction', transactionModel) as any;

const tradeModel = mongoose.model('Trade', tradeSchema);
export const Trade = createSmartModel('Trade', tradeModel) as any;

const kycModel = mongoose.model('KYC', kycSchema);
export const KYC = createSmartModel('KYC', kycModel) as any;

const customAssetModel = mongoose.model('CustomAsset', customAssetSchema);
export const CustomAsset = createSmartModel('CustomAsset', customAssetModel) as any;

const manipulationModel = mongoose.model('Manipulation', manipulationSchema);
export const Manipulation = createSmartModel('Manipulation', manipulationModel) as any;
