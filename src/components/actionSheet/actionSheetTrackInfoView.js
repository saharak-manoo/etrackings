import React from 'react';
import ActionSheet, {
  SheetManager,
  useSheetPayload,
} from 'react-native-actions-sheet';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {Text} from 'react-native-paper';
import FastImage from '@d11/react-native-fast-image';
import Ripple from 'react-native-material-ripple';
import {styles} from '../../helpers/styles';

export default ActionSheetTrackInfoView = () => {
  const {
    sheetName,
    title,
    subTitle,
    isShowDetail,
    courierImageURL,
    trackDetail,
    close,
  } = useSheetPayload('payload');
  // redux
  const {
    fontSize,
    hp,
    copyToClipboard,
    height,
  } = require('../../helpers/globalFunction');
  const setting = useSelector(state => state.setting);
  const imageURL = courierImageURL;

  return (
    <ActionSheet
      gestureEnabled
      bounceOnOpen
      containerStyle={{
        backgroundColor: setting.cardColor,
      }}
      onClose={() => {
        SheetManager.hide(sheetName);
        close();
      }}>
      <ScrollView
        style={{
          padding: 10,
          backgroundColor: setting.cardColor,
          maxHeight: height() / 1.2,
        }}>
        <View style={{flexDirection: 'row'}}>
          <View
            style={{
              width: imageURL ? '80%' : '100%',
              justifyContent: 'center',
            }}>
            <Text
              theme={{
                dark: setting.isDarkMode,
                colors: {text: setting.textColor},
              }}
              numberOfLines={2}
              allowFontScaling={false}
              style={{
                alignContent: 'center',
                fontFamily: 'Kanit-Light',
                fontSize: fontSize(23),
                paddingTop: hp(0.5),
                paddingLeft: hp(1),
              }}>
              {title}
            </Text>

            {subTitle && (
              <Ripple
                rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                onPress={() => copyToClipboard(subTitle)}>
                <Text
                  theme={{
                    dark: setting.isDarkMode,
                    colors: {text: setting.textColor},
                  }}
                  allowFontScaling={false}
                  style={{
                    alignContent: 'center',
                    fontFamily: 'Kanit-Light',
                    fontSize: fontSize(18),
                    paddingTop: hp(0.5),
                    paddingLeft: hp(1),
                  }}>
                  {subTitle}
                </Text>
              </Ripple>
            )}
          </View>

          {imageURL && (
            <View style={{width: '20%', justifyContent: 'center'}}>
              <FastImage
                resizeMode={FastImage.resizeMode.contain}
                style={styles.headerImageTrackingStatus}
                source={{
                  uri: imageURL,
                  priority: FastImage.priority.low,
                }}
              />
            </View>
          )}
        </View>
        {isShowDetail && trackDetail}
      </ScrollView>
    </ActionSheet>
  );
};
