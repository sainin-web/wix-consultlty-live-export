/**
 * Wix Context Controller
 * Provides Wix authentication context to the frontend custom element
 * Called by the React widget to obtain access tokens and verification
 */

const { shopModel } = require("../Modal/shopify");
const {
  resolveWixInstanceFromAuthHeader,
} = require("../services/wixInstanceFromToken");

/**
 * GET /api/wix-context
 * Endpoint for frontend to verify and obtain Wix context
 *
 * The frontend can call this with:
 * 1. Authorization header with Wix access token (best option)
 * 2. Instance query param (install JWT)
 * 3. No auth (will return 401)
 *
 * Returns: { success: true, accessToken, shopId, instanceId }
 */
const getWixContext = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const instanceParam = req.query.instance || req.body.instance;

    console.log("[WIX-CONTEXT] Request received");
    console.log("[WIX-CONTEXT] authHeader:", authHeader ? "present" : "missing");
    console.log("[WIX-CONTEXT] instanceParam:", instanceParam ? "present" : "missing");

    let resolved;

    // Try authorization header first (OAuth token or install JWT)
    if (authHeader) {
      resolved = await resolveWixInstanceFromAuthHeader(authHeader);

      if (resolved.success) {
        console.log("[WIX-CONTEXT] Token verified via Authorization header");
        const instanceId = resolved.instanceId;

        // Look up shop
        const shop = await shopModel.findOne({ instanceId })
          .lean()
          .select("_id");

        if (!shop) {
          return res.status(401).json({
            success: false,
            message: "Shop not found for instance",
          });
        }

        return res.json({
          success: true,
          accessToken: resolved.instance || authHeader.replace(/^Bearer\s+/i, ""),
          shopId: shop._id.toString(),
          instanceId,
        });
      }

      // If header verification failed, fall through to other options
      console.log("[WIX-CONTEXT] Authorization header verification failed");
    }

    // Try instance parameter (install JWT format)
    if (instanceParam) {
      console.log("[WIX-CONTEXT] Attempting to verify instance param");

      // Pass as bearer token for consistent verification
      const result = await resolveWixInstanceFromAuthHeader(`Bearer ${instanceParam}`);

      if (result.success) {
        const instanceId = result.instanceId;
        const shop = await shopModel.findOne({ instanceId })
          .lean()
          .select("_id");

        if (!shop) {
          return res.status(401).json({
            success: false,
            message: "Shop not found for instance",
          });
        }

        return res.json({
          success: true,
          accessToken: instanceParam,
          shopId: shop._id.toString(),
          instanceId,
        });
      }
    }

    // No valid authentication
    return res.status(401).json({
      success: false,
      message: "No valid Wix authentication found",
    });
  } catch (error) {
    console.error("[WIX-CONTEXT] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getWixContext };
