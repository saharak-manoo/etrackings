import React, {useState} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {Text, Button, Colors} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

export default ActionSheetAccountTypeView = props => {
  const {
    hp,
    fontSize,
    validateBlank,
    isPresent,
  } = require('../../helpers/globalFunction');
  // redux
  const {t} = useTranslation();
  const setting = useSelector(state => state.setting);
  [isLoading, setLoading] = useState(false);
  user = props.user || null;

  return (
    <View
      style={{
        padding: 10,
        backgroundColor: setting.cardColor,
      }}>
      <View style={{flexDirection: 'row'}}>
        <View style={{width: '100%'}}>
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
        </View>
      </View>

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
          fontSize: fontSize(15),
          paddingTop: hp(0.5),
          paddingLeft: hp(1),
        }}>
        {`${t('text.package')}: ${props.subtitle}`}
      </Text>

      {isPresent(user?.payDate) && (
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
            fontSize: fontSize(15),
            paddingTop: hp(0.5),
            paddingLeft: hp(1),
          }}>
          {`${t('text.payDate')}: ${user?.payDate}`}
        </Text>
      )}

      {isPresent(user?.expireDate) && (
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
            fontSize: fontSize(15),
            paddingTop: hp(0.5),
            paddingLeft: hp(1),
          }}>
          {`${t('text.expireDate')}: ${user?.expireDate}`}
        </Text>
      )}

      {user?.isForever && (
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
            fontSize: fontSize(15),
            paddingTop: hp(0.5),
            paddingLeft: hp(1),
          }}>
          {`${t('text.expireDate')}: ${t('text.forever')}`}
        </Text>
      )}

      <View style={{flexDirection: 'row'}}>
        <View style={{width: '50%'}}>
          <Button
            color={Colors.amber300}
            mode={'contained'}
            style={{margin: 10}}
            loading={isLoading}
            disabled={isLoading}
            onPress={async () => {
              setLoading(true);
              await props.onRestoreButton();
              setLoading(false);
            }}>
            {t('text.restore')}
          </Button>
        </View>
        <View style={{width: '50%'}}>
          <Button
            mode={'contained'}
            style={{margin: 10}}
            disabled={isLoading}
            onPress={() => {
              props.onPackageButton();
            }}>
            {t('text.package')}
          </Button>
        </View>
      </View>

      <View style={{paddingTop: 10}} />
    </View>
  );
};
