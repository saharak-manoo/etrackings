import {Linking} from 'react-native';
import {showMessage} from 'react-native-flash-message';
import messaging from '@react-native-firebase/messaging';

export const showLocalNotification = async (
  message,
  description,
  backgroundColor,
  url = null,
  isOpneURL = false,
  onSuccess = null,
) => {
  showMessage({
    message: message,
    description: description,
    type: 'default',
    backgroundColor: backgroundColor,
    color: '#FFF',
    duration: 5000,
    textStyle: {
      fontFamily: 'Kanit-Light',
    },
    titleStyle: {
      fontFamily: 'Kanit-Light',
    },
    onPress: () => {
      if (isOpneURL) {
        Linking.openURL(url || 'https://apps.etrackings.com/premium');
      } else {
        if (onSuccess) onSuccess();
      }
    },
  });
};

export const openTrackDetail = async onSuccess => {
  onSuccess();
};

export const requestFirebasePermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) return await getFirebaseToken();

  return null;
};

export const getFirebaseToken = async () => {
  try {
    const enabled = await messaging().hasPermission();
    if (!enabled) await messaging().requestPermission();

    const fcmToken = await messaging().getToken();
    return fcmToken;
  } catch {}
};

// On notification in open app
export const unsubscribeNotification = async navigation => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    let {
      courierName,
      currentStatus,
      courierColor,
      courierKey,
      trackingNumber,
      notiType,
      message,
      color,
      url,
    } = remoteMessage.data;

    if (notiType === 'tracking') {
      showLocalNotification(
        courierName,
        currentStatus,
        courierColor,
        null,
        false,
        () =>
          navigation.navigate('TrackDetail', {
            courier: courierKey,
            trackingNumber: trackingNumber,
            isKeep: false,
          }),
      );
    } else {
      showLocalNotification('ETrackings', message, color, url, true);
    }
  });

  return unsubscribe;
};

export const openedAppNotification = (navigation, setting) => {
  messaging().onNotificationOpenedApp(remoteMessage => {
    let {notiType, courierKey, trackingNumber, url} = remoteMessage.data;

    if (notiType === 'tracking' && courierKey) {
      openTrackDetail(
        navigation.navigate('TrackDetail', {
          courier: courierKey,
          trackingNumber: trackingNumber,
          isKeep: false,
        }),
        setting.isBiometrics,
      );
    } else {
      Linking.openURL(url || 'https://apps.etrackings.com');
    }
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        let {notiType, courierKey, trackingNumber, url} = remoteMessage.data;

        if (notiType === 'tracking' && courierKey) {
          setTimeout(() => {
            openTrackDetail(
              navigation.navigate('TrackDetail', {
                courier: courierKey,
                trackingNumber: trackingNumber,
                isKeep: false,
              }),
              setting.isBiometrics,
            );
          }, 1750);
        } else {
          Linking.openURL(url || 'https://apps.etrackings.com');
        }
      }
    });
};
