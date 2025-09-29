import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { useDispatch } from 'react-redux';
import RNLanguageDetector from '@os-team/i18next-react-native-language-detector';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { HAS_LAUNCHED } from '../actions/constants';
import { CommonActions, NavigationProp } from '@react-navigation/native';
import { useDarkMode } from 'react-native-dynamic';
import NetInfo from '@react-native-community/netinfo';
import { SheetManager } from 'react-native-actions-sheet';
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

// Define Props type for navigation (replace RootStackParamList with your actual type)
interface LogoViewProps {
  navigation: NavigationProp<any>;
}

const LogoView: React.FC<LogoViewProps> = ({ navigation }) => {
  const {
    isIpad,
    errorMessage,
    encryptedStorageGetItem,
    encryptedStorageSetItem,
    encryptedStorageRemoveItem,
  } = require('../../helpers/globalFunction');

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isDarkMode = useDarkMode();

  useEffect(() => {
    checkIfFirstLaunch();
  }, []);

  const setAppLaunched = async () => {
    await encryptedStorageSetItem(HAS_LAUNCHED, 'true');
  };

  const checkIfFirstLaunch = async () => {
    try {
      await setup();
      const hasLaunched = await encryptedStorageGetItem(HAS_LAUNCHED);
      if (hasLaunched === null) {
        await encryptedStorageRemoveItem('user');
        await setAppLaunched();
        navigation.navigate('Intro');
      } else {
        await goToPage();
      }
    } catch (error) {
      navigation.navigate('Intro');
    }
  };

  const setup = async () => {
    let language = await encryptedStorageGetItem('locale');
    if (language == null || language === 'system') {
      language = i18next.language;
      await encryptedStorageSetItem('locale', 'system');
    }

    i18next.changeLanguage(language || RNLanguageDetector.detect());
    await dispatch(setLanguage(language));
    dispatch(setLimitTrackingHistories(isIpad() ? 25 : 5));

    let menu = await encryptedStorageGetItem('selectedMenu');
    if (menu == null) {
      menu = 'trackHistoryOnly';
      await encryptedStorageSetItem('selectedMenu', menu);
      dispatch(setMenu(menu));
    } else {
      dispatch(setMenu(menu));
    }

    let isSystemDarkMode = JSON.parse(
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
        let darkMode = JSON.parse(
          (await encryptedStorageGetItem('isDarkMode')) || 'null',
        );
        if (darkMode === null) {
          await encryptedStorageSetItem('isDarkMode', 'false');
          dispatch(setDarkMode(false));
        } else {
          dispatch(setDarkMode(darkMode));
        }
      }
    }

    let isAgreeTermsAndConditions = JSON.parse(
      (await encryptedStorageGetItem('isAgreeTermsAndConditions')) || 'null',
    );
    if (isAgreeTermsAndConditions === null) {
      isAgreeTermsAndConditions = false;
      await encryptedStorageSetItem(
        'isAgreeTermsAndConditions',
        JSON.stringify(isAgreeTermsAndConditions),
      );
      dispatch(setAgreeTermsAndConditions(isAgreeTermsAndConditions));
    } else {
      dispatch(setAgreeTermsAndConditions(isAgreeTermsAndConditions));
    }

    let isHideOnDelivered = JSON.parse(
      (await encryptedStorageGetItem('isHideOnDelivered')) || 'false',
    );
    await encryptedStorageSetItem(
      'isHideOnDelivered',
      JSON.stringify(isHideOnDelivered),
    );
    dispatch(setHideOnDelivered(isHideOnDelivered));

    let isHideReturnedToSender = JSON.parse(
      (await encryptedStorageGetItem('isHideReturnedToSender')) || 'false',
    );
    await encryptedStorageSetItem(
      'isHideReturnedToSender',
      JSON.stringify(isHideReturnedToSender),
    );
    dispatch(isHideReturnedToSender(isHideReturnedToSender));

    let animation = await encryptedStorageGetItem('animation');
    if (animation == null) {
      await encryptedStorageSetItem('animation', 'fast');
      dispatch(setAnimation('fast'));
    } else {
      dispatch(setAnimation(animation));
    }

    let isSelectColor = JSON.parse(
      (await encryptedStorageGetItem('isSelectColor')) || 'null',
    );
    if (isSelectColor === null) {
      await encryptedStorageSetItem('isSelectColor', JSON.stringify(false));
      dispatch(setSelectColor(false));
    } else {
      dispatch(setSelectColor(isSelectColor));
    }

    let isNonPersonalizedAdsOnly = JSON.parse(
      (await encryptedStorageGetItem('isNonPersonalizedAdsOnly')) || 'null',
    );
    if (isNonPersonalizedAdsOnly === null) {
      await encryptedStorageSetItem(
        'isNonPersonalizedAdsOnly',
        JSON.stringify(false),
      );
      dispatch(setNonPersonalizedAdsOnly(false));
    } else {
      dispatch(setNonPersonalizedAdsOnly(isNonPersonalizedAdsOnly));
    }

    let isHideTrackingButton = JSON.parse(
      (await encryptedStorageGetItem('isHideTrackingButton')) || 'null',
    );
    if (isHideTrackingButton === null) {
      await encryptedStorageSetItem(
        'isHideTrackingButton',
        JSON.stringify(false),
      );
      dispatch(setHideTrackingButton(false));
    } else {
      dispatch(setHideTrackingButton(isHideTrackingButton));
    }

    let isAutoCopiedText = JSON.parse(
      (await encryptedStorageGetItem('isAutoCopiedText')) || 'null',
    );
    if (isAutoCopiedText === null) {
      await encryptedStorageSetItem('isAutoCopiedText', JSON.stringify(false));
      dispatch(setCopiedText(false));
    } else {
      dispatch(setCopiedText(isAutoCopiedText));
    }

    let isShowCouriers = JSON.parse(
      (await encryptedStorageGetItem('isShowCouriers')) || 'null',
    );
    if (isShowCouriers === null) {
      await encryptedStorageSetItem('isShowCouriers', JSON.stringify(true));
      dispatch(setShowCouriers(true));
    } else {
      dispatch(setShowCouriers(isShowCouriers));
    }

    let isShowSwitchNotification = JSON.parse(
      (await encryptedStorageGetItem('isShowSwitchNotification')) || 'null',
    );
    if (isShowSwitchNotification === null) {
      await encryptedStorageSetItem(
        'isShowSwitchNotification',
        JSON.stringify(true),
      );
      dispatch(setShowSwitchNotification(true));
    } else {
      dispatch(setShowSwitchNotification(isShowSwitchNotification));
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        errorMessage('ETrackings', t('message.internetLost'));
        SheetManager.show('NoInternetConnected', {
          payload: {
            sheetName: 'NoInternetConnected',
            navigation,
          },
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const openLink = async (url: string) => {
    await Linking.openURL(url);
  };

  const loadCouriers = async () => {
    try {
      const couriersStr = await encryptedStorageGetItem('couriers');
      if (couriersStr) {
        const couriers = JSON.parse(couriersStr);
        dispatch(setCouriers(couriers));
      }
    } catch (e) {
      errorMessage('ETrackings', t('message.somethingWentWrong'));
    }
  };

  const goToPage = async () => {
    await loadCouriers();

    const isAgreeTermsAndConditions = JSON.parse(
      (await encryptedStorageGetItem('isAgreeTermsAndConditions')) || 'false',
    );
    const isVerifyYourIdentity = JSON.parse(
      (await encryptedStorageGetItem('isConsentToVerifyYourIdentity')) ||
        'false',
    );
    const user = await encryptedStorageGetItem('user');

    if (isAgreeTermsAndConditions && isVerifyYourIdentity) {
      if (user) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          }),
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Guest' }],
          }),
        );
      }
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'TermsAndConditions',
              params: { isAgree: false },
            },
          ],
        }),
      );
    }
  };

  return null;
};

export default LogoView;
