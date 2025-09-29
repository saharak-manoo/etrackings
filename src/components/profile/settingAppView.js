/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import i18next from 'i18next';
import {View, Linking} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import RNLanguageDetector from '@os-team/i18next-react-native-language-detector';
import {
  setSystemDarkMode,
  setDarkMode,
  setLanguage,
  setUserToStorage,
  setCopiedText,
  setShowCouriers,
  setAnimation,
  setSelectColor,
  setHideOnDelivered,
  setHideTrackingButton,
  setHideOnReturnedToSender,
  setShowSwitchNotification,
  setNonPersonalizedAdsOnly,
} from '../actions';
import * as Api from '../actions/api';
import {useTranslation} from 'react-i18next';
import {styles} from '../../helpers/styles';
import {Text, Switch} from 'react-native-paper';
import {ListItem} from 'react-native-elements';
import {ScrollView} from 'react-native-gesture-handler';
import {getBuildNumber, getVersion} from 'react-native-device-info';
import {etrackingsPrivacyPolicy} from '../../../app.json';
import ActionSheet from 'react-native-action-sheet';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import Ripple from 'react-native-material-ripple';
import {useDarkMode} from 'react-native-dynamic';

import IOSHeader from '../header/iosHeaderView';

export default SettingApp = ({navigation}) => {
  const {t} = useTranslation();
  const {
    isLogin,
    fontSize,
    hp,
    encryptedStorageSetItem,
  } = require('../../helpers/globalFunction');
  const dispatch = useDispatch();
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const isDarkMode = useDarkMode();

  onChangeToDarkMode = async () => {
    ActionSheet.showActionSheetWithOptions(
      {
        title: t('placeholder.changeDarkMode'),
        options: [
          t('placeholder.open'),
          t('placeholder.close'),
          t('placeholder.systemDarkMode'),
          t('button.cancel'),
        ],
        cancelButtonIndex: 3,
      },
      async buttonIndex => {
        if (buttonIndex === 0 || buttonIndex === 1 || buttonIndex === 2) {
          let isSystemDarkMode = buttonIndex === 2;
          await encryptedStorageSetItem(
            'isSystemDarkMode',
            JSON.stringify(isSystemDarkMode),
          );
          await dispatch(setSystemDarkMode(isSystemDarkMode));

          let isOpenDarkMode = isSystemDarkMode
            ? isDarkMode
            : buttonIndex === 0;

          await encryptedStorageSetItem(
            'isDarkMode',
            JSON.stringify(isOpenDarkMode),
          );
          await dispatch(setDarkMode(isOpenDarkMode));
        }
      },
    );
  };

  onChangeLanguage = async () => {
    ActionSheet.showActionSheetWithOptions(
      {
        title: t('placeholder.changeLanguage'),
        options: [
          t('placeholder.system'),
          t('placeholder.th'),
          t('placeholder.en'),
          t('button.cancel'),
        ],
        cancelButtonIndex: 3,
      },
      async buttonIndex => {
        if (
          buttonIndex === 0 ||
          buttonIndex === 1 ||
          buttonIndex === 2 ||
          buttonIndex === 3
        ) {
          let locale =
            buttonIndex === 0 ? 'system' : buttonIndex === 1 ? 'th' : 'en';

          if (buttonIndex !== 3) {
            let lang =
              locale === 'system' ? RNLanguageDetector.detect() : locale;
            i18next.changeLanguage(lang);
            await encryptedStorageSetItem('locale', locale);
            await dispatch(setLanguage(lang));

            if (isLogin(data?.user)) {
              let resp = await Api.updateUser(data?.user?.authenticationJWT, {
                language: lang,
              });
              if (resp?.meta?.code === 200)
                dispatch(setUserToStorage(resp.data));
            }
          }
        }
      },
    );
  };

  onChangeNonPersonalizedAdsOnly = async isNonPersonalizedAdsOnly => {
    await encryptedStorageSetItem(
      'isNonPersonalizedAdsOnly',
      JSON.stringify(isNonPersonalizedAdsOnly),
    );
    await dispatch(setNonPersonalizedAdsOnly(isNonPersonalizedAdsOnly));
  };

  onChangeHideTrackingButton = async isHideTrackingButton => {
    await encryptedStorageSetItem(
      'isHideTrackingButton',
      JSON.stringify(isHideTrackingButton),
    );
    await dispatch(setHideTrackingButton(isHideTrackingButton));
  };

  onChangeAutoCopiedText = async isAutoCopiedText => {
    await encryptedStorageSetItem(
      'isAutoCopiedText',
      JSON.stringify(isAutoCopiedText),
    );
    await dispatch(setCopiedText(isAutoCopiedText));
  };

  onChangeSwitchNotification = async isShowSwitchNotification => {
    await encryptedStorageSetItem(
      'isShowSwitchNotification',
      JSON.stringify(isShowSwitchNotification),
    );
    await dispatch(setShowSwitchNotification(isShowSwitchNotification));
  };

  onChangeShowCouriers = async isShowCouriers => {
    await encryptedStorageSetItem(
      'isShowCouriers',
      JSON.stringify(isShowCouriers),
    );
    await dispatch(setShowCouriers(isShowCouriers));
  };

  onChangeAnimation = async () => {
    ActionSheet.showActionSheetWithOptions(
      {
        title: t('text.animation'),
        options: [
          t('text.normal'),
          t('text.fast'),
          t('text.close'),
          t('button.cancel'),
        ],
        cancelButtonIndex: 3,
      },
      async buttonIndex => {
        if (buttonIndex === 0) {
          animation = 'normal';
        } else if (buttonIndex === 1) {
          animation = 'fast';
        } else if (buttonIndex === 2) {
          animation = 'close';
        }

        if (animation) {
          await encryptedStorageSetItem('animation', animation);
          await dispatch(setAnimation(animation));
        }
      },
    );
  };

  onChangeSelectColor = async isSelectColor => {
    await encryptedStorageSetItem(
      'isSelectColor',
      JSON.stringify(isSelectColor),
    );
    await dispatch(setSelectColor(isSelectColor));
  };

  onChangeHideOnDelivered = async isHideOnDelivered => {
    await encryptedStorageSetItem(
      'isHideOnDelivered',
      JSON.stringify(isHideOnDelivered),
    );
    await dispatch(setHideOnDelivered(isHideOnDelivered));
  };

  onChangeHideReturnedToSender = async isHideReturnedToSender => {
    await encryptedStorageSetItem(
      'isHideReturnedToSender',
      JSON.stringify(isHideReturnedToSender),
    );
    await dispatch(setHideOnReturnedToSender(isHideReturnedToSender));
  };

  openLink = async url => Linking.openURL(url);

  return (
    <View style={{flex: 1, backgroundColor: setting.appColor}}>
      <IOSHeader
        title={t('placeholder.setting')}
        subtitle={t('placeholder.app')}
        canGoBack={true}
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: setting.appColor,
        }}>
        <View style={{flex: 1}}>
          <View
            style={{
              backgroundColor: setting.appColor,
              height: '100%',
              borderRadius: 15,
            }}>
            <View style={{flex: 1}}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{paddingTop: 20}}>
                  <Text
                    theme={{
                      dark: setting.isDarkMode,
                      colors: {text: setting.textColor},
                    }}
                    numberOfLines={1}
                    allowFontScaling={false}
                    style={{
                      paddingBottom: 10,
                      fontFamily: 'Kanit-Light',
                      fontSize: fontSize(22),
                      alignSelf: 'flex-start',
                      paddingTop: hp(0.5),
                      paddingLeft: hp(1),
                    }}>
                    {t('placeholder.app')}
                  </Text>

                  <Ripple
                    rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                    onPress={() => onChangeAnimation()}>
                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('text.animation')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Text
                          theme={{
                            dark: setting.isDarkMode,
                            colors: {text: setting.textColor},
                          }}>
                          {t(`text.${setting.animation}`)}
                        </Text>
                      }
                    />
                  </Ripple>

                  <ListItem
                    containerStyle={{
                      backgroundColor: setting.cardColor,
                    }}
                    title={t('text.requestNonPersonalizedAdsOnly')}
                    titleStyle={{
                      fontFamily: 'Kanit-Light',
                      color: setting.textColor,
                    }}
                    rightIcon={
                      <Switch
                        value={setting.isNonPersonalizedAdsOnly}
                        onValueChange={isNonPersonalizedAdsOnly =>
                          onChangeNonPersonalizedAdsOnly(
                            isNonPersonalizedAdsOnly,
                          )
                        }
                      />
                    }
                  />

                  <ListItem
                    containerStyle={{
                      backgroundColor: setting.cardColor,
                    }}
                    title={t('text.hideTrackingButton')}
                    titleStyle={{
                      fontFamily: 'Kanit-Light',
                      color: setting.textColor,
                    }}
                    rightIcon={
                      <Switch
                        value={setting.isHideTrackingButton}
                        onValueChange={isHideTrackingButton =>
                          onChangeHideTrackingButton(isHideTrackingButton)
                        }
                      />
                    }
                  />

                  <ListItem
                    containerStyle={{
                      backgroundColor: setting.cardColor,
                    }}
                    title={t('text.hideOnDelivered')}
                    titleStyle={{
                      fontFamily: 'Kanit-Light',
                      color: setting.textColor,
                    }}
                    rightIcon={
                      <Switch
                        value={setting.isHideOnDelivered}
                        onValueChange={isHideOnDelivered =>
                          onChangeHideOnDelivered(isHideOnDelivered)
                        }
                      />
                    }
                  />

                  <ListItem
                    containerStyle={{
                      backgroundColor: setting.cardColor,
                    }}
                    title={t('text.hideReturnedToSender')}
                    titleStyle={{
                      fontFamily: 'Kanit-Light',
                      color: setting.textColor,
                    }}
                    rightIcon={
                      <Switch
                        value={setting.isHideReturnedToSender}
                        onValueChange={isHideReturnedToSender =>
                          onChangeHideReturnedToSender(isHideReturnedToSender)
                        }
                      />
                    }
                  />

                  <ListItem
                    containerStyle={{
                      backgroundColor: setting.cardColor,
                    }}
                    title={t('text.selectColor')}
                    titleStyle={{
                      fontFamily: 'Kanit-Light',
                      color: setting.textColor,
                    }}
                    rightIcon={
                      <Switch
                        value={setting.isSelectColor}
                        onValueChange={isSelectColor =>
                          onChangeSelectColor(isSelectColor)
                        }
                      />
                    }
                  />

                  <ListItem
                    containerStyle={{
                      backgroundColor: setting.cardColor,
                    }}
                    title={t('text.switchNotification')}
                    titleStyle={{
                      fontFamily: 'Kanit-Light',
                      color: setting.textColor,
                    }}
                    rightIcon={
                      <Switch
                        value={setting.isShowSwitchNotification}
                        onValueChange={isShowSwitchNotification =>
                          onChangeSwitchNotification(isShowSwitchNotification)
                        }
                      />
                    }
                  />

                  <ListItem
                    containerStyle={{
                      backgroundColor: setting.cardColor,
                    }}
                    title={t('placeholder.autoClipboard')}
                    titleStyle={{
                      fontFamily: 'Kanit-Light',
                      color: setting.textColor,
                    }}
                    rightIcon={
                      <Switch
                        value={setting.isAutoCopiedText}
                        onValueChange={isAutoCopiedText =>
                          onChangeAutoCopiedText(isAutoCopiedText)
                        }
                      />
                    }
                  />

                  <ListItem
                    containerStyle={{
                      backgroundColor: setting.cardColor,
                    }}
                    title={t('placeholder.showCouriers')}
                    titleStyle={{
                      fontFamily: 'Kanit-Light',
                      color: setting.textColor,
                    }}
                    rightIcon={
                      <Switch
                        value={setting.isShowCouriers}
                        onValueChange={isShowCouriers =>
                          onChangeShowCouriers(isShowCouriers)
                        }
                      />
                    }
                  />

                  <Ripple
                    rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                    onPress={() => onChangeToDarkMode()}>
                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('placeholder.darkMode')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Text
                          theme={{
                            dark: setting.isDarkMode,
                            colors: {text: setting.textColor},
                          }}>
                          {t(
                            `placeholder.${
                              setting.isSystemDarkMode
                                ? 'systemDarkMode'
                                : setting.isDarkMode
                                ? 'open'
                                : 'close'
                            }`,
                          )}
                        </Text>
                      }
                    />
                  </Ripple>

                  <Ripple
                    rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                    onPress={() => onChangeLanguage()}>
                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('placeholder.language')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Text
                          theme={{
                            dark: setting.isDarkMode,
                            colors: {text: setting.textColor},
                          }}>
                          {t(
                            `placeholder.${setting.isLanguageTH ? 'th' : 'en'}`,
                          )}
                        </Text>
                      }
                    />
                  </Ripple>

                  <Ripple
                    rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                    onPress={() => openLink(etrackingsPrivacyPolicy)}>
                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('text.privacyPolicy')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <MatIcon
                          name={'launch'}
                          style={styles.openLinkIcon}
                          color={'#129CE6'}
                        />
                      }
                    />
                  </Ripple>

                  <Ripple
                    rippleDuration={setting?.animation == 'normal' ? 600 : 450}>
                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('placeholder.appVersion')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Text
                          theme={{
                            dark: setting.isDarkMode,
                            colors: {text: setting.textColor},
                          }}>
                          {getVersion() || t('text.loading')}
                        </Text>
                      }
                    />
                  </Ripple>

                  <Ripple
                    rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                    style={{marginBottom: 45}}>
                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('placeholder.buildNumber')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Text
                          theme={{
                            dark: setting.isDarkMode,
                            colors: {text: setting.textColor},
                          }}>
                          {getBuildNumber() || t('text.loading')}
                        </Text>
                      }
                    />
                  </Ripple>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
