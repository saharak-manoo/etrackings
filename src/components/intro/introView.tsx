import React, { useState } from 'react';
import { StatusBar, View, StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native-paper';
import AppIntroSlider from 'react-native-app-intro-slider';
import { styles } from '../../helpers/styles';
import FastImage from '@d11/react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { CommonActions, NavigationProp } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';

// Define types
interface Slide {
  key: number;
  title: string;
  text: string;
  image: string;
  backgroundColor: string;
}

interface IntroViewProps {
  navigation: NavigationProp<any>;
}

// Slides data
const slides: Slide[] = [
  {
    key: 1,
    title: 'placeholder.appName',
    text: 'placeholder.trackingAndNotification',
    image: `https://fast.etrackings.com/apps.png`,
    backgroundColor: '#59b2ab',
  },
  {
    key: 2,
    title: 'placeholder.checkParcelStatus',
    text: 'placeholder.trackParcelsForMoreThan50Shipments',
    image: `https://fast.etrackings.com/tracking.png`,
    backgroundColor: '#febe29',
  },
  {
    key: 3,
    title: 'button.notifications',
    text: 'placeholder.notifEveryStatus',
    image: `https://fast.etrackings.com/notification.png`,
    backgroundColor: '#FD8F34',
  },
];

const IntroView: React.FC<IntroViewProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    encryptedStorageGetItem,
    isIpad,
  } = require('../../helpers/globalFunction');

  const [spinner, setSpinner] = useState<boolean>(false);

  const renderImages = ({ item }: { item: Slide }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <Text style={styles.title}>{t(item.title)}</Text>
        <FastImage
          resizeMode={FastImage.resizeMode.contain}
          style={isIpad() ? styles.appETrackingsIpad : styles.appETrackings}
          source={{ uri: item.image, priority: FastImage.priority.low }}
        />
        <Text style={styles.text}>{t(item.text)}</Text>
      </View>
    );
  };

  const renderNextButton = () => {
    return (
      <View style={styles.buttonCircle as StyleProp<ViewStyle>}>
        <Icon name={'arrow-forward-outline'} color={'#FFF'} size={24} />
      </View>
    );
  };

  const renderDoneButton = () => {
    return (
      <View style={styles.buttonCircle as StyleProp<ViewStyle>}>
        <Icon name={'checkmark-outline'} color={'#FFF'} size={24} />
      </View>
    );
  };

  const goToPage = async () => {
    const isAgreeTermsAndConditions = JSON.parse(
      await encryptedStorageGetItem('isAgreeTermsAndConditions'),
    );

    if (isAgreeTermsAndConditions) {
      if (await encryptedStorageGetItem('user')) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          }),
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Guest' }],
          }),
        );
      }
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'TermsAndConditions',
              params: {
                isAgree: false,
              },
            },
          ],
        }),
      );
    }
  };

  return (
    <>
      <StatusBar barStyle={'light-content'} />
      <Spinner
        visible={spinner}
        textContent={t('text.loading')}
        textStyle={{ color: '#FFF', fontFamily: 'Kanit-Light' }}
      />
      <AppIntroSlider
        renderItem={renderImages}
        data={slides}
        renderDoneButton={renderDoneButton}
        renderNextButton={renderNextButton}
        onDone={goToPage}
      />
    </>
  );
};

export default IntroView;
