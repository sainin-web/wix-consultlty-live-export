# MongoDB Reconnect Loop Diagnostics & Fix

**Date:** August 18, 2026  
**Status:** ✅ DIAGNOSTICS ADDED - READY FOR TESTING  
**Issue:** Production app repeatedly disconnecting/reconnecting from MongoDB  
**Pattern Observed:** connected → reconnected → open → disconnected → connected (repeat)

---

## FIXES APPLIED

### Fix #1: Removed Duplicate Schema Indexes
**File:** `Modal/userSchema.js`

**Problem:** 
- Schema field `email` had `unique: true` (creates index automatically)
- PLUS explicit `registerUserSchema.index({ email: 1 })` (duplicate)
- Same for `agoraUid` and `licenseNo`

**Solution:**
- Removed 3 duplicate index declarations (lines 186, 195, 198)
- Kept automatic indexes from `unique: true` in schema fields
- Kept other explicit indexes for compound queries

**Before:**
```
registerUserSchema.index({ email: 1 });           // REMOVED - duplicate
registerUserSchema.index({ agoraUid: 1 }, ...);  // REMOVED - duplicate
registerUserSchema.index({ licenseNo: 1 }, ...); // REMOVED - duplicate
```

**After:**
```
// Kept explicit indexes only for:
registerUserSchema.index({ shop_id: 1, userType: 1, isActive: 1 });  // ✓ Needed
registerUserSchema.index({ wixMemberId: 1 });                         // ✓ Needed
registerUserSchema.index({ instanceId: 1 });                          // ✓ Needed
registerUserSchema.index({ shop_id: 1, userType: 1 });               // ✓ Needed
```

**Why:** Mongoose automatically creates indexes for `unique: true` fields. Adding explicit indexes creates duplicates, which can confuse MongoDB and cause performance issues.

---

### Fix #2: Added Comprehensive Diagnostics for Reconnect Loop
**File:** `Utils/db.js`

**What Was Added:**

1. **Process & Connection Tracking:**
```javascript
DIAGNOSTICS = {
  processId: process.pid,
  startTime: new Date().toISOString(),
  connectDBCallCount: 0,          // How many times connectDB() called
  connectionCreatedCount: 0,       // How many new connections created
  lastDisconnectReason: null,
  lastDisconnectTime: null,
  connectionStateHistory: [],      // All state changes with timestamps
}
```

2. **Connection Creation Logging:**
```javascript
console.log(`[DB] ⚠️  Creating new connection #${DIAGNOSTICS.connectionCreatedCount} (attempt #${connectionAttempts}) - readyState: ${readyState} - PID: ${DIAGNOSTICS.processId}`)
```

3. **Connection Event Logging (with emojis for quick visual scanning):**
```javascript
connecting       📡
connected        ✅
disconnecting    ⚠️
disconnected     ❌ (with full history)
reconnected      🔄 (with history)
error            🚨
open             🔓
topologyOpened   🎯
topologyClosed   ⛔
```

4. **Critical Alert on Disconnect:**
```javascript
console.log(`[DB] CRITICAL: This may indicate a reconnect loop! History: ${JSON.stringify(DIAGNOSTICS.connectionStateHistory.slice(-10))}`)
```

**Why:** The observed pattern (connected → disconnected → connected repeatedly) suggests:
- Either the process is being restarted by PM2
- Or the connection pool is being cleared and recreated
- These diagnostics will show which is happening

---

## HOW TO IDENTIFY THE RECONNECT LOOP

### Scenario 1: Process Restart Loop
**Evidence in logs:**
```
[SERVER] Starting application...
[DB] connectDB() called #1 - PID: 12345 - readyState: 0
[DB] ✓ Connection established (readyState=1) - Connection #1
[SERVER] ✓ Running on port 3500
... (time passes, maybe minutes) ...
[SERVER] Starting application...  ← NEW PROCESS
[DB] connectDB() called #1 - PID: 99999 - readyState: 0  ← DIFFERENT PID!
[DB] ✓ Connection established (readyState=1) - Connection #1  ← Connection #1 AGAIN
```

**What it means:** PM2 is restarting the process repeatedly (every N minutes/seconds)

**Check:** `pm2 show wix-consultant-backend` to see restart count

---

### Scenario 2: Connection Pool Cleared Loop
**Evidence in logs:**
```
[DB] connectDB() called #1 - PID: 12345 - readyState: 0
[DB] ✓ Connection established (readyState=1) - Connection #1
[DB] ✅ Event: connected (readyState=1)
... (a few minutes pass) ...
[DB] ⛔ Event: topologyClosed        ← POOL CLEARED
[DB] ❌ Event: disconnected          ← DISCONNECTED
[DB] ⚠️  Event: disconnecting
[DB] 🔄 Event: reconnected
[DB] 📡 Event: connecting
[DB] ✅ Event: connected
... (pattern repeats)
```

**What it means:** Something is causing MongoDB to clear the pool or connection is being dropped

**Causes:**
- MongoDB Atlas timeout configuration
- Network issue between EC2 and MongoDB
- Connection pool size too small for load
- Idle connection timeout

---

### Scenario 3: Multiple Connections Being Created
**Evidence in logs:**
```
[DB] ⚠️  Creating new connection #1 - PID: 12345
[DB] ✓ Connection established (readyState=1) - Connection #1

