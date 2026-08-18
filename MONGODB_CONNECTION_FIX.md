# MongoDB Connection Lifecycle - Diagnostic & Fix Report

**Date:** August 18, 2026  
**Status:** ✅ IMPLEMENTATION COMPLETE  
**Issue:** MongoPoolClearedError, MongoNetworkError with empty errors array  
**Root Cause Identified:** Connection lifecycle management and query optimization issues  

---

## INVESTIGATION RESULTS

### Part 1: Connection Lifecycle Analysis

**Finding 1: Improper Async Handling in index.js**
- **Problem:** `connectDB()` was called without awaiting
- **Line:** `connectDB();` (line 9, old code)
- **Impact:** Express server started BEFORE MongoDB connection was ready
- **Symptom:** Race condition where API requests could hit before connection established
- **Fix:** Wrapped server startup in async IIFE with proper await

**Finding 2: Missing Idempotent Connection Logic**
- **Problem:** No protection against multiple `mongoose.connect()` calls
- **File:** `Utils/db.js`
- **Impact:** If connection promise rejected, retry would attempt new connection immediately
- **Fix:** Added state machine logic:
  - If connected (readyState=1) → return existing connection
  - If connecting (readyState=2) → await existing promise
  - If disconnected (readyState=0,3) → create new connection

**Finding 3: No Connection Event Monitoring**
- **Problem:** Silent failures - no visibility into connection state changes
- **File:** `Utils/db.js`
- **Impact:** Pool errors happened without logging
- **Fix:** Added event listeners:
  - `connecting`, `connected`, `disconnecting`, `disconnected`
  - `reconnected`, `error`, `open`
  - `serverDescriptionChanged`, `topologyOpened`, `topologyClosed`

**Finding 4: Inadequate Error Logging**
- **Problem:** "AggregateError has an empty errors array" is useless without deeper error cause
- **File:** `Utils/db.js` and all controllers
- **Impact:** Impossible to diagnose real error
- **Fix:** Log complete error chain:
  ```javascript
  {
    name: error.name,
    message: error.message,
    code: error.code,
    causeName: error.cause?.name,
    causeMessage: error.cause?.message,
    causeCode: error.cause?.code
  }
  ```

---

## Part 2: Performance Bottleneck Analysis

### Finding 5: Sequential Database Queries in getAppStatusController
- **Location:** `Controller/userDetailsController.js` line 127
- **Problem:** Multiple queries executed sequentially:
  ```javascript
  // OLD (SEQUENTIAL - up to 4 queries):
  admin = await shopModel.findById(adminIdLocal);          // If provided
  const resolved = await resolveWixInstanceFromToken(...); // Always waits
  admin = await shopModel.findById(...);                   // If resolved
  admin = await shopModel.findOne({ instanceId });        // Fallback
  ```
- **Impact:** Each query waits for previous to complete
- **Example timing:** If each query is 50-100ms → total 200-400ms
- **Fix:** 
  1. Check `adminIdLocal` first (direct lookup)
  2. Only call `resolveWixInstanceFromToken` if needed
  3. Use `.select()` to return only needed fields (`appEnabled`, `_id`)

### Finding 6: API Performance Without Measurement
- **Problem:** No timing data on API endpoints
- **Impact:** Can't distinguish network latency vs. database vs. application code
- **Fix:** Added diagnostic logging:
  ```javascript
  [API] CREATE consultant START
  [DB] save: XXXms
  [API] CREATE consultant END - total: XXXms
  ```

### Finding 7: getStorefrontStatus Timing Not Measured
- **Location:** `Controller/onboardingController.js` line 44
- **Problem:** Parallel queries `Promise.all()` but no timing breakdown
- **Fix:** Added timing for:
  - findShopByAdminId duration
  - Parallel queries (countDocuments + findOne) duration
  - Total API duration

---

## Part 3: Implementation Details

### Files Modified (5 files):

#### 1. **Utils/db.js** (Major rewrite)
**Changes:**
- Added connection state tracking (`connectionPromise`, `connectionAttempts`)
- Implemented idempotent `connectDB()` with state machine logic
- Added complete event listener set for monitoring
- Added proper error chain logging
- Changed function to async (returns Promise)

