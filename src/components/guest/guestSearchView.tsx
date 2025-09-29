/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  AppState,
  BackHandler,
  ToastAndroid,
  FlatList,
  View,
  StatusBar,
  Linking,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useAppOpenAd, TestIds } from 'react-native-google-mobile-ads';
import { hasNotch } from 'react-native-device-info';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { request, PERMISSIONS } from 'react-native-permissions';
import { SheetManager } from 'react-native-actions-sheet';

import * as Api from '../actions/api';
import { admobKey } from '../../helpers/admob';

// View
import HeaderView from '../header/headerView';
import SearchMenu from '../search/searchMenu';
import TrackingSearch from '../search/trackingSearch';
import CheckPriceSearchView from '../checkPrice/checkPriceSearchView';
import ZipcodeView from '../zipcode/zipcodeView';
import AppBannerAd from '../ads/bannerAd';

// Type
import type { RouteProp } from '@react-navigation/native';
import { RootState } from '../../store';
import { setInitialURL } from '../../store/settingSlice';
import { StackNavigationProp } from '@react-navigation/stack';

type GuestSearchViewProps = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<any>;
};

type ScreenType = 'tracking' | 'checkPrice' | 'zipcode';

const GuestSearchView: React.FC<GuestSearchViewProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    isDisplayAds,
    isIpad,
    isAndroid,
    hex2rgba,
    hp,
  } = require('../../helpers/globalFunction');

  const {
    openTrackDetail,
    requestFirebasePermission,
    unsubscribeNotification,
    openedAppNotification,
  } = require('../../helpers/firebaseNotification');

  const dispatch = useDispatch();
  const [screen, setScreen] = useState<ScreenType>('tracking');
  const setting = useSelector((state: RootState) => state.setting);
  const data = useSelector((state: RootState) => state.data);

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [exitApp, setExitApp] = useState(false);

  const adAppOpenUnitId = __DEV__ ? TestIds.GAM_APP_OPEN : admobKey.appOpen;
  const adAppOpen = useAppOpenAd(adAppOpenUnitId || null, {
    requestNonPersonalizedAdsOnly: setting.isNonPersonalizedAdsOnly || false,
  });

  const screens = [
    { name: 'tracking', color: '#FB1744', icon: 'search' },
    { name: 'checkPrice', color: '#FE873F', icon: 'check' },
    { name: 'zipcode', color: '#07D856', icon: 'send' },
  ];

  // Handle App State
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isDisplayAds(data)) adAppOpen.load();
  }, [adAppOpen.load]);

  useEffect(() => {
    if (adAppOpen.error !== undefined) {
      console.log(
        `${Platform.OS} app open hook error: ${adAppOpen.error.message}`,
      );
    }
  }, [adAppOpen.error]);

  useEffect(() => {
    if (appStateVisible === 'active' && isAdOpen && isDisplayAds(data)) {
      setIsAdOpen(false);
      if (data?.appTrackCount > 0) {
        setTimeout(() => adAppOpen.show(), 1000);
      }
    } else {
      if (isDisplayAds(data)) adAppOpen.load();
      setIsAdOpen(true);
    }
  }, [appStateVisible]);

  useEffect(() => {
    if (isDisplayAds(data)) adAppOpen.load();
  }, [adAppOpen.isOpened, adAppOpen.isClicked, adAppOpen.isClosed]);

  const handleBackButtonClick = useCallback(() => {
    if (!exitApp) {
      if (!navigation.canGoBack()) {
        ToastAndroid.showWithGravity(
          t('message.backExitApp'),
          1500,
          ToastAndroid.BOTTOM,
        );
        setExitApp(true);
      } else {
        navigation.goBack();
      }
    } else {
      BackHandler.exitApp();
    }

    setTimeout(() => setExitApp(false), 1500);
    return true;
  }, [exitApp, navigation, t]);

  useEffect(() => {
    const backEventListener = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );
    return () => backEventListener.remove();
  }, [handleBackButtonClick]);

  const checkInitialURL = async () => {
    const url = await Linking.getInitialURL();
    if (url && !setting.initialURL) {
      handleOpenURL({ url });
      dispatch(setInitialURL(url));
    }
  };

  const handleOpenURL = ({ url }: { url: string }) => {
    if (url.includes('package')) {
      try {
        let [, productID] =
          /[packages|package]*\?[packageId|package_id|productID]*=(\S+)/gi.exec(
            url,
          ) || [];
        navigation.navigate('Package', { productID });
      } catch {
        navigation.navigate('Package');
      }
    } else if (url.includes('qrcode')) {
      SheetManager.show('QRCode', {
        payload: {
          sheetName: 'QRCode',
          navigation,
          title: t('text.scanToTracking'),
          courier: data?.couriers[0],
        },
      });
    } else if (url.includes('setting')) {
      navigation.navigate('Profile');
    } else if (url.includes('login')) {
      navigation.navigate('Auth');
    } else if (url.includes('trackingResult')) {
      const [, courier, trackingNumber] =
        /courier=(\S+)&trackingNumber=(\S+)/gi.exec(url) || [];
      openTrackDetail(
        navigation.navigate('TrackDetail', {
          courier: courier?.replace('_', '-'),
          trackingNumber,
          isKeep: false,
        }),
      );
    } else if (url.includes('tracking')) {
      const [, courier, trackingNumber] =
        /courier=(\S+)&tracking-no=(\S+)/gi.exec(url) || [];
      openTrackDetail(
        navigation.navigate('TrackDetail', {
          courier,
          trackingNumber,
          isKeep: false,
        }),
      );
    } else {
      Linking.openURL(url);
    }
  };

  useEffect(() => {
    Linking.addEventListener('url', handleOpenURL);
    return () => Linking.removeEventListener('url', handleOpenURL);
  }, []);

  const loadData = async () => {
    Linking.removeAllListeners('url');
  };

  useEffect(() => {
    const registerFirebaseToken = async () => {
      const fcmToken = await requestFirebasePermission();
      await Api.saveDeviceFirebaseToken(fcmToken);
    };

    registerFirebaseToken();
    checkInitialURL();

    if (!isAndroid()) {
      request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
    }

    loadData();
  }, []);

  useEffect(() => {
    unsubscribeNotification(navigation);
  }, []);

  useEffect(() => {
    openedAppNotification(navigation, setting);
  }, []);

  const renderSearchMenu = () => (
    <FlatList
      style={{
        flex: 1,
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: isIpad() ? -50 : hasNotch() ? 0 : -50,
      }}
      data={screens}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <SearchMenu
          key={index}
          index={index}
          selected={screen === item.name}
          title={t(`placeholder.${item.name}`)}
          iconName={item.icon}
          color={hex2rgba(item.color, 1)}
          onPress={() => setScreen(item.name as ScreenType)}
        />
      )}
      keyExtractor={(_, index) => index.toString()}
    />
  );

  const renderContent = () => {
    switch (screen) {
      case 'tracking':
        return <TrackingSearch navigation={navigation} />;
      case 'checkPrice':
        return <CheckPriceSearchView navigation={navigation} />;
      case 'zipcode':
        return <ZipcodeView navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: setting.appColor }}>
      <StatusBar
        barStyle={`${setting.isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={setting.appColor}
      />
      <HeaderView
        title={t('placeholder.appName')}
        titleFontSize={33}
        isIcon
        iconName="log-in-outline"
        navigation={navigation}
      />
      <View
        style={{
          height: hp(isIpad() ? 3 : isAndroid() ? 6.3 : 5.3),
          marginRight: 15,
        }}
      >
        {renderSearchMenu()}
      </View>
      <View style={{ flex: 1, padding: 10 }}>{renderContent()}</View>
      <AppBannerAd />
    </SafeAreaView>
  );
};

export default GuestSearchView;
