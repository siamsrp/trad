import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { User, Transaction, Trade, KYC, CustomAsset, Manipulation } from './models.ts';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env file');
  process.exit(1);
}

// Initialize Firebase Admin for token verification
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (serviceAccount) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} else {
  // Dev mode: skip token verification
  console.warn('FIREBASE_SERVICE_ACCOUNT not set — auth middleware disabled (dev mode)');
}

let assets: any[] = [];

const activeManipulations = new Map<string, { direction: 'up' | 'down'; endTime: Date }>();

async function loadCustomAssetsAndManipulations() {
  try {
    // 1. Clean up expired manipulations
    await Manipulation.deleteMany({ endTime: { $lte: new Date() } });

    // 2. Load active manipulations
    const manips = await Manipulation.find();
    manips.forEach(m => {
      activeManipulations.set(m.assetId, {
        direction: m.direction as 'up' | 'down',
        endTime: m.endTime
      });
    });
    console.log(`Loaded ${activeManipulations.size} active manipulations.`);

    // 3. Load custom assets from DB
    const customs = await CustomAsset.find();
    customs.forEach(c => {
      if (!assets.some(a => a.id === c.id)) {
        assets.push({
          id: c.id,
          name: c.name,
          price: c.price,
          volatility: c.volatility,
          type: c.type
        });
      }
    });
    console.log(`Loaded ${customs.length} custom assets from database.`);
  } catch (err) {
    console.error('Error loading startup data from MongoDB:', err);
  }
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await loadCustomAssetsAndManipulations();
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Auth middleware — verifies Firebase ID token
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!serviceAccount) return next(); // dev mode bypass

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const token = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).uid = decoded.uid;
    (req as any).email = decoded.email;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// ── User routes ──────────────────────────────────────────────────────────────
app.post('/api/users/sync', async (req, res) => {
  const { email, displayName, photoURL } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) user = await User.create({ email, displayName, photoURL });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Error syncing user' });
  }
});

app.get('/api/users', requireAuth, async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (user) res.json(user);
    else res.status(404).json({ error: 'User not found' });
  } catch {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

app.patch('/api/users/:id/balance', requireAuth, async (req, res) => {
  const { balance } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { balance }, { new: true });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Error updating balance' });
  }
});

// ── Trade routes ─────────────────────────────────────────────────────────────
// Open a new trade (buy/sell)
app.post('/api/trades', async (req, res) => {
  const { email, assetId, assetName, type, amount, entryPrice, lots = 1, multiplier = 1 } = req.body;
  if (!email || !assetId || !type || !amount || !entryPrice) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  try {
    const user = await User.findOne({ email });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    if (type === 'buy' && user.balance < amount) {
      res.status(400).json({ error: 'Insufficient balance' });
      return;
    }

    const units = amount / entryPrice;
    const trade = await Trade.create({
      userId: user._id,
      assetId,
      assetName,
      type,
      amount,
      units,
      lots,
      multiplier,
      entryPrice,
      status: 'open'
    });

    // Deduct balance for buy orders
    if (type === 'buy') {
      user.balance -= amount;
      await user.save();
    }

    res.json({ trade, balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating trade' });
  }
});

// Get all trades for a user
app.get('/api/trades/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const trades = await Trade.find({ userId: user._id }).sort({ timestamp: -1 });
    res.json(trades);
  } catch {
    res.status(500).json({ error: 'Error fetching trades' });
  }
});

// Close a trade
app.patch('/api/trades/:id/close', async (req, res) => {
  const { exitPrice, email } = req.body;
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) { res.status(404).json({ error: 'Trade not found' }); return; }
    if (trade.status === 'closed') { res.status(400).json({ error: 'Trade already closed' }); return; }

    const lots = trade.lots ?? 1;
    const multiplier = trade.multiplier ?? 1;
    const profit = trade.type === 'buy'
      ? (exitPrice - trade.entryPrice) * lots * multiplier
      : (trade.entryPrice - exitPrice) * lots * multiplier;

    trade.exitPrice = exitPrice;
    trade.profit = profit;
    trade.status = 'closed';
    trade.closedAt = new Date();
    await trade.save();

    // Return proceeds to user balance
    const user = await User.findOne({ email });
    if (user) {
      user.balance += trade.amount + profit;
      await user.save();
      res.json({ trade, balance: user.balance });
    } else {
      res.json({ trade });
    }
  } catch {
    res.status(500).json({ error: 'Error closing trade' });
  }
});

