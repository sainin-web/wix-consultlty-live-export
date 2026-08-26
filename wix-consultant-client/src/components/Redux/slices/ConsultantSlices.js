import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { perfMark, perfMeasure } from "../../../utils/performanceMonitor";

// API call using createAsyncThunk

export const fetchConsultants = createAsyncThunk(
  "consultants/fetch",
  async ({ instance, page = 1, limit = 12 }) => {
    perfMark('api:consultant-fetch-start');

    const authToken = instance || localStorage.getItem("wix_instance") || "";
    const apiUrl = `${process.env.REACT_APP_BACKEND_HOST}/api/consultant/wix-store-front`;

    console.log("[API-DEBUG] fetchConsultants called with:", { instance, page, limit });
    console.log("[API-DEBUG] Using authToken:", authToken.substring(0, 20) + "...");
    console.log("[API-DEBUG] Calling endpoint:", apiUrl);

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          page,
          limit,
        },
      });

      perfMark('api:consultant-fetch-end');
      perfMeasure('api:consultant-fetch-start', 'api:consultant-fetch-end');

      console.log("[API-DEBUG] Response received:", {
        status: response.status,
        statusText: response.statusText,
        dataKeys: response.data ? Object.keys(response.data) : "null",
        consultantCount: response.data?.findConsultant?.length || 0,
        fullResponse: response.data
      });

      console.log("[PERF] Consultant API response:", {
        count: response.data?.findConsultant?.length,
        pagination: response.data?.pagination,
      });

      return response.data;
    } catch (error) {
      console.error("[API-ERROR] fetchConsultants failed:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorData: error.response?.data,
        fullError: error
      });
      throw error;
    }
  },
);

/**
 * get consultant with shop id and consultant id
 */
export const fetchConsultantById = createAsyncThunk(
  "consultants/fetchById",
  async ({ shop_id, consultant_id, token, shop }) => {
    console.log(" shop_id, consultant_id, token, shop ", shop_id, consultant_id)
    console.log("token", token);
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_HOST}/api/api-consultant/consultant-by-shop-id-and-consultant-id/${shop_id}/${consultant_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log("response", response);
    return response.data;
  },
);

/**
 * get chat history with shop id and consultant id
 */
export const fetchChatHistory = createAsyncThunk(
  "consultants/fetchChatHistory",
  async ({ shopId, userId, consultantId }) => {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_HOST}/api/chat/get/chat-history/${shopId}/${userId}/${consultantId}`,
    );
    return response.data;
  },
);

export const deleteConsultantById = createAsyncThunk(
  "consultants/delete",
  async (id) => {
    const response = await axios.delete(
      `${process.env.REACT_APP_BACKEND_HOST}/api-consultant/delete-consultant/${id}`,
    );
    return response.data;
  },
);

export const updateUserRequestById = createAsyncThunk(
  "consultants/updateUserRequestById",
  async ({
    shopId = "6a05a2a968ff4f71b20ef0d1",
    userId,
    consultantId,
    token,
    shop,
  }) => {
    const response = await axios.put(
      `${process.env.REACT_APP_BACKEND_HOST}/api/chat/update-user-request/${shopId}/${userId}/${consultantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },
);

const consultantSlice = createSlice({
  name: "consultants",
  initialState: {
    consultants: [],
    consultantOverview: null,
    chatHistory: null,
    loading: false,
    error: null,
    deletedConsultant: null,
    userInRequest: null,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchConsultants.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConsultants.fulfilled, (state, action) => {
        state.loading = false;
        state.consultants = action.payload;
      })
      .addCase(fetchConsultants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteConsultantById.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteConsultantById.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedConsultant = action.payload;
      })
      .addCase(deleteConsultantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchConsultantById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConsultantById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.consultant) {
          state.consultantOverview = action.payload;
          const c = action.payload.consultant;
          if (c.fullname) localStorage.setItem("consultant_display_name", c.fullname);
          if (c.email) localStorage.setItem("consultant_display_email", c.email);
        }
      })
      .addCase(fetchConsultantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.chatHistory = action.payload;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateUserRequestById.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.userInRequest = action.payload;
      })
      .addCase(updateUserRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default consultantSlice.reducer;
