/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useEffect, useState} from 'react';
import {FlatList, View, SafeAreaView} from 'react-native';
import {TestIds, useInterstitialAd} from 'react-native-google-mobile-ads';
import {admobKey} from '../../helpers/admob';
import {useDispatch, useSelector} from 'react-redux';
import * as Animatable from 'react-native-animatable';
import {Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {styles} from '../../helpers/styles';
import FastImage from '@d11/react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import Ripple from 'react-native-material-ripple';
import {setAppTrackCount} from '../actions';

// View
import IOSHeader from '../header/iosHeaderView';

export default OcrDetailView = ({navigation, route: {params}}) => {
  const {t} = useTranslation();
  const {
    isDisplayAds,
    shareTracking,
    isIpad,
    fontSize,
    hp,
    wp,
  } = require('../../helpers/globalFunction');
  const isInitialMount = useRef(true);
  const dispatch = useDispatch();
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const adInterstitialUnitId = __DEV__
    ? TestIds.INTERSTITIAL
    : admobKey.interstitial;
  const {load, show, isLoaded} = useInterstitialAd(adInterstitialUnitId, {
    requestNonPersonalizedAdsOnly: setting.isNonPersonalizedAdsOnly || false,
  });
  const [tracks, setTracks] = useState([]);

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

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setup();
    }
  });

  setup = async () => {
    await setTracks(params.tracks || []);
  };

  openTrackingDetail = (courier, trackingNumber) => {
    navigation.navigate('TrackDetail', {
      courier: courier,
      trackingNumber: trackingNumber,
    });
  };

  shareButton = item => {
    return (
      <Ripple
        rippleDuration={setting?.animation == 'normal' ? 600 : 450}
        onPress={() => onShare()}
        style={styles.floatRight}>
        <Icon
          name={'ios-share-outline'}
          style={[styles.headerIcon, {color: setting.textColor, marginTop: -4}]}
        />
      </Ripple>
    );
  };

  onShare = async item => {
    await shareTracking(item.title, item.shareURL);
  };

  renderTrackings = () => {
    return (
      <FlatList
        style={{flex: 1, paddingTop: 10, backgroundColor: setting.appColor}}
        data={tracks}
        horizontal={false}
        numColumns={isIpad() ? 2 : 1}
        showsVerticalScrollIndicator={false}
        renderItem={({item, index}) => {
          return (
            <Animatable.View
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
              delay={
                index <= 25
                  ? index * (index + setting?.animation == 'normal' ? 110 : 55)
                  : 0
              }>
              <Ripple
                rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                rippleContainerBorderRadius={15}
                onPress={() =>
                  openTrackingDetail(item.courier.key, item.trackingNo)
                }
                style={{
                  flex: 1,
                  fontFamily: 'Kanit-Light',
                  backgroundColor: setting.cardColor,
                  margin: hp(1),
                  borderRadius: 15,
                  width: isIpad() ? wp(38) : wp(90),
                  height: 130,
                }}>
                <View style={{flex: 1}}>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={{width: '80%'}}>
                      <Text
                        theme={{
                          dark: setting.isDarkMode,
                          colors: {text: setting.textColor},
                        }}
                        numberOfLines={1}
                        allowFontScaling={false}
                        style={{
                          alignContent: 'flex-start',
                          fontFamily: 'Kanit-Light',
                          fontSize: fontSize(21),
                          alignSelf: 'flex-start',
                          paddingTop: hp(2),
                          paddingLeft: hp(2),
                        }}>
                        {item.trackingNo}
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
                        {setting.isLanguageTH
                          ? item.courier.nameTH
                          : item.courier.nameEN}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: '20%',
                      }}>
                      <View
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          marginRight: 15,
                        }}>
                        <FastImage
                          resizeMode={FastImage.resizeMode.contain}
                          style={styles.imageOrcRight}
                          source={{
                            uri: item.courier.imageURL,
                            priority: FastImage.priority.normal,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </Ripple>
            </Animatable.View>
          );
        }}
        keyExtractor={(item, index) => `trackings-${index}`}
      />
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: setting.appColor}}>
      <IOSHeader
        title={t('placeholder.ocr')}
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
        <View style={{flex: 1, padding: 10}}>{renderTrackings()}</View>
      </View>
    </SafeAreaView>
  );
};