// ── Transaction routes ────────────────────────────────────────────────────────
app.post('/api/transactions', async (req, res) => {
  const { email, type, amount } = req.body;
  if (!email || !type || !amount) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  try {
    const user = await User.findOne({ email });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    if (type === 'withdrawal' && user.balance < amount) {
      res.status(400).json({ error: 'Insufficient balance' });
      return;
    }

    const tx = await Transaction.create({ userId: user._id, type, amount });

    user.balance += type === 'deposit' ? amount : -amount;
    await user.save();

    res.json({ transaction: tx, balance: user.balance });
  } catch {
    res.status(500).json({ error: 'Error creating transaction' });
  }
});

app.get('/api/transactions/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const txs = await Transaction.find({ userId: user._id }).sort({ timestamp: -1 });
    res.json(txs);
  } catch {
    res.status(500).json({ error: 'Error fetching transactions' });
  }
});

// ── KYC routes ────────────────────────────────────────────────────────────────
// Submit KYC
app.post('/api/kyc', async (req, res) => {
  const { email, fullName, dob, country, idType, idNumber, idPhotoUrl, selfieUrl } = req.body;
  if (!email || !fullName || !dob || !country || !idType || !idNumber) {
    res.status(400).json({ error: 'Missing required fields' }); return;
  }
  try {
    const user = await User.findOne({ email });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const kyc = await KYC.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id, email, fullName, dob, country, idType, idNumber, idPhotoUrl, selfieUrl, status: 'pending', submittedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(kyc);
  } catch (e) { res.status(500).json({ error: 'Error submitting KYC' }); }
});

// Get KYC status for a user
app.get('/api/kyc/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const kyc = await KYC.findOne({ userId: user._id });
    res.json(kyc || null);
  } catch { res.status(500).json({ error: 'Error fetching KYC' }); }
});

// Admin: get all KYC submissions
app.get('/api/admin/kyc', async (_req, res) => {
  try {
    const kycs = await KYC.find().sort({ submittedAt: -1 });
    res.json(kycs);
  } catch { res.status(500).json({ error: 'Error fetching KYC list' }); }
});

// Admin: approve/reject KYC
app.patch('/api/admin/kyc/:id', async (req, res) => {
  const { status, rejectionReason } = req.body;
  try {
    const kyc = await KYC.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason: rejectionReason || '', reviewedAt: new Date() },
      { new: true }
    );
    res.json(kyc);
  } catch { res.status(500).json({ error: 'Error updating KYC' }); }
});

// ── Binary Trade routes ───────────────────────────────────────────────────────
app.post('/api/binary', async (req, res) => {
  const { email, assetId, assetName, direction, amount, duration } = req.body;
  if (!email || !assetId || !direction || !amount || !duration) {
    res.status(400).json({ error: 'Missing required fields' }); return;
  }
  try {
    const user = await User.findOne({ email });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    if (user.balance < amount) { res.status(400).json({ error: 'Insufficient balance' }); return; }

    const asset = assets.find(a => a.id === assetId);
    if (!asset) { res.status(404).json({ error: 'Asset not found' }); return; }

    const entryPrice = asset.price;
    const commission = duration === 30 ? 0.25 : 0.30; // 30s = 25%, 60s = 30%

    user.balance -= amount;
    await user.save();

    setTimeout(async () => {
      try {
        const exitPrice = asset.price;
        const won = direction === 'up' ? exitPrice > entryPrice : exitPrice < entryPrice;
        const profit = won ? amount * commission : -amount;
        const payout = won ? amount + (amount * commission) : 0;

        const u = await User.findOne({ email });
        if (u) { u.balance += payout; await u.save(); }

        io.emit(`binary_result_${email}`, {
          assetId, assetName, direction, amount, duration,
          entryPrice, exitPrice, won, profit, payout, commission
        });
      } catch (e) { console.error('Binary resolve error:', e); }
    }, duration * 1000);

    res.json({ success: true, entryPrice, commission, balance: user.balance });
  } catch (e) {
    res.status(500).json({ error: 'Error placing binary trade' });
  }
});

// ── Admin: Market Control ─────────────────────────────────────────────────────
app.get('/api/admin/market', (_req, res) => {
  const now = new Date();
  res.json(assets.map(a => {
    const manip = activeManipulations.get(a.id);
    let manipulation = null;
    if (manip) {
      const remainingMs = manip.endTime.getTime() - now.getTime();
      manipulation = {
        direction: manip.direction,
        endTime: manip.endTime,
        remainingSeconds: Math.max(0, Math.floor(remainingMs / 1000))
      };
    }
    return {
      id: a.id,
      name: a.name,
      price: a.price,
      volatility: a.volatility,
      type: a.type,
      manipulation
    };
  }));
});

