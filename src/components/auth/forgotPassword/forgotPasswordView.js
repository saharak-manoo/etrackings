import React, {useState} from 'react';
import {View, KeyboardAvoidingView} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {HelperText, TextInput} from 'react-native-paper';
import AnimateLoadingButton from 'react-native-animate-loading-button';
import {useTranslation} from 'react-i18next';
import {styles} from '../../../helpers/styles';
import * as Animatable from 'react-native-animatable';
import * as Api from '../../actions/api';

// View
import IOSHeader from '../../header/iosHeaderView';

export default ForgotPasswordView = ({navigation, route: {params}}) => {
  const {
    validateEmail,
    successMessage,
    errorMessage,
    isIpad,
    isIos,
    width,
    fontSize,
  } = require('../../../helpers/globalFunction');
  // redux
  const {t} = useTranslation();
  const setting = useSelector(state => state.setting);
  const [loadingForgotPassword, setLoadingForgotPassword] = useState();
  const [email, setEmail] = useState('');

  async function validateForgotPassword() {
    loadingForgotPassword.showLoading(true);

    if (validateEmail(email) || email === '') {
      errorMessage(
        t('message.notValidate'),
        t('message.emailInvalid'),
      );
      loadingForgotPassword.showLoading(false);
    } else {
      sendResetPassword();
    }
  }

  async function sendResetPassword() {
    let response = await Api.forgotPassword({
      email: email,
    });
    if (response?.meta?.code === 200) {
      loadingForgotPassword.showLoading(false);

      successMessage(
        t('message.success'),
        t('message.resetPassword'),
      );

      navigation.navigate('Login');
    } else {
      loadingForgotPassword.showLoading(false);
      errorMessage(
        t('message.notValidate'),
        t(`message.notHaveEmail`),
      );
    }
  }

  return (
    <View style={{flex: 1, backgroundColor: setting.appColor}}>
      <IOSHeader
        title={t('placeholder.resetPassword')}
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
              {t('text.fillOutToContinue')}
            </Animatable.Text>
            <Animatable.View
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
              delay={setting?.animation == 'normal' ? 100 : 50 * 2.5}
              style={{
                alignSelf: 'center',
                paddingTop: 20,
              }}>
              <AnimateLoadingButton
                ref={c => setLoadingForgotPassword(c)}
                width={isIpad() ? width() / 1.25 : width() / 1.1}
                height={50}
                title={t('button.resetPassword')}
                titleFontFamily={'Kanit-Light'}
                titleFontSize={fontSize(14)}
                titleColor={'#FFF'}
                backgroundColor={'#FF3260'}
                borderRadius={12}
                onPress={() => validateForgotPassword()}
              />
            </Animatable.View>
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    </View>
  );
};
