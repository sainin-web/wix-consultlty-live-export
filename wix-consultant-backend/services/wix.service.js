const axios = require("axios");
const { shopModel } = require("../Modal/shopify");
const { User } = require("../Modal/userSchema");
const dotenv = require("dotenv")
dotenv.config()

/**
 * Fetch the site display name / domain from Wix Site Properties API
 * Requires a valid access token for the instance
 */

/**
 * Auto-add "Consultly" menu item to storefront navigation
 * Called during app installation to automatically create menu entry
 */
const addConsultlyToNavigation = async (accessToken, instanceId) => {
  try {
    console.log("📍 Attempting to add Consultly to navigation...");

    // Get site navigation menus
    const navigationRes = await axios.get(
      'https://www.wixapis.com/v1/navigation/menus',
      {
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json'
        }
      }
    );

    const navMenus = navigationRes.data.menus || [];
    if (!navMenus.length) {
      console.log("ℹ️  [Wix Navigation] No navigation menus found");
      return null;
    }

    // Get primary menu (usually index 0)
    const primaryMenu = navMenus[0];
    console.log("✅ Found navigation menu:", primaryMenu.id);

    // Add "Consultly" menu item
    const addItemRes = await axios.post(
      `https://www.wixapis.com/v1/navigation/menus/${primaryMenu.id}/items`,
      {
        label: "Consultly",
        url: "/consultly",
        target: "SAME_WINDOW",
        hidden: false
      },
      {
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ [Wix Navigation] Added Consultly menu item:", addItemRes.data?.itemId);
    return addItemRes.data;

  } catch (err) {
    const errMsg = err.response?.data?.message || err.message;
    console.warn(`⚠️  [Wix Navigation] Could not auto-add menu (non-fatal):`, errMsg);
    // Don't fail installation if menu API fails
    return null;
  }
};

/**
 * Shared install logic — fetch token + save to DB + create admin user
 * Called from both the install controller (GET) and webhook (POST)
 */
const handleWixInstall = async ({ instanceId, appDefId = "", siteOwnerId = "", siteMemberId = "" }) => {
    try {
        // 1. Check if shop exists and token is still fresh
        const existing = await shopModel.findOne({ instanceId });

        // Token valid hai toh refresh ki zaroorat nahi
        // Buffer: 60 seconds pehle hi refresh kar lo safety ke liye
        if (existing && existing.accessToken && existing.tokenExpiry > (Date.now() + 60000)) {
            console.log("⏭ Token still valid for:", instanceId);
            return existing;
        }

        console.log("📡 Fetching new access token for:", instanceId);

        // 2. Wix Token API Call
        const tokenRes = await axios.post(
            "https://www.wixapis.com/oauth2/token",
            {
                grant_type: "client_credentials",
                client_id: process.env.WIX_CLIENT_ID,
                client_secret: process.env.WIX_CLIENT_SECRET,
                instance_id: instanceId,
            },
            { headers: { "Content-Type": "application/json" } }
        );

        const { access_token, expires_in } = tokenRes.data;

        // 3. Fetch site domain using the new token

        // 4. Upsert Shop
        // Sirf wahi fields update karo jo param mein aayi hain (siteOwnerId etc.)
        const updateData = {
            accessToken: access_token,
            tokenExpiry: Date.now() + expires_in * 1000,
            updatedAt: new Date(),
        };

        if (appDefId) updateData.appDefId = appDefId;
        if (siteOwnerId) updateData.siteOwnerId = siteOwnerId;
        if (siteMemberId) updateData.siteMemberId = siteMemberId;
        // if (siteDomain) updateData.shop_Domain = siteDomain;
        if (!existing) updateData.installedAt = new Date();

        const updatedShop = await shopModel.findOneAndUpdate(
            { instanceId },
            { $set: updateData },
            { upsert: true, new: true }
        );

        console.log("✅ Shop DB Sync Complete for:", instanceId);

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
        } else {
            console.log("ℹ️  Admin User already exists for:", instanceId);
        }

        // 🎯 Auto-add Consultly to storefront navigation
        await addConsultlyToNavigation(access_token, instanceId);

        return updatedShop;

    } catch (error) {
        console.error("❌ Wix Install/Token Error:", error.response?.data || error.message);
        throw new Error("Failed to handle Wix Installation");
    }
};

module.exports = { handleWixInstall, addConsultlyToNavigation };
