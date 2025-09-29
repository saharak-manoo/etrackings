import React, {useState, useEffect} from 'react';
import Config from 'react-native-config';
import {View, KeyboardAvoidingView} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {Text, HelperText, TextInput} from 'react-native-paper';
import AnimateLoadingButton from 'react-native-animate-loading-button';
import {useTranslation} from 'react-i18next';
import * as Api from '../../actions/api';
import * as Animatable from 'react-native-animatable';
import {styles} from '../../../helpers/styles';
import {
  appleAuth,
  appleAuthAndroid,
} from '@invertase/react-native-apple-authentication';
import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import {Icon} from 'react-native-elements';
// import {
//   AccessToken,
//   GraphRequest,
//   GraphRequestManager,
//   LoginManager,
// } from 'react-native-fbsdk';
import {CommonActions} from '@react-navigation/native';

// View
import IOSHeader from '../../header/iosHeaderView';

export default RegisterView = ({navigation, route: {params}}) => {
  const {
    validateEmail,
    validateBlank,
    validatePasswordLessThanEight,
    validatePasswordMatch,
    successMessage,
    infoMessage,
    errorMessage,
    isIpad,
    isIos,
    width,
    fontSize,
    encryptedStorageSetItem,
    decodeJWT,
  } = require('../../../helpers/globalFunction');
  // redux
  const {t} = useTranslation();
  const setting = useSelector(state => state.setting);
  const [loadingSignUp, setLoadingSignUp] = useState();
  const [email, setEmail] = useState(params ? params.email : '');
  const [name, setName] = useState(params ? params.name : null);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [spinner, setSpinner] = useState(false);
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_SIGN_IN_KEY,
      forceConsentPrompt: true,
    });
  });

  async function validateSignIn() {
    loadingSignUp.showLoading(true);

    if (validateEmail(email) || email === '') {
      errorMessage(t('message.notValidate'), t('message.emailInvalid'));
      loadingSignUp.showLoading(false);
    } else if (password && passwordConfirmation) {
      if (
        validatePasswordLessThanEight(password) ||
        validatePasswordLessThanEight(passwordConfirmation)
      ) {
        errorMessage(
          t('message.notValidate'),
          t('message.passwordLessThanSix'),
        );
        loadingSignUp.showLoading(false);
      } else {
        if (password !== passwordConfirmation) {
          errorMessage(t('message.notValidate'), t('message.passwordNotMatch'));
          loadingSignUp.showLoading(false);
        } else {
          saveUser();
        }
      }
    } else {
      errorMessage(t('message.notValidate'), t('message.pleaseInputAllValue'));
      loadingSignUp.showLoading(false);
    }
  }

  async function saveUser() {
    let userParams = {
      email: email,
      name: name,
      password: password,
      confirmPassword: passwordConfirmation,
      language: setting.locale,
    };

    let resp = await Api.signUp(userParams);
    if (resp?.meta?.code === 200) {
      loadingSignUp.showLoading(false);

      successMessage(t('message.success'), t('message.signUpSuccessful'));

      navigation.goBack();
    } else {
      if (
        resp?.meta?.message ==
        `ERROR: duplicate key value violates unique constraint "users_email_key" (SQLSTATE 23505)`
      ) {
        errorMessage(
          t('message.notValidate'),
          t('message.emailHasAlreadyBeenTaken'),
        );
      } else {
        errorMessage(t('message.notValidate'), t('message.error'));
      }
      loadingSignUp.showLoading(false);
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
            email: appleAuthRequestResponse?.email || jwtData?.email,
            name:
              appleAuthRequestResponse?.fullName?.givenName ||
              appleAuthRequestResponse?.email ||
              jwtData?.email,
            appleUID: appleAuthRequestResponse?.user || jwtData?.sub,
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

        let fullname;
        if (response?.user) {
          if (response?.user?.name?.firstName) {
            fullname += response?.user?.name?.firstName;
          }
          if (response?.user?.name?.lastName) {
            fullname += ` ${response?.user?.name?.lastName}`;
          }
        }

        let user = {
          email: response?.user?.email || jwtData.email,
          name: fullname || 'ETrackings',
          appleUID: jwtData.sub,
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
  //       console.log('error => ', error);
  //     },
  //   );
  // };

  signInWith = async user => {
    let response = await Api.signInWith(user);
    if (response?.meta?.code === 200 && response?.data?.confirmedAt != null) {
      setSpinner(false);
      await encryptedStorageSetItem('user', JSON.stringify(response.data));
      successMessage(t('message.success'), t('message.signInSuccessful'));

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Home'}],
        }),
      );
    } else if (
      response?.meta?.code === 401 &&
      response?.data?.confirmedAt == null
    ) {
      setSpinner(false);
      infoMessage(
        t('message.notValidate'),
        t('message.pleaseConfirmYourEmail'),
      );
    } else {
      setSpinner(false);
      errorMessage(t('message.notValidate'), t('message.error'));
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: setting.appColor,
      }}>
      <IOSHeader
        title={t('placeholder.signUp')}
        titleColor={setting.textColor}
        canGoBack={true}
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: setting.appColor,
          padding: isIpad() ? 80 : 0,
        }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <KeyboardAvoidingView
            behavior={'padding'}
            enabled={isIos()}
            style={styles.centerScreen}>
            <Animatable.Text
              allowFontScaling={false}
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
              delay={setting?.animation == 'normal' ? 100 : 50 * 1.5}
              style={[styles.textSub, {color: setting.textSubtitle}]}>
              {t('text.fillOutToSignUp')}
            </Animatable.Text>
            <Animatable.View
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
              delay={setting?.animation == 'normal' ? 100 : 50 * 2}>
              <TextInput
                theme={{
                  dark: setting.isDarkMode,
                  colors: {text: setting.textColor},
                }}
                allowFontScaling={false}
                style={{
                  fontFamily: 'Kanit-Light',
                  backgroundColor: setting.inputColor,
                }}
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
                allowFontScaling={false}
                style={{
                  fontFamily: 'Kanit-Light',
                  backgroundColor: setting.inputColor,
                }}
                autoCapitalize={'none'}
                keyboardAppearance={setting.theme}
                mode={'outlined'}
                label={t('placeholder.name')}
                value={name}
                onChangeText={val => setName(val)}
              />
            </Animatable.View>
            <HelperText
              allowFontScaling={false}
              style={{fontFamily: 'Kanit-Light', color: '#FF3260'}}
              type={'error'}
              visible={validateBlank(name)}>
              {t('message.nameCannotBeBlank')}
            </HelperText>

            <Animatable.View
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
              delay={setting?.animation == 'normal' ? 100 : 50 * 3}>
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
              delay={setting?.animation == 'normal' ? 100 : 50 * 3.5}>
              <TextInput
                allowFontScaling={false}
                theme={{
                  dark: setting.isDarkMode,
                  colors: {text: setting.textColor},
                }}
                style={{
                  fontFamily: 'Kanit-Light',
                  backgroundColor: setting.inputColor,
                }}
                autoCapitalize={'none'}
                secureTextEntry={isSecureTextEntry}
                keyboardAppearance={setting.theme}
                mode={'outlined'}
                label={t('placeholder.passwordConfirmation')}
                value={passwordConfirmation}
                onChangeText={val => setPasswordConfirmation(val)}
              />
            </Animatable.View>
            <HelperText
              allowFontScaling={false}
              style={{fontFamily: 'Kanit-Light', color: '#FF3260'}}
              type={'error'}
              visible={validatePasswordMatch(password, passwordConfirmation)}>
              {t('message.passwordNotMatch')}
            </HelperText>

            <Animatable.View
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
              delay={setting?.animation == 'normal' ? 100 : 50 * 4}
              style={{
                alignSelf: 'center',
                paddingTop: 5,
              }}>
              <AnimateLoadingButton
                ref={c => setLoadingSignUp(c)}
                width={isIpad() ? width() / 1.25 : width() / 1.1}
                height={50}
                title={t('button.signUp')}
                titleFontFamily={'Kanit-Light'}
                titleFontSize={fontSize(14)}
                titleColor={'#FFF'}
                backgroundColor={'#672FFE'}
                borderRadius={12}
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
                      containerStyle={{backgroundColor: setting.bgLogoColo}}
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
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    </View>
  );
};
