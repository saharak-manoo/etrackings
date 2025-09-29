import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Courier } from '../models/courier';

export interface State {
  user: any | null;
  couriers: Courier[];
  ocrCouriers: any[];
  searchHistories: any[];
  lastStatus: any[];
  sizeParcels: any[];
  trackingCount: number;
  limitTrackingHistories: number;
  keywordTrackingHistories: string;
  status: string;
  appTrackCount: number;
  removedAdsDate: string | null;
  guest: any | null;
  adAppOpenLastTime: string | null;
}

const initialState: State = {
  user: null,
  couriers: [],
  ocrCouriers: [],
  searchHistories: [],
  lastStatus: [],
  sizeParcels: [],
  trackingCount: 0,
  limitTrackingHistories: 0,
  keywordTrackingHistories: '',
  status: 'ALL',
  appTrackCount: 0,
  removedAdsDate: null,
  guest: null,
  adAppOpenLastTime: null,
};

const rootSlice = createSlice({
  name: 'root',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<any | null>) {
      state.user = action.payload;
    },
    setCouriers(state, action: PayloadAction<Courier[]>) {
      state.couriers = action.payload;
      state.ocrCouriers = action.payload;
    },
    setSearchHistories(state, action: PayloadAction<any[]>) {
      state.searchHistories = action.payload;
    },
    setLastStatus(state, action: PayloadAction<any[]>) {
      state.lastStatus = action.payload;
    },
    setSizeParcels(state, action: PayloadAction<any[]>) {
      state.sizeParcels = action.payload;
    },
    setTrackingCount(state, action: PayloadAction<number>) {
      state.trackingCount = action.payload;
    },
    setLimitTrackingHistories(state, action: PayloadAction<number>) {
      state.limitTrackingHistories = action.payload;
    },
    setKeywordTrackingHistories(state, action: PayloadAction<string>) {
      state.keywordTrackingHistories = action.payload;
    },
    setStatus(state, action: PayloadAction<string>) {
      state.status = action.payload;
    },
    setAppTrackCount(state, action: PayloadAction<number>) {
      state.appTrackCount = action.payload;
    },
    setRemovedAdsDate(state, action: PayloadAction<string | null>) {
      state.removedAdsDate = action.payload;
    },
    setGuest(state, action: PayloadAction<any | null>) {
      state.guest = action.payload;
    },
    setAdAppOpenLastTime(state, action: PayloadAction<string | null>) {
      state.adAppOpenLastTime = action.payload;
    },
  },
});

export const {
  setUser,
  setCouriers,
  setSearchHistories,
  setLastStatus,
  setSizeParcels,
  setTrackingCount,
  setLimitTrackingHistories,
  setKeywordTrackingHistories,
  setStatus,
  setAppTrackCount,
  setRemovedAdsDate,
  setGuest,
  setAdAppOpenLastTime,
} = rootSlice.actions;

export default rootSlice.reducer;
