import React, {useState} from 'react';
import {View, Keyboard} from 'react-native';
import {useSelector} from 'react-redux';
import {Text, TextInput, HelperText, Button} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

export default ActionSheetCustomBoxView = props => {
  const {
    hp,
    fontSize,
    validateBlank,
    isPresent,
  } = require('../../helpers/globalFunction');
  // redux
  const {t} = useTranslation();
  const setting = useSelector(state => state.setting);
  const [width, setWidth] = useState(props?.width || 1);
  const [length, setLength] = useState(props?.length || 1);
  const [height, setHeight] = useState(props?.height || 1);

  submit = () => {
    props.onSubmit(width, length, height);
  };

  return (
    <View
      style={{
        padding: 10,
        marginBottom: 30,
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
              onPress={() => submit()}>
              {t('button.save')}
            </Button>
          </View>
        </View>
      </View>

      <TextInput
        returnKeyLabel={t('button.done')}
        returnKeyType={'done'}
        onSubmitEditing={Keyboard.dismiss}
        keyboardType={'numeric'}
        placeholder={t('placeholder.width')}
        label={t('placeholder.width')}
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
              display: isPresent(width) ? 'flex' : 'none',
            }}
            onPress={() => setWidth(1)}
          />
        }
        allowFontScaling={false}
        autoCapitalize={'none'}
        mode={'outlined'}
        value={width}
        keyboardAppearance={setting.theme}
        onChangeText={val => setWidth(val)}
      />

      <HelperText
        allowFontScaling={false}
        style={{fontFamily: 'Kanit-Light', color: '#FF3260'}}
        type={'error'}
        visible={validateBlank(width)}>
        {t('message.cannotBeBlank')}
      </HelperText>

      <TextInput
        returnKeyLabel={t('button.done')}
        returnKeyType={'done'}
        onSubmitEditing={Keyboard.dismiss}
        keyboardType={'numeric'}
        placeholder={t('placeholder.length')}
        label={t('placeholder.length')}
        theme={{
          dark: setting.isDarkMode,
          colors: {text: setting.textColor},
        }}
        style={{
          fontFamily: 'Kanit-Light',
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
              display: isPresent(length) ? 'flex' : 'none',
            }}
            onPress={() => setLength(1)}
          />
        }
        allowFontScaling={false}
        autoCapitalize={'none'}
        mode={'outlined'}
        value={length}
        keyboardAppearance={setting.theme}
        onChangeText={val => setLength(val)}
      />

      <HelperText
        allowFontScaling={false}
        style={{fontFamily: 'Kanit-Light', color: '#FF3260'}}
        type={'error'}
        visible={validateBlank(length)}>
        {t('message.cannotBeBlank')}
      </HelperText>

      <TextInput
        returnKeyLabel={t('button.done')}
        returnKeyType={'done'}
        onSubmitEditing={Keyboard.dismiss}
        keyboardType={'numeric'}
        placeholder={t('placeholder.height')}
        label={t('placeholder.height')}
        theme={{
          dark: setting.isDarkMode,
          colors: {text: setting.textColor},
        }}
        style={{
          fontFamily: 'Kanit-Light',
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
              display: isPresent(height) ? 'flex' : 'none',
            }}
            onPress={() => setHeight(1)}
          />
        }
        allowFontScaling={false}
        autoCapitalize={'none'}
        mode={'outlined'}
        value={height}
        keyboardAppearance={setting.theme}
        onChangeText={val => setHeight(val)}
      />

      <HelperText
        allowFontScaling={false}
        style={{fontFamily: 'Kanit-Light', color: '#FF3260'}}
        type={'error'}
        visible={validateBlank(height)}>
        {t('message.cannotBeBlank')}
      </HelperText>

      <View style={{paddingTop: 10}} />
    </View>
  );
};
