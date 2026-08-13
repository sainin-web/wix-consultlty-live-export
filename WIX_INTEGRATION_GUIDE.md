# Wix Storefront Integration & Debugging Guide

**Status:** 🔴 ISSUE: API returning 0 consultants, taking 19-20 seconds  
**Date:** 2026-08-13

---

## 🚨 CURRENT ISSUE DIAGNOSIS

### Symptoms
1. ✅ App loads (skeleton renders)
2. ❌ API returning `count: 0` (no consultants)
3. ❌ API taking 19-20 seconds per request
4. ❌ Duplicate API calls being made

### Root Cause Analysis

Console logs show:
```
[PERF] api:consultant-fetch-start → api:consultant-fetch-end: 19729.40ms
ConsultantSlices.js:28 [PERF] Consultant API response: {count: 0, pagination: {...}}
```

**This means either:**
1. No consultants in database for this Wix shop
2. Instance/shop lookup is failing
3. shop_id type mismatch (ObjectId vs String)

---

## ✅ FIXES APPLIED

### Fix #1: Duplicate API Calls ✅
**Problem:** useEffect dependency array was causing multiple fetches  
**Solution:** Changed to empty dependency array `[]` - fetch ONLY once on mount  
**Result:** Eliminates 20+ duplicate API calls

### Fix #2: Detailed Logging ✅
**Added:** Backend logging to diagnose instance/shop lookup:
```javascript
[DEBUG] instance: d10aac3f...
[DEBUG] Shop lookup result: found/NOT FOUND
[DEBUG] shop_id: 6a7d5e02...
[DEBUG] Query results - found: 0, total: 0
```

---

## 🔍 HOW TO DIAGNOSE THE ISSUE

### Step 1: Restart Backend & Check Logs

```bash
# Stop backend (Ctrl+C if running)

# Start backend and watch logs
npm start

# In browser console, refresh the storefront page

# Check backend logs for:
# [DEBUG] Shop lookup result: found/NOT FOUND
# [DEBUG] Query results - found: X, total: X
```

### Step 2: Verify Consultants in Database

```bash
# Connect to MongoDB (from backend directory)
mongo <your-mongo-url>

# Check if consultants exist
db.ragisterUser.find({ userType: "consultant", isActive: true }).count()

# Check if this shop has consultants
db.ragisterUser.find({ 
  shop_id: ObjectId("6a7d5e02604d3dc868fb82af"), 
  userType: "consultant", 
  isActive: true 
}).count()
```

### Step 3: Verify Instance Lookup

```bash
# In MongoDB
db.shops.findOne({ instanceId: "d10aac3f-fb2e-4eb0-9361-fc85b86dfdf5" })

# Should return:
# {
#   _id: ObjectId(...),
#   instanceId: "d10aac3f-fb2e-4eb0-9361-fc85b86dfdf5",
#   ...
# }
```

### Step 4: Check Browser Console

After restarting backend:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Refresh page (Ctrl+R)
4. Look for:
   - `[DEBUG] instance: d10aac3f...` ✅
   - `[DEBUG] Shop lookup result: found` ✅
   - `[DEBUG] Query results - found: X, total: X` ✅

---

## 🛠️ LIKELY FIXES

### Issue: "Shop lookup result: NOT FOUND"

**Solution:** The instance is not registered in database

```bash
# Check Wix instance
db.shops.findOne({ instanceId: "d10aac3f-fb2e-4eb0-9361-fc85b86dfdf5" })

# If not found, create it (or reinstall app)
db.shops.insertOne({
  instanceId: "d10aac3f-fb2e-4eb0-9361-fc85b86dfdf5",
  appDefId: "YOUR_APP_ID",
  siteOwnerId: "YOUR_SITE_OWNER_ID",
  siteMemberId: "YOUR_SITE_MEMBER_ID",
  appEnabled: true,
  accessToken: "YOUR_ACCESS_TOKEN",
  currency: "$"
})
```

### Issue: "Query results - found: 0, total: 0"

**Solution #1:** No consultants exist in database
```bash
# Add a test consultant
db.ragisterUser.insertOne({
  fullname: "Test Consultant",
  email: "test@consultant.com",
  userType: "consultant",
  shop_id: ObjectId("6a7d5e02604d3dc868fb82af"),
  isActive: true,
  profession: "Astrologer",
  experience: "5",
  chatPerMinute: 5,
  voicePerMinute: 10,
  videoPerMinute: 20,
  language: ["English"],
  password: "hashed_password_here"
})
```

**Solution #2:** shop_id type mismatch
```javascript
// In backend controller (wixStroeFrontController.js line ~40)
// Change this:
shop_id: shop_id,

// To this (convert to string):
shop_id: shop_id.toString(),

// Already done in latest commit ✅
```

### Issue: "API taking 19-20 seconds"

**Check:**
1. Is MongoDB connection slow?
2. Are indexes created?

```bash
# Verify indexes exist
db.ragisterUser.getIndexes()

# Should include:
# { shop_id: 1, userType: 1, isActive: 1 }
# { email: 1 }
# etc.

# If missing, create them:
db.ragisterUser.createIndex({ shop_id: 1, userType: 1, isActive: 1 })
db.ragisterUser.createIndex({ email: 1 })
```

---

## 📋 PRODUCTION CHECKLIST

### Before Going Live

