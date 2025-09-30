import React, { useRef, useState, useEffect } from 'react';
import analytics from '@react-native-firebase/analytics';
import * as Api from '../actions/api';
import {
  NavigationContainer,
  CommonActions,
  NavigationContainerRef,
} from '@react-navigation/native';
import RNBootSplash from 'react-native-bootsplash';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';
import MobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import i18next from 'i18next';
import RNLanguageDetector from '@os-team/i18next-react-native-language-detector';
import {
  setAgreeTermsAndConditions,
  setAnimation,
  setCopiedText,
  setDarkMode,
  setHideOnDelivered,
  setHideTrackingButton,
  setLanguage,
  setMenu,
  setNonPersonalizedAdsOnly,
  setSelectColor,
  setShowCouriers,
  setShowSwitchNotification,
  setSystemDarkMode,
} from '../../store/settingSlice';
import { setCouriers, setLimitTrackingHistories } from '../../store/dataSlice';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from 'react-native-dynamic';
import {
  APP_UPDATE_URL,
  HTTP_STATUSES,
  LOGIN_PAGE_URL,
  LOGO_DARK_URL,
  LOGO_LIGHT_URL,
  NO_WIFI_URL,
  REMOVE_ADS_URL,
  SEARCH_NOT_FOUND_URL,
  SERVER_ERROR_URL,
  SYSTEM_MAINTENANCE_URL,
  WAIT_PARCEL_URL,
} from '../actions/constants';
import { Courier } from '../../models/courier';
import FastImage from '@d11/react-native-fast-image';

import TabNavigation from './tabNavigation';

// Views
import LogoView from '../logo/logoView';
import IntroView from '../intro/introView';
import TermsAndConditionsView from '../termsAndConditions/termsAndConditionsView';
import LoginView from '../auth/login/loginView';
import RegisterView from '../auth/register/registerView';
import ForgotPasswordView from '../auth/forgotPassword/forgotPasswordView';
import ReConfirmEmailView from '../auth/reConfirmEmail/reConfirmEmailView';
import ProfileView from '../profile/profileView';
import GuestSearchView from '../guest/guestSearchView';
import TrackDetailView from '../trackDetail/trackDetailView';
import CheckPriceDetailView from '../checkPrice/checkPriceDetailView';
import OcrDetailView from '../scanner/ocrDetailView';
import TrackingSettingView from '../trackDetail/trackingSettingView';
import SettingNotificationView from '../profile/settingNotificationView';
import SettingAppView from '../profile/settingAppView';
import ManageDeviceView from '../profile/manageDeviceView';
import PackageView from '../profile/packageView';
import ManageDataView from '../profile/manageDataView';
import RewardedAdView from '../profile/rewardedAdView';
import CheckPriceStoreView from '../checkPrice/checkPriceStoreView';
import ScreenWithBanner from './screenWithBanner';
import { Platform } from 'react-native';

type RootStackParamList = {
  Logo: undefined;
  Intro: undefined;
  TermsAndConditions: { isAgree: boolean };
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ReConfirmEmail: undefined;
  Profile: undefined;
  Home: undefined;
  Guest: undefined;
  TrackDetail: undefined;
  CheckPriceDetail: undefined;
  OcrDetail: undefined;
  TrackingSetting: undefined;
  SettingNotification: undefined;
  SettingApp: undefined;
  ManageDevice: undefined;
  Package: undefined;
  ManageData: undefined;
  RewardedAd: undefined;
  CheckPriceStore: undefined;
};

const inAppUpdates = new SpInAppUpdates(
  __DEV__, // isDebug
);

const RootStack = createStackNavigator<RootStackParamList>();

