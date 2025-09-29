import React, {useState} from 'react';
import {Alert, ActionSheetIOS, View, SafeAreaView} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {Text, Switch} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import * as Api from '../actions/api';
import {styles} from '../../helpers/styles';
import {ListItem} from 'react-native-elements';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import QRCode from 'react-native-qrcode-svg';
import {HOST_BACKUP, HTTP_STATUSES} from '../actions/constants';
import * as Error from '../../helpers/errorResponse';
import Ripple from 'react-native-material-ripple';
import {CommonActions} from '@react-navigation/native';
import {SheetManager} from 'react-native-actions-sheet';

// View
import IOSHeader from '../header/iosHeaderView';

export default TrackingSettingView = ({navigation, route: {params}}) => {
  const {t} = useTranslation();
  const {
    isIos,
    isDisplayAds,
    fontSize,
    hp,
    isIpad,
    infoMessage,
    errorMessage,
    isLogin,
    copyToClipboard,
  } = require('../../helpers/globalFunction');
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const [tracking, setTracking] = useState(params.tracking);
  const courier = params.courier;
  const trackingNumber = params.trackingNumber;
  const note = params.note;
  const courierData = data.couriers.find(item => item.key === courier);

  updateNotify = async trackingParams => {
    let resp = await Api.updateTracking(
      data?.user?.authenticationJWT,
      tracking.id,
      trackingParams,
    );

    if (!HTTP_STATUSES.includes(resp.status) && !resp?.meta) {
      Error.ResponseView(navigation, resp.status, SheetManager);
      return;
    }
    if (resp?.meta?.code === 200) {
      infoMessage('ETrackings', t('text.save'));
      setTracking(resp.data);
    } else {
      errorMessage('ETrackings', t('message.somethingWentWrong'));
    }
  };

  dialogDeleteTracking = trackingID => {
    if (isIos())
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t('text.areYouSureToDeleteTracking'),
          options: [t('button.cancel'), t('button.delete')],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            deleteTracking(trackingID);
          }
        },
      );
    else {
      Alert.alert(
        '',
        t('text.areYouSureToDeleteTracking'),
        [
          {
            text: t('button.cancel'),
          },
          {
            text: t('button.delete'),
            onPress: () => deleteTracking(trackingID),
            style: 'destructive',
          },
        ],
        {
          cancelable: false,
        },
      );
    }
  };

  deleteTracking = async trackingID => {
    let resp = await Api.deleteTracking(
      data?.user?.authenticationJWT,
      trackingID,
    );
    if (resp?.meta?.code === 200) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Home'}],
        }),
      );
      infoMessage(t('placeholder.appName'), t('text.deleteTracking'));
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: setting.appColor}}>
      <IOSHeader
        title={setting.isLanguageTH ? courierData.nameTH : courierData.nameEN}
        titleColor={courierData?.color}
        subtitle={note ? `(${note}) ${trackingNumber}` : trackingNumber}
        canGoBack={true}
        onPressBack={() => {
          params.onBack(tracking);
          navigation.goBack();
        }}
      />

      <View
        style={{
          flex: 1,
          backgroundColor: setting.appColor,
          padding: isIpad() ? 80 : 0,
        }}>
        <View style={{flex: 1}}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                flex: 0.4,
                alignSelf: 'center',
                justifyContent: 'center',
                paddingTop: 10,
              }}>
              <QRCode
                value={trackingNumber}
                logo={{uri: `${HOST_BACKUP}/ic-web.png`}}
                logoSize={40}
                size={220}
                quietZone={10}
                logoBorderRadius={15}
                logoBackgroundColor={'transparent'}
              />
            </View>

            <View
              style={{
                flex: 1,
                paddingTop: 20,
                marginBottom:
                  isLogin(data?.user) && data?.user?.isPremium ? 0 : 40,
              }}>
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
                  fontSize: fontSize(21),
                  alignSelf: 'flex-start',
                  paddingTop: hp(0.5),
                  paddingLeft: hp(1),
                }}>
                {t('text.info')}
              </Text>

              <Ripple
                rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                onPress={() => copyToClipboard(trackingNumber)}>
                <ListItem
                  containerStyle={{
                    backgroundColor: setting.cardColor,
                  }}
                  title={trackingNumber}
                  titleStyle={{
                    fontFamily: 'Kanit-Light',
                    color: setting.textColor,
                  }}
                  rightIcon={
                    <MatIcon
                      name={'content-copy'}
                      style={styles.iconShare}
                      color={setting.textColor}
                    />
                  }
                />
              </Ripple>

              <Ripple
                rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                onPress={() => params.onShare()}>
                <ListItem
                  containerStyle={{
                    backgroundColor: setting.cardColor,
                  }}
                  title={t('button.share')}
                  titleStyle={{
                    fontFamily: 'Kanit-Light',
                    color: setting.textColor,
                  }}
                  rightIcon={
                    <Icon
                      name={'ios-share-outline'}
                      style={styles.iconShare}
                      color={setting.textColor}
                    />
                  }
                />
              </Ripple>

              <Ripple
                rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                onPress={() => dialogDeleteTracking(tracking.id)}>
                <ListItem
                  containerStyle={{
                    backgroundColor: setting.cardColor,
                  }}
                  title={t('button.delete')}
                  titleStyle={{
                    fontFamily: 'Kanit-Light',
                    color: setting.textColor,
                  }}
                  rightIcon={
                    <Icon
                      name={'trash-outline'}
                      style={styles.iconShare}
                      color={'#FF0055'}
                    />
                  }
                />
              </Ripple>
            </View>

            {isLogin(data?.user) && data?.user?.isPremium && (
              <View style={{flex: 1, paddingTop: 20, marginBottom: 40}}>
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
                    fontSize: fontSize(21),
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
                      value={tracking.isNotifyOnPickedUp}
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
                      value={tracking.isNotifyOnShipping}
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
                      value={tracking.isNotifyOnDelivered}
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
                      value={tracking.isNotifyOnUnableToSend}
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
                  }}
                  title={t('placeholder.notifyOnOtherStatus')}
                  titleStyle={{
                    fontFamily: 'Kanit-Light',
                    color: setting.textColor,
                  }}
                  rightIcon={
                    <Switch
                      value={tracking.isNotifyOnOtherStatus}
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
    </SafeAreaView>
  );
};