app.post('/api/admin/market/add', async (req, res) => {
  const { id, name, price, volatility, type, manipulationDirection, manipulationDuration, manipulationUnit } = req.body;
  if (!id || !name || price === undefined || volatility === undefined || !type) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const idLower = id.toLowerCase().trim();
  if (assets.some(a => a.id === idLower)) {
    res.status(400).json({ error: 'Coin symbol/ID already exists' });
    return;
  }

  try {
    const customAsset = await CustomAsset.create({
      id: idLower,
      name: name.trim(),
      price: Number(price),
      volatility: Number(volatility),
      type
    });

    const newAsset = {
      id: idLower,
      name: customAsset.name,
      price: customAsset.price,
      volatility: customAsset.volatility,
      type: customAsset.type
    };

    assets.push(newAsset);

    // Apply immediate manipulation if set
    if (manipulationDirection === 'up' || manipulationDirection === 'down') {
      const durationVal = parseFloat(manipulationDuration) || 0;
      if (durationVal > 0) {
        let durationMs = durationVal * 1000;
        if (manipulationUnit === 'minutes') durationMs *= 60;
        else if (manipulationUnit === 'hours') durationMs *= 3600;
        else if (manipulationUnit === 'days') durationMs *= 86400;

        const endTime = new Date(Date.now() + durationMs);

        await Manipulation.findOneAndUpdate(
          { assetId: idLower },
          { assetId: idLower, direction: manipulationDirection, startTime: new Date(), endTime },
          { upsert: true, new: true }
        );

        activeManipulations.set(idLower, {
          direction: manipulationDirection,
          endTime
        });
      }
    }

    io.emit('price_update', assets);
    res.json({ success: true, asset: newAsset });
  } catch (err) {
    console.error('Error adding coin:', err);
    res.status(500).json({ error: 'Failed to add coin listing' });
  }
});

app.post('/api/admin/market/manipulate', async (req, res) => {
  const { assetId, direction, duration, durationUnit } = req.body;
  if (!assetId || !direction) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const asset = assets.find(a => a.id === assetId);
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  try {
    if (direction === 'normal') {
      await Manipulation.deleteOne({ assetId });
      activeManipulations.delete(assetId);
      res.json({ success: true, message: `Market control released for ${asset.name}` });
    } else {
      const durationVal = parseFloat(duration) || 0;
      if (durationVal <= 0) {
        res.status(400).json({ error: 'Duration must be greater than 0' });
        return;
      }

      let durationMs = durationVal * 1000;
      if (durationUnit === 'minutes') durationMs *= 60;
      else if (durationUnit === 'hours') durationMs *= 3600;
      else if (durationUnit === 'days') durationMs *= 86400;

      const endTime = new Date(Date.now() + durationMs);

      await Manipulation.findOneAndUpdate(
        { assetId },
        { assetId, direction, startTime: new Date(), endTime },
        { upsert: true, new: true }
      );

      activeManipulations.set(assetId, {
        direction: direction as 'up' | 'down',
        endTime
      });

      res.json({ success: true, message: `Market control set to ${direction} for ${asset.name}` });
    }
  } catch (err) {
    console.error('Error manipulating coin:', err);
    res.status(500).json({ error: 'Failed to apply manipulation' });
  }
});

app.patch('/api/admin/market/:id', (req, res) => {
  const { price, volatility, direction } = req.body;
  const asset = assets.find(a => a.id === req.params.id);
  if (!asset) { res.status(404).json({ error: 'Asset not found' }); return; }
  if (price !== undefined) asset.price = Math.max(0.0001, price);
  if (volatility !== undefined) asset.volatility = Math.max(0, volatility);
  if (direction === 'up') asset.price = Math.max(0.0001, asset.price * 1.005);
  if (direction === 'down') asset.price = Math.max(0.0001, asset.price * 0.995);
  io.emit('price_update', assets);
  res.json({ id: asset.id, price: asset.price, volatility: asset.volatility });
});

// ── Admin routes ─────────────────────────────────────────────────────────────
app.get('/api/admin/users', async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch { res.status(500).json({ error: 'Error fetching users' }); }
});

app.get('/api/admin/transactions', async (_req, res) => {
  try {
    const txs = await Transaction.find().sort({ timestamp: -1 }).limit(500);
    res.json(txs);
  } catch { res.status(500).json({ error: 'Error fetching transactions' }); }
});

app.get('/api/admin/trades', async (_req, res) => {
  try {
    const trades = await Trade.find().sort({ timestamp: -1 }).limit(500);
    res.json(trades);
  } catch { res.status(500).json({ error: 'Error fetching trades' }); }
});

