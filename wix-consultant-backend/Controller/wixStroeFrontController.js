const { shopModel } = require("../Modal/shopify");
const { User } = require("../Modal/userSchema");
const axios = require("axios");
const mongoose = require("mongoose");

const getAllConsultantWixStoreFront = async (req, res) => {
  const startTime = Date.now();
  const t = (label) => console.log(`[PERF][BACKEND] ${label}: ${Date.now() - startTime}ms`);

  try {
    t('start');
    const authHeader = req.headers.authorization;
    const instance = authHeader?.split(" ")[1];

    if (!instance) {
      return res.status(401).json({
        success: false,
        message: "No instance provided",
      });
    }

    t('instance-extracted');

    // Lookup shop by instanceId — must be indexed
    const findAdmin = await shopModel.findOne({
      instanceId: instance,
    }).lean().select("_id");

    t('shop-lookup');

    if (!findAdmin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const shop_id = findAdmin._id;

    // Pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(24, parseInt(req.query.limit) || 12); // Max 24 per page
    const skip = (page - 1) * limit;

    t('pagination-setup');

    // Optimized query: only fetch required fields for storefront cards
    // Use .lean() to get plain objects instead of Mongoose documents
    const [consultants, totalCount] = await Promise.all([
      User.find({
        userType: "consultant",
        shop_id: shop_id,
        isActive: true, // Only show active consultants
      })
        .select("_id fullname profession profileImage experience language chatPerMinute voicePerMinute videoPerMinute")
        .lean()
        .skip(skip)
        .limit(limit)
        .exec(),
      User.countDocuments({
        userType: "consultant",
        shop_id: shop_id,
        isActive: true,
      })
    ]);

    t('consultant-query-complete');

    // Transform to response format
    const hostBase = `${req.protocol}://${req.get("host")}`;
    const formattedConsultants = consultants.map((item) => ({
      _id: item._id,
      fullname: item.fullname,
      profession: item.profession,
      experience: item.experience,
      language: item.language,
      chatPerMinute: item.chatPerMinute,
      voicePerMinute: item.voicePerMinute,
      videoPerMinute: item.videoPerMinute,
      profileImage: item.profileImage
        ? `${hostBase}/${item.profileImage.replace(/\\/g, "/")}`
        : null,
    }));

    t('transform-complete');

    const hasNextPage = skip + limit < totalCount;
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      findConsultant: formattedConsultants,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage,
      },
    });
  } catch (error) {
    console.error("[ERROR] getAllConsultantWixStoreFront:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// const buyVoucherController = async (req, res) => {
//   try {
//     const { adminId } = req.params;
//     const { wixProductId } = req.body;

//     /*
//       ============================
//       VALIDATIONS
//       ============================
//     */
//     if (!mongoose.Types.ObjectId.isValid(adminId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid admin ID" });
//     }

//     if (!wixProductId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "wixProductId is required" });
//     }

//     const admin = await shopModel.findById(adminId);
//     if (!admin)
//       return res
//         .status(404)
//         .json({ success: false, message: "Admin not found" });
//     if (!admin.accessToken)
//       return res
//         .status(400)
//         .json({ success: false, message: "Access token missing" });

//     /*
//       ============================
//       FIND VOUCHER
//       ============================
//     */
//     const voucher = admin.vouchers.find((v) => v.wixProductId === wixProductId);
//     if (!voucher)
//       return res
//         .status(404)
//         .json({ success: false, message: "Voucher not found" });

//     /*
//       ============================
//       STEP 1: CREATE CHECKOUT DIRECTLY
//       POST /ecom/v1/checkouts
//       ============================
//     */
//     const checkoutResponse = await axios.post(
//       "https://www.wixapis.com/ecom/v1/checkouts",
//       {
//         channelType: "WEB",
//         lineItems: [
//           {
//             catalogReference: {
//               catalogItemId: wixProductId,
//               appId: "e87fc4f0-d74b-463f-ad77-b813eec84846",
//             },
//             quantity: 1,
//           },
//         ],
//       },
//       {
//         headers: {
//           Authorization: admin.accessToken,
//           "Content-Type": "application/json",
//         },
//       },
//     );

//     console.log(
//       "Full Checkout Response:",
//       JSON.stringify(checkoutResponse.data, null, 2),
//     );

//     const checkout = checkoutResponse.data.checkout;

//     // ✅ FIX: Wix returns "id" not "_id"
//     const checkoutId = checkout.id || checkout._id;

//     console.log("Checkout Created ID:", checkoutId);

//     if (!checkoutId) {
//       return res.status(500).json({
//         success: false,
//         message: "Checkout ID missing from Wix response",
//         wixResponse: checkoutResponse.data,
//       });
//     }

//     /*
//       ============================
//       STEP 2: GET CHECKOUT URL
//       GET /ecom/v1/checkouts/{checkoutId}/checkout-url
//       ============================
//     */
//     const checkoutUrlResponse = await axios.get(
//       `https://www.wixapis.com/ecom/v1/checkouts/${checkoutId}/checkout-url`,
//       {
//         headers: {
//           Authorization: admin.accessToken,
//           "Content-Type": "application/json",
//         },
//       },
//     );

//     console.log(
//       "Checkout URL Response:",
//       JSON.stringify(checkoutUrlResponse.data, null, 2),
//     );

//     // ✅ FIX: Wix returns checkoutUrl inside object
//     const checkoutUrl =
//       checkoutUrlResponse.data.checkoutUrl ||
//       checkoutUrlResponse.data.url ||
//       checkout.checkoutUrl; // fallback: sometimes it's in checkout object itself

//     console.log("Checkout URL:", checkoutUrl);

//     if (!checkoutUrl) {
//       return res.status(500).json({
//         success: false,
//         message: "Checkout URL missing from Wix response",
//         wixResponse: checkoutUrlResponse.data,
//       });
//     }

//     /*
//       ============================
//       RETURN TO FRONTEND
//       ============================
//     */
//     return res.status(200).json({
//       success: true,
//       message: "Checkout ready",
//       data: {
//         checkoutId,
//         checkoutUrl,
//         voucher: {
//           totalCoin: voucher.totalCoin,
//           extraCoin: voucher.extraCoin,
//           price: voucher.price,
//           wixProductSlug: voucher.wixProductSlug,
//         },
//       },
//     });
//   } catch (error) {
//     console.log("Buy voucher error:", error.response?.data || error.message);

//     if (error.response?.status === 401) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Wix token invalid or expired" });
//     }
//     if (error.response?.status === 403) {
//       return res
//         .status(403)
//         .json({ success: false, message: "Insufficient Wix permissions" });
//     }
//     if (error.response?.status === 404) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found on Wix" });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// };
const buyVoucherController = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { wixProductId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ success: false, message: "Invalid admin ID" });
    }

    if (!wixProductId) {
      return res.status(400).json({ success: false, message: "wixProductId is required" });
    }

    const admin = await shopModel.findById(adminId);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    /*
      ============================
      FIND VOUCHER
      ============================
    */
    const voucher = admin.vouchers.find((v) => v.wixProductId === wixProductId);
    if (!voucher) return res.status(404).json({ success: false, message: "Voucher not found" });

    /*
      ============================
      BUILD PRODUCT PAGE URL
      Wix product page has its own
      "Add to Cart" + checkout flow
      No API cart/checkout needed
      ============================
    */

    // wixSiteUrl save hona chahiye admin model mein
    // e.g. "https://www.dev-site-1x530.wix-dev-sites.org"
    const siteBase = admin.wixSiteUrl
      || voucher.wixSiteUrl
      || "https://www.dev-site-1x530.wix-dev-sites.org"; // fallback for now

    const productPageUrl = `${siteBase}/product-page/${voucher.wixProductSlug}`;

    console.log("Product Page URL:", productPageUrl);

    return res.status(200).json({
      success: true,
      message: "Voucher buy URL ready",
      data: {
        productPageUrl,        // ✅ user isko open kare — Wix handles cart + checkout
        voucher: {
          totalCoin: voucher.totalCoin,
          extraCoin: voucher.extraCoin,
          price: voucher.price,
          wixProductSlug: voucher.wixProductSlug,
          wixProductId: voucher.wixProductId,
        },
      },
    });

  } catch (error) {
    console.log("Buy voucher error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
module.exports = { getAllConsultantWixStoreFront, buyVoucherController };