function Navigation() {
  const { t } = useTranslation();
  const routeNameRef = useRef<string>('');
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);
  const dispatch = useDispatch();
  const isDarkMode = useDarkMode();
  const [isAgreeTermsAndCondition, setAgreeTermsAndCondition] = useState(false);
  const [isAppReady, setAppReady] = useState(false);

  const data = useSelector((state: RootState) => state.data);
  const setting = useSelector((state: RootState) => state.setting);

  const {
    isIpad,
    errorMessage,
    encryptedStorageGetItem,
    encryptedStorageSetItem,
  } = require('../../helpers/globalFunction');

  useEffect(() => {
    const init = async () => {
      setup();
    };

    init().finally(async () => {
      await RNBootSplash.hide({ fade: true });
      console.log('Bootsplash has been hidden successfully');
    });
  }, []);

  const setup = async () => {
    try {
      await setupAdmob();
      await setupPreferences();
      await loadCouriers();
    } catch (err) {
      console.error('Setup error:', err);
    }

    FastImage.preload([
      { uri: LOGO_LIGHT_URL },
      { uri: LOGO_DARK_URL },
      { uri: NO_WIFI_URL },
      { uri: REMOVE_ADS_URL },
      { uri: LOGIN_PAGE_URL },
      { uri: SERVER_ERROR_URL },
      { uri: SYSTEM_MAINTENANCE_URL },
      { uri: APP_UPDATE_URL },
      { uri: SEARCH_NOT_FOUND_URL },
      { uri: WAIT_PARCEL_URL },
    ]);

    let language = await encryptedStorageGetItem('locale');
    if (language == null || language == 'system') {
      language = i18next.language;
      await encryptedStorageSetItem('locale', language);
    }
    i18next.changeLanguage(language);

    checkUpdateOnStore();
  };

  const checkUpdateOnStore = () => {
    inAppUpdates.checkNeedsUpdate().then(result => {
      if (result.shouldUpdate) {
        const updateOptions = Platform.select<StartUpdateOptions>({
          ios: {
            title: i18next.t('placeholder.updateAvailable'),
            message: i18next.t('message.newVersionOfTheAppOnTheAppStore'),
            buttonUpgradeText: i18next.t('button.update'),
            buttonCancelText: i18next.t('button.cancel'),
          },
          android: {
            updateType: IAUUpdateKind.FLEXIBLE,
          },
        });

        if (updateOptions) {
          inAppUpdates.startUpdate(updateOptions);
        } else {
          console.warn('Unsupported platform for in-app updates');
        }
      }
    });
  };

  const setupAdmob = async () => {
    MobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('Initialization complete! -> ', adapterStatuses);
      });

    MobileAds()
      .setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
      })
      .then(() => {
        console.log('Setup Admob done..');
      });
  };

  const setupPreferences = async () => {
    // Language
    let language = await encryptedStorageGetItem('locale');
    if (!language || language === 'system') {
      language = i18next.language;
      await encryptedStorageSetItem('locale', 'system');
    }
    i18next.changeLanguage(language || RNLanguageDetector.detect());
    dispatch(setLanguage(language));

    // Tracking history limit
    dispatch(setLimitTrackingHistories(isIpad() ? 25 : 5));

    // Menu
    let menu = await encryptedStorageGetItem('selectedMenu');
    if (!menu) {
      menu = 'trackHistoryOnly';
      await encryptedStorageSetItem('selectedMenu', menu);
    }
    dispatch(setMenu(menu));

    // Dark mode & system theme
    const isSystemDarkMode = JSON.parse(
      (await encryptedStorageGetItem('isSystemDarkMode')) || 'null',
    );
    if (isSystemDarkMode === null) {
      await encryptedStorageSetItem('isSystemDarkMode', 'true');
      dispatch(setSystemDarkMode(true));
      dispatch(setDarkMode(isDarkMode));
    } else {
      dispatch(setSystemDarkMode(isSystemDarkMode));
      if (isSystemDarkMode) {
        dispatch(setDarkMode(isDarkMode));
      } else {
        const darkMode = JSON.parse(
          (await encryptedStorageGetItem('isDarkMode')) || 'false',
        );
        dispatch(setDarkMode(darkMode));
      }
    }

    // Terms agreement
    const isAgree = JSON.parse(
      (await encryptedStorageGetItem('isAgreeTermsAndConditions')) || 'false',
    );
    setAgreeTermsAndCondition(isAgree);
    dispatch(setAgreeTermsAndConditions(isAgree));

    // Other settings
    dispatch(
      setHideOnDelivered(
        JSON.parse(
          (await encryptedStorageGetItem('isHideOnDelivered')) || 'false',
        ),
      ),
    );
    dispatch(
      setHideTrackingButton(
        JSON.parse(
          (await encryptedStorageGetItem('isHideTrackingButton')) || 'false',
        ),
      ),
    );
    dispatch(
      setCopiedText(
        JSON.parse(
          (await encryptedStorageGetItem('isAutoCopiedText')) || 'false',
        ),
      ),
    );
    dispatch(
      setAnimation((await encryptedStorageGetItem('animation')) || 'fast'),
    );
    dispatch(
      setSelectColor(
        JSON.parse((await encryptedStorageGetItem('isSelectColor')) || 'false'),
      ),
    );
    dispatch(
      setNonPersonalizedAdsOnly(
        JSON.parse(
          (await encryptedStorageGetItem('isNonPersonalizedAdsOnly')) ||
            'false',
        ),
      ),
    );
    dispatch(
      setShowCouriers(
        JSON.parse((await encryptedStorageGetItem('isShowCouriers')) || 'true'),
      ),
    );
    dispatch(
      setShowSwitchNotification(
        JSON.parse(
          (await encryptedStorageGetItem('isShowSwitchNotification')) || 'true',
        ),
      ),
    );
  };

  const loadCouriers = async () => {
    try {
      console.log('courier -> ');
      let resp = await Api.courier();
      console.log('resp -> ', resp);

      if (
        resp &&
        typeof resp === 'object' &&
        'meta' in resp &&
        resp.meta.code === 200
      ) {
        let couriers = resp?.data as Courier[];
        dispatch(setCouriers(couriers));
      } else {
        errorMessage('ETrackings', i18next.t('message.somethingWentWrong'));
      }
    } catch (err) {
      console.log('err load courier -> ', err);
      errorMessage('ETrackings', t('message.somethingWentWrong'));
    }
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current =
          navigationRef.current!.getCurrentRoute()?.name || '';
      }}
      onStateChange={async () => {
        const prev = routeNameRef.current;
        const curr = navigationRef.current!.getCurrentRoute()?.name;
        if (prev !== curr) {
          await analytics().logScreenView({
            screen_name: curr!,
            screen_class: curr!,
          });
        }
        routeNameRef.current = curr!;
      }}
    >
      <RootStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={
          data.user ? 'Home' : isAgreeTermsAndCondition ? 'Guest' : 'Guest'
        }
      >
        <RootStack.Screen name="Logo" component={LogoView} />

        <RootStack.Screen name="Intro" component={IntroView} />
        <RootStack.Screen
          name="TermsAndConditions"
          component={TermsAndConditionsView}
          initialParams={{ isAgree: false }}
        />
        <RootStack.Screen name="Login" component={LoginView} />
        {/* <RootStack.Screen name="Register" component={RegisterView} />
        <RootStack.Screen
          name="ForgotPassword"
          component={ForgotPasswordView}
        />
        <RootStack.Screen
          name="ReConfirmEmail"
          component={ReConfirmEmailView}
        /> */}

        <RootStack.Screen name="Home" component={TabNavigation} />
        {/* <RootStack.Screen name="Profile" component={ProfileView} />
            <RootStack.Screen
              name="TrackingSetting"
              component={TrackingSettingView}
            />
            <RootStack.Screen
              name="SettingNotification"
              component={SettingNotificationView}
            />
            <RootStack.Screen name="SettingApp" component={SettingAppView} />
            <RootStack.Screen
              name="ManageDevice"
              component={ManageDeviceView}
            />
            <RootStack.Screen name="Package" component={PackageView} />
            {/* <RootStack.Screen name="ManageData" component={ManageDataView} /> */}
        {/* <RootStack.Screen name="RewardedAd" component={RewardedAdView} />

            <RootStack.Screen
              name="TrackDetail"
              children={props => (
                <ScreenWithBanner routeName="TrackDetail">
                  <TrackDetailView {...props} />
                </ScreenWithBanner>
              )}
            />
            <RootStack.Screen
              name="CheckPriceDetail"
              children={props => (
                <ScreenWithBanner routeName="CheckPriceDetail">
                  <CheckPriceDetailView {...props} />
                </ScreenWithBanner>
              )}
            />
            <RootStack.Screen
              name="OcrDetail"
              children={props => (
                <ScreenWithBanner routeName="OcrDetail">
                  <OcrDetailView {...props} />
                </ScreenWithBanner>
              )}
            />
            <RootStack.Screen
              name="CheckPriceStore"
              children={props => (
                <ScreenWithBanner routeName="CheckPriceStore">
                  <CheckPriceStoreView {...props} />
                </ScreenWithBanner>
              )}
            /> */}

        <RootStack.Screen name="Guest" component={GuestSearchView} />
        {/* <RootStack.Screen name="Profile" component={ProfileView} />
          <RootStack.Screen name="Package" component={PackageView} />
          <RootStack.Screen
            name="TrackingSetting"
            component={TrackingSettingView}
          />
          <RootStack.Screen name="SettingApp" component={SettingAppView} />
          <RootStack.Screen name="RewardedAd" component={RewardedAdView} />

          <RootStack.Screen
            name="TrackDetail"
            children={props => (
              <ScreenWithBanner routeName="TrackDetail">
                <TrackDetailView {...props} />
              </ScreenWithBanner>
            )}
          />
          <RootStack.Screen
            name="CheckPriceDetail"
            children={props => (
              <ScreenWithBanner routeName="CheckPriceDetail">
                <CheckPriceDetailView {...props} />
              </ScreenWithBanner>
            )}
          /> */}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
