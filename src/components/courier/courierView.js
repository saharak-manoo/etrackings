/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { styles } from '../../helpers/styles';
import * as Animatable from 'react-native-animatable';
import { useSelector } from 'react-redux';
import FastImage from '@d11/react-native-fast-image';
import Ripple from 'react-native-material-ripple';
import { useTranslation } from 'react-i18next';
import { hasNotch } from 'react-native-device-info';

export default CourierView = props => {
  const {
    fontSize,
    hp,
    isIpad,
    width,
    isLandscape,
    errorMessage,
  } = require('../../helpers/globalFunction');
  const { t } = useTranslation();
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);

  onCourierClose = courierName => {
    errorMessage(
      courierName,
      `${courierName} ${t('message.courierNotAvailable')}`,
    );
  };

  return (
    <Animatable.View
      delay={
        props.index * (props.index + setting?.animation == 'normal' ? 70 : 35)
      }
      animation={
        props.isCloseAnimation
          ? ''
          : setting?.animation != 'close'
            ? 'fadeInUp'
            : ''
      }
    >
      <Ripple
        rippleDuration={setting?.animation == 'normal' ? 600 : 450}
        rippleContainerBorderRadius={15}
        onPress={() =>
          props?.disabled ? onCourierClose(props.title) : props?.onPress()
        }
        onLongPress={() =>
          props?.disabled
            ? onCourierClose(props.title)
            : props?.onLongPress
              ? props.onLongPress()
              : props?.onPress()
        }
        style={{
          marginBottom: props.isNoBottom
            ? 0
            : data?.user == null
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
          height: props.isSmall ? 65 : 90,
          width: isIpad()
            ? width() / (isLandscape() ? 4.32 : 3.32)
            : width() / 2.3,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 90,
            width: isIpad()
              ? width() / (isLandscape() ? 4.32 : 3.32)
              : width() / 2.3,
          }}
        >
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View
              style={{
                width: '70%',
                justifyContent: 'center',
              }}
            >
              <Text
                numberOfLines={2}
                style={{
                  padding: 15,
                  fontFamily: 'Kanit-Light',
                  fontSize: fontSize(
                    isIpad()
                      ? props.isSmall
                        ? 14
                        : 16
                      : props.isSmall
                        ? 10
                        : 14,
                  ),
                  color: props.textColor,
                }}
              >
                {props?.disabled ? t('text.closedForMaintenance') : props.title}
              </Text>
            </View>
            <View
              style={{
                width: '30%',
                justifyContent: 'center',
              }}
            >
              <FastImage
                resizeMode={FastImage.resizeMode.contain}
                style={styles.imageSelect}
                source={{
                  uri: props.imageURL,
                  priority: FastImage.priority.normal,
                }}
              />
            </View>
          </View>
        </View>
      </Ripple>
    </Animatable.View>
  );
};