- [ ] **1. Verify App Installation**
  - [ ] App installed on Wix dev site
  - [ ] Instance stored in database
  - [ ] Test: `db.shops.findOne({ instanceId: "..." })`

- [ ] **2. Create Test Data**
  - [ ] Add at least 1 consultant
  - [ ] Consultant has: name, email, profession, pricing, image
  - [ ] Consultant isActive = true
  - [ ] Test: `db.ragisterUser.find({ userType: "consultant", isActive: true })`

- [ ] **3. Verify Database Indexes**
  - [ ] Compound index: `{shop_id, userType, isActive}`
  - [ ] Test: `db.ragisterUser.getIndexes()`

- [ ] **4. Test Storefront**
  - [ ] Click "Our Consultant" on Wix
  - [ ] Check browser console for [DEBUG] logs
  - [ ] Verify: shop found ✅
  - [ ] Verify: consultants returned ✅
  - [ ] Cards render in < 3 seconds ✅

- [ ] **5. Check Backend Performance**
  - [ ] MongoDB connection: < 100ms
  - [ ] Query time: < 500ms  
  - [ ] Total API time: < 1000ms
  - [ ] (Shown as [PERF] logs)

- [ ] **6. Verify No Duplicate Calls**
  - [ ] Network tab shows ONE consultant API call
  - [ ] NOT 20+ duplicate calls
  - [ ] (Fixed by dependency array change ✅)

---

## 🎯 IMPLEMENTATION CHECKLIST (For Your Dev Team)

### Backend Setup
- [ ] Restart backend (npm start in backend directory)
- [ ] Verify MongoDB connection
- [ ] Check [DEBUG] logs appear in console

### Frontend Setup
- [ ] Rebuild frontend (`npm run build`)
- [ ] Test in Wix development site
- [ ] Monitor browser console for logs

### Data Setup
- [ ] Create test shop instance (if not auto-created)
- [ ] Create test consultants
- [ ] Verify indexes exist

### Testing
- [ ] Storefront loads in < 3 seconds
- [ ] Consultants display correctly
- [ ] No duplicate API calls
- [ ] Backend logs show query completed

---

## 📊 EXPECTED BEHAVIOR AFTER FIXES

### Before Fix
```
Click "Our Consultant"
  ↓ (42 seconds - FIRST huge delay)
Skeleton shows
  ↓ (19 seconds - API request)
API returns count: 0
  ↓ (more duplicate calls)
No consultants show
```

### After Fix
```
Click "Our Consultant"
  ↓ (< 1 second)
Skeleton shows
  ↓ (500-1000ms - SINGLE API request)
API returns consultants
  ↓ (< 2 seconds total)
Consultant cards render ✅
```

---

## 🔧 DEBUGGING WORKFLOW

### When Storefront is Slow:

1. **Check Backend Logs**
   ```
   [PERF][BACKEND] start: 0ms
   [PERF][BACKEND] instance-extracted: 2ms
   [PERF][BACKEND] shop-lookup: 50ms  ← Check this
   [PERF][BACKEND] consultant-query-complete: 1500ms ← Check this
   [PERF][BACKEND] transform-complete: 1510ms
   [PERF][BACKEND] Total: 1510ms
   ```

2. **If shop-lookup > 100ms:**
   - MongoDB connection is slow
   - Check MongoDB performance
   - Verify instanceId index exists

3. **If consultant-query > 500ms:**
   - Database query is slow
   - Verify indexes exist
   - Check query filter (shop_id type mismatch?)

4. **If total > 1 second:**
   - Check network latency
   - Check MongoDB server load

---

## 📝 NEXT STEPS

### Immediate (Today)
1. Restart backend with new logging
2. Open browser console and refresh storefront
3. Share backend logs showing [DEBUG] output
4. Verify if consultants appear

### If Still Not Working
1. Check MongoDB has consultants
2. Verify instance lookup works
3. Run diagnostic queries above
4. Share MongoDB output

### If Consultants Show But Slow
1. Check [PERF] backend logs
2. Identify slow part (shop lookup vs query)
3. Verify indexes exist
4. Optimize that specific part

---

## 🆘 NEED HELP?

Share these when asking for help:

1. **Browser Console Output:**
   ```
   [PERF] app:start: XXXms
   [PERF] root-app:mount: XXXms
   [PERF] storefront:mount: XXXms
   [DEBUG] instance: ...
   [DEBUG] Shop lookup result: found/NOT FOUND
   [DEBUG] Query results - found: X, total: X
   ```

2. **Backend Console Output:**
   ```
   [PERF][BACKEND] start: 0ms
   [PERF][BACKEND] shop-lookup: XXms
   [PERF][BACKEND] consultant-query-complete: XXms
   [DEBUG] Looking up shop with instanceId: ...
   [DEBUG] Query results - found: X, total: X
   ```

3. **MongoDB Queries:**
   ```
   db.shops.findOne({ instanceId: "..." })
   db.ragisterUser.countDocuments({ userType: "consultant", isActive: true })
   ```

---

## ✅ SUCCESS CRITERIA

When the fix is working:
- ✅ Storefront renders in < 3 seconds
- ✅ Consultant cards show with data
- ✅ Only ONE API call made (no duplicates)
- ✅ Backend logs show consultants found > 0
- ✅ Network tab shows API response < 1 second

---

**Last Updated:** 2026-08-13  
**Commits:** 61b1cc6 (debugging + fixes)
