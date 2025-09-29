/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  FlatList,
  View,
  StatusBar,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { TestIds, useInterstitialAd } from 'react-native-google-mobile-ads';
import { admobKey } from '../../helpers/admob';
import * as Api from '../actions/api';
import { HTTP_STATUSES } from '../actions/constants';
import { useDispatch, useSelector } from 'react-redux';
import {
  TextInput,
  Text,
  HelperText,
  ProgressBar,
  Searchbar,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import Clipboard from '@react-native-community/clipboard';
import Ripple from 'react-native-material-ripple';
import { SheetManager } from 'react-native-actions-sheet';

import { Courier } from '../../models/courier';
import { RootState } from '../../store';
import CourierView from '../courier/courierView';

interface TrackingSearchProps {
  navigation: any; // You can type better if you know the navigator type, e.g. StackNavigationProp
}

const TrackingSearch: React.FC<TrackingSearchProps> = props => {
  const { t } = useTranslation();

  // Using require here for helper functions, but ideally import them explicitly
  const {
    isDisplayAds,
    fontSize,
    hp,
    hex2rgba,
    isIpad,
    errorMessage,
    validateBlank,
    isPresent,
    isLandscape,
  } = require('../../helpers/globalFunction');

  const isInitialMount = useRef(true);
  const isMounted = useRef(true);

  const setting = useSelector((state: RootState) => state.setting);
  const data = useSelector((state: RootState) => state.data);
  const couriers = useSelector((state: RootState) => state.data.couriers);

  const adInterstitialUnitId = __DEV__
    ? TestIds.INTERSTITIAL
    : admobKey.interstitial;

  const { load, show, isClicked, isClosed, isOpened } = useInterstitialAd(
    adInterstitialUnitId ?? null,
    {
      requestNonPersonalizedAdsOnly: setting.isNonPersonalizedAdsOnly || false,
    },
  );

  const [spinner, setSpinner] = useState<boolean>(true);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [courier, setCourier] = useState<string>('');
  const [stateCouriers, setStateCouriers] = useState<Courier[]>([]);
  const [limit, setLimit] = useState<number>(isIpad() ? 25 : 14);
  const [searchCourier, setSearchCourier] = useState<string>('');
  const [isSearchCourier, setIsSearchCourier] = useState<boolean>(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;
    if (isDisplayAds(data)) load();
  }, [load]);

  useEffect(() => {
    if (!isMounted.current) return;
    if (isDisplayAds(data)) load();
  }, [isOpened, isClicked, isClosed]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (isMounted.current) setup();
    }
  }, []);

  const setup = async () => {
    try {
      setSpinner(true);
      setCourier(data?.couriers?.find(s => s?.selected)?.key || 'auto-detect');
      setupCourier(limit);
      setSpinner(false);

      if (setting.isAutoCopiedText) {
        const text = await Clipboard.getString();
        setTrackingNumber(text.replace(/\s/g, '').trim());
      } else {
        setTrackingNumber('');
      }
    } catch (e) {
      errorMessage('ETrackings', t('message.somethingWentWrong'));
      setSpinner(false);
    }
  };

  const setupCourier = (loadLimit: number) => {
    const newCouriers = (couriers || [])
      .slice(0, loadLimit)
      .map((c, index) => ({ ...c, selected: index === 0 }));
    setStateCouriers(newCouriers);
  };

  const handleLoadMore = () => {
    if (couriers.length !== stateCouriers?.length) {
      const newLimit = limit + 10;
      setLimit(newLimit);
      setupCourier(newLimit);
    }
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: NativeSyntheticEvent<NativeScrollEvent>['nativeEvent']) => {
    const paddingToBottom = isIpad() ? 65 : 85;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const trackingSearch = () => {
    if (!trackingNumber) {
      errorMessage(
        t('message.notValidate'),
        t('message.trackingCannotBeBlank'),
      );
      return;
    }

    setLoadingSearch(true);

    props.navigation.navigate('TrackDetail', {
      courier,
      trackingNumber,
      isTrackingSearch: true,
      couriers: courier === 'auto-detect' ? stateCouriers : [],
      showAds: () => show(),
    });

    setLoadingSearch(false);
  };

  const onSelectCourier = (courierData: Courier, index: number) => {
    const updatedCouriers = stateCouriers.map((c, i) => ({
      ...c,
      selected: i === index,
    }));
    setStateCouriers(updatedCouriers);
    setCourier(courierData.key);
  };

  const renderCouriers = () => (
    <FlatList<Courier>
      style={{ flex: 1 }}
      data={stateCouriers}
      numColumns={isIpad() ? (isLandscape() ? 4 : 3) : 2}
      showsVerticalScrollIndicator={false}
      initialNumToRender={isIpad() ? 35 : 15}
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false },
      )}
      onMomentumScrollEnd={({ nativeEvent }) => {
        if (isCloseToBottom(nativeEvent)) handleLoadMore();
      }}
      ListEmptyComponent={renderNoCourier}
      contentContainerStyle={{ flexGrow: 1 }}
      renderItem={({ item, index }) => (
        <CourierView
          key={item.key || index.toString()}
          isLasted={couriers.length - 1 === index}
          index={index + 3}
          selected={!!item.selected}
          selectedColor={hex2rgba(item.color || '#5A4DF2', 1)}
          title={setting.isLanguageTH ? item.nameTH : item.nameEN}
          backgroundColor={hex2rgba(
            item.color || '#5A4DF2',
            setting.isDarkMode ? 0.5 : 0.3,
          )}
          imageURL={item.imageURL}
          textColor={setting.textColor}
          disabled={!item.active}
          onPress={() => onSelectCourier(item, index)}
        />
      )}
      keyExtractor={(item, index) => item.key?.toString() || index.toString()}
    />
  );

  const goToQRCode = () => {
    SheetManager.show('QRCode', {
      payload: {
        sheetName: 'QRCode',
        navigation: props.navigation,
        title: t('text.scanToTracking'),
        courier: couriers.find(s => s.selected),
      },
    });
  };

  const renderSearchInput = () => (
    <Animatable.View
      delay={setting?.animation === 'normal' ? 70 : 35}
      animation={setting?.animation !== 'close' ? 'fadeIn' : undefined}
    >
      <Searchbar
        theme={{
          dark: setting.isDarkMode,
          colors: {
            text: setting.textColor,
          },
        }}
        style={{
          backgroundColor: setting.cardColor,
          marginTop: 5,
          margin: 10,
        }}
        allowFontScaling={false}
        inputStyle={{
          fontFamily: 'Kanit-Light',
          backgroundColor: setting.cardColor,
        }}
        placeholder={t('button.search')}
        onChangeText={onSearchCourier}
        value={searchCourier}
      />
    </Animatable.View>
  );

  const renderNoCourier = () => (
    <Animatable.View
      delay={setting?.animation === 'normal' ? 70 : 35}
      animation={setting?.animation !== 'close' ? 'fadeIn' : undefined}
    >
      <Text
        theme={{
          dark: setting.isDarkMode,
          colors: { text: setting.textColor },
        }}
        numberOfLines={1}
        allowFontScaling={false}
        style={{
          fontFamily: 'Kanit-Light',
          fontSize: fontSize(20),
          alignSelf: 'center',
          justifyContent: 'center',
          alignContent: 'center',
          paddingTop: hp(2.5),
        }}
      >
        {t('message.noData')}
      </Text>
    </Animatable.View>
  );

  const onSearchCourier = (keyword: string) => {
    setSearchCourier(keyword);
    const filtered = (data?.couriers || [])
      .filter(
        c =>
          c?.nameTH?.toLowerCase()?.includes(keyword?.toLowerCase()) ||
          c?.nameEN?.toLowerCase()?.includes(keyword?.toLowerCase()),
      )
      .slice(0, limit)
      .map((c, index) => ({ ...c, selected: index === 0 }));
    setStateCouriers(filtered);
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle={`${setting.isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={setting.appColor}
      />
      {spinner && <ProgressBar indeterminate={true} color={'#1E88E5'} />}

      <Animatable.View
        delay={0}
        animation={setting?.animation !== 'close' ? 'fadeInUp' : undefined}
      >
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: '100%' }}>
            <Text
              theme={{
                dark: setting.isDarkMode,
                colors: { text: setting.textColor },
              }}
              numberOfLines={1}
              allowFontScaling={false}
              style={{
                fontFamily: 'Kanit-Light',
                fontSize: fontSize(22),
                alignSelf: 'flex-start',
                paddingTop: hp(0.1),
                paddingLeft: hp(1),
              }}
            >
              {t('placeholder.trackingNumber')}
            </Text>
          </View>
        </View>
      </Animatable.View>

      <Animatable.View
        delay={setting?.animation === 'normal' ? 100 : 50}
        animation={setting?.animation !== 'close' ? 'fadeInUp' : undefined}
      >
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: isIpad() ? '90%' : '70%' }}>
            <TextInput
              placeholder={t('placeholder.enterTrackingNumber')}
              theme={{
                dark: setting.isDarkMode,
                colors: { text: setting.textColor },
              }}
              style={{
                fontFamily: 'Kanit-Light',
                marginTop: 5,
                margin: 10,
                backgroundColor: setting.inputColor,
              }}
              right={
                <TextInput.Icon
                  icon={'close'}
                  theme={{
                    dark: setting.isDarkMode,
                    colors: { text: setting.notSelectColor },
                  }}
                  style={{
                    display: isPresent(trackingNumber) ? 'flex' : 'none',
                  }}
                  onPress={() => setTrackingNumber('')}
                />
              }
              allowFontScaling={false}
              autoCapitalize={'none'}
              label={t('placeholder.trackingNumber')}
              mode={'outlined'}
              value={trackingNumber}
              keyboardAppearance={setting.theme}
              onChangeText={text =>
                setTrackingNumber(text.replace(/\s/g, '').trim())
              }
            />
            <HelperText
              allowFontScaling={false}
              style={{ fontFamily: 'Kanit-Light', color: '#FF3260' }}
              type="error"
              visible={validateBlank(trackingNumber)}
            >
              {t('message.trackingCannotBeBlank')}
            </HelperText>
          </View>

          <Ripple
            rippleDuration={setting?.animation === 'normal' ? 600 : 450}
            rippleCentered
            rippleSize={75}
            style={{
              width: isIpad() ? '5%' : '15%',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -20,
            }}
            disabled={loadingSearch}
            onPress={trackingSearch}
          >
            <Icon
              name={'search-outline'}
              size={34}
              disabled={loadingSearch}
              color={
                validateBlank(trackingNumber) || !trackingNumber
                  ? setting.notSelectColor
                  : setting.textColor
              }
            />
          </Ripple>

          <Ripple
            rippleDuration={setting?.animation === 'normal' ? 600 : 450}
            rippleContainerBorderRadius={15}
            rippleCentered
            rippleSize={75}
            style={{
              width: isIpad() ? '5%' : '15%',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -20,
            }}
            disabled={loadingSearch}
            onPress={goToQRCode}
          >
            <Icon
              name={'qr-code-outline'}
              size={34}
              disabled={loadingSearch}
              color={setting.textColor}
            />
          </Ripple>
        </View>
      </Animatable.View>

      {setting.isShowCouriers && (
        <>
          <Animatable.View
            delay={setting?.animation === 'normal' ? 200 : 100}
            animation={setting?.animation !== 'close' ? 'fadeInUp' : undefined}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: '90%' }}>
                <Text
                  theme={{
                    dark: setting.isDarkMode,
                    colors: { text: setting.textColor },
                  }}
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={{
                    fontFamily: 'Kanit-Light',
                    fontSize: fontSize(22),
                    alignSelf: 'flex-start',
                    marginTop: validateBlank(trackingNumber) ? hp(0.2) : -16,
                    paddingLeft: hp(1),
                  }}
                >
                  {t('placeholder.courier')}
                </Text>
              </View>
              <View style={{ width: '10%' }}>
                <Ripple
                  rippleDuration={setting?.animation === 'normal' ? 600 : 450}
                  rippleCentered
                  rippleSize={75}
                  rippleContainerBorderRadius={50}
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: -10,
                  }}
                  onPress={() => setIsSearchCourier(!isSearchCourier)}
                >
                  <Icon
                    name={'search-outline'}
                    size={24}
                    color={setting.textColor}
                  />
                </Ripple>
              </View>
            </View>

            {isSearchCourier && renderSearchInput()}
          </Animatable.View>

          <View style={{ flex: 1 }}>
            {couriers.length === 0 ? renderNoCourier() : renderCouriers()}
          </View>
        </>
      )}
    </View>
  );
};

export default TrackingSearch;
