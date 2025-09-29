import React from 'react';
import {View} from 'react-native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {admobKey} from '../../helpers/admob';
import {useSelector} from 'react-redux';

export default function ScreenWithBanner({children, routeName}) {
  const insets = useSafeAreaInsets();
  const {isDisplayAds} = require('../../helpers/globalFunction');
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);

  const hiddenScreens = [
    'TrackDetail',
    'CheckPriceDetail',
    'OcrDetail',
    'CheckPriceStore',
  ];

  const shouldShowBanner = hiddenScreens.includes(routeName);

  return (
    <View style={{flex: 1}}>
      {children}

      {shouldShowBanner && isDisplayAds(data) && (
        <View
          style={{
            position: 'absolute',
            bottom: insets.bottom || 0,
            width: '100%',
            backgroundColor: setting.appColor,
          }}>
          <BannerAd
            unitId={__DEV__ ? TestIds.GAM_BANNER : admobKey.banner}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly:
                setting.isNonPersonalizedAdsOnly || false,
            }}
            onAdFailedToLoad={error => {
              console.warn(
                '❌ BannerAd failed to load:',
                JSON.stringify(error, null, 2),
              );
            }}
          />
        </View>
      )}
    </View>
  );
}
