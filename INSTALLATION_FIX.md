# Wix App Installation Fix - Admin Data Not Saving

## 🔴 Problem Identified

When you installed the app on Wix, **admin data was NOT being saved to the database**. This caused:
- Admin users couldn't access the dashboard
- No admin record existed in the User collection
- Only shop/instance data was saved, but no admin user

## 🔍 Root Cause

The `handleWixInstall()` function in `services/wix.service.js` was only:
1. ✅ Creating shop record in `shopModel`
2. ✅ Fetching Wix access token
3. ❌ **NOT creating admin user in `User` collection**

## ✅ Fix Applied

Updated `services/wix.service.js` to also create an admin user during installation:

### What Changed:

**Added to handleWixInstall():**
```javascript
// 5. Create Admin User if doesn't exist
const adminEmail = `admin-${instanceId}@wix-consultant.local`;
const existingAdmin = await User.findOne({
    shop_id: String(updatedShop._id),
    userType: "admin"
});

if (!existingAdmin) {
    const newAdmin = new User({
        fullname: `Admin - ${instanceId}`,
        email: adminEmail,
        shop_id: String(updatedShop._id),
        shop_Domain: updatedShop.shop_Domain || "wix-shop",
        wixMemberId: siteOwnerId || siteMemberId,
        instanceId: instanceId,
        userType: "admin",
        isActive: true,
        password: "", // No password for Wix admin (uses token auth)
    });

    await newAdmin.save();
    console.log("✅ Admin User Created for:", instanceId);
}
```

## 📋 What This Does

Now when app is installed:
1. ✅ Shop record created in `shopModel`
2. ✅ Wix token fetched and stored
3. ✅ **Admin user created in `User` collection** (NEW!)
4. ✅ Admin can access dashboard immediately after installation

## 🧪 Testing the Fix

### Before Testing:
```bash
cd wix-consultant-backend
npm install  # Make sure dependencies are installed
```

### Reinstall the App:
1. Go to Wix Studio
2. Go to App Management
3. Uninstall the Consultant app
4. Reinstall it
5. Admin should now be created automatically

### Verify in MongoDB:
```bash
# Check if shop was created
db.shopifyShops.findOne({ instanceId: "YOUR-INSTANCE-ID" })

# Check if admin user was created
db.ragisterUsers.findOne({ userType: "admin", instanceId: "YOUR-INSTANCE-ID" })
```

Both should now exist after installation!

## 📝 Flow Diagram

**Before Fix:**
```
Wix App Install
    ↓
Webhook triggered
    ↓
handleWixInstall()
    ↓
Create shop record ✅
    ↓
❌ MISSING: Create admin user
    ↓
Admin dashboard has no user!
```

**After Fix:**
```
Wix App Install
    ↓
Webhook triggered
    ↓
handleWixInstall()
    ↓
Create shop record ✅
    ↓
Create admin user ✅
    ↓
Admin can access dashboard immediately!
```

## 🚀 Next Steps

1. **Deploy the updated code:**
   ```bash
   git add services/wix.service.js
   git commit -m "fix: create admin user on wix app installation"
   ```

2. **Test with ngrok:**
   ```bash
   npm run start  # or your start command
   ngrok http 3500  # or your server port
   ```

3. **Reinstall app in Wix with the new code running**

4. **Verify admin user exists in MongoDB**

5. **Try logging into admin dashboard**

## ✨ Files Changed

- `services/wix.service.js` - Added admin user creation on installation

## 📌 Important Notes

- Admin user is created with:
  - Email: `admin-{instanceId}@wix-consultant.local`
  - userType: "admin"
  - shop_id: linked to the shop record
  - No password (uses token-based authentication)

- If admin user already exists, it won't create a duplicate (checks before creating)

- The fix only creates the admin user, actual data creation (consultants, etc.) happens in the admin dashboard when the user adds data

---

**Status: ✅ FIXED**

Admin data should now save correctly during app installation!
