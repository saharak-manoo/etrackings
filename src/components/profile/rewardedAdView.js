/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

export default RewardedAdView = ({navigation, route: {params}}) => {
  const setting = useSelector(state => state.setting);

  return (
    <View style={{flex: 1, backgroundColor: setting.appColor}}>
      <View
        style={{
          flex: 1,
          backgroundColor: setting.appColor,
        }}></View>
    </View>
  );
};
