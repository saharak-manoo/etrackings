/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setUserToStorage} from '../actions';
import * as Api from '../actions/api';
import {useTranslation} from 'react-i18next';
import {Text, Switch} from 'react-native-paper';
import {ListItem} from 'react-native-elements';
import {ScrollView} from 'react-native-gesture-handler';

import IOSHeader from '../header/iosHeaderView';

export default SettingNotification = ({navigation, route: {params}}) => {
  const {t} = useTranslation();
  const {
    isLogin,
    infoMessage,
    errorMessage,
    fontSize,
    hp,
  } = require('../../helpers/globalFunction');
  const dispatch = useDispatch();
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);

  onChangeNotifyWebAndApp = async isNotifyWebAndApp => {
    let resp = await Api.updateUser(data?.user?.authenticationJWT, {
      isNotifyWebAndApp: isNotifyWebAndApp,
    });
    if (resp?.meta?.code === 200) dispatch(setUserToStorage(resp.data));
  };

  onChangeNotifyEmail = async isNotifyEmail => {
    let resp = await Api.updateUser(data?.user?.authenticationJWT, {
      isNotifyEmail: isNotifyEmail,
    });
    if (resp?.meta?.code === 200) dispatch(setUserToStorage(resp.data));
  };

  onChangeNotifyLine = async isNotifyLine => {
    let resp = await Api.updateUser(data?.user?.authenticationJWT, {
      isNotifyLine: isNotifyLine,
    });
    if (resp?.meta?.code === 200) dispatch(setUserToStorage(resp.data));
  };

  onChangeShowImageOnNotification = async isShowImageOnNotification => {
    let resp = await Api.updateUser(data?.user?.authenticationJWT, {
      isShowImageOnNotification: isShowImageOnNotification,
    });
    if (resp?.meta?.code === 200) dispatch(setUserToStorage(resp.data));
  };

  updateNotify = async notifyParams => {
    let resp = await Api.updateUser(
      data?.user?.authenticationJWT,
      notifyParams,
    );

    if (resp?.meta?.code === 200) {
      infoMessage('ETrackings', t('text.save'));
      dispatch(setUserToStorage(resp.data));
    } else {
      errorMessage('ETrackings', t('message.somethingWentWrong'));
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: setting.appColor}}>
      <IOSHeader
        title={t('placeholder.setting')}
        subtitle={t('placeholder.notification')}
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
                {isLogin(data?.user) && (
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
                      {t('placeholder.supplies')}
                    </Text>

                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('placeholder.app')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Switch
                          value={data.user.isNotifyWebAndApp}
                          onValueChange={isNotifyWebAndApp =>
                            onChangeNotifyWebAndApp(isNotifyWebAndApp)
                          }
                        />
                      }
                    />

                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('placeholder.showImageOnNotification')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Switch
                          value={data.user.isShowImageOnNotification}
                          onValueChange={isShowImageOnNotification =>
                            onChangeShowImageOnNotification(
                              isShowImageOnNotification,
                            )
                          }
                        />
                      }
                    />

                    {data?.user?.lineUID != '' && (
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        title={t('placeholder.line')}
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon={
                          <Switch
                            value={data.user.isNotifyLine}
                            onValueChange={isNotifyLine =>
                              onChangeNotifyLine(isNotifyLine)
                            }
                          />
                        }
                      />
                    )}

                    {data?.user?.isPremium && (
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        title={t('placeholder.shortNotify')}
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon={
                          <Switch
                            disabled={!data?.user?.isPremium}
                            value={data.user.isShortNotify}
                            onValueChange={isShortNotify =>
                              updateNotify({
                                isShortNotify: isShortNotify,
                              })
                            }
                          />
                        }
                      />
                    )}

                    {data?.user?.isPremium && (
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        title={t('placeholder.autoRemoveTracking')}
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon={
                          <Switch
                            disabled={!data?.user?.isPremium}
                            value={data.user.isAutoRemoveTracking}
                            onValueChange={isAutoRemoveTracking =>
                              updateNotify({
                                isAutoRemoveTracking: isAutoRemoveTracking,
                              })
                            }
                          />
                        }
                      />
                    )}
                  </View>
                )}

                {isLogin(data?.user) && (
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
                      {t('placeholder.service')}
                    </Text>

                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('placeholder.notifyWhatNew')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Switch
                          value={data?.user?.isNotifyWhatNew}
                          onValueChange={isNotifyWhatNew =>
                            updateNotify({
                              isNotifyWhatNew: isNotifyWhatNew,
                            })
                          }
                        />
                      }
                    />

                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('placeholder.notifyPromotion')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Switch
                          value={data?.user?.isNotifyPromotion}
                          onValueChange={isNotifyPromotion =>
                            updateNotify({
                              isNotifyPromotion: isNotifyPromotion,
                            })
                          }
                        />
                      }
                    />
                  </View>
                )}

                {isLogin(data?.user) && data?.user?.isPremium && (
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
                      {t('placeholder.premiumFeature')}
                    </Text>

                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('placeholder.notifyOnPickedUp')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Switch
                          value={data.user.isNotifyOnPickedUp}
                          onValueChange={isNotifyOnPickedUp =>
                            updateNotify({
                              isNotifyOnPickedUp: isNotifyOnPickedUp,
                            })
                          }
                        />
                      }
                    />

                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('placeholder.notifyOnShipping')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Switch
                          value={data.user.isNotifyOnShipping}
                          onValueChange={isNotifyOnShipping =>
                            updateNotify({
                              isNotifyOnShipping: isNotifyOnShipping,
                            })
                          }
                        />
                      }
                    />

                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('placeholder.notifyOnDelivered')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Switch
                          value={data.user.isNotifyOnDelivered}
                          onValueChange={isNotifyOnDelivered =>
                            updateNotify({
                              isNotifyOnDelivered: isNotifyOnDelivered,
                            })
                          }
                        />
                      }
                    />

                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('placeholder.notifyOnUnableToSendParcel')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Switch
                          value={data.user.isNotifyOnUnableToSend}
                          onValueChange={isNotifyOnUnableToSend =>
                            updateNotify({
                              isNotifyOnUnableToSend: isNotifyOnUnableToSend,
                            })
                          }
                        />
                      }
                    />

                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                        marginBottom: 45,
                      }}
                      title={t('placeholder.notifyOnOtherStatus')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Switch
                          value={data.user.isNotifyOnOtherStatus}
                          onValueChange={isNotifyOnOtherStatus =>
                            updateNotify({
                              isNotifyOnOtherStatus: isNotifyOnOtherStatus,
                            })
                          }
                        />
                      }
                    />
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
