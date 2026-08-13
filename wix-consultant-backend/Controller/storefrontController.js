/**
 * STOREFRONT CONTROLLER
 *
 * Dedicated lightweight API for public consultant marketplace.
 *
 * Endpoints:
 * - GET /api/storefront/consultants — List consultants with pagination
 * - GET /api/storefront/consultant/:id — Single consultant profile
 *
 * RESPONSE FIELDS ONLY:
 * - id
 * - name
 * - profileImage
 * - profession
 * - experience
 * - languages
 * - isActive
 * - chatPerMinute
 * - voicePerMinute
 * - videoPerMinute
 *
 * NO:
 * - password
 * - email (unless needed for auth)
 * - private fields
 * - wallet data
 * - call history
 * - admin fields
 */

const { shopModel } = require('../Modal/shopify');
const { User } = require('../Modal/userSchema');

/**
 * GET /api/storefront/consultants
 *
 * Query:
 * - page: 1 (default)
 * - limit: 20 (default, max 50)
 * - shop_id: string (required)
 *
 * Returns:
 * {
 *   success: true,
 *   consultants: [...],
 *   pagination: { page, limit, total, hasMore }
 * }
 */
const getStorefrontConsultants = async (req, res) => {
  const startTime = Date.now();
  const t = (label) => console.log(`[STORE_PERF][BACKEND] ${label}: ${Date.now() - startTime}ms`);

  try {
    t('start');

    // Get shop_id from request
    const { shop_id } = req.query;
    const authHeader = req.headers.authorization;
    const instance = authHeader?.split(' ')[1];

    console.log('[STOREFRONT-API] Request:', { shop_id, instance: instance ? instance.substring(0, 20) + '...' : 'missing' });

    // Validate shop_id
    if (!shop_id) {
      console.warn('[STOREFRONT-API] No shop_id provided');
      return res.status(400).json({
        success: false,
        message: 'shop_id is required',
      });
    }

    t('shop-id-validated');

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    t('pagination-setup');

    // Query: lightweight projection + lean
    const [consultants, totalCount] = await Promise.all([
      User.find({
        shop_id: shop_id.toString(),
        userType: 'consultant',
        isActive: true,
      })
        .select(
          '_id fullname profession profileImage experience language chatPerMinute voicePerMinute videoPerMinute'
        )
        .lean()
        .skip(skip)
        .limit(limit)
        .exec(),
      User.countDocuments({
        shop_id: shop_id.toString(),
        userType: 'consultant',
        isActive: true,
      }),
    ]);

    t('consultants-query-complete');

    console.log('[STOREFRONT-API] Query results:', {
      found: consultants.length,
      total: totalCount,
      page,
      limit,
    });

    // Format response
    const hostBase = `${req.protocol}://${req.get('host')}`;
    const formattedConsultants = consultants.map((consultant) => ({
      id: consultant._id.toString(),
      name: consultant.fullname || 'Consultant',
      profileImage: consultant.profileImage
        ? `${hostBase}/${consultant.profileImage.replace(/\\/g, '/')}`
        : null,
      profession: consultant.profession || '',
      experience: parseInt(consultant.experience) || 0,
      languages: Array.isArray(consultant.language)
        ? consultant.language
        : consultant.language
        ? [consultant.language]
        : [],
      isActive: true,
      chatPerMinute: parseInt(consultant.chatPerMinute) || 0,
      voicePerMinute: parseInt(consultant.voicePerMinute) || 0,
      videoPerMinute: parseInt(consultant.videoPerMinute) || 0,
    }));

    t('response-formatted');

    const hasMore = skip + limit < totalCount;
    const totalPages = Math.ceil(totalCount / limit);

    console.log('[STOREFRONT-API] SUCCESS:', {
      consultantsReturned: formattedConsultants.length,
      totalAvailable: totalCount,
      totalTime: Date.now() - startTime + 'ms',
    });

    return res.status(200).json({
      success: true,
      consultants: formattedConsultants,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error('[STOREFRONT-API] ERROR:', error.message);
    console.error('[STOREFRONT-API] Stack:', error.stack);

    return res.status(500).json({
      success: false,
      message: 'Failed to load consultants',
      error: error.message,
    });
  }
};

/**
 * GET /api/storefront/consultant/:id
 *
 * Get single consultant profile (public).
 */
const getStorefrontConsultantProfile = async (req, res) => {
  const { id } = req.params;

  try {
    console.log('[STOREFRONT-API-PROFILE] Fetching:', id);

    const consultant = await User.findById(id)
      .select(
        '_id fullname profession profileImage experience language chatPerMinute voicePerMinute videoPerMinute bio'
      )
      .lean()
      .exec();

    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant not found',
      });
    }

    // Format response
    const hostBase = `${req.protocol}://${req.get('host')}`;
    const formatted = {
      id: consultant._id.toString(),
      name: consultant.fullname || 'Consultant',
      profileImage: consultant.profileImage
        ? `${hostBase}/${consultant.profileImage.replace(/\\/g, '/')}`
        : null,
      profession: consultant.profession || '',
      experience: parseInt(consultant.experience) || 0,
      languages: Array.isArray(consultant.language)
        ? consultant.language
        : consultant.language
        ? [consultant.language]
        : [],
      chatPerMinute: parseInt(consultant.chatPerMinute) || 0,
      voicePerMinute: parseInt(consultant.voicePerMinute) || 0,
      videoPerMinute: parseInt(consultant.videoPerMinute) || 0,
      bio: consultant.bio || '',
    };

    return res.status(200).json({
      success: true,
      consultant: formatted,
    });
  } catch (error) {
    console.error('[STOREFRONT-API-PROFILE] ERROR:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to load consultant',
      error: error.message,
    });
  }
};

module.exports = {
  getStorefrontConsultants,
  getStorefrontConsultantProfile,
};