... (time passes) ...

[DB] ⚠️  Creating new connection #2 - PID: 12345  ← SAME PID, NEW CONNECTION
[DB] ✓ Connection established (readyState=1) - Connection #2
```

**What it means:** connectDB() is being called multiple times instead of reusing the same connection

**Likely cause:** The idempotent logic isn't working, or the connection is being disconnected unexpectedly

---

## DEPLOYMENT STEPS

### 1. Syntax Verification
✅ Both files verified:
- `Utils/db.js` - Syntax OK
- `Modal/userSchema.js` - Syntax OK

### 2. Build Backend
```bash
cd wix-consultant-backend
npm install  # No changes, but ensure deps are installed
```

### 3. Restart PM2 with Diagnostics

**IMPORTANT: Use --update-env to load any .env changes**

```bash
pm2 stop wix-consultant-backend

# Wait a few seconds
sleep 5

# Start with --update-env and watch logs
pm2 start index.js --name wix-consultant-backend --update-env --watch
```

### 4. Monitor Logs Immediately
```bash
# Watch the FIRST 60 seconds of logs carefully
pm2 logs wix-consultant-backend | head -100
```

**Expected output (first 30 seconds):**
```
[SERVER] Starting application...
[SERVER] Connecting to MongoDB...
[DB] connectDB() called #1 - PID: XXXXX - readyState: 0
[DB] ⚠️  Creating new connection #1 (attempt #1) - readyState: 0 - PID: XXXXX
[DB] 📡 Event: connecting (readyState=2)
[DB] 🎯 Event: topologyOpened
[DB] 🔍 Event: serverDescriptionChanged
[DB] ✅ Event: connected (readyState=1)
[DB] 🔓 Event: open
[DB] ✓ Connection established (readyState=1) - Connection #1
[SERVER] ✓ MongoDB connection ready
[SERVER] ✓ Running on port 3500
```

**Should then STAY connected (no more events for a while)**

---

## TESTING CHECKLIST

### Test 1: Startup (Immediate)
```bash
# Watch first 60 seconds
pm2 logs wix-consultant-backend | grep "\[DB\]\|\[SERVER\]" | head -20
```

**Expected:** 
- ✅ One process start (single PID)
- ✅ Connection created once (Connection #1)
- ✅ Connected events appear
- ✅ NO "disconnected" events in first 60 seconds

**Failure Signs:**
- ❌ Multiple different PIDs → Process restart loop
- ❌ Connection #2, #3, #4 → Multiple connections
- ❌ Repeated disconnected → Pool cleared loop

---

### Test 2: Connection Stability (5 minutes)
```bash
# Run for 5 minutes
timeout 300 pm2 logs wix-consultant-backend | grep "Event:"
```

**Expected:**
- ✅ No "disconnected" events
- ✅ No "reconnected" events
- ✅ Should be SILENT (no events after initial connection)

**Failure Signs:**
- ❌ Any "❌ Event: disconnected"
- ❌ Any "🔄 Event: reconnected"
- ❌ Any "⛔ Event: topologyClosed"

---

### Test 3: API Request (After 5 min stability)
```bash
# Test GET consultants
curl -X GET "http://localhost:3500/api/admin/consultant-list/{adminId}" \
  -H "Authorization: Bearer {token}" \
  2>&1 | grep -E "success|error"

# Check logs for API call
pm2 logs wix-consultant-backend | grep -E "\[API\]\|\[DB\]" | tail -10
```

**Expected:**
- ✅ API responds successfully
- ✅ API timing logged
- ✅ No database errors
- ✅ Connection still showing readyState=1 if needed

---

### Test 4: CREATE Consultant (After Test 3)
```bash
curl -X POST http://localhost:3500/api/api-consultant/add-consultant/{shop_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{ ... consultant data ... }'

