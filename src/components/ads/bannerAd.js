import React from 'react';
import { View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import { admobKey } from '../../helpers/admob';
import { useSelector } from 'react-redux';

export default AppBannerAd = props => {
  const {
    isDisplayAds,
    adBottomWithBtn,
  } = require('../../helpers/globalFunction');
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);

  // useForeground(() => {
  //   Platform.OS === 'ios' && bannerRef.current?.load();
  // });

  return (
    isDisplayAds(data) && (
      <View
        style={{
          justifyContent: 'flex-end',
          marginBottom: props.isBottom ? adBottomWithBtn() : 0,
          backgroundColor: setting.appColor,
        }}
      >
        <BannerAd
          unitId={__DEV__ ? TestIds.GAM_BANNER : admobKey.banner}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly:
              setting.isNonPersonalizedAdsOnly || false,
          }}
        />
      </View>
    )
  );
};
