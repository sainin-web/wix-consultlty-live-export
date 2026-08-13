/**
 * CONSULTANT REDUX STORE
 *
 * Slices:
 * - auth - Consultant login, token, user data
 * - profile - Consultant profile info
 * - availability - Availability schedule
 * - earnings - Earnings/wallet
 * - calls - Call logs
 */

import { configureStore, createSlice } from '@reduxjs/toolkit';

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: localStorage.getItem('consultant_logged_in') === 'true',
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('consultant_user') || 'null'),
    loading: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.loading = false;
    },
    loginError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.user = null;
      localStorage.removeItem('consultant_logged_in');
      localStorage.removeItem('token');
      localStorage.removeItem('consultant_user');
    },
  },
});

// Profile slice
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    fetchProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state, action) => {
      state.data = action.payload;
      state.loading = false;
    },
    fetchProfileError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateProfile: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    },
  },
});

// Earnings slice
const earningsSlice = createSlice({
  name: 'earnings',
  initialState: {
    balance: 0,
    totalEarnings: 0,
    transactions: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchEarningsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEarningsSuccess: (state, action) => {
      state.balance = action.payload.balance;
      state.totalEarnings = action.payload.totalEarnings;
      state.transactions = action.payload.transactions || [];
      state.loading = false;
    },
    fetchEarningsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

// Store
export const consultantStore = configureStore({
  reducer: {
    auth: authSlice.reducer,
    profile: profileSlice.reducer,
    earnings: earningsSlice.reducer,
  },
  devTools: process.env.NODE_ENV === 'development',
});

export const { loginStart, loginSuccess, loginError, logout } = authSlice.actions;
export const { fetchProfileStart, fetchProfileSuccess, fetchProfileError, updateProfile } = profileSlice.actions;
export const { fetchEarningsStart, fetchEarningsSuccess, fetchEarningsError } = earningsSlice.actions;

export default consultantStore;
