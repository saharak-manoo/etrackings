import React from 'react';
import { Linking, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { styles } from '../../helpers/styles';
import FastImage from '@d11/react-native-fast-image';
import { Text } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
// import RNExitApp from 'react-native-exit-app';
import Ripple from 'react-native-material-ripple';
import ActionSheet, {
  SheetManager,
  useSheetPayload,
} from 'react-native-actions-sheet';
import { CommonActions } from '@react-navigation/native';
import { etrackingAppStore, etrackingPlayStore } from '../../../app.json';
import { SYSTEM_MAINTENANCE_URL } from '../actions/constants';

export default SystemMaintenanceView = () => {
  const { sheetName, navigation } = useSheetPayload('payload');
  // redux
  const {
    isIos,
    isIpad,
    fontSize,
    hp,
    width,
  } = require('../../helpers/globalFunction');
  const { t } = useTranslation();
  const setting = useSelector(state => state.setting);

  openLink = async url => Linking.openURL(url);

  return (
    <ActionSheet
      gestureEnabled
      bounceOnOpen
      closable={false}
      containerStyle={{ backgroundColor: setting.cardColor }}
      onClose={() => {
        SheetManager.hide(sheetName);
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1 }}>
          <Animatable.View
            animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
            delay={setting?.animation == 'normal' ? 100 : 50 * 1}
          >
            <FastImage
              resizeMode={FastImage.resizeMode.contain}
              style={styles.imageSystemMaintenance}
              source={{ uri: SYSTEM_MAINTENANCE_URL }}
            />
          </Animatable.View>
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <Animatable.View
            animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
            delay={setting?.animation == 'normal' ? 100 : 50 * 5}
          >
            <Text
              theme={{
                dark: setting.isDarkMode,
                colors: { text: setting.textColor },
              }}
              allowFontScaling={false}
              style={{
                textAlign: 'center',
                fontFamily: 'Kanit-Light',
                fontSize: fontSize(12),
                alignSelf: 'center',
                paddingTop: hp(0.5),
                paddingLeft: hp(2),
                paddingRight: hp(2),
              }}
            >
              {t('placeholder.systemMaintenance')}
            </Text>
          </Animatable.View>

          <Animatable.View
            animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
            delay={setting?.animation == 'normal' ? 100 : 50 * 6}
          >
            <Ripple
              rippleDuration={setting?.animation == 'normal' ? 600 : 450}
              style={[
                styles.buttonLoginWith,
                {
                  borderWidth: 2,
                  borderColor: '#1dd793',
                  backgroundColor: '#1dd793',
                  flexDirection: 'row',
                  borderRadius: 8,
                  height: 50,
                  marginTop: 20,
                  width: isIpad() ? width() / 3.2 : width() / 1.2,
                },
              ]}
              onPress={async () => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Logo' }],
                  }),
                );
                SheetManager.hide(sheetName);
              }}
            >
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    color: '#000',
                    fontSize: fontSize(12),
                    fontFamily: 'Kanit-Light',
                  }}
                >
                  {t('button.reConnect')}
                </Text>
              </View>
            </Ripple>
          </Animatable.View>

          <Animatable.View
            animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
            delay={setting?.animation == 'normal' ? 100 : 50 * 7}
          >
            <Ripple
              rippleDuration={setting?.animation == 'normal' ? 600 : 450}
              style={[
                styles.buttonLoginWith,
                {
                  borderWidth: 2,
                  borderColor: '#f9b245',
                  backgroundColor: '#f9b245',
                  flexDirection: 'row',
                  borderRadius: 8,
                  height: 50,
                  marginTop: 20,
                  width: isIpad() ? width() / 3.2 : width() / 1.2,
                },
              ]}
              onPress={() => {
                openLink(isIos() ? etrackingAppStore : etrackingPlayStore);
              }}
            >
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    color: '#000',
                    fontSize: fontSize(12),
                    fontFamily: 'Kanit-Light',
                  }}
                >
                  {t('button.update')}
                </Text>
              </View>
            </Ripple>
          </Animatable.View>

          <Animatable.View
            animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
            delay={setting?.animation == 'normal' ? 100 : 50 * 8}
          >
            <Ripple
              rippleDuration={setting?.animation == 'normal' ? 600 : 450}
              style={[
                styles.buttonLoginWith,
                {
                  borderWidth: 2,
                  borderColor: '#000',
                  backgroundColor: '#000',
                  flexDirection: 'row',
                  borderRadius: 8,
                  height: 50,
                  marginTop: 20,
                  width: isIpad() ? width() / 3.2 : width() / 1.2,
                },
              ]}
              // onPress={() => RNExitApp.exitApp()}
            >
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    color: '#FFF',
                    fontSize: fontSize(12),
                    fontFamily: 'Kanit-Light',
                  }}
                >
                  {t('button.closeApp')}
                </Text>
              </View>
            </Ripple>
          </Animatable.View>
        </View>
      </ScrollView>
    </ActionSheet>
  );
};
