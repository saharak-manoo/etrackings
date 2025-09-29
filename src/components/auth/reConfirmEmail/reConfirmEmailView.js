import React, {useState} from 'react';
import {View, KeyboardAvoidingView} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {HelperText, TextInput} from 'react-native-paper';
import AnimateLoadingButton from 'react-native-animate-loading-button';
import {useTranslation} from 'react-i18next';
import * as Api from '../../actions/api';
import * as Animatable from 'react-native-animatable';
import {styles} from '../../../helpers/styles';

// View
import IOSHeader from '../../header/iosHeaderView';

export default ReConfirmEmailView = ({navigation, route: {params}}) => {
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
  const [loadingReConfirmEmail, setLoadingReConfirmEmail] = useState();
  const [email, setEmail] = useState('');

  async function validateReConfirmEmail() {
    loadingReConfirmEmail.showLoading(true);

    if (validateEmail(email) || email === '') {
      errorMessage(
        t('message.notValidate'),
        t('message.emailInvalid'),
      );
      loadingReConfirmEmail.showLoading(false);
    } else {
      sendReConfirmEmail();
    }
  }

  async function sendReConfirmEmail() {
    let response = await Api.reConfirmEmail({
      email: email,
    });
    if (response?.meta?.code === 200) {
      loadingReConfirmEmail.showLoading(false);

      successMessage(
        t('message.success'),
        t('message.reConfirmEmail'),
      );

      navigation.navigate('Login');
    } else {
      loadingReConfirmEmail.showLoading(false);
      errorMessage(
        t('message.notValidate'),
        t(`message.notHaveEmail`),
      );
    }
  }

  return (
    <View style={{flex: 1, backgroundColor: setting.appColor}}>
      <IOSHeader
        title={t('placeholder.reConfirmEmail')}
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
              animation={
                setting?.animation != 'close'
                  ? setting?.animation != 'close'
                    ? 'fadeInUp'
                    : ''
                  : ''
              }
              delay={setting?.animation == 'normal' ? 100 : 50 * 1}
              style={[styles.textHead, {color: setting.textColor}]}>
              {t('button.reConfirmEmail')},
            </Animatable.Text>
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
              delay={setting?.animation == 'normal' ? 100 : 50 * 2.5}
              style={{
                alignSelf: 'center',
                paddingTop: 20,
              }}>
              <AnimateLoadingButton
                ref={c => setLoadingReConfirmEmail(c)}
                width={isIpad() ? width() / 1.25 : width() / 1.1}
                height={50}
                title={t('button.reConfirmEmail')}
                titleFontFamily={'Kanit-Light'}
                titleFontSize={fontSize(14)}
                titleColor={'#FFF'}
                backgroundColor={'#FF3260'}
                borderRadius={12}
                onPress={() => validateReConfirmEmail()}
              />
            </Animatable.View>
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    </View>
  );
};
