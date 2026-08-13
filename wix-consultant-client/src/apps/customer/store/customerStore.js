/**
 * CUSTOMER REDUX STORE
 *
 * Slices:
 * - auth - Member login
 * - profile - Customer profile
 * - wallet - Wallet balance, vouchers
 * - history - Call/chat history
 */

import { configureStore, createSlice } from '@reduxjs/toolkit';

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: localStorage.getItem('wixLoggedIn') === 'true',
    user: JSON.parse(localStorage.getItem('wixUser') || 'null'),
    loading: false,
  },
  reducers: {
    setLoggedIn: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
    },
  },
});

// Profile slice
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,
    loading: false,
  },
  reducers: {
    setProfile: (state, action) => {
      state.data = action.payload;
    },
  },
});

// Wallet slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: 0,
    vouchers: [],
    loading: false,
  },
  reducers: {
    setWallet: (state, action) => {
      state.balance = action.payload.balance;
      state.vouchers = action.payload.vouchers;
    },
  },
});

// History slice
const historySlice = createSlice({
  name: 'history',
  initialState: {
    calls: [],
    chats: [],
    loading: false,
  },
  reducers: {
    setHistory: (state, action) => {
      state.calls = action.payload.calls;
      state.chats = action.payload.chats;
    },
  },
});

// Store
export const customerStore = configureStore({
  reducer: {
    auth: authSlice.reducer,
    profile: profileSlice.reducer,
    wallet: walletSlice.reducer,
    history: historySlice.reducer,
  },
  devTools: process.env.NODE_ENV === 'development',
});

export const { setLoggedIn, logout } = authSlice.actions;
export const { setProfile } = profileSlice.actions;
export const { setWallet } = walletSlice.actions;
export const { setHistory } = historySlice.actions;

export default customerStore;
