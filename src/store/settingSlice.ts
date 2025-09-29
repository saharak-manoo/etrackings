import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  isSystemDarkMode: boolean;
  isDarkMode: boolean;
  appColor: string;
  bgLogoColor: string;
  textColor: string;
  cardColor: string;
  cardColorDisable: string;
  deliveredColor: string;
  inDeliveredColor: string;
  waitColor: string;
  unableSendParcelColor: string;
  pickedUpColor: string;
  returnedToSenderColor: string;
  locale: string;
  isLanguageTH: boolean;
  animation: string;
  isSelectColor: boolean;
  isBiometrics: boolean;
  inputColor: string;
  notSelectColor: string;
  initialURL: string | null;
  menu: string;
  isNonPersonalizedAdsOnly: boolean;
  isHideOnDelivered: boolean;
  isHideReturnedToSender: boolean;
  isHideTrackingButton: boolean;
  isShowSwitchNotification: boolean;
  isAgreeTermsAndConditions: boolean;
  isAutoCopiedText?: boolean;
  isShowCouriers?: boolean;
  textTimelineColor?: string;
  textSubtitle?: string;
}

const initialState: SettingsState = {
  isSystemDarkMode: true,
  isDarkMode: false,
  appColor: '#EEEEEE',
  bgLogoColor: '#FFF',
  textColor: '#000',
  cardColor: '#FFF',
  cardColorDisable: '#4B4B4B',
  deliveredColor: 'rgba(130, 250, 132, 0.3)',
  inDeliveredColor: 'rgba(252, 192, 44, 0.3)',
  waitColor: 'rgba(2, 94, 219, 0.3)',
  unableSendParcelColor: 'rgba(254, 41, 67, 0.3)',
  pickedUpColor: 'rgba(28, 223, 254, 0.3)',
  returnedToSenderColor: 'rgba(255, 167, 38, 0.3)',
  locale: 'th',
  isLanguageTH: true,
  animation: 'fast',
  isSelectColor: true,
  isBiometrics: false,
  inputColor: '#EEEEEE',
  notSelectColor: '#CBCBCB',
  initialURL: null,
  menu: 'trackHistoryOnly',
  isNonPersonalizedAdsOnly: false,
  isHideOnDelivered: false,
  isHideReturnedToSender: false,
  isHideTrackingButton: false,
  isShowSwitchNotification: false,
  isAgreeTermsAndConditions: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSystemDarkMode(state, action: PayloadAction<boolean>) {
      state.isSystemDarkMode = action.payload;
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.isDarkMode = action.payload;

      // Update related colors based on dark mode flag
      if (action.payload) {
        state.appColor = '#202020';
        state.bgLogoColor = '#000';
        state.textColor = '#FFF';
        state.cardColor = '#363636';
        state.textTimelineColor = '#EEEEEE';
        state.textSubtitle = '#EEEEEE';
        state.cardColorDisable = '#4B4B4B';
        state.deliveredColor = 'rgba(42, 252, 156, 0.6)';
        state.inDeliveredColor = 'rgba(252, 192, 44, 0.8)';
        state.waitColor = 'rgba(2, 94, 219, 0.8)';
        state.unableSendParcelColor = 'rgba(254, 41, 67, 0.8)';
        state.pickedUpColor = 'rgba(54, 140, 244, 0.8)';
        state.returnedToSenderColor = 'rgba(255, 167, 38, 0.6)';
        state.notSelectColor = '#4F4F4F';
        state.inputColor = '#363636';
      } else {
        state.appColor = '#EEEEEE';
        state.bgLogoColor = '#FFF';
        state.textColor = '#000';
        state.cardColor = '#FFF';
        state.textTimelineColor = 'gray';
        state.textSubtitle = '#666666';
        state.cardColorDisable = '#4B4B4B';
        state.deliveredColor = 'rgba(130, 250, 132, 0.2)';
        state.inDeliveredColor = 'rgba(252, 192, 44, 0.3)';
        state.waitColor = 'rgba(2, 94, 219, 0.3)';
        state.unableSendParcelColor = 'rgba(254, 41, 67, 0.3)';
        state.pickedUpColor = 'rgba(54, 140, 244, 0.3)';
        state.returnedToSenderColor = 'rgba(255, 167, 38, 0.3)';
        state.notSelectColor = '#CBCBCB';
        state.inputColor = '#FFF';
      }
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.locale = action.payload;
      state.isLanguageTH = action.payload === 'th';
    },
    setBiometrics(state, action: PayloadAction<boolean>) {
      state.isBiometrics = action.payload;
    },
    setAnimation(state, action: PayloadAction<string>) {
      state.animation = action.payload;
    },
    setSelectColor(state, action: PayloadAction<boolean>) {
      state.isSelectColor = action.payload;
    },
    setCopiedText(state, action: PayloadAction<boolean>) {
      state.isAutoCopiedText = action.payload;
    },
    setShowCouriers(state, action: PayloadAction<boolean>) {
      state.isShowCouriers = action.payload;
    },
    setInitialURL(state, action: PayloadAction<string | null>) {
      state.initialURL = action.payload;
    },
    setMenu(state, action: PayloadAction<string>) {
      state.menu = action.payload;
    },
    setHideOnDelivered(state, action: PayloadAction<boolean>) {
      state.isHideOnDelivered = action.payload;
    },
    setHideReturnedToSender(state, action: PayloadAction<boolean>) {
      state.isHideReturnedToSender = action.payload;
    },
    setNonPersonalizedAdsOnly(state, action: PayloadAction<boolean>) {
      state.isNonPersonalizedAdsOnly = action.payload;
    },
    setHideTrackingButton(state, action: PayloadAction<boolean>) {
      state.isHideTrackingButton = action.payload;
    },
    setShowSwitchNotification(state, action: PayloadAction<boolean>) {
      state.isShowSwitchNotification = action.payload;
    },
    setAgreeTermsAndConditions(state, action: PayloadAction<boolean>) {
      state.isAgreeTermsAndConditions = action.payload;
    },
  },
});

export const {
  setSystemDarkMode,
  setDarkMode,
  setLanguage,
  setBiometrics,
  setAnimation,
  setSelectColor,
  setCopiedText,
  setShowCouriers,
  setInitialURL,
  setMenu,
  setHideOnDelivered,
  setHideReturnedToSender,
  setNonPersonalizedAdsOnly,
  setHideTrackingButton,
  setShowSwitchNotification,
  setAgreeTermsAndConditions,
} = settingsSlice.actions;

export default settingsSlice.reducer;
