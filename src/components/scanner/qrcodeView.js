/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import * as Animatable from 'react-native-animatable';
import {Button, Text, FAB} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import {launchImageLibrary} from 'react-native-image-picker';
import {QRreader} from 'react-native-qr-decode-image-camera';
import ActionSheet, {
  useSheetPayload,
  SheetManager,
} from 'react-native-actions-sheet';
import {styles} from '../../helpers/styles';

// View
import {ScrollView} from 'react-native-gesture-handler';

const options = {
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
  mediaType: 'photo',
  quality: 0.99,
  pauseAfterCapture: true,
  doNotSave: true,
  fixOrientation: true,
  forceUpOrientation: true,
  isVertical: true,
  rotation: 360,
};

export default QrCodeView = () => {
  const {sheetName, navigation, title, courier} = useSheetPayload('payload');
  const {t} = useTranslation();
  const {
    isURL,
    height,
    errorMessage,
    fontSize,
    hp,
  } = require('../../helpers/globalFunction');
  const setting = useSelector(state => state.setting);
  const [spinner, setSpinner] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);

  useEffect(() => {
    if (!courier) {
      SheetManager.hide(sheetName);
      navigation.navigate('Guest');
      errorMessage('ETrackings', t('message.somethingWentWrong'));
    }
  });

  onReadData = e => {
    try {
      if (isURL(e.data)) {
        Linking.openURL(e.data);
      } else {
        SheetManager.hide(sheetName);
        navigation.navigate('TrackDetail', {
          courier: courier.key || 'auto_detect',
          trackingNumber: e.data,
          isTrackingSearch: true,
        });
      }
    } catch {
      errorMessage('ETrackings', t('message.somethingWentWrong'));
      SheetManager.hide(sheetName);
    }
  };

  onFlash = async () => {
    await setIsFlashOn(!isFlashOn);
  };

  openImagePicker = async () => {
    setSpinner(true);
    launchImageLibrary(options, async response => {
      if (response.assets.length != 0) {
        let path = response.assets[0].uri;

        QRreader(path)
          .then(trackingNumber => {
            SheetManager.hide(sheetName);
            navigation.navigate('TrackDetail', {
              courier: courier.key || 'auto_detect',
              trackingNumber: trackingNumber,
              isTrackingSearch: true,
            });
            setSpinner(false);
          })
          .catch(() => {
            errorMessage('ETrackings', t('message.somethingWentWrong'));
            setSpinner(false);
          });
      } else {
        setSpinner(false);
      }
    });
  };

  return (
    <ActionSheet
      gestureEnabled
      bounceOnOpen
      closable={true}
      containerStyle={{backgroundColor: setting.cardColor}}
      onClose={() => {
        SheetManager.hide(sheetName);
      }}>
      <ScrollView
        style={{
          padding: 10,
          backgroundColor: setting.cardColor,
        }}>
        <Animatable.View
          animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
          delay={setting?.animation == 'normal' ? 100 : 50 * 1}>
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
        </Animatable.View>

        <Animatable.View
          animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
          delay={setting?.animation == 'normal' ? 100 : 50 * 2}>
          <Text
            theme={{
              dark: setting.isDarkMode,
              colors: {text: setting.textColor},
            }}
            allowFontScaling={false}
            style={{
              alignContent: 'center',
              fontFamily: 'Kanit-Light',
              fontSize: fontSize(16),
              paddingTop: hp(0.5),
              paddingLeft: hp(1),
            }}>
            {setting.isLanguageTH ? courier?.nameTH : courier?.nameEN}
          </Text>
        </Animatable.View>
        <QRCodeScanner
          containerStyle={{zIndex: 0}}
          showMarker={true}
          markerStyle={{
            borderColor: '#fff',
            borderRadius: 25,
            borderStyle: 'dotted',
            justifyContent: 'center',
          }}
          onRead={e => onReadData(e)}
          flashMode={
            isFlashOn
              ? RNCamera.Constants.FlashMode.torch
              : RNCamera.Constants.FlashMode.off
          }
          topViewStyle={{flex: 0}}
          cameraStyle={{
            backgroundColor: '#474747',
            height: height() / 1.7,
            width: '100%',
            zIndex: 0,
          }}
        />

        <FAB
          color={'#FFFFFF'}
          style={styles.fabQRCode}
          icon={'image'}
          onPress={() => openImagePicker()}
        />
      </ScrollView>
    </ActionSheet>
  );
};
