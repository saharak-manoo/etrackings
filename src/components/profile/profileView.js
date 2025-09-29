/* eslint-disable react-native/no-inline-styles */
import React, { createRef, useEffect, useState } from 'react';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import MobileAds from 'react-native-google-mobile-ads';
import { SheetManager } from 'react-native-actions-sheet';
import i18next from 'i18next';
import Config from 'react-native-config';
import { Alert, ActionSheetIOS, View, Linking } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import { default as sheet } from 'react-native-action-sheet';
import { useDispatch, useSelector } from 'react-redux';
import RNLanguageDetector from '@os-team/i18next-react-native-language-detector';
import {
  setDarkMode,
  setLanguage,
  setUserToStorage,
  setCopiedText,
  setSelectColor,
  user,
} from '../actions';
import {
  appleAuth,
  appleAuthAndroid,
} from '@invertase/react-native-apple-authentication';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import * as Api from '../actions/api';
import { useTranslation } from 'react-i18next';
import { styles } from '../../helpers/styles';
import { Colors, Text, Switch } from 'react-native-paper';
import { ListItem } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import {
  etrackingsWebURL,
  etrackingsLineBotURL,
  etrackingsDeveloperURL,
  etrackingPlayStore,
  etrackingAppStore,
  etrackingsApiTrackingURL,
  etrackingsPageURL,
  etrackingsShopURL,
  etrackingsGetAppURL,
  etrackingsApiSendTrackingURL,
  etrackingsPrivacyPolicy,
  appleTermsOfUse,
  etrackingsTermsAndConditions,
} from '../../../app.json';
import Icon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import { getBuildNumber, getVersion } from 'react-native-device-info';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import FastImage from '@d11/react-native-fast-image';
import Spinner from 'react-native-loading-spinner-overlay';
import Ripple from 'react-native-material-ripple';
import { CommonActions } from '@react-navigation/native';

// View
import IOSHeader from '../header/iosHeaderView';
import ActionSheetPhoneNumberView from '../actionSheet/actionSheetPhoneNumberView';
import ActionSheetAccountTypeView from '../actionSheet/actionSheetAccountTypeView';

