/* eslint-disable react-native/no-inline-styles */
import React, {useEffect} from 'react';
import {FlatList, View, SafeAreaView} from 'react-native';
import {TestIds, useInterstitialAd} from 'react-native-google-mobile-ads';
import {admobKey} from '../../helpers/admob';
import * as Animatable from 'react-native-animatable';
import {useDispatch, useSelector} from 'react-redux';
import {Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import Ripple from 'react-native-material-ripple';
import {styles} from '../../helpers/styles';
import FastImage from '@d11/react-native-fast-image';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import {setAppTrackCount} from '../actions';

// View
import IOSHeader from '../header/iosHeaderView';

export default CheckPriceDetailView = ({navigation, route: {params}}) => {
  const {
    isDisplayAds,
    hp,
    wp,
    fontSize,
    isIpad,
  } = require('../../helpers/globalFunction');
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const adInterstitialUnitId = __DEV__
    ? TestIds.INTERSTITIAL
    : admobKey.interstitial;
  const {load, show, isLoaded} = useInterstitialAd(adInterstitialUnitId, {
    requestNonPersonalizedAdsOnly: setting.isNonPersonalizedAdsOnly || false,
  });

  useEffect(() => {
    // Start loading the interstitial straight away
    if (isDisplayAds(data)) load();
  }, [load]);

  useEffect(() => {
    if (isLoaded && isDisplayAds(data)) {
      try {
        if (data?.appTrackCount > 0)
          setTimeout(() => {
            show();
          }, 1000);
        dispatch(setAppTrackCount(data?.appTrackCount + 1));
      } catch (error) {
        console.log('Show interstitial ads error -> ', error);
      }
    }
  }, [isLoaded]);

  renderCourierPrice = () => {
    return (
      <FlatList
        style={{flex: 1, paddingTop: 10, backgroundColor: setting.appColor}}
        data={params.courierPrices}
        horizontal={false}
        numColumns={isIpad() ? 2 : 1}
        showsVerticalScrollIndicator={false}
        renderItem={({item, index}) => {
          return (
            <Animatable.View
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
              delay={
                index * (index + setting?.animation == 'normal' ? 150 : 75)
              }>
              <Ripple
                rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                rippleContainerBorderRadius={15}
                onPress={() =>
                  navigation.navigate('CheckPriceStore', {
                    store: item,
                  })
                }
                onLongPress={() =>
                  navigation.navigate('CheckPriceStore', {
                    store: item,
                  })
                }
                style={{
                  flex: 1,
                  fontFamily: 'Kanit-Light',
                  backgroundColor: setting.cardColor,
                  margin: hp(1),
                  borderRadius: 15,
                  width: isIpad() ? wp(30) : wp(90),
                  height: 130,
                }}>
                <View style={{flex: 1}}>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={{width: '14%', justifyContent: 'center'}}>
                      <FastImage
                        resizeMode={FastImage.resizeMode.contain}
                        style={styles.imageStore}
                        source={{
                          uri: item.imageURL,
                          priority: FastImage.priority.normal,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        width: item?.isSupportStoreNearBy ? '70%' : '86%',
                        justifyContent: 'flex-start',
                      }}>
                      <Text
                        theme={{
                          dark: setting.isDarkMode,
                          colors: {text: setting.textColor},
                        }}
                        allowFontScaling={false}
                        numberOfLines={1}
                        style={{
                          alignContent: 'flex-start',
                          fontFamily: 'Kanit-Light',
                          fontSize: fontSize(16),
                          alignSelf: 'flex-start',
                          paddingTop: hp(1),
                          paddingLeft: hp(2),
                        }}>
                        {item.name}
                      </Text>

                      <Text
                        theme={{
                          dark: setting.isDarkMode,
                          colors: {text: setting.textColor},
                        }}
                        allowFontScaling={false}
                        numberOfLines={1}
                        style={{
                          fontFamily: 'Kanit-Light',
                          fontSize: fontSize(16),
                          alignSelf: 'flex-start',
                          paddingTop: hp(0.5),
                          paddingLeft: hp(2),
                        }}>
                        {t('text.price', {
                          price: Number(item.price).toFixed(2),
                        })}
                      </Text>

                      <Text
                        theme={{
                          dark: setting.isDarkMode,
                          colors: {text: setting.textColor},
                        }}
                        allowFontScaling={false}
                        numberOfLines={2}
                        style={{
                          fontFamily: 'Kanit-Light',
                          fontSize: fontSize(12),
                          alignSelf: 'flex-start',
                          paddingTop: hp(0.5),
                          paddingLeft: hp(2),
                        }}>
                        {item.duration}
                      </Text>
                    </View>
                    {item?.isSupportStoreNearBy && (
                      <View style={{width: '16%', justifyContent: 'center'}}>
                        <MatIcon
                          name={'store'}
                          style={styles.checkPriceStoreIcon}
                        />
                      </View>
                    )}
                  </View>
                </View>
              </Ripple>
            </Animatable.View>
          );
        }}
        keyExtractor={(_item, index) => `checkPrice-${index}`}
      />
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: setting.appColor}}>
      <IOSHeader
        title={t('placeholder.checkPrice')}
        canGoBack={true}
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: setting.appColor,
          padding: isIpad() ? 80 : 0,
        }}>
        <View style={{flex: 1, padding: 10}}>{renderCourierPrice()}</View>
      </View>
    </SafeAreaView>
  );
};
