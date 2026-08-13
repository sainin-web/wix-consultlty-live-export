/**
 * STOREFRONT REDUX STORE
 *
 * MINIMAL Redux store for public marketplace only.
 *
 * Slices:
 * - consultants — Consultant listing, pagination, loading/error states
 *
 * Does NOT include:
 * - User authentication
 * - Consultant account
 * - Customer profile
 * - Wallet
 * - Admin
 * - Call history
 * - Chat state
 */

import { configureStore, createSlice } from '@reduxjs/toolkit';

/**
 * Consultant Listing Slice
 *
 * State:
 * - consultants: []
 * - page: 1
 * - limit: 20
 * - total: 0
 * - hasMore: false
 * - loading: false
 * - error: null
 * - cached: false
 */
const consultantSlice = createSlice({
  name: 'consultants',
  initialState: {
    consultants: [],
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
    loading: false,
    error: null,
    cached: false,
    cacheTimestamp: null,
  },
  reducers: {
    // Fetch start
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    // Fetch success
    fetchSuccess: (state, action) => {
      const { consultants, page, limit, total, hasMore } = action.payload;
      state.consultants = consultants;
      state.page = page;
      state.limit = limit;
      state.total = total;
      state.hasMore = hasMore;
      state.loading = false;
      state.cached = true;
      state.cacheTimestamp = Date.now();
    },
    // Fetch error
    fetchError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Append page (for load-more)
    appendPage: (state, action) => {
      const { consultants, page, hasMore } = action.payload;
      state.consultants.push(...consultants);
      state.page = page;
      state.hasMore = hasMore;
      state.loading = false;
    },
    // Clear cache
    clearCache: (state) => {
      state.consultants = [];
      state.cached = false;
      state.cacheTimestamp = null;
    },
  },
});

export const {
  fetchStart,
  fetchSuccess,
  fetchError,
  appendPage,
  clearCache,
} = consultantSlice.actions;

/**
 * Storefront Redux Store
 *
 * MINIMAL configuration:
 * - Only consultants slice
 * - No dev tools in production
 * - No middleware except default
 */
export const storefrontStore = configureStore({
  reducer: {
    consultants: consultantSlice.reducer,
  },
  devTools: process.env.NODE_ENV === 'development',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['consultants/fetchSuccess'],
      },
    }),
});

export default storefrontStore;
