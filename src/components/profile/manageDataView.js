/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useEffect, useState } from 'react';
import { Alert, ActionSheetIOS, View } from 'react-native';
import { Text } from 'react-native-paper';
import { setUserToStorage } from '../actions';
import Spinner from 'react-native-loading-spinner-overlay';
import { useDispatch, useSelector } from 'react-redux';
import * as Api from '../actions/api';
import { useTranslation } from 'react-i18next';
import { ListItem } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import Swipeout from 'react-native-swipeout';
import Ripple from 'react-native-material-ripple';
// import RNExitApp from 'react-native-exit-app';
import { CommonActions } from '@react-navigation/native';
import { HTTP_STATUSES } from '../actions/constants';

import IOSHeader from '../header/iosHeaderView';

export default ManageDataView = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    getUserData,
    successMessage,
    errorMessage,
    isIos,
    fontSize,
    hp,
    encryptedStorageClearStorage,
  } = require('../../helpers/globalFunction');
  const isInitialMount = useRef(true);
  const dispatch = useDispatch();
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const [spinner, setSpinner] = useState(false);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  });

  deleteData = async action => {
    let resp;
    if (action === 'track') {
      resp = await Api.deleteAllTrackHistories(data?.user?.authenticationJWT);
    } else if (action == 'notification') {
      resp = await Api.deleteAllNotifications(data?.user?.authenticationJWT);
    }

    if (resp?.meta?.code === 200) {
      successMessage('ETrackings', t('message.delete'));
    } else {
      errorMessage('ETrackings', t('message.error'));
    }
  };

  dialogDelete = action => {
    if (isIos())
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t('text.areYouSureToDeleteData'),
          options: [t('button.cancel'), t('button.delete')],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            deleteData(action);
          }
        },
      );
    else {
      Alert.alert(
        '',
        t('text.areYouSureToDeleteData'),
        [
          {
            text: t('button.cancel'),
          },
          {
            text: t('button.delete'),
            onPress: () => deleteData(action),
            style: 'destructive',
          },
        ],
        {
          cancelable: false,
        },
      );
    }
  };

  swipeoutBtns = onAction => {
    return [
      {
        backgroundColor: '#FC2045',
        text: t('button.delete'),
        onPress: onAction,
      },
    ];
  };

  renderParcelMenu = () => {
    return (
      <>
        <Swipeout
          autoClose
          right={swipeoutBtns(() => dialogDelete('track'))}
          backgroundColor={setting.appColor}
          style={{
            alignContent: 'center',
            textAlign: 'center',
          }}
        >
          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            onPress={() => dialogDelete('track')}
          >
            <ListItem
              rightIcon
              containerStyle={{
                backgroundColor: setting.cardColor,
              }}
              title={t('text.trackData')}
              titleStyle={{
                fontFamily: 'Kanit-Light',
                color: setting.textColor,
              }}
            />
          </Ripple>
        </Swipeout>

        <Swipeout
          autoClose
          right={swipeoutBtns(() => dialogDelete('notification'))}
          backgroundColor={setting.appColor}
          style={{
            alignContent: 'center',
            textAlign: 'center',
          }}
        >
          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            onPress={() => dialogDelete('notification')}
          >
            <ListItem
              rightIcon
              containerStyle={{
                backgroundColor: setting.cardColor,
              }}
              title={t('text.notificationData')}
              titleStyle={{
                fontFamily: 'Kanit-Light',
                color: setting.textColor,
              }}
            />
          </Ripple>
        </Swipeout>
      </>
    );
  };

  renderAppMenu = () => {
    return (
      <>
        <Swipeout
          autoClose
          right={swipeoutBtns(() => dialogDeleteAllAppSetting())}
          backgroundColor={setting.appColor}
          style={{
            alignContent: 'center',
            textAlign: 'center',
          }}
        >
          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            onPress={() => dialogDeleteAllAppSetting()}
          >
            <ListItem
              rightIcon
              containerStyle={{
                backgroundColor: setting.cardColor,
              }}
              title={t('text.allAppSetting')}
              titleStyle={{
                fontFamily: 'Kanit-Light',
                color: setting.textColor,
              }}
            />
          </Ripple>
        </Swipeout>
      </>
    );
  };

  dialogDeleteAllAppSetting = () => {
    if (isIos())
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t('placeholder.pleaseConfirm'),
          message: t('text.deleteAllAppSetting'),
          options: [t('button.cancel'), t('button.ok')],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        async buttonIndex => {
          if (buttonIndex === 1) {
            await removeAllAppData();
          }
        },
      );
    else {
      Alert.alert(
        t('placeholder.pleaseConfirm'),
        t('text.deleteAllAppSetting'),
        [
          {
            text: t('button.cancel'),
          },
          {
            text: t('button.ok'),
            onPress: async () => {
              await removeAllAppData();
            },
            style: 'destructive',
          },
        ],
        {
          cancelable: false,
        },
      );
    }
  };

  removeAllAppData = async () => {
    await encryptedStorageClearStorage();
    // RNExitApp.exitApp();
  };

  renderAccountMenu = () => {
    return (
      <>
        <Swipeout
          autoClose
          right={swipeoutBtns(() => dialogDeletePhoneNumber())}
          backgroundColor={setting.appColor}
          style={{
            alignContent: 'center',
            textAlign: 'center',
          }}
        >
          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            onPress={() => dialogDeletePhoneNumber()}
          >
            <ListItem
              rightIcon
              containerStyle={{
                backgroundColor: setting.cardColor,
              }}
              title={t('text.removePhoneNumber')}
              titleStyle={{
                fontFamily: 'Kanit-Light',
                color: setting.textColor,
              }}
            />
          </Ripple>
        </Swipeout>

        <Swipeout
          autoClose
          right={swipeoutBtns(() => dialogDeleteProfile())}
          backgroundColor={setting.appColor}
          style={{
            alignContent: 'center',
            textAlign: 'center',
          }}
        >
          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            onPress={() => dialogDeleteProfile()}
          >
            <ListItem
              rightIcon
              containerStyle={{
                backgroundColor: setting.cardColor,
              }}
              title={t('text.removeImageProfile')}
              titleStyle={{
                fontFamily: 'Kanit-Light',
                color: setting.textColor,
              }}
            />
          </Ripple>
        </Swipeout>

        <Swipeout
          autoClose
          right={swipeoutBtns(() => dialogDeleteAccount())}
          backgroundColor={setting.appColor}
          style={{
            alignContent: 'center',
            textAlign: 'center',
          }}
        >
          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            onPress={() => dialogDeleteAccount()}
          >
            <ListItem
              rightIcon
              containerStyle={{
                backgroundColor: setting.cardColor,
              }}
              title={t('text.removeAccount')}
              titleStyle={{
                fontFamily: 'Kanit-Light',
                color: setting.textColor,
              }}
            />
          </Ripple>
        </Swipeout>
      </>
    );
  };

  dialogDeletePhoneNumber = () => {
    if (isIos())
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t('placeholder.pleaseConfirm'),
          message: t('text.removePhoneNumberFromAccount'),
          options: [t('button.cancel'), t('button.ok')],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        async buttonIndex => {
          if (buttonIndex === 1) {
            await onDeletePhoneNumber();
          }
        },
      );
    else {
      Alert.alert(
        t('placeholder.pleaseConfirm'),
        t('text.removePhoneNumberFromAccount'),
        [
          {
            text: t('button.cancel'),
          },
          {
            text: t('button.ok'),
            onPress: async () => {
              await onDeletePhoneNumber();
            },
            style: 'destructive',
          },
        ],
        {
          cancelable: false,
        },
      );
    }
  };

  onDeletePhoneNumber = async () => {
    let resp = await Api.updateUser(data?.user?.authenticationJWT, {
      phoneNumber: '',
    });
    if (resp?.meta?.code === 200) {
      successMessage('ETrackings', t('message.delete'));
      dispatch(setUserToStorage(resp.data));
    } else {
      errorMessage('ETrackings', t('message.error'));
    }
  };

  dialogDeleteProfile = () => {
    if (isIos())
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t('placeholder.pleaseConfirm'),
          message: t('text.removeImageProfile'),
          options: [t('button.cancel'), t('button.ok')],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        async buttonIndex => {
          if (buttonIndex === 1) {
            await onDeleteImageProfile();
          }
        },
      );
    else {
      Alert.alert(
        t('placeholder.pleaseConfirm'),
        t('text.removeImageProfile'),
        [
          {
            text: t('button.cancel'),
          },
          {
            text: t('button.ok'),
            onPress: async () => {
              await onDeleteImageProfile();
            },
            style: 'destructive',
          },
        ],
        {
          cancelable: false,
        },
      );
    }
  };

  onDeleteImageProfile = async () => {
    let resp = await Api.updateUser(data?.user?.authenticationJWT, {
      imageURL: null,
    });
    if (resp?.meta?.code === 200) {
      successMessage('ETrackings', t('message.delete'));
      dispatch(setUserToStorage(resp.data));
    } else {
      errorMessage('ETrackings', t('message.error'));
    }
  };

  dialogDeleteAccount = () => {
    if (isIos())
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t('placeholder.pleaseConfirm'),
          message: t('text.removeAccountPermanently'),
          options: [t('button.cancel'), t('button.ok')],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        async buttonIndex => {
          if (buttonIndex === 1) {
            await deletedUser();
          }
        },
      );
    else {
      Alert.alert(
        t('placeholder.pleaseConfirm'),
        t('text.removeAccountPermanently'),
        [
          {
            text: t('button.cancel'),
          },
          {
            text: t('button.ok'),
            onPress: async () => {
              await deletedUser();
            },
            style: 'destructive',
          },
        ],
        {
          cancelable: false,
        },
      );
    }
  };

  deletedUser = async () => {
    try {
      setSpinner(true);
      let userData = await getUserData();

      if (userData) {
        Api.deletedUser(userData?.authenticationJWT).then(async resp => {
          setSpinner(false);
          if (!HTTP_STATUSES.includes(resp.status) && !resp?.meta) {
            errorMessage('ETrackings', t('message.canNotDeleteData'));
            return;
          }
          if (resp?.meta?.code === 200) {
            successMessage(
              'ETrackings',
              t('message.removeDataAndAccountSuccess'),
            );

            await encryptedStorageClearStorage();
            dispatch(setUserToStorage(null));

            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Guest' }],
              }),
            );
          }
        });
      } else {
        successMessage('ETrackings', t('message.removeDataSuccess'));
        // No Login
        await encryptedStorageClearStorage();

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Guest' }],
          }),
        );
      }
    } catch (error) {
      console.log('Error => ', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: setting.appColor }}>
      <Spinner
        visible={spinner}
        textContent={t('text.loading')}
        textStyle={{ color: '#FFF', fontFamily: 'Kanit-Light' }}
      />
      <IOSHeader
        title={t('placeholder.setting')}
        subtitle={t('text.manageData')}
        canGoBack={true}
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: setting.appColor,
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              backgroundColor: setting.appColor,
              height: '100%',
              borderRadius: 15,
            }}
          >
            <View style={{ flex: 1 }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text
                  theme={{
                    dark: setting.isDarkMode,
                    colors: { text: setting.textColor },
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
                  }}
                >
                  {t('placeholder.parcel')}
                </Text>
                <View style={{ paddingTop: 10 }}>{renderParcelMenu()}</View>

                <Text
                  theme={{
                    dark: setting.isDarkMode,
                    colors: { text: setting.textColor },
                  }}
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={{
                    paddingBottom: 10,
                    fontFamily: 'Kanit-Light',
                    fontSize: fontSize(22),
                    alignSelf: 'flex-start',
                    paddingTop: hp(1.5),
                    paddingLeft: hp(1),
                  }}
                >
                  {t('placeholder.app')}
                </Text>
                <View style={{ paddingTop: 10 }}>{renderAppMenu()}</View>

                <Text
                  theme={{
                    dark: setting.isDarkMode,
                    colors: { text: setting.textColor },
                  }}
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={{
                    paddingBottom: 10,
                    fontFamily: 'Kanit-Light',
                    fontSize: fontSize(22),
                    alignSelf: 'flex-start',
                    paddingTop: hp(1.5),
                    paddingLeft: hp(1),
                  }}
                >
                  {t('placeholder.account')}
                </Text>
                <View style={{ paddingTop: 10 }}>{renderAccountMenu()}</View>
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
