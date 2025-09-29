import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  configureFonts,
  DefaultTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import NavigatorView from './navigators/navigatorView';
import FlashMessage from 'react-native-flash-message';
import { Provider } from 'react-redux';
import { hasDynamicIsland } from 'react-native-device-info';
import { registerSheet, SheetProvider } from 'react-native-actions-sheet';
import { store } from '../store';

// Sheet
import NoInternetConnectedView from '../components/errors/noInternetConnectedView';
import pleaseLoginView from '../components/errors/pleaseLoginView';
import ServerErrorView from '../components/errors/serverErrorView';
import systemMaintenanceView from '../components/errors/systemMaintenanceView';
import updatedAppView from '../components/errors/updatedAppView';
import ActionSheetRemoveAdsView from '../components/actionSheet/actionSheetRemoveAdsView';
import ActionSheetInputView from '../components/actionSheet/actionSheetInputView';
import ActionSheetInputWithSelectCourierView from '../components/actionSheet/actionSheetInputWithSelectCourierView';
import ActionSheetTrackInfoView from '../components/actionSheet/actionSheetTrackInfoView';
import QRCodeView from '../components/scanner/qrcodeView';
import { fontSize } from '../helpers/globalFunction';

registerSheet('NoInternetConnected', NoInternetConnectedView);
registerSheet('PleaseLogin', pleaseLoginView);
registerSheet('ServerError', ServerErrorView);
registerSheet('SystemMaintenance', systemMaintenanceView);
registerSheet('UpdatedApp', updatedAppView);
registerSheet('RemoveAds', ActionSheetRemoveAdsView);
registerSheet('InputView', ActionSheetInputView);
registerSheet(
  'InputWithSelectCourierView',
  ActionSheetInputWithSelectCourierView,
);
registerSheet('TrackInfoView', ActionSheetTrackInfoView);
registerSheet('QRCode', QRCodeView);

const fontConfig = {
  android: {
    regular: {
      fontFamily: 'Kanit-Light',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Kanit-Light',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'Kanit-Light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'Kanit-Light',
      fontWeight: 'normal',
    },
  },
  ios: {
    regular: {
      fontFamily: 'Kanit-Light',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Kanit-Light',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'Kanit-Light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'Kanit-Light',
      fontWeight: 'normal',
    },
  },
  web: {
    regular: {
      fontFamily: 'Kanit-Light',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Kanit-Light',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'Kanit-Light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'Kanit-Light',
      fontWeight: 'normal',
    },
  },
};

const theme = {
  ...DefaultTheme,
  roundness: 12,
  textProps: {
    allowFontScaling: false,
  },
  colors: {
    ...DefaultTheme.colors,
    placeholder: 'gray',
    text: '#FFF',
    primary: '#03DAC6',
    accent: '#00E2BB',
    underlineColor: 'transparent',
  },
  dark: false,
  fonts: configureFonts(fontConfig),
};

function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView
        style={{
          flex: 1,
        }}
      >
        <Provider store={store}>
          <PaperProvider theme={theme}>
            <SheetProvider context="global">
              <NavigatorView />
              <FlashMessage
                hideStatusBar={false}
                statusBarHeight={
                  hasDynamicIsland() ? 50 : StatusBar.currentHeight
                }
                position={'top'}
                titleStyle={{ fontSize: fontSize(13) }}
              />
            </SheetProvider>
          </PaperProvider>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;