// Admin: delete user
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Transaction.deleteMany({ userId: req.params.id });
    await Trade.deleteMany({ userId: req.params.id });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Error deleting user' }); }
});

// Admin: force deposit/withdrawal for a user
app.post('/api/admin/users/:id/fund', async (req, res) => {
  const { type, amount } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const delta = type === 'deposit' ? amount : -amount;
    user.balance = Math.max(0, user.balance + delta);
    await user.save();
    const tx = await Transaction.create({ userId: user._id, type, amount });
    res.json({ user, transaction: tx });
  } catch { res.status(500).json({ error: 'Error funding user' }); }
});

// Admin: force-close a trade
app.patch('/api/admin/trades/:id/close', async (req, res) => {
  const { exitPrice } = req.body;
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) { res.status(404).json({ error: 'Trade not found' }); return; }
    if (trade.status === 'closed') { res.status(400).json({ error: 'Already closed' }); return; }
    const lots = trade.lots ?? 1;
    const multiplier = trade.multiplier ?? 1;
    const profit = trade.type === 'buy'
      ? (exitPrice - trade.entryPrice) * lots * multiplier
      : (trade.entryPrice - exitPrice) * lots * multiplier;
    trade.exitPrice = exitPrice;
    trade.profit = profit;
    trade.status = 'closed';
    trade.closedAt = new Date();
    await trade.save();
    const user = await User.findById(trade.userId);
    if (user) { user.balance += trade.amount + profit; await user.save(); }
    res.json({ trade });
  } catch { res.status(500).json({ error: 'Error closing trade' }); }
});

// Admin: get all trades for a specific user
app.get('/api/admin/users/:id/trades', async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.params.id }).sort({ timestamp: -1 });
    res.json(trades);
  } catch { res.status(500).json({ error: 'Error fetching trades' }); }
});

// Admin: get all transactions for a specific user
app.get('/api/admin/users/:id/transactions', async (req, res) => {
  try {
    const txs = await Transaction.find({ userId: req.params.id }).sort({ timestamp: -1 });
    res.json(txs);
  } catch { res.status(500).json({ error: 'Error fetching transactions' }); }
});