# Check logs
pm2 logs wix-consultant-backend | grep "CREATE consultant"
```

**Expected:**
- ✅ Creation succeeds
- ✅ Timing logged
- ✅ No connection errors

---

### Test 5: UPDATE Consultant (After Test 4)
```bash
curl -X PUT http://localhost:3500/api/api-consultant/update-consultant/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{ ... consultant data ... }'

# Check logs
pm2 logs wix-consultant-backend | grep "UPDATE consultant"
```

**Expected:**
- ✅ Update succeeds
- ✅ Timing logged
- ✅ No connection errors

---

### Test 6: No MongoNetworkError
```bash
# Search for errors during 10 minutes of operation
timeout 600 pm2 logs wix-consultant-backend | grep -iE "MongoNetworkError|MongoPoolClearedError|pool.*cleared"
```

**Expected:**
- ✅ No output (no errors)

**Failure Signs:**
- ❌ Any "MongoNetworkError" → Network issue
- ❌ Any "MongoPoolClearedError" → Pool cleared
- ❌ Any "pool was cleared" → Same issue

---

## WHAT THE DIAGNOSTICS TELL YOU

### Diagnostic 1: Number of Connections Created
```
[DB] ⚠️  Creating new connection #1
[DB] ⚠️  Creating new connection #2  ← If you see this, connection reuse is broken
```

**Expected:** Only #1 (one connection for entire process)  
**If you see #2+:** Something is causing connections to be dropped and recreated

---

### Diagnostic 2: Process ID
```
[DB] connectDB() called #1 - PID: 12345
[DB] connectDB() called #1 - PID: 99999  ← Different PID = new process
```

**Expected:** Same PID throughout  
**If changes:** PM2 is restarting the process

---

### Diagnostic 3: connectDB() Call Count
```
[DB] connectDB() called #1
[DB] connectDB() called #2  ← Called again
[DB] connectDB() called #3  ← Called AGAIN
```

**Expected:** Usually #1, maybe #2 on startup  
**If increasing repeatedly:** Someone is calling connectDB() in a loop or on every request

---

### Diagnostic 4: Connection State History
```
History: [
  { event: 'connecting', time: '...' },
  { event: 'connected', time: '...' },
  { event: 'open', time: '...' }
]
```

**Expected:** Short history (just initial connection events)  
**If long with disconnect/reconnect:** Connection is unstable

---

## TROUBLESHOOTING

### If You See Multiple Connections Being Created

**First Check:**
```bash
grep "Creating new connection" pm2-logs.txt | wc -l
```

If > 1, then investigate:
1. Is connectDB() being called from multiple places?
   ```bash
   grep -rn "connectDB()" wix-consultant-backend --include="*.js"
   ```

2. Is the connection being disconnected in a loop?
   ```bash
   grep "Event: disconnected" pm2-logs.txt | wc -l
   ```

3. Are there any manual `mongoose.disconnect()` calls?
   ```bash
   grep -rn "mongoose.disconnect\|connection.close" wix-consultant-backend --include="*.js"
   ```

---

### If You See Process Restart Loop

**Check PM2:**
```bash
pm2 show wix-consultant-backend
# Look for "restarts" - should be 0 or 1
```

**If restarts > 1:**
- Check PM2 logs: `pm2 logs PM2` (capital letters - PM2's own logs)
- Check for crash messages
- Check available memory: `free -h`
- Check if errors cause process.exit(1): `grep "process.exit" wix-consultant-backend/index.js`

---

### If You See Repeated Connected/Disconnected

**Check Network:**
```bash
# Can the server reach MongoDB?
mongosh "$MONGO_DB_URL" --eval 'db.adminCommand({ping: 1})'
```

**Check MongoDB Atlas:**
- Is the connection string still valid?
- Is the IP whitelist still allowing 0.0.0.0/0?
- Are there connection pool limits being hit?

**Check for Timeouts:**
```bash
grep "timeout\|TIMEOUT" pm2-logs.txt
```

---

## FINAL VERIFICATION

**After 10+ minutes of operation, declare success when:**

✅ No MongoNetworkError in logs  
✅ No MongoPoolClearedError in logs  
✅ Only 1 connection created (Connection #1)  
✅ Same PID throughout (no process restarts)  
✅ No repeated disconnected/reconnected events  
✅ connectDB() called 1-2 times maximum  
✅ APIs respond successfully with timing logs  

---

## IMPORTANT

**Do NOT declare the issue fixed until:**
1. ✅ Backend built successfully
2. ✅ PM2 restarted with --update-env
3. ✅ Initial connection logs look correct
4. ✅ 5-10 minutes pass with NO disconnect/reconnect loop
5. ✅ API requests work successfully
6. ✅ Logs show stable connection

The diagnostics will show you exactly where the problem is if it still exists.

---

**Status: Ready for Production Testing** ✅
