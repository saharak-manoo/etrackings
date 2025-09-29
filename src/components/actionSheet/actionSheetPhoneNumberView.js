import React, {useState} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {Text, TextInput, HelperText, Button} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

export default ActionSheetPhoneNumberView = props => {
  const {
    hp,
    fontSize,
    validatePhoneNumber,
    isPresent,
  } = require('../../helpers/globalFunction');
  // redux
  const {t} = useTranslation();
  const setting = useSelector(state => state.setting);
  const [phoneNumber, setPhoneNumber] = useState(props.phoneNumber);
  isLoading = props.isLoading || false;

  validate = () => {
    if (props.isRequired) {
      if (validatePhoneNumber(phoneNumber) && phoneNumber.startsWith('0')) {
        props.requiredText = 'message.phoneNumberMustBeTen';
        return false;
      } else if (!phoneNumber.startsWith('0')) {
        props.requiredText = 'message.phoneNumberMustStartsWith';
        return false;
      } else if (phoneNumber == props.phoneNumber) {
        props.requiredText = 'message.phoneNumberNoChange';
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  };

  submit = () => {
    if (validate()) {
      props.onSubmit(phoneNumber);
    }
  };

  return (
    <View
      style={{
        padding: 10,
        backgroundColor: setting.cardColor,
      }}>
      <View style={{flexDirection: 'row'}}>
        <View style={{width: '70%'}}>
          <Text
            theme={{
              dark: setting.isDarkMode,
              colors: {text: setting.textColor},
            }}
            numberOfLines={2}
            allowFontScaling={false}
            style={{
              alignContent: 'center',
              fontFamily: 'Kanit-Light',
              fontSize: fontSize(25),
              paddingTop: hp(0.5),
              paddingLeft: hp(1),
            }}>
            {props.title}
          </Text>

          {props.subTitle && (
            <Text
              theme={{
                dark: setting.isDarkMode,
                colors: {text: setting.textColor},
              }}
              allowFontScaling={false}
              style={{
                alignContent: 'center',
                fontFamily: 'Kanit-Light',
                fontSize: fontSize(12),
                paddingTop: hp(0.5),
                paddingLeft: hp(1),
              }}>
              {props.subTitle}
            </Text>
          )}
        </View>
        <View style={{width: '30%'}}>
          <View style={{marginTop: 7}}>
            <Button
              mode={'contained'}
              style={{
                textColor: setting.textColor,
                borderRadius: 8,
                shadowColor: '#03DAC6',
              }}
              color={'#03DAC6'}
              loading={isLoading}
              disabled={isLoading || !validate()}
              onPress={() => submit()}>
              {t('button.save')}
            </Button>
          </View>
        </View>
      </View>

      <TextInput
        returnKeyLabel={t('button.done')}
        returnKeyType={'done'}
        keyboardType={'numeric'}
        placeholder={props.inputPlaceholder}
        maxLength={10}
        theme={{
          dark: setting.isDarkMode,
          colors: {text: setting.textColor},
        }}
        style={{
          fontFamily: 'Kanit-Light',
          marginTop: 5,
          margin: 10,
          backgroundColor: setting.inputColor,
        }}
        right={
          <TextInput.Icon
            icon={'close'}
            theme={{
              dark: setting.isDarkMode,
              colors: {text: setting.notSelectColor},
            }}
            style={{
              display: isPresent(phoneNumber) ? 'flex' : 'none',
            }}
            onPress={() => setPhoneNumber('')}
          />
        }
        allowFontScaling={false}
        autoCapitalize={'none'}
        label={props.inputLabel}
        mode={'outlined'}
        value={phoneNumber}
        keyboardAppearance={setting.theme}
        onChangeText={t => setPhoneNumber(t)}
      />

      {props.isRequired && (
        <HelperText
          allowFontScaling={false}
          style={{fontFamily: 'Kanit-Light', color: '#FF3260'}}
          type={'error'}
          visible={validatePhoneNumber(phoneNumber)}>
          {t(props.requiredText || 'message.cannotBeBlank')}
        </HelperText>
      )}

      <View style={{paddingTop: 10}} />
    </View>
  );
};
