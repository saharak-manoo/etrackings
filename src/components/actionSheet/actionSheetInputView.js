import React, {useState} from 'react';
import ActionSheet, {
  SheetManager,
  useSheetPayload,
} from 'react-native-actions-sheet';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {Text, TextInput, HelperText, Button} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

export default ActionSheetInputView = () => {
  const {
    sheetName,
    navigation,
    title,
    subTitle,
    isLoading,
    onSubmit,
    word,
    inputPlaceholder,
    inputLabel,
    requiredText,
    isRequired,
  } = useSheetPayload('payload');
  const {
    hp,
    fontSize,
    validateBlank,
    isPresent,
  } = require('../../helpers/globalFunction');
  // redux
  const {t} = useTranslation();
  const setting = useSelector(state => state.setting);
  const [text, setText] = useState(word);

  submit = () => {
    if (isRequired) {
      if (!validateBlank(text)) {
        onSubmit(text);
      }
    } else {
      onSubmit(text);
    }

    SheetManager.hide(sheetName);
  };

  return (
    <ActionSheet
      gestureEnabled
      bounceOnOpen
      onClose={() => {
        SheetManager.hide(sheetName);
      }}
      containerStyle={{backgroundColor: setting.cardColor}}>
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
              {title}
            </Text>

            {subTitle && (
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
                {subTitle}
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
                disabled={isLoading}
                onPress={() => submit()}>
                {t('button.save')}
              </Button>
            </View>
          </View>
        </View>

        <TextInput
          placeholder={inputPlaceholder}
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
                display: isPresent(text) ? 'flex' : 'none',
              }}
              onPress={() => setText(null)}
            />
          }
          allowFontScaling={false}
          autoCapitalize={'none'}
          label={inputLabel}
          mode={'outlined'}
          value={text}
          keyboardAppearance={setting.theme}
          onChangeText={t => setText(t)}
        />

        {isRequired && (
          <HelperText
            allowFontScaling={false}
            style={{fontFamily: 'Kanit-Light', color: '#FF3260'}}
            type={'error'}
            visible={validateBlank(text)}>
            {requiredText || t('message.cannotBeBlank')}
          </HelperText>
        )}
      </View>
    </ActionSheet>
  );
};