**Key Logic:**
```javascript
// Idempotent connection management:
if (readyState === 1) return existing;      // Connected
if (readyState === 2) return promise;        // Connecting
if (readyState === 0 || 3) create new;      // Disconnected
```

**Event Listeners Added:**
```javascript
connecting, connected, disconnecting, disconnected
reconnected, error, open
serverDescriptionChanged, topologyOpened, topologyClosed
```

#### 2. **index.js** (Connection handling)
**Changes:**
- Wrapped server startup in async IIFE
- Changed `connectDB()` call to `await connectDB()`
- Added proper error handling for connection failures
- Server now waits for DB before starting

**Before:**
```javascript
connectDB();  // Not awaited - race condition!
const server = http.createServer(app);
server.listen(...); // Starts immediately
```

**After:**
```javascript
(async () => {
  await connectDB(); // Waits for DB connection
  server.listen(...); // Starts after DB ready
})();
```

#### 3. **Controller/consultantController.js** (API timing)
**Changes:**
- Added timing logs to CREATE consultant endpoint
- Added timing logs to UPDATE consultant endpoint
- Added error chain logging (name, message, code, cause.*)
- Measures: validation, file I/O, password hashing, database save

**Logs Added:**
```javascript
[API] CREATE consultant START - shop_id: XXX
[DB] save: XXXms
[API] CREATE consultant END - total: XXXms
[API] CREATE consultant ERROR (XXXms): { name, message, code, ... }
```

#### 4. **Controller/userDetailsController.js** (Query optimization)
**Changes:**
- Optimized `getAppStatusController` to use early exit
- Only call `resolveWixInstanceFromToken` when necessary
- Added `.select()` to reduce document size
- Added query timing logs

**Before:**
```javascript
admin = await shopModel.findById(adminIdLocal);
const resolved = await resolveWixInstanceFromToken(instance); // Always called
admin = await shopModel.findById(resolved.shopMongoId);
admin = await shopModel.findOne({ instanceId });
// Sequential execution
```

**After:**
```javascript
if (adminIdLocal) {
  admin = await shopModel.findById(adminIdLocal).select(...);
}
if (!admin && instance) {
  const resolved = await resolveWixInstanceFromToken(instance); // Only if needed
  // Then execute ONE of the three lookups
}
```

#### 5. **Controller/onboardingController.js** (API timing)
**Changes:**
- Added timing to `getStorefrontStatus` endpoint
- Separate timings for findShopByAdminId and parallel queries
- Added error chain logging

**Logs Added:**
```javascript
[API] getStorefrontStatus START - adminId: XXX
[DB] findShopByAdminId: XXXms
[DB] parallel queries: XXXms
[API] getStorefrontStatus END - XXXms
```

---

## DEPLOYMENT CHECKLIST

### Before Restart:
- [ ] Verify all modified files have correct syntax (done ✓)
- [ ] Check MongoDB Atlas credentials still valid
- [ ] Confirm network access to MongoDB (0.0.0.0/0)
- [ ] Note current PM2 process state (if any)

### Deployment Steps:
1. **Stop Current Process:**
   ```bash
   pm2 stop wix-consultant-backend  # or your PM2 app name
   ```

2. **Deploy Code:**
   ```bash
   # Pull/copy new code with modified files
   cd wix-consultant-backend
   npm install  # In case dependencies changed
   ```

3. **Start with PM2:**
   ```bash
   pm2 start index.js --name wix-consultant-backend --watch
   # OR if using ecosystem config:
   pm2 start ecosystem.config.js
   ```

4. **Monitor Startup Logs:**
   ```bash
   pm2 logs wix-consultant-backend
   ```
   **Expected output:**
   ```
   [SERVER] Starting application...
   [SERVER] Connecting to MongoDB...
   [DB] connectDB() called - readyState: 0
   [DB] Creating new connection (attempt #1)
   [DB] ✓ Connection established (readyState=1)
   [SERVER] ✓ MongoDB connection ready
   [SERVER] ✓ Running on port XXXX
   ```

---

## TESTING PLAN

