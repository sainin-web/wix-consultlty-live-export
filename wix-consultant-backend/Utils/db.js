// mongoose
const mongoose = require("mongoose")
require("dotenv").config()

const url = process.env.MONGO_DB_URL

// ─── CRITICAL DIAGNOSTICS FOR RECONNECT LOOP ──────────────────────────────
const DIAGNOSTICS = {
  processId: process.pid,
  startTime: new Date().toISOString(),
  connectDBCallCount: 0,
  connectionCreatedCount: 0,
  lastDisconnectReason: null,
  lastDisconnectTime: null,
  connectionStateHistory: [],
};

// Track connection state
let connectionPromise = null;
let connectionAttempts = 0;

/**
 * Idempotent MongoDB connection function
 * - If already connected → return existing connection
 * - If currently connecting → await the existing promise
 * - Only create new connection when genuinely disconnected
 */
const connectDB = async () => {
   DIAGNOSTICS.connectDBCallCount++;
   const readyState = mongoose.connection.readyState;

   // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
   console.log(`[DB] connectDB() called #${DIAGNOSTICS.connectDBCallCount} - PID: ${DIAGNOSTICS.processId} - readyState: ${readyState}`);

   if (!url) {
      console.error("[DB] ERROR: MongoDB URL not found in environment variables");
      return;
   }

   // If already connected, return immediately
   if (readyState === 1) {
      console.log(`[DB] ✓ Already connected (readyState=1) - Not creating duplicate connection`);
      return mongoose.connection;
   }

   // If currently connecting, await existing promise
   if (readyState === 2) {
      console.log(`[DB] ✓ Connecting in progress (readyState=2) - Awaiting existing promise...`);
      return connectionPromise;
   }

   // Create new connection promise only when disconnected (readyState 0 or 3)
   if (!connectionPromise || readyState === 0 || readyState === 3) {
      connectionAttempts++;
      DIAGNOSTICS.connectionCreatedCount++;
      console.log(`[DB] ⚠️  Creating new connection #${DIAGNOSTICS.connectionCreatedCount} (attempt #${connectionAttempts}) - readyState: ${readyState} - PID: ${DIAGNOSTICS.processId}`);

      connectionPromise = mongoose.connect(url, {
         maxPoolSize: 20,
         minPoolSize: 5,
         socketTimeoutMS: 30000,
         serverSelectionTimeoutMS: 5000,
         retryWrites: true,
         retryReads: true,
         // Ensure we don't create duplicate connections
         monitorCommands: false,
      })
         .then(() => {
            console.log(`[DB] ✓ Connection established (readyState=1) - Connection #${DIAGNOSTICS.connectionCreatedCount}`);
            console.log("[DB] Pool size: max=20, min=5");
            return mongoose.connection;
         })
         .catch((err) => {
            console.error(`[DB] ✗ Connection error on attempt #${connectionAttempts}:`, {
               name: err.name,
               message: err.message,
               code: err.code,
               causeName: err.cause?.name,
               causeMessage: err.cause?.message,
               causeCode: err.cause?.code,
            });
            console.error(`[DB] DIAGNOSTICS: ${JSON.stringify(DIAGNOSTICS)}`);
            connectionPromise = null;
            process.exit(1);
         });
   }

   return connectionPromise;
};

// Setup connection event listeners for diagnostics
// CRITICAL: These detect the reconnect loop
mongoose.connection.on('connecting', () => {
   const timestamp = new Date().toISOString();
   DIAGNOSTICS.connectionStateHistory.push({ event: 'connecting', time: timestamp });
   console.log(`[DB] 📡 Event: connecting (readyState=2) - PID: ${DIAGNOSTICS.processId} - ${timestamp}`);
});

mongoose.connection.on('connected', () => {
   const timestamp = new Date().toISOString();
   DIAGNOSTICS.connectionStateHistory.push({ event: 'connected', time: timestamp });
   console.log(`[DB] ✅ Event: connected (readyState=1) - PID: ${DIAGNOSTICS.processId} - ${timestamp}`);
});

mongoose.connection.on('disconnecting', () => {
   const timestamp = new Date().toISOString();
   DIAGNOSTICS.connectionStateHistory.push({ event: 'disconnecting', time: timestamp });
   console.log(`[DB] ⚠️  Event: disconnecting (readyState=3) - PID: ${DIAGNOSTICS.processId} - ${timestamp}`);
});

mongoose.connection.on('disconnected', () => {
   const timestamp = new Date().toISOString();
   DIAGNOSTICS.lastDisconnectTime = timestamp;
   DIAGNOSTICS.connectionStateHistory.push({ event: 'disconnected', time: timestamp });
   console.log(`[DB] ❌ Event: disconnected (readyState=0) - PID: ${DIAGNOSTICS.processId} - ${timestamp}`);
   console.log(`[DB] CRITICAL: This may indicate a reconnect loop! History: ${JSON.stringify(DIAGNOSTICS.connectionStateHistory.slice(-10))}`);
});

mongoose.connection.on('reconnected', () => {
   const timestamp = new Date().toISOString();
   DIAGNOSTICS.connectionStateHistory.push({ event: 'reconnected', time: timestamp });
   console.log(`[DB] 🔄 Event: reconnected (readyState=1) - PID: ${DIAGNOSTICS.processId} - ${timestamp}`);
   console.log(`[DB] Connection state history (last 10): ${JSON.stringify(DIAGNOSTICS.connectionStateHistory.slice(-10))}`);
});

mongoose.connection.on('error', (err) => {
   const timestamp = new Date().toISOString();
   DIAGNOSTICS.connectionStateHistory.push({ event: 'error', time: timestamp, error: err.message });
   console.error(`[DB] 🚨 Event: error - PID: ${DIAGNOSTICS.processId} - ${timestamp}`, {
      name: err.name,
      message: err.message,
      code: err.code,
      cause: err.cause?.message,
   });
});

mongoose.connection.on('open', () => {
   const timestamp = new Date().toISOString();
   DIAGNOSTICS.connectionStateHistory.push({ event: 'open', time: timestamp });
   console.log(`[DB] 🔓 Event: open - PID: ${DIAGNOSTICS.processId} - ${timestamp}`);
});

// Track pool changes
mongoose.connection.on('serverDescriptionChanged', (evt) => {
   const timestamp = new Date().toISOString();
   console.log(`[DB] 🔍 Event: serverDescriptionChanged - ${timestamp}`);
});

mongoose.connection.on('topologyOpened', (evt) => {
   const timestamp = new Date().toISOString();
   console.log(`[DB] 🎯 Event: topologyOpened - ${timestamp}`);
});

mongoose.connection.on('topologyClosed', (evt) => {
   const timestamp = new Date().toISOString();
   DIAGNOSTICS.connectionStateHistory.push({ event: 'topologyClosed', time: timestamp });
   console.log(`[DB] ⛔ Event: topologyClosed - PID: ${DIAGNOSTICS.processId} - ${timestamp}`);
});

module.exports = { connectDB, DIAGNOSTICS }