export default ProfileView = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    isLogin,
    successMessage,
    infoMessage,
    errorMessage,
    shareTracking,
    isIos,
    isIpad,
    isPresent,
    phoneNumberOnly,
    fontSize,
    hp,
    wp,
    sendEmail,
    encryptedStorageGetItem,
    encryptedStorageSetItem,
    encryptedStorageRemoveItem,
    decodeJWT,
    copyToClipboard,
    accountType,
    formatPhoneNumber,
    isDisplayAds,
  } = require('../../helpers/globalFunction');
  const dispatch = useDispatch();
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const actionSheetPhoneNumberRef = createRef();
  const actionSheetAccountTypeRef = createRef();
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [spinner, setSpinner] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_SIGN_IN_KEY,
      forceConsentPrompt: true,
    });
  });

  onChangeAppleSignin = async isAppleSignin => {
    setSpinner(true);
    try {
      if (isAppleSignin) {
        try {
          const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
          });

          const credentialState = await appleAuth.getCredentialStateForUser(
            appleAuthRequestResponse.user,
          );

          if (credentialState === appleAuth.State.AUTHORIZED) {
            if (appleAuthRequestResponse.identityToken) {
              const jwtData = decodeJWT(appleAuthRequestResponse.identityToken);

              let resp = await Api.linkSigninWith(
                data?.user?.authenticationJWT,
                isAppleSignin,
                {
                  provider: 'APPLE_ID',
                  imageURL: null,
                  appleUID: appleAuthRequestResponse?.user || jwtData?.sub,
                },
              );

              if (resp?.meta?.code === 200) {
                dispatch(setUserToStorage(resp.data));
              } else {
                errorMessage('ETrackings', t('text.alreadyLinked'));
              }
              setSpinner(false);
            }
          }
        } catch (err) {
          setSpinner(false);
          console.log('onChangeAppleSignin err -> ', err);
          errorMessage('ETrackings', t('message.error'));
        }
      } else {
        let resp = await Api.linkSigninWith(
          data?.user?.authenticationJWT,
          isAppleSignin,
          {
            provider: 'APPLE_ID',
            appleUID: '',
          },
        );
        if (resp?.meta?.code === 200) dispatch(setUserToStorage(resp.data));
        setSpinner(false);
      }
    } catch (err) {
      setSpinner(false);
      console.log('onChangeAppleSignin err -> ', err);
    }
  };

  onChangeAppleSigninAndroid = async isAppleSignin => {
    try {
      if (isAppleSignin) {
        try {
          const rawNonce = uuid();
          const state = uuid();

          appleAuthAndroid.configure({
            clientId: Config.APPLE_ID_CLIENT_ID_ANDROID,
            redirectUri: Config.APPLE_ID_CALLBACK_URL,
            responseType: appleAuthAndroid.ResponseType.ALL,
            scope: appleAuthAndroid.Scope.ALL,
            nonce: rawNonce,
            state,
          });

          const response = await appleAuthAndroid.signIn();

          if (response.id_token) {
            const jwtData = decodeJWT(response.id_token);

            let resp = await Api.linkSigninWith(
              data?.user?.authenticationJWT,
              isAppleSignin,
              {
                provider: 'APPLE_ID',
                imageURL: null,
                appleUID: jwtData.sub || null,
              },
            );

            if (resp?.meta?.code === 200) {
              dispatch(setUserToStorage(resp.data));
            } else {
              errorMessage('ETrackings', t('text.alreadyLinked'));
            }
            setSpinner(false);
          }
        } catch (err) {
          setSpinner(false);
          console.log('onChangeAppleSignin Android err -> ', err);
          errorMessage('ETrackings', t('message.error'));
        }
      } else {
        let resp = await Api.linkSigninWith(
          data?.user?.authenticationJWT,
          isAppleSignin,
          {
            provider: 'APPLE_ID',
            appleUID: '',
          },
        );
        if (resp?.meta?.code === 200) dispatch(setUserToStorage(resp.data));
        setSpinner(false);
      }
    } catch (err) {
      setSpinner(false);
      console.log('onChangeAppleSignin Android err -> ', err);
    }
  };

  onChangeGoogleSignin = async isGoogleSignin => {
    setSpinner(true);
    try {
      if (isGoogleSignin) {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        if (isSuccessResponse(response)) {
          let resp = await Api.linkSigninWith(
            data?.user?.authenticationJWT,
            isGoogleSignin,
            {
              provider: 'GOOGLE',
              imageURL: response?.data?.user?.photo || null,
              googleUID: response?.data?.user?.id || null,
            },
          );

          if (resp?.meta?.code === 200) {
            dispatch(setUserToStorage(resp.data));
          } else {
            errorMessage('ETrackings', t('text.alreadyLinked'));
          }
        }
        setSpinner(false);
      } else {
        let resp = await Api.linkSigninWith(
          data?.user?.authenticationJWT,
          isGoogleSignin,
          {
            provider: 'GOOGLE',
            googleUID: '',
          },
        );
        if (resp?.meta?.code === 200) dispatch(setUserToStorage(resp.data));
        setSpinner(false);
      }
    } catch {
      setSpinner(false);
      console.log('onChangeGoogleSignin err -> ', error);
    }
  };

  onChangeNotifyWebAndApp = async isNotifyWebAndApp => {
    let resp = await Api.changeNotifyWebAndApp(
      data?.user?.authenticationJWT,
      isNotifyWebAndApp,
    );
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

  onChangeToDarkMode = async isDarkMode => {
    await encryptedStorageSetItem('isDarkMode', JSON.stringify(isDarkMode));
    await dispatch(setDarkMode(isDarkMode));
  };

  onChangeLanguage = async () => {
    sheet.showActionSheetWithOptions(
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

  onChangeAutoCopiedText = async isAutoCopiedText => {
    await encryptedStorageSetItem(
      'isAutoCopiedText',
      JSON.stringify(isAutoCopiedText),
    );
    await dispatch(setCopiedText(isAutoCopiedText));
  };

  onChangeSelectColor = async isSelectColor => {
    await encryptedStorageSetItem(
      'isSelectColor',
      JSON.stringify(isSelectColor),
    );
    await dispatch(setSelectColor(isSelectColor));
  };

  openLink = async url => Linking.openURL(url);

  shareLinkAction = () => {
    return (
      <>
        <Ripple
          rippleDuration={setting?.animation == 'normal' ? 600 : 450}
          onPress={() =>
            copyToClipboard(
              `${t('text.linkToGetAppETrackings')}\n${etrackingsGetAppURL}`,
            )
          }
        >
          <ListItem
            containerStyle={{
              backgroundColor: setting.cardColor,
            }}
            title={t('text.linkToGetApp')}
            titleStyle={{
              fontFamily: 'Kanit-Light',
              color: setting.textColor,
            }}
            rightIcon={
              <MatIcon
                name={'content-copy'}
                color={setting.textColor}
                style={styles.openLinkIcon}
              />
            }
          />
        </Ripple>

        <Ripple
          rippleDuration={setting?.animation == 'normal' ? 600 : 450}
          onPress={() =>
            shareTracking(
              t('text.linkToGetAppETrackings'),
              `${t('text.linkToGetAppETrackings')}\n${etrackingsGetAppURL}`,
            )
          }
        >
          <ListItem
            containerStyle={{
              backgroundColor: setting.cardColor,
            }}
            title={t('text.shareApp')}
            titleStyle={{
              fontFamily: 'Kanit-Light',
              color: setting.textColor,
            }}
            rightIcon={
              <MatIcon
                name={'share'}
                color={setting.textColor}
                style={styles.openLinkIcon}
              />
            }
          />
        </Ripple>
      </>
    );
  };

  dialogSignOut = () => {
    if (isIos())
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t('text.areYouSureToSignOut'),
          options: [t('button.cancel'), t('button.signOut')],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            signOut();
          }
        },
      );
    else {
      Alert.alert(
        '',
        t('text.areYouSureToSignOut'),
        [
          {
            text: t('button.cancel'),
          },
          {
            text: t('button.signOut'),
            onPress: () => signOut(),
            style: 'destructive',
          },
        ],
        {
          cancelable: false,
        },
      );
    }
  };

  signOut = async () => {
    setSpinner(true);
    await Api.signOut(data?.user?.authenticationJWT);
    encryptedStorageRemoveItem('user').then(() => {
      dispatch(user(null));
      successMessage(t('message.success'), t('message.signOutSuccessful'));

      setSpinner(false);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Guest' }],
        }),
      );
    });
  };

  updateName = async name => {
    setLoadingUpdate(true);
    let resp = await Api.updateUser(data?.user?.authenticationJWT, {
      name: name,
    });

    if (resp?.meta?.code === 200) {
      infoMessage('ETrackings', t('text.updateName'));
      dispatch(setUserToStorage(resp.data));
      setLoadingUpdate(false);
    } else {
      errorMessage('ETrackings', t('message.somethingWentWrong'));
      setLoadingUpdate(false);
    }
  };

  updatePhoneNumber = async (modalCurrent, phoneNumber) => {
    setLoadingUpdate(true);
    let resp = await Api.checkPhoneNumber(data?.user?.authenticationJWT, {
      phoneNumber: formatPhoneNumber(phoneNumber),
    });
    if (resp?.data) {
      let respData = await Api.updateUser(data?.user?.authenticationJWT, {
        phoneNumber: formatPhoneNumber(phoneNumber),
      });

      if (respData?.meta?.code === 200) {
        infoMessage('ETrackings', t('text.savePhoneNumber'));
        dispatch(setUserToStorage(respData.data));
        setLoadingUpdate(false);
        modalCurrent.setModalVisible(false);
      } else {
        errorMessage('ETrackings', t('message.somethingWentWrong'));
        setLoadingUpdate(false);
      }
    } else {
      errorMessage('ETrackings', t('message.phoneNumberHasBeTaken'));
      setLoadingUpdate(false);
    }
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

  renderLink = (title, icon, iconColor, link) => {
    return (
      <Ripple
        rippleDuration={setting?.animation == 'normal' ? 600 : 450}
        onPress={() => openLink(link)}
      >
        <ListItem
          containerStyle={{
            backgroundColor: setting.cardColor,
          }}
          title={t(title)}
          titleStyle={{
            fontFamily: 'Kanit-Light',
            color: setting.textColor,
          }}
          rightIcon={
            <MatIcon
              name={icon}
              style={styles.openLinkIcon}
              color={iconColor}
            />
          }
        />
      </Ripple>
    );
  };

  renderPackage = () => {
    return (
      <>
        <Ripple
          rippleDuration={setting?.animation == 'normal' ? 600 : 300}
          onPress={() => navigation.navigate('Package')}
        >
          <ListItem
            containerStyle={{
              backgroundColor: setting.cardColor,
            }}
            leftIcon={
              <Icon
                name={'pricetags-outline'}
                size={24}
                color={setting.textColor}
              />
            }
            title={t('text.package')}
            titleStyle={{
              fontFamily: 'Kanit-Light',
              color: setting.textColor,
            }}
            rightIcon
          />
        </Ripple>
      </>
    );
  };

  goToTermsAndConditionsDetail = async () => {
    let isMarketingActivities = JSON.parse(
      await encryptedStorageGetItem('isConsentToMarketingActivities'),
    );
    if (isMarketingActivities == null) {
      isMarketingActivities = false;
    }

    let isVerifyYourIdentity = JSON.parse(
      await encryptedStorageGetItem('isConsentToVerifyYourIdentity'),
    );
    if (isVerifyYourIdentity == null) {
      isVerifyYourIdentity = false;
    }

    navigation.navigate('TermsAndConditionsDetail', {
      isAgree: true,
      isMarketingActivities: isMarketingActivities,
      isVerifyYourIdentity: isVerifyYourIdentity,
    });
  };

  checkIsPayment = async () => {
    setSpinner(true);
    let resp = await Api.profile(data?.user?.authenticationJWT);
    if (resp?.meta?.code === 200) {
      successMessage(t('message.success'), t('message.checkIsPayment'));
      dispatch(setUserToStorage(resp.data));
    } else {
      errorMessage('ETrackings', t('message.error'));
    }

    setSpinner(false);
  };

  openAdInspector = async () => {
    try {
      await MobileAds().openAdInspector();
      // The promise will resolve when the inspector is closed.
    } catch (error) {
      // The promise will reject if ad inspector is closed due to an error.
      console.log(error);
    }
  };

  sendEmailToDev = () => {
    message = `
      เรื่อง ปัญหาที่พบ / คำถาม / ข้อเสนอแนะ :
      รายละเอียด :

      ระบบปฏิบัติการ OS : ${Platform.OS}
      เวอร์ชั่น : ${getVersion()}
      หมายเลข Build : ${getBuildNumber()}

      ** หมายเหตุ แนบรูปประกอบเพิ่มเติม (ถ้ามี)
    `;

    sendEmail('saharakmanoo@gmail.com', 'Hi, Developer ETrackings', message);
  };

  return (
    <View style={{ flex: 1, backgroundColor: setting.appColor }}>
      <IOSHeader
        title={
          isLogin(data?.user) ? data?.user?.name : t('placeholder.setting')
        }
        subtitle={isLogin(data?.user) && t('placeholder.profile')}
        canGoBack={true}
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      <Spinner
        visible={spinner}
        textContent={t('text.loading')}
        textStyle={{ color: '#FFF', fontFamily: 'Kanit-Light' }}
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
                {!isLogin(data?.user) && (
                  <View style={{ paddingTop: 20 }}>
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
                      {t('placeholder.notSignin')}
                    </Text>

                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 300
                      }
                      onPress={() => {
                        navigation.goBack();
                        navigation.navigate('Auth');
                      }}
                    >
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        title={t('button.signIn')}
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon
                      />
                    </Ripple>

                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      onPress={() => onChangeLanguage()}
                    >
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
                              colors: { text: setting.textColor },
                            }}
                          >
                            {t(
                              `placeholder.${
                                setting.isLanguageTH ? 'th' : 'en'
                              }`,
                            )}
                          </Text>
                        }
                      />
                    </Ripple>

                    <>
                      <Ripple
                        rippleDuration={
                          setting?.animation == 'normal' ? 600 : 300
                        }
                        onPress={() =>
                          actionSheetAccountTypeRef?.current?.setModalVisible(
                            true,
                          )
                        }
                      >
                        <ListItem
                          containerStyle={{
                            backgroundColor: setting.cardColor,
                          }}
                          title={t('text.accountType')}
                          titleStyle={{
                            fontFamily: 'Kanit-Light',
                            color: setting.textColor,
                          }}
                          rightIcon={
                            <Text
                              style={{
                                fontFamily: 'Kanit-Light',
                                color: setting.textColor,
                              }}
                            >
                              {accountType(data?.guest || data?.user)}
                            </Text>
                          }
                        />
                      </Ripple>
                    </>

                    {shareLinkAction()}

                    <Text
                      theme={{
                        dark: setting.isDarkMode,
                        colors: { text: setting.textColor },
                      }}
                      allowFontScaling={false}
                      style={{
                        padding: 10,
                        paddingBottom: 10,
                        fontFamily: 'Kanit-Light',
                        fontSize: fontSize(12),
                        alignSelf: 'flex-start',
                        paddingTop: hp(0.5),
                        paddingLeft: hp(1),
                      }}
                    >
                      {t('text.signIn')}
                    </Text>
                  </View>
                )}

                {isLogin(data?.user) && (
                  <View style={{ padding: 20 }}>
                    <FastImage
                      style={styles.profilePhoto}
                      size={isIpad() ? wp(18) : wp(35)}
                      source={{
                        uri:
                          data?.user?.imageURL ||
                          `https://ui-avatars.com/api/?name=${data?.user?.name}&size=350`,
                        priority: FastImage.priority.normal,
                      }}
                    />
                  </View>
                )}

                {isLogin(data?.user) && (
                  <View style={{ paddingTop: 20 }}>
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
                      {t('placeholder.information')}
                    </Text>
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 300
                      }
                      onPress={() => {
                        if (isLogin(data?.user)) {
                          SheetManager.show('InputView', {
                            payload: {
                              sheetName: 'InputView',
                              navigation: navigation,
                              isLoading: loadingUpdate,
                              word: data?.user?.name,
                              isRequired: true,
                              title: t(`placeholder.name`),
                              inputPlaceholder: t(`placeholder.enterName`),
                              inputLabel: t(`placeholder.name`),
                              onSubmit: text => updateName(text),
                            },
                          });
                        }
                      }}
                    >
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        leftIcon={
                          <Icon
                            name={'people-outline'}
                            size={24}
                            color={setting.textColor}
                          />
                        }
                        title={data?.user?.name}
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon={
                          <Icon
                            name={'create-outline'}
                            style={styles.openLinkIcon}
                            color={'#F5C70D'}
                          />
                        }
                      />
                    </Ripple>
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 300
                      }
                      onPress={() => copyToClipboard(data?.user?.email)}
                    >
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        leftIcon={
                          <Icon
                            name={'mail-outline'}
                            size={24}
                            color={setting.textColor}
                          />
                        }
                        title={data?.user?.email}
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon={
                          <MatIcon
                            name={'content-copy'}
                            color={'#F5C70D'}
                            style={styles.openLinkIcon}
                          />
                        }
                      />
                    </Ripple>

                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 300
                      }
                      onPress={() =>
                        actionSheetPhoneNumberRef.current?.setModalVisible(true)
                      }
                    >
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        leftIcon={
                          <Icon
                            name={'call-outline'}
                            size={24}
                            color={setting.textColor}
                          />
                        }
                        title={
                          data?.user?.phoneNumber || t('text.noPhoneNumber')
                        }
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon={
                          <Icon
                            name={'create-outline'}
                            style={styles.openLinkIcon}
                            color={'#F5C70D'}
                          />
                        }
                      />
                    </Ripple>
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 300
                      }
                      onPress={() => navigation.navigate('ManageDevice')}
                    >
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        leftIcon={
                          <Icon
                            name={'phone-portrait-outline'}
                            size={24}
                            color={setting.textColor}
                          />
                        }
                        title={t('text.manageDevices')}
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon
                      />
                    </Ripple>
                    {isDisplayAds(data) && renderPackage()}
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 300
                      }
                      onPress={() =>
                        actionSheetAccountTypeRef?.current?.setModalVisible(
                          true,
                        )
                      }
                    >
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        title={t('text.accountType')}
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon={
                          <Text
                            style={{
                              fontFamily: 'Kanit-Light',
                              color: setting.textColor,
                            }}
                          >
                            {accountType(data?.guest || data?.user)}
                          </Text>
                        }
                      />
                    </Ripple>
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      onPress={() => onChangeLanguage()}
                    >
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
                              colors: { text: setting.textColor },
                            }}
                          >
                            {t(
                              `placeholder.${
                                setting.isLanguageTH ? 'th' : 'en'
                              }`,
                            )}
                          </Text>
                        }
                      />
                    </Ripple>
                    {appleAuth.isSupported &&
                      JSON.parse(Config.IS_LOGIN_WITH_APPLE_ID) && (
                        <ListItem
                          containerStyle={{
                            backgroundColor: setting.cardColor,
                          }}
                          leftIcon={
                            <FAIcon
                              name={'apple'}
                              size={24}
                              color={setting.textColor}
                            />
                          }
                          title={`${t('text.signInWith')} Apple`}
                          titleStyle={{
                            fontFamily: 'Kanit-Light',
                            color: setting.textColor,
                          }}
                          rightIcon={
                            <Switch
                              value={isPresent(data?.user?.appleUID)}
                              onValueChange={isAppleSignin =>
                                onChangeAppleSignin(isAppleSignin)
                              }
                            />
                          }
                        />
                      )}
                    {appleAuthAndroid.isSupported &&
                      JSON.parse(Config.IS_LOGIN_WITH_APPLE_ID) && (
                        <ListItem
                          containerStyle={{
                            backgroundColor: setting.cardColor,
                          }}
                          leftIcon={
                            <FAIcon
                              name={'apple'}
                              size={24}
                              color={setting.textColor}
                            />
                          }
                          title={`${t('text.signInWith')} Apple`}
                          titleStyle={{
                            fontFamily: 'Kanit-Light',
                            color: setting.textColor,
                          }}
                          rightIcon={
                            <Switch
                              value={isPresent(data?.user?.appleUID)}
                              onValueChange={isAppleSignin =>
                                onChangeAppleSigninAndroid(isAppleSignin)
                              }
                            />
                          }
                        />
                      )}
                    {JSON.parse(Config.IS_LOGIN_WITH_FACEBOOK) && (
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        leftIcon={
                          <FAIcon
                            name={'facebook'}
                            size={24}
                            color={
                              isPresent(data?.user?.facebookUID)
                                ? '#298EFF'
                                : setting.textColor
                            }
                          />
                        }
                        title={`${t('text.signInWith')} Facebook`}
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon={
                          <Switch
                            value={isPresent(data?.user?.facebookUID)}
                            // onValueChange={isFacebookSignin =>
                            //   onChangeFacebookSignin(isFacebookSignin)
                            // }
                          />
                        }
                      />
                    )}
                    {JSON.parse(Config.IS_LOGIN_WITH_GOOGLE) && (
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        leftIcon={
                          <FAIcon
                            name={'google'}
                            size={24}
                            color={
                              isPresent(data?.user?.googleUID)
                                ? '#FC2045'
                                : setting.textColor
                            }
                          />
                        }
                        title={`${t('text.signInWith')} Google`}
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon={
                          <Switch
                            value={isPresent(data?.user?.googleUID)}
                            onValueChange={isGoogleSignin =>
                              onChangeGoogleSignin(isGoogleSignin)
                            }
                          />
                        }
                      />
                    )}
                    {shareLinkAction()}
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 300
                      }
                      onPress={() => dialogSignOut()}
                    >
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        title={t('button.signOut')}
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon={
                          <Icon
                            name={'log-out'}
                            style={styles.openLinkIcon}
                            color={'#FF0055'}
                          />
                        }
                      />
                    </Ripple>
                  </View>
                )}

                <View style={{ paddingTop: 20 }}>
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
                    {t('placeholder.setting')}
                  </Text>

                  {isLogin(data?.user) && (
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 300
                      }
                      onPress={() => navigation.navigate('SettingNotification')}
                    >
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        title={t('placeholder.notification')}
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon
                      />
                    </Ripple>
                  )}

                  <Ripple
                    rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                    onPress={() => navigation.navigate('SettingApp')}
                  >
                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('placeholder.app')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon
                      onPress={() => navigation.navigate('SettingApp')}
                    />
                  </Ripple>

                  <Ripple
                    rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                    onPress={() => goToTermsAndConditionsDetail()}
                  >
                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('text.personalInformation')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon
                      onPress={() => goToTermsAndConditionsDetail()}
                    />
                  </Ripple>

                  {__DEV__ && (
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      onPress={() => openAdInspector()}
                    >
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        title={'Open Ad Inspector'}
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon
                        onPress={() => openAdInspector()}
                      />
                    </Ripple>
                  )}

                  {isLogin(data?.user) && (
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      onPress={() => navigation.navigate('ManageData')}
                    >
                      <ListItem
                        containerStyle={{
                          backgroundColor: setting.cardColor,
                        }}
                        title={t('placeholder.manageData')}
                        titleStyle={{
                          fontFamily: 'Kanit-Light',
                          color: setting.textColor,
                        }}
                        rightIcon
                        onPress={() => navigation.navigate('ManageData')}
                      />
                    </Ripple>
                  )}
                </View>

                <View style={{ paddingTop: 20 }}>
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
                    {t('placeholder.services')}
                  </Text>

                  {renderLink(
                    'text.page',
                    'launch',
                    Colors.teal400,
                    etrackingsPageURL,
                  )}

                  {renderLink(
                    'text.forShop',
                    'launch',
                    Colors.teal400,
                    etrackingsShopURL,
                  )}

                  {renderLink(
                    'text.web',
                    'launch',
                    Colors.teal400,
                    etrackingsWebURL,
                  )}

                  {renderLink(
                    'text.lineBot',
                    'launch',
                    Colors.teal400,
                    etrackingsLineBotURL,
                  )}

                  {renderLink(
                    'text.developer',
                    'launch',
                    Colors.teal400,
                    etrackingsDeveloperURL,
                  )}

                  {renderLink(
                    'text.apiTracking',
                    'launch',
                    Colors.teal400,
                    etrackingsApiTrackingURL,
                  )}

                  {renderLink(
                    'text.apiSendTracking',
                    'launch',
                    Colors.teal400,
                    etrackingsApiSendTrackingURL,
                  )}

                  {renderLink(
                    'text.appleTermsOfUse',
                    'launch',
                    Colors.teal400,
                    appleTermsOfUse,
                  )}

                  {renderLink(
                    'text.privacyPolicy',
                    'launch',
                    Colors.teal400,
                    etrackingsPrivacyPolicy,
                  )}

                  {renderLink(
                    'text.termsAndConditions',
                    'launch',
                    Colors.teal400,
                    etrackingsTermsAndConditions,
                  )}

                  <Ripple
                    rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                    onPress={sendEmailToDev}
                  >
                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('text.contact')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <MatIcon
                          name={'mail'}
                          style={styles.openLinkIcon}
                          color={Colors.teal400}
                        />
                      }
                    />
                  </Ripple>

                  <Ripple
                    rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                    style={{ marginBottom: 45 }}
                    onPress={() =>
                      openLink(isIos() ? etrackingAppStore : etrackingPlayStore)
                    }
                  >
                    <ListItem
                      containerStyle={{
                        backgroundColor: setting.cardColor,
                      }}
                      title={t('text.reviewApp')}
                      titleStyle={{
                        fontFamily: 'Kanit-Light',
                        color: setting.textColor,
                      }}
                      rightIcon={
                        <Icon
                          name={
                            isIos()
                              ? 'logo-apple-appstore'
                              : 'logo-google-playstore'
                          }
                          style={styles.openLinkIcon}
                          color={Colors.teal400}
                        />
                      }
                    />
                  </Ripple>
                </View>
              </ScrollView>
            </View>
          </View>

          {isLogin(data?.user) && (
            <ActionSheet
              ref={actionSheetPhoneNumberRef}
              gestureEnabled
              bounceOnOpen
              containerStyle={{ backgroundColor: setting.cardColor }}
            >
              <ActionSheetPhoneNumberView
                ref={actionSheetPhoneNumberRef}
                isLoading={loadingUpdate}
                phoneNumber={phoneNumberOnly(data?.user?.phoneNumber)}
                isRequired={true}
                requiredText={'message.phoneNumberMustBeTen'}
                title={t(`placeholder.phoneNumber`)}
                inputPlaceholder={t(`placeholder.enterPhoneNumber`)}
                inputLabel={t(`placeholder.phoneNumber`)}
                onSubmit={text =>
                  updatePhoneNumber(actionSheetPhoneNumberRef.current, text)
                }
              />
            </ActionSheet>
          )}

          <ActionSheet
            ref={actionSheetAccountTypeRef}
            gestureEnabled
            bounceOnOpen
            containerStyle={{ backgroundColor: setting.cardColor }}
          >
            <ActionSheetAccountTypeView
              ref={actionSheetAccountTypeRef}
              isLoading={spinner}
              title={t('text.accountType')}
              subtitle={accountType(data?.guest || data?.user)}
              user={data?.guest || data?.user}
              onRestoreButton={async () => {
                await checkIsPayment();
              }}
              onPackageButton={async () => {
                await actionSheetAccountTypeRef?.current?.setModalVisible(
                  false,
                );
                navigation.navigate('Package');
              }}
            />
          </ActionSheet>
        </View>
      </View>
    </View>
  );
};
