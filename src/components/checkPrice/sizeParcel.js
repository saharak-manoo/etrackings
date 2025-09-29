/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import {useSelector} from 'react-redux';
import Ripple from 'react-native-material-ripple';
import {hasNotch} from 'react-native-device-info';

export default SizeParcel = props => {
  const {
    width,
    isLandscape,
    isIpad,
    hp,
    fontSize,
  } = require('../../helpers/globalFunction');
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);

  return (
    <Animatable.View
      delay={
        props.index * (props.index + setting?.animation == 'normal' ? 70 : 35)
      }
      animation={setting?.animation != 'close' ? 'fadeInUp' : ''}>
      <Ripple
        rippleDuration={setting?.animation == 'normal' ? 600 : 450}
        rippleContainerBorderRadius={15}
        onPress={() => props.onPress()}
        style={{
          marginBottom:
            data?.user == null
              ? 0
              : props.isLasted
              ? hasNotch()
                ? 85
                : 65
              : 0,
          backgroundColor: props.selected
            ? props.selectedColor
            : setting.isSelectColor
            ? props.backgroundColor
            : setting.notSelectColor,
          fontFamily: 'Kanit-Light',
          margin: hp(1),
          borderRadius: 15,
          height: isIpad() ? 95 : 65,
          width: isIpad()
            ? width() / (isLandscape() ? 4.33 : 3.33)
            : width() / 2.3,
        }}>
        <View style={{flex: 1}}>
          <View
            style={{
              justifyContent: 'center',
            }}>
            <Text
              allowFontScaling={false}
              numberOfLines={2}
              style={{
                textAlign: 'left',
                padding: 10,
                fontFamily: 'Kanit-Light',
                fontSize: fontSize(isIpad() ? 12 : 11),
                color: props.textColor,
              }}>
              {props.title.replace(' (', '\n(')}
            </Text>
          </View>
        </View>
      </Ripple>
    </Animatable.View>
  );
};
