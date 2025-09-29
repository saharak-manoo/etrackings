import React from 'react';
import ActionSheet, {
  SheetManager,
  useSheetPayload,
} from 'react-native-actions-sheet';
import {REMOVE_ADS_URL} from '../actions/constants';
import {View, Linking} from 'react-native';
import {useSelector} from 'react-redux';
import {Text} from 'react-native-paper';
import Ripple from 'react-native-material-ripple';
import FastImage from '@d11/react-native-fast-image';
import {useTranslation} from 'react-i18next';
import * as Animatable from 'react-native-animatable';
import {styles} from '../../helpers/styles';

export default ActionSheetRemoveAdsView = props => {
  const {sheetName, navigation, title, subTitle} = useSheetPayload('payload');
  const {
    isIpad,
    width,
    hp,
    fontSize,
    encryptedStorageSetItem,
  } = require('../../helpers/globalFunction');
  // redux
  const {t} = useTranslation();
  const setting = useSelector(state => state.setting);

  openLink = async url => Linking.openURL(url);

  return (
    <ActionSheet
      gestureEnabled
      bounceOnOpen
      closable={false}
      containerStyle={{backgroundColor: setting.cardColor}}
      onClose={() => {
        SheetManager.hide(sheetName);
      }}>
      <View
        style={{
          padding: 10,
          backgroundColor: setting.cardColor,
        }}>
        <View style={{flexDirection: 'row'}}>
          <View style={{width: '100%'}}>
            <Animatable.View
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
              delay={setting?.animation == 'normal' ? 100 : 50 * 1}>
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
                  fontSize: fontSize(25),
                  paddingTop: hp(0.5),
                  paddingLeft: hp(1),
                }}>
                {title}
              </Text>
            </Animatable.View>

            <Animatable.View
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
              delay={setting?.animation == 'normal' ? 100 : 50 * 2}>
              {subTitle && (
                <Text
                  theme={{
                    dark: setting.isDarkMode,
                    colors: {text: setting.textColor},
                  }}
                  allowFontScaling={false}
                  style={{
                    alignContent: 'center',
                    fontFamily: 'Kanit-Light',
                    fontSize: fontSize(12),
                    paddingTop: hp(0.5),
                    paddingLeft: hp(1),
                  }}>
                  {subTitle}
                </Text>
              )}
            </Animatable.View>

            <Animatable.View
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
              delay={setting?.animation == 'normal' ? 100 : 50 * 3}>
              <FastImage
                resizeMode={FastImage.resizeMode.contain}
                style={styles.imageNoAds}
                source={{uri: REMOVE_ADS_URL}}
              />
            </Animatable.View>

            <Animatable.View
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
              delay={setting?.animation == 'normal' ? 100 : 50 * 4}>
              <Ripple
                rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                style={[
                  styles.buttonLoginWith,
                  {
                    borderWidth: 2,
                    borderColor: '#1dd793',
                    backgroundColor: '#1dd793',
                    flexDirection: 'row',
                    borderRadius: 8,
                    height: 50,
                    marginTop: 20,
                    width: isIpad() ? width() / 3.2 : width() / 1.2,
                  },
                ]}
                onPress={() => {
                  navigation.navigate('Package');
                  SheetManager.hide(sheetName);
                }}>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: '#000',
                      fontSize: fontSize(12),
                      fontFamily: 'Kanit-Light',
                    }}>
                    {t('text.package')}
                  </Text>
                </View>
              </Ripple>
            </Animatable.View>

            <Animatable.View
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
              delay={setting?.animation == 'normal' ? 100 : 50 * 5}>
              <Ripple
                rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                style={[
                  styles.buttonLoginWith,
                  {
                    borderWidth: 2,
                    borderColor: '#fa4343',
                    backgroundColor: '#fa4343',
                    flexDirection: 'row',
                    borderRadius: 8,
                    height: 50,
                    marginTop: 20,
                    width: isIpad() ? width() / 3.2 : width() / 1.2,
                  },
                ]}
                onPress={() => SheetManager.hide(sheetName)}>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: '#FFF',
                      fontSize: fontSize(12),
                      fontFamily: 'Kanit-Light',
                    }}>
                    {t('button.close')}
                  </Text>
                </View>
              </Ripple>
            </Animatable.View>

            <Animatable.View
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
              delay={setting?.animation == 'normal' ? 100 : 50 * 6}>
              <Ripple
                rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                style={[
                  styles.buttonLoginWith,
                  {
                    borderWidth: 2,
                    borderColor: '#000',
                    backgroundColor: '#000',
                    flexDirection: 'row',
                    borderRadius: 8,
                    height: 50,
                    marginTop: 20,
                    width: isIpad() ? width() / 3.2 : width() / 1.2,
                  },
                ]}
                onPress={async () => {
                  SheetManager.hide(sheetName);
                  await encryptedStorageSetItem('isRemovedAdsModel', 'true');
                }}>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: '#FFF',
                      fontSize: fontSize(12),
                      fontFamily: 'Kanit-Light',
                    }}>
                    {t('button.doNotShowItAgain')}
                  </Text>
                </View>
              </Ripple>
            </Animatable.View>
          </View>
        </View>
      </View>
    </ActionSheet>
  );
};
