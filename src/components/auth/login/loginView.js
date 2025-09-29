import React, {useState, useEffect} from 'react';
import Config from 'react-native-config';
import {
  View,
  KeyboardAvoidingView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {
  appleAuth,
  appleAuthAndroid,
} from '@invertase/react-native-apple-authentication';
import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';
import {Text, HelperText, TextInput} from 'react-native-paper';
import AnimateLoadingButton from 'react-native-animate-loading-button';
import * as Animatable from 'react-native-animatable';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import Spinner from 'react-native-loading-spinner-overlay';
import {Icon} from 'react-native-elements';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';
// import {
//   AccessToken,
//   GraphRequest,
//   GraphRequestManager,
//   LoginManager,
// } from 'react-native-fbsdk';
import Ripple from 'react-native-material-ripple';
import {styles} from '../../../helpers/styles';
import * as Api from '../../actions/api';
import {CommonActions} from '@react-navigation/native';

export default LoginView = ({navigation}) => {
  const {
    validateEmail,
    validatePasswordLessThanEight,
    successMessage,
    infoMessage,
    errorMessage,
    isIpad,
    isIos,
    width,
    fontSize,
    hp,
    encryptedStorageSetItem,
    decodeJWT,
  } = require('../../../helpers/globalFunction');
  // redux
  const {t} = useTranslation();
  const setting = useSelector(state => state.setting);
  const [loadingSignIn, setLoadingSignIn] = useState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [spinner, setSpinner] = useState(false);
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_SIGN_IN_KEY,
      forceConsentPrompt: true,
    });
  });

  async function validateSignIn() {
    loadingSignIn.showLoading(true);

    if (validateEmail(email) || email === '') {
      errorMessage(t('message.notValidate'), t('message.emailInvalid'));
      loadingSignIn.showLoading(false);
    } else if (validatePasswordLessThanEight(password) || password === '') {
      errorMessage(
        t('message.notValidate'),
        t('message.passwordLessThanEight'),
      );
      loadingSignIn.showLoading(false);
    } else {
      await signIn();
    }
  }

  async function signIn() {
    let params = {
      email: email,
      password: password,
    };

    let response = await Api.signIn(params);
    if (response?.meta?.code === 200) {
      loadingSignIn.showLoading(false);
      await encryptedStorageSetItem('user', JSON.stringify(response.data));

      successMessage(t('message.success'), t('message.signInSuccessful'));

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Home'}],
        }),
      );
    } else {
      response = await response.json();
      loadingSignIn.showLoading(false);
      errorMessage(
        t('message.notValidate'),
        t(`message.${response?.meta?.message}`),
      );
    }
  }

  signInWithAppleId = async () => {
    setSpinner(true);
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse?.user,
      );

      if (credentialState === appleAuth.State.AUTHORIZED) {
        if (appleAuthRequestResponse.identityToken) {
          const jwtData = decodeJWT(appleAuthRequestResponse.identityToken);

          let user = {
            email: appleAuthRequestResponse?.email || jwtData.Email,
            name:
              appleAuthRequestResponse?.fullName?.givenName ||
              'ETrackings Apple',
            appleUID: appleAuthRequestResponse?.user || jwtData.sub,
            provider: 'APPLE_ID',
            imageURL: null,
          };

          signInWith(user);
        }
      }
    } catch (err) {
      setSpinner(false);
    }
  };

  signInWithAppleIdAndroid = async () => {
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

        let fullName;
        if (response?.user) {
          if (response?.user?.name?.firstName) {
            fullName += response?.user?.name?.firstName;
          }
          if (response?.user?.name?.lastName) {
            fullName += ` ${response?.user?.name?.lastName}`;
          }
        }

        let user = {
          email: response?.user?.email || jwtData?.email,
          name: fullName || response?.user?.email || jwtData?.email,
          appleUID: jwtData?.sub,
          provider: 'APPLE_ID',
          imageURL: null,
        };

        signInWith(user);
      }
    } catch (error) {
      console.log('SignInWithAppleIdAndroid error => ', error);
      setSpinner(false);
    }
  };

  signInWithGoogleSignin = async () => {
    setSpinner(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        setSpinner(false);
        let user = {
          email: response?.data?.user?.email,
          name: response?.data?.user?.name || 'ETrackings',
          googleUID: response?.data?.user?.id,
          provider: 'GOOGLE',
          imageURL: response?.data?.user?.photo,
        };

        signInWith(user);
      } else {
        setSpinner(false);
      }
    } catch (err) {
      setSpinner(false);
    }
  };

  // getInfoFromToken = token => {
  //   const PROFILE_REQUEST_PARAMS = {
  //     fields: {
  //       string: 'id,name,first_name,last_name,email,picture.type(large)',
  //     },
  //   };

  //   const profileRequest = new GraphRequest(
  //     '/me',
  //     {token, parameters: PROFILE_REQUEST_PARAMS},
  //     (error, fbUser) => {
  //       if (error) {
  //         setSpinner(false);
  //         errorMessage('ETrackings', t('message.somethingWentWrong'));
  //       } else {
  //         let user = {
  //           email: fbUser?.email,
  //           name: fbUser?.name,
  //           facebookUID: fbUser?.id,
  //           provider: 'FACEBOOK',
  //           imageURL: fbUser?.picture?.data?.url,
  //         };

  //         signInWith(user);
  //         setSpinner(false);
  //       }
  //     },
  //   );

  //   new GraphRequestManager().addRequest(profileRequest).start();
  // };

  // signInWithFacebook = () => {
  //   setSpinner(true);
  //   LoginManager.logInWithPermissions(['public_profile', 'email']).then(
  //     login => {
  //       if (login.isCancelled) {
  //         setSpinner(false);
  //       } else {
  //         AccessToken.getCurrentAccessToken().then(respData => {
  //           const accessToken = respData.accessToken.toString();
  //           this.getInfoFromToken(accessToken);
  //         });
  //       }
  //     },
  //     error => {
  //       setSpinner(false);
  //       console.log('error -> ', error);
  //     },
  //   );
  // };

  signInWith = async user => {
    let resp = await Api.signInWith(user);
    if (resp?.meta?.code === 200 && resp?.data?.confirmedAt != null) {
      setSpinner(false);
      await encryptedStorageSetItem('user', JSON.stringify(resp.data));
      successMessage(t('message.success'), t('message.signInSuccessful'));

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Home'}],
        }),
      );
    } else if (resp?.meta?.code === 401 && resp?.data?.confirmedAt == null) {
      setSpinner(false);
      infoMessage(
        t('message.notValidate'),
        t('message.pleaseConfirmYourEmail'),
      );
    } else {
      setSpinner(false);
      if (
        resp?.meta?.message ==
        `ERROR: duplicate key value violates unique constraint "users_email_key" (SQLSTATE 23505)`
      ) {
        errorMessage(
          t('message.notValidate'),
          t('message.emailHasAlreadyBeenTaken'),
        );
      } else {
        errorMessage(
          t('message.notValidate'),
          t('message.emailOrPasswordInvalid'),
        );
      }
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: setting.appColor,
      }}>
      <StatusBar
        barStyle={`${setting.isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={setting.appColor}
      />
      <Spinner
        visible={spinner}
        textContent={t('text.loading')}
        textStyle={{color: '#FFF', fontFamily: 'Kanit-Light'}}
      />
      <Ripple
        rippleDuration={setting?.animation == 'normal' ? 600 : 450}
        onPress={() => navigation.navigate('Guest')}
        style={styles.floatLeftAuth}>
        <MatIcon
          name={'keyboard-backspace'}
          style={[styles.headerIcon, {color: setting.textColor}]}
        />
      </Ripple>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: isIpad() ? 80 : 0,
        }}>
        <KeyboardAvoidingView
          behavior={'height'}
          enabled={isIos()}
          style={styles.centerScreen}>
          <Animatable.Text
            allowFontScaling={false}
            animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
            delay={setting?.animation == 'normal' ? 100 : 50 * 1}
            style={[styles.textHead, {color: setting.textColor}]}>
            {t('text.welcome')},
          </Animatable.Text>
          <Animatable.Text
            allowFontScaling={false}
            animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
            delay={setting?.animation == 'normal' ? 100 : 50 * 1.5}
            style={[styles.textSub, {color: setting.textSubtitle}]}>
            {t('text.fillOutToSignIn')}
          </Animatable.Text>
          <Animatable.View
            allowFontScaling={false}
            animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
            delay={setting?.animation == 'normal' ? 100 : 50 * 2}>
            <TextInput
              theme={{
                dark: setting.isDarkMode,
                colors: {text: setting.textColor},
              }}
              style={{
                fontFamily: 'Kanit-Light',
                backgroundColor: setting.inputColor,
              }}
              allowFontScaling={false}
              autoCapitalize={'none'}
              keyboardAppearance={setting.theme}
              mode={'outlined'}
              label={t('placeholder.email')}
              value={email}
              onChangeText={val => setEmail(val)}
            />
          </Animatable.View>
          <HelperText
            allowFontScaling={false}
            style={{fontFamily: 'Kanit-Light', color: '#FF3260'}}
            type={'error'}
            visible={validateEmail(email)}>
            {t('message.emailInvalid')}
          </HelperText>
          <Animatable.View
            animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
            delay={setting?.animation == 'normal' ? 100 : 50 * 2.5}>
            <TextInput
              theme={{
                dark: setting.isDarkMode,
                colors: {text: setting.textColor},
              }}
              style={{
                fontFamily: 'Kanit-Light',
                backgroundColor: setting.inputColor,
              }}
              secureTextEntry={isSecureTextEntry}
              right={
                <TextInput.Icon
                  icon={isSecureTextEntry ? 'eye' : 'eye-off'}
                  theme={{
                    dark: setting.isDarkMode,
                    colors: {text: setting.notSelectColor},
                  }}
                  onPress={() => setIsSecureTextEntry(!isSecureTextEntry)}
                />
              }
              allowFontScaling={false}
              autoCapitalize={'none'}
              keyboardAppearance={setting.theme}
              mode={'outlined'}
              label={t('placeholder.password')}
              value={password}
              onChangeText={val => setPassword(val)}
            />
          </Animatable.View>

          <HelperText
            allowFontScaling={false}
            style={{fontFamily: 'Kanit-Light', color: '#FF3260'}}
            type={'error'}
            visible={validatePasswordLessThanEight(password)}>
            {t('message.passwordLessThanEight')}
          </HelperText>

          <Animatable.View
            animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
            delay={setting?.animation == 'normal' ? 100 : 50 * 3}
            style={{justifyContent: 'flex-end'}}>
            <Ripple
              rippleDuration={setting?.animation == 'normal' ? 600 : 450}
              style={{
                padding: hp(2),
                paddingTop: hp(0.2),
                alignItems: 'flex-end',
              }}
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text
                allowFontScaling={false}
                style={{
                  color: setting.textColor,
                  fontSize: fontSize(13),
                  textDecorationLine: 'underline',
                  fontFamily: 'Kanit-Light',
                }}>
                {t('button.forgotPassword')}
              </Text>
            </Ripple>
          </Animatable.View>

          <Animatable.View
            animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
            delay={setting?.animation == 'normal' ? 100 : 50 * 2.5}
            style={{
              alignSelf: 'center',
              paddingTop: 5,
            }}>
            <AnimateLoadingButton
              ref={c => setLoadingSignIn(c)}
              width={isIpad() ? width() / 1.25 : width() / 1.1}
              height={50}
              title={t('button.signIn')}
              titleFontFamily={'Kanit-Light'}
              titleFontSize={fontSize(14)}
              titleColor={'#FFF'}
              backgroundColor={'#641BFF'}
              borderRadius={8}
              onPress={() => validateSignIn()}
            />
          </Animatable.View>

          <Animatable.View
            animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
            delay={setting?.animation == 'normal' ? 100 : 50 * 3.5}
            style={{justifyContent: 'center', paddingTop: 20}}>
            <Text
              allowFontScaling={false}
              style={{
                color: setting.textColor,
                fontSize: fontSize(12),
                fontFamily: 'Kanit-Light',
                textAlign: 'center',
              }}>
              {t('button.or')}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                paddingTop: 30,
              }}>
              {appleAuth.isSupported &&
                JSON.parse(Config.IS_LOGIN_WITH_APPLE_ID) && (
                  <Icon
                    raised
                    containerStyle={{backgroundColor: setting.bgLogoColor}}
                    name={'apple'}
                    type={'font-awesome'}
                    color={'#000'}
                    onPress={() => signInWithAppleId()}
                  />
                )}

              {appleAuthAndroid.isSupported &&
                JSON.parse(Config.IS_LOGIN_WITH_APPLE_ID) && (
                  <Icon
                    raised
                    containerStyle={{backgroundColor: setting.bgLogoColor}}
                    name={'apple'}
                    type={'font-awesome'}
                    color={'#000'}
                    onPress={() => signInWithAppleIdAndroid()}
                  />
                )}

              {JSON.parse(Config.IS_LOGIN_WITH_FACEBOOK) && (
                <Icon
                  raised
                  name={'facebook'}
                  type={'font-awesome'}
                  color={'#298EFF'}
                  // onPress={() => signInWithFacebook()}
                />
              )}

              {JSON.parse(Config.IS_LOGIN_WITH_GOOGLE) && (
                <Icon
                  raised
                  name={'google'}
                  type={'font-awesome'}
                  color={'#FC2045'}
                  onPress={() => signInWithGoogleSignin()}
                />
              )}
            </View>
          </Animatable.View>

          <Animatable.View
            animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
            delay={setting?.animation == 'normal' ? 100 : 50 * 5.5}
            style={{justifyContent: 'center', paddingTop: 30}}>
            <Ripple
              rippleDuration={setting?.animation == 'normal' ? 600 : 450}
              style={{
                padding: hp(2),
                paddingTop: hp(0.2),
                alignItems: 'center',
              }}
              onPress={() => navigation.navigate('Register')}>
              <Text
                allowFontScaling={false}
                style={{
                  color: setting.textColor,
                  fontSize: fontSize(15),
                  fontFamily: 'Kanit-Light',
                }}>
                {t('button.signUp')}
              </Text>
            </Ripple>
          </Animatable.View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};