### Test 1: Connection Lifecycle
**Command:**
```bash
pm2 logs wix-consultant-backend | grep "\[DB\]"
```
**Expected:**
```
[DB] connectDB() called - readyState: 0
[DB] Creating new connection (attempt #1)
[DB] Event: connecting
[DB] Event: connected
[DB] ✓ Connection established
```

**Failure Signs:**
```
✗ Multiple attempts before connected
✗ Rapid connecting/disconnected cycles
✗ "Pool was cleared" errors
```

### Test 2: CREATE Consultant API
**Command:**
```bash
curl -X POST http://localhost:3500/api/api-consultant/add-consultant/{shop_id} \
  -H "Content-Type: application/json" \
  -d '{ "fullName": "Test", ... }'
```

**Monitor Logs:**
```bash
pm2 logs | grep "CREATE consultant"
```

**Expected Output:**
```
[API] CREATE consultant START - shop_id: XXXX
[DB] Parallel validation queries took XXXms
[DB] file I/O (async): XXXms
[DB] password hashing: XXXms
[DB] save: XXXms
[API] CREATE consultant END - total: XXXms
```

**Timing Targets:**
- Validation queries: < 100ms
- File I/O: 50-200ms (should be parallel with hashing)
- Password hashing: 400-600ms
- Save: 200-400ms
- **Total: 500-800ms** (goal from previous optimization)

### Test 3: UPDATE Consultant API
**Monitor Logs:**
```bash
pm2 logs | grep "UPDATE consultant"
```

**Expected Output:**
```
[API] UPDATE consultant START - id: XXXX
[DB] Parallel validation queries took XXXms
[DB] findByIdAndUpdate: XXXms
[API] UPDATE consultant END - total: XXXms
```

**Timing Target:** 400-600ms total

### Test 4: getStorefrontStatus API
**Monitor Logs:**
```bash
pm2 logs | grep "getStorefrontStatus"
```

**Expected Output:**
```
[API] getStorefrontStatus START - adminId: XXXX
[DB] findShopByAdminId: XXms
[DB] parallel queries: XXXms
[API] getStorefrontStatus END - XXXms
```

**Timing Target:** < 300ms total

### Test 5: getAppStatus API
**Monitor Logs:**
```bash
pm2 logs | grep "getAppStatus"
```

**Expected Output:**
```
[API] getAppStatus START
[DB] getAppStatus queries: XXXms
[API] getAppStatus END - XXXms
```

**Timing Target:** < 200ms

### Test 6: Monitor for Pool Errors
**Command:**
```bash
pm2 logs | grep -i "pool\|error\|clearerd\|network"
```

**Expected:** NO MongoPoolClearedError, NO MongoNetworkError

**If Errors Occur:**
```
[DB] Event: error { name: "...", message: "...", code: "..." }
```
Watch for the full error details in logs.

### Test 7: Wix Admin Dashboard
1. Navigate to Wix Admin Dashboard
2. Check console for no errors
3. Monitor PM2 logs for API calls
4. Should see `[API]` and `[DB]` timing logs

### Test 8: Public Storefront
1. Load public widget on storefront
2. Monitor logs for `[API]` calls
3. Check response times from logs

---

## MONITORING AFTER DEPLOYMENT

### Key Metrics to Watch:

**1. Connection State:**
```bash
pm2 logs | grep "\[DB\].*readyState"
```
Should stay at readyState=1 after initial connection.

**2. API Response Times:**
```bash
pm2 logs | grep "\[API\].*END"
```
Extract the `total: XXXms` values and track:
- CREATE: Should be 500-800ms
- UPDATE: Should be 400-600ms
- getStorefrontStatus: Should be < 300ms
- getAppStatus: Should be < 200ms

**3. Database Query Times:**
```bash
pm2 logs | grep "\[DB\]"
```
Look for specific query timings to identify bottlenecks.

**4. Error Frequency:**
```bash
pm2 logs | grep "\[ERROR\]"
```
Should be minimal - no pool errors, no network errors.

---

## ROOT CAUSE SUMMARY

**Primary Issue:** Connection lifecycle management
- Server started before DB connection ready (race condition)
- No idempotent connection logic
- Multiple connection attempts could happen simultaneously