// ── Market Data Engine ────────────────────────────────────────────────────────
assets = [
  // ── Crypto ──────────────────────────────────────────────────────────────────
  { id: 'btc',    name: 'Bitcoin',     price: 65000,    volatility: 10,       type: 'crypto'  },
  { id: 'eth',    name: 'Ethereum',    price: 3500,     volatility: 2,        type: 'crypto'  },
  { id: 'sol',    name: 'Solana',      price: 145,      volatility: 0.8,      type: 'crypto'  },
  { id: 'xrp',    name: 'XRP',         price: 0.62,     volatility: 0.003,    type: 'crypto'  },
  { id: 'trump',  name: 'TRUMP',       price: 12.50,    volatility: 0.3,      type: 'crypto'  },
  { id: 'doge',   name: 'Dogecoin',    price: 0.18,     volatility: 0.005,    type: 'crypto'  },
  { id: 'usdc',   name: 'USDC',        price: 1.00,     volatility: 0.0001,   type: 'crypto'  },
  { id: 'shib',   name: 'SHIB',        price: 0.000025, volatility: 0.000001, type: 'crypto'  },
  { id: 'pepe',   name: 'Pepe',        price: 0.000012, volatility: 0.0000005,type: 'crypto'  },
  { id: 'ltc',    name: 'Litecoin',    price: 85.00,    volatility: 0.4,      type: 'crypto'  },
  { id: 'bnb',    name: 'BNB',         price: 580,      volatility: 1.5,      type: 'crypto'  },
  { id: 'ada',    name: 'Cardano',     price: 0.45,     volatility: 0.002,    type: 'crypto'  },
  { id: 'dot',    name: 'Polkadot',    price: 7.20,     volatility: 0.05,     type: 'crypto'  },
  { id: 'link',   name: 'Chainlink',   price: 14.50,    volatility: 0.1,      type: 'crypto'  },
  { id: 'avax',   name: 'Avalanche',   price: 35.00,    volatility: 0.3,      type: 'crypto'  },
  { id: 'matic',  name: 'Polygon',     price: 0.85,     volatility: 0.005,    type: 'crypto'  },
  // ── Stocks ──────────────────────────────────────────────────────────────────
  { id: 'bac',    name: 'Bank of America', price: 38.50, volatility: 0.2,    type: 'stock'   },
  { id: 'nflx',   name: 'Netflix',     price: 620.00,   volatility: 2,        type: 'stock'   },
  { id: 'amzn',   name: 'Amazon',      price: 182.40,   volatility: 0.4,      type: 'stock'   },
  { id: 'googl',  name: 'Google',      price: 155.20,   volatility: 0.3,      type: 'stock'   },
  { id: 'ma',     name: 'Mastercard',  price: 480.00,   volatility: 1,        type: 'stock'   },
  { id: 'meta',   name: 'Meta',        price: 520.00,   volatility: 0.8,      type: 'stock'   },
  { id: 'tsla',   name: 'Tesla',       price: 175.30,   volatility: 0.8,      type: 'stock'   },
  { id: 'aapl',   name: 'Apple',       price: 178.50,   volatility: 0.3,      type: 'stock'   },
  { id: 'baba',   name: 'Alibaba',     price: 78.00,    volatility: 0.5,      type: 'stock'   },
  { id: 'msft',   name: 'Microsoft',   price: 415.00,   volatility: 0.5,      type: 'stock'   },
  { id: 'nvda',   name: 'NVDA',        price: 880.50,   volatility: 2,        type: 'stock'   },
  // ── Metals ──────────────────────────────────────────────────────────────────
  { id: 'gold',   name: 'Gold',        price: 2150.00,  volatility: 1,        type: 'metals'  },
  { id: 'silver', name: 'Silver',      price: 24.80,    volatility: 0.05,     type: 'metals'  },
  { id: 'copper', name: 'Copper',      price: 4.20,     volatility: 0.02,     type: 'metals'  },
  { id: 'platinum', name: 'Platinum',  price: 980.00,   volatility: 0.5,      type: 'metals'  },
  { id: 'palladium', name: 'Palladium',price: 1050.00,  volatility: 0.8,      type: 'metals'  },
  // ── Energy ──────────────────────────────────────────────────────────────────
  { id: 'oil',    name: 'Crude Oil',   price: 78.50,    volatility: 0.2,      type: 'energy'  },
  { id: 'natgas', name: 'Natural Gas', price: 2.85,     volatility: 0.03,     type: 'energy'  },
  { id: 'brent',  name: 'Brent Oil',   price: 82.30,    volatility: 0.2,      type: 'energy'  },
  // ── Forex ───────────────────────────────────────────────────────────────────
  { id: 'eurusd', name: 'EUR/USD',     price: 1.0850,   volatility: 0.0002,   type: 'forex'   },
  { id: 'usdjpy', name: 'USD/JPY',     price: 151.50,   volatility: 0.03,     type: 'forex'   },
  { id: 'audusd', name: 'AUD/USD',     price: 0.6520,   volatility: 0.0001,   type: 'forex'   },
  { id: 'usdcad', name: 'USD/CAD',     price: 1.3650,   volatility: 0.0002,   type: 'forex'   },
  { id: 'usdchf', name: 'USD/CHF',     price: 0.9050,   volatility: 0.0001,   type: 'forex'   },
  { id: 'nzdusd', name: 'NZD/USD',     price: 0.6050,   volatility: 0.0001,   type: 'forex'   },
  { id: 'eurjpy', name: 'EUR/JPY',     price: 164.20,   volatility: 0.04,     type: 'forex'   },
  { id: 'gbpjpy', name: 'GBP/JPY',     price: 191.50,   volatility: 0.05,     type: 'forex'   },
  { id: 'eurgbp', name: 'EUR/GBP',     price: 0.8580,   volatility: 0.0001,   type: 'forex'   },
  { id: 'gbpusd', name: 'GBP/USD',     price: 1.2650,   volatility: 0.0002,   type: 'forex'   },
];

setInterval(() => {
  const now = new Date();
  assets.forEach(asset => {
    const manip = activeManipulations.get(asset.id);
    if (manip) {
      if (now > manip.endTime) {
        // Manipulation expired
        activeManipulations.delete(asset.id);
        Manipulation.deleteOne({ assetId: asset.id }).catch(e => console.error('Error deleting expired manipulation:', e));
        
        const change = (Math.random() - 0.5) * asset.volatility;
        asset.price = Math.max(0.0001, asset.price + change);
      } else {
        // Apply manipulation bias
        const changeFactor = manip.direction === 'up' ? 0.35 : 0.65;
        const change = (Math.random() - changeFactor) * asset.volatility;
        asset.price = Math.max(0.0001, asset.price + change);
      }
    } else {
      const change = (Math.random() - 0.5) * asset.volatility;
      asset.price = Math.max(0.0001, asset.price + change);
    }
  });
  io.emit('price_update', assets);
}, 1000);

io.on('connection', (socket: any) => {
  console.log('Client connected:', socket.id);
  socket.emit('initial_prices', assets);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
