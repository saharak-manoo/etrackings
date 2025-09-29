import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './dataSlice';
import settingReducer from './settingSlice';

export const store = configureStore({
  reducer: {
    data: dataReducer,
    setting: settingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