**Secondary Issue:** API Performance Not Measured
- No timing data to identify bottlenecks
- Sequential queries treated as normal
- Pool errors not properly logged

**Result:** 
- MongoPoolClearedError when connection pool was recreated
- Intermittent failures when APIs executed before connection ready
- Slow API responses due to sequential queries

---

## VERIFICATION

### After Restart, Run These Commands:

```bash
# 1. Check startup logs
pm2 logs wix-consultant-backend | head -20

# 2. Test CREATE API and check timing
curl -X POST http://localhost:3500/api/api-consultant/add-consultant/{shop_id} ...
pm2 logs | grep "CREATE consultant"

# 3. Test UPDATE API
curl -X PUT http://localhost:3500/api/api-consultant/update-consultant/{id} ...
pm2 logs | grep "UPDATE consultant"

# 4. Check for errors
pm2 logs | grep -i "error\|pool\|network" | head -20

# 5. Monitor connection state
pm2 logs | grep "\[DB\]" | tail -20
```

**Success Criteria:**
- ✓ Server starts without connection errors
- ✓ APIs execute and log timing
- ✓ No MongoPoolClearedError in logs
- ✓ No MongoNetworkError in logs
- ✓ CREATE API: 500-800ms
- ✓ UPDATE API: 400-600ms
- ✓ Connection readyState stays at 1 (connected)

---

## IMPORTANT NOTES

### What Changed:
1. ✅ Connection is now awaited before server starts
2. ✅ Idempotent connection logic prevents duplicate connections
3. ✅ Event listeners track connection state changes
4. ✅ Error chain is logged for diagnosis
5. ✅ getAppStatusController optimized (early exit, .select())
6. ✅ All APIs now have timing measurements
7. ✅ Parallel queries used where appropriate

### What Did NOT Change:
- ❌ MongoDB connection options (still maxPoolSize: 20, minPoolSize: 5)
- ❌ Mongoose version (still 8.18.1)
- ❌ Backend API structure or logic
- ❌ Wix integration (public widget + admin dashboard still separated)
- ❌ Database schema or models

### What Remains to Verify:
- ⏳ Tests on production MongoDB during peak load
- ⏳ Measurement of actual API response times in production
- ⏳ Verification that pool no longer clears unexpectedly
- ⏳ Confirmation that frontend sees improved response times

---

## IF ISSUES PERSIST

### Issue: Still Getting MongoPoolClearedError

**Check:**
1. Is the server actually waiting for DB connection? (Look for `[SERVER] ✓ MongoDB connection ready` in logs)
2. Are there multiple node processes? (`ps aux | grep node`)
3. Is PM2 cluster mode enabled? (`pm2 show wix-consultant-backend | grep instances`)
4. Is the database URL correct? (Don't log it, just verify it's set)

**Workaround:**
- Restart PM2 after confirming DB is accessible
- Check MongoDB Atlas Network Access is still 0.0.0.0/0
- Check MongoDB credentials haven't changed

### Issue: APIs Still Slow (> 1000ms)

**Check:**
1. Log output for `[DB]` queries - which one is taking longest?
2. Are there duplicate API calls from frontend?
3. Is there a network issue to MongoDB?
4. Are there other slow queries not yet optimized?

**Example Log Analysis:**
```
[API] CREATE consultant START
[DB] Parallel validation queries took 500ms ← SLOW! Check indexes
[API] CREATE consultant END - total: 800ms
```

**Action Items:**
1. Check MongoDB index status
2. Run explain() on slow queries
3. Add indexes if missing: email, licenseNo, agoraUid
4. Check if frontend is sending duplicate requests

---

## CONCLUSION

The MongoDB connection lifecycle has been properly implemented with:
1. ✅ Idempotent async connection management
2. ✅ Comprehensive event monitoring
3. ✅ Detailed error logging for diagnosis
4. ✅ API response timing measurement
5. ✅ Query optimization (early exit, parallel queries, .select())

**Status: Ready for Production Deployment** ✅

---

**Next Step:** Restart PM2 process and monitor logs for 1 hour to verify no pool errors and acceptable API response times.
