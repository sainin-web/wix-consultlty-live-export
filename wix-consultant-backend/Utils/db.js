// mongoose
const mongoose = require("mongoose")
require("dotenv").config()

const url = process.env.MONGO_DB_URL

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
   const readyState = mongoose.connection.readyState;

   // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
   console.log(`[DB] connectDB() called - readyState: ${readyState}`);

   if (!url) {
      console.error("[DB] ERROR: MongoDB URL not found in environment variables");
      return;
   }

   // If already connected, return immediately
   if (readyState === 1) {
      console.log("[DB] ✓ Already connected (readyState=1)");
      return mongoose.connection;
   }

   // If currently connecting, await existing promise
   if (readyState === 2) {
      console.log("[DB] Connecting in progress (readyState=2), awaiting existing promise...");
      return connectionPromise;
   }

   // Create new connection promise only when disconnected (readyState 0 or 3)
   if (!connectionPromise || readyState === 0 || readyState === 3) {
      connectionAttempts++;
      console.log(`[DB] Creating new connection (attempt #${connectionAttempts}) - readyState: ${readyState}`);

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
            console.log("[DB] ✓ Connection established (readyState=1)");
            console.log("[DB] Pool size: max=20, min=5");
            return mongoose.connection;
         })
         .catch((err) => {
            console.error("[DB] ✗ Connection error:", {
               name: err.name,
               message: err.message,
               code: err.code,
               causeName: err.cause?.name,
               causeMessage: err.cause?.message,
               causeCode: err.cause?.code,
            });
            connectionPromise = null;
            process.exit(1);
         });
   }

   return connectionPromise;
};

// Setup connection event listeners for diagnostics
mongoose.connection.on('connecting', () => {
   console.log("[DB] Event: connecting (readyState=2)");
});

mongoose.connection.on('connected', () => {
   console.log("[DB] Event: connected (readyState=1)");
});

mongoose.connection.on('disconnecting', () => {
   console.log("[DB] Event: disconnecting (readyState=3)");
});

mongoose.connection.on('disconnected', () => {
   console.log("[DB] Event: disconnected (readyState=0)");
});

mongoose.connection.on('reconnected', () => {
   console.log("[DB] Event: reconnected (readyState=1)");
});

mongoose.connection.on('error', (err) => {
   console.error("[DB] Event: error", {
      name: err.name,
      message: err.message,
      code: err.code,
   });
});

mongoose.connection.on('open', () => {
   console.log("[DB] Event: open");
});

// Track pool changes
mongoose.connection.on('serverDescriptionChanged', (evt) => {
   console.log("[DB] Event: serverDescriptionChanged");
});

mongoose.connection.on('topologyOpened', (evt) => {
   console.log("[DB] Event: topologyOpened");
});

mongoose.connection.on('topologyClosed', (evt) => {
   console.log("[DB] Event: topologyClosed");
});

module.exports = { connectDB }

