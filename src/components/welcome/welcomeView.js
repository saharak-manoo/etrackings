import React from 'react';
import {View, StatusBar} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {styles} from '../../helpers/styles';
import FastImage from '@d11/react-native-fast-image';
import {Text} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import Ripple from 'react-native-material-ripple';

export default WelcomeView = ({navigation, route: {params}}) => {
  const {t} = useTranslation();
  const {isIpad, fontSize, hp, width} = require('../../helpers/globalFunction');
  // redux
  const setting = useSelector(state => state.setting);

  return (
    <View style={{flex: 1}}>
      <StatusBar
        barStyle={`${setting.isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={setting.appColor}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: setting.appColor,
          padding: isIpad() ? 80 : 0,
        }}>
        <View style={{flex: 1}}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{flex: 1, marginTop: 40}}>
              <Animatable.View
                animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
                delay={setting?.animation == 'normal' ? 100 : 50 * 1}>
                <FastImage
                  resizeMode={FastImage.resizeMode.contain}
                  style={styles.appETrackings}
                  source={{
                    uri: `https://fast.etrackings.com/apps.png`,
                    priority: FastImage.priority.normal,
                  }}
                />
              </Animatable.View>
            </View>

            <View
              style={{
                flex: 1,
              }}>
              <Animatable.View
                animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
                delay={setting?.animation == 'normal' ? 100 : 50 * 2}>
                <Text
                  numberOfLines={1}
                  theme={{
                    dark: setting.isDarkMode,
                    colors: {text: setting.textColor},
                  }}
                  style={{
                    textAlign: 'center',
                    fontFamily: 'Kanit-Light',
                    fontSize: fontSize(25),
                    alignSelf: 'center',
                    paddingTop: hp(0.5),
                    paddingLeft: hp(1),
                  }}>
                  {t('placeholder.appName')}
                </Text>
              </Animatable.View>
              <Animatable.View
                animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
                delay={setting?.animation == 'normal' ? 100 : 50 * 3}>
                <Text
                  theme={{
                    dark: setting.isDarkMode,
                    colors: {text: setting.textColor},
                  }}
                  style={{
                    textAlign: 'center',
                    fontFamily: 'Kanit-Light',
                    fontSize: fontSize(16),
                    alignSelf: 'center',
                    paddingTop: hp(0.5),
                    paddingLeft: hp(3),
                    paddingRight: hp(3),
                  }}>
                  {t('placeholder.trackingNotifications')}
                </Text>
              </Animatable.View>
              <Animatable.View
                animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
                delay={setting?.animation == 'normal' ? 100 : 50 * 5}>
                <Text
                  theme={{
                    dark: setting.isDarkMode,
                    colors: {text: setting.textColor},
                  }}
                  style={{
                    textAlign: 'center',
                    fontFamily: 'Kanit-Light',
                    fontSize: fontSize(16),
                    alignSelf: 'center',
                    paddingTop: hp(0.5),
                    paddingLeft: hp(3),
                    paddingRight: hp(3),
                  }}>
                  {t('placeholder.trackingAndKeep')}
                </Text>
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
                      borderColor: '#02CF8B',
                      backgroundColor: '#02CF8B',
                      flexDirection: 'row',
                      borderRadius: 8,
                      height: 50,
                      marginTop: 40,
                      width: width() / 1.2,
                    },
                  ]}
                  onPress={() => navigation.navigate('Auth')}>
                  <View style={{flex: 1, alignItems: 'center'}}>
                    <Text
                      style={{
                        color: '#FFF',
                        fontSize: fontSize(12),
                        fontFamily: 'Kanit-Light',
                      }}>
                      {t('button.signIn')}
                    </Text>
                  </View>
                </Ripple>
              </Animatable.View>

              <Animatable.View
                animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
                delay={setting?.animation == 'normal' ? 100 : 50 * 7}>
                <Ripple
                  rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                  style={[
                    styles.buttonLoginWith,
                    {
                      borderWidth: 2,
                      borderColor: '#FC1449',
                      backgroundColor: setting.isDarkMode
                        ? '#FC1449'
                        : 'transparent',
                      flexDirection: 'row',
                      borderRadius: 8,
                      height: 50,
                      marginTop: 20,
                      marginBottom: 30,
                      width: width() / 1.2,
                    },
                  ]}
                  onPress={() => navigation.navigate('Guest')}>
                  <View style={{flex: 1, alignItems: 'center'}}>
                    <Text
                      style={{
                        color: setting.isDarkMode ? '#FFF' : '#FC1449',
                        fontSize: fontSize(12),
                        fontFamily: 'Kanit-Light',
                      }}>
                      {t('button.trackingOnly')}
                    </Text>
                  </View>
                </Ripple>
              </Animatable.View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};
