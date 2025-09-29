import React, { useState } from 'react';
import * as Animatable from 'react-native-animatable';
import {
  StatusBar,
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Text, RadioButton } from 'react-native-paper';
import { CommonActions, RouteProp } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import { hasNotch } from 'react-native-device-info';

import IOSHeader from '../header/iosHeaderView';
import { styles } from '../../helpers/styles';
import {
  fontSize,
  errorMessage,
  encryptedStorageGetItem,
  encryptedStorageSetItem,
} from '../../helpers/globalFunction';
import { setAgreeTermsAndConditions } from '../../store/settingSlice';

// Define route and navigation types
interface TermsAndConditionsParams {
  isAgree?: boolean;
  isMarketingActivities?: boolean;
  isVerifyYourIdentity?: boolean;
}

interface Props {
  navigation: any;
  route: RouteProp<Record<string, TermsAndConditionsParams>, string>;
}

interface RootState {
  setting: {
    appColor: string;
    textColor: string;
    textSubtitle: string;
    bgLogoColor: string;
    deliveredColor: string;
    unableSendParcelColor: string;
    cardColor: string;
    animation: string;
    isDarkMode: boolean;
  };
}

const TermsAndConditionsView: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const setting = useSelector((state: RootState) => state.setting);

  const [spinner, setSpinner] = useState(false);
  const [isConsentToMarketingActivities, setIsConsentToMarketingActivities] =
    useState<boolean>(route?.params?.isMarketingActivities || false);
  const [isConsentToVerifyYourIdentity, setIsConsentToVerifyYourIdentity] =
    useState<boolean>(route?.params?.isVerifyYourIdentity || false);

  const goToPage = async () => {
    const user = await encryptedStorageGetItem('user');
    const nextRoute = user ? 'Home' : 'Guest';

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: nextRoute }],
      }),
    );
  };

  const agree = async () => {
    if (isConsentToVerifyYourIdentity) {
      await encryptedStorageSetItem(
        'isAgreeTermsAndConditions',
        JSON.stringify(true),
      );
      dispatch(setAgreeTermsAndConditions(true));
      await goToPage();
    } else {
      errorMessage('ETrackings', t('text.pleaseAgree'));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: setting.appColor }}>
      <StatusBar
        barStyle={`${setting.isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={setting.bgLogoColor}
      />
      <Spinner
        visible={spinner}
        textContent={t('text.loading')}
        textStyle={{ color: '#FFF', fontFamily: 'Kanit-Light' }}
      />
      <IOSHeader
        title={
          route?.params?.isAgree ? t('text.personalInformation') : 'ETrackings'
        }
        titleColor={route?.params?.isAgree ? setting.textColor : '#1E88E5'}
        subtitle={route?.params?.isAgree ? null : t('text.termsAndConditions')}
        canGoBack={!!route?.params?.isAgree}
        onPressBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, marginLeft: 20, marginRight: 20, marginTop: 5 }}
      >
        <Animatable.Text
          animation={setting?.animation !== 'close' ? 'fadeInUp' : undefined}
          delay={setting?.animation === 'normal' ? 100 : 50}
          style={[styles.textCaption, { color: setting.textSubtitle }]}
        >
          {t('message.expressMyIntentionForEtrackings')}
        </Animatable.Text>

        {/* Marketing Consent */}
        <Animatable.View
          animation={setting?.animation !== 'close' ? 'fadeInUp' : undefined}
          delay={setting?.animation === 'normal' ? 100 : 75}
          style={stylesCard(setting.cardColor)}
        >
          <Text allowFontScaling={false} style={textStyle(setting.textColor)}>
            {t('message.consentToMarketingActivities')}
          </Text>
          <RadioButton.Group
            onValueChange={async (val: any) => {
              setIsConsentToMarketingActivities(val);
              await encryptedStorageSetItem(
                'isConsentToMarketingActivities',
                JSON.stringify(val),
              );
            }}
            value={isConsentToMarketingActivities}
          >
            <RadioButton.Item
              label={t('button.agree')}
              value={true}
              mode="ios"
              style={radioStyle(setting.deliveredColor)}
              color={setting.textColor}
            />
            <RadioButton.Item
              label={t('button.notAgree')}
              value={false}
              mode="ios"
              style={radioStyle(setting.unableSendParcelColor)}
              color={setting.textColor}
            />
          </RadioButton.Group>
        </Animatable.View>

        {/* Identity Consent */}
        <Animatable.View
          animation={setting?.animation !== 'close' ? 'fadeInUp' : undefined}
          delay={setting?.animation === 'normal' ? 100 : 100}
          style={stylesCard(setting.cardColor)}
        >
          <Text allowFontScaling={false} style={textStyle(setting.textColor)}>
            {t('message.consentToVerifyYourIdentity')}
          </Text>
          <RadioButton.Group
            onValueChange={async (val: any) => {
              setIsConsentToVerifyYourIdentity(val);
              await encryptedStorageSetItem(
                'isConsentToVerifyYourIdentity',
                JSON.stringify(val),
              );
            }}
            value={isConsentToVerifyYourIdentity}
          >
            <RadioButton.Item
              label={t('button.agree')}
              value={true}
              mode="ios"
              style={radioStyle(setting.deliveredColor)}
              color={setting.textColor}
            />
            <RadioButton.Item
              label={t('button.notAgree')}
              value={false}
              mode="ios"
              style={radioStyle(setting.unableSendParcelColor)}
              color={setting.textColor}
            />
          </RadioButton.Group>
        </Animatable.View>
      </ScrollView>

      <Animatable.View
        animation={setting?.animation !== 'close' ? 'fadeInUp' : undefined}
        delay={setting?.animation === 'normal' ? 100 : 125}
      >
        <Button
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginTop: 15,
            marginBottom: hasNotch() ? 10 : 15,
          }}
          disabled={!isConsentToVerifyYourIdentity}
          mode="contained"
          onPress={agree}
        >
          {t('button.submit')}
        </Button>
      </Animatable.View>
    </SafeAreaView>
  );
};

export default TermsAndConditionsView;

const stylesCard = (bgColor: string) => ({
  backgroundColor: bgColor,
  borderRadius: 15,
  marginTop: 10,
});

const textStyle = (color: string) => ({
  alignSelf: 'center',
  alignContent: 'center',
  fontFamily: 'Kanit-Light',
  fontSize: fontSize(12),
  padding: 15,
  color,
});

const radioStyle = (bgColor: string) => ({
  backgroundColor: bgColor,
  borderRadius: 15,
  margin: 10,
});
