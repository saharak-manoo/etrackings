/**
 * @format
 */

import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './src/components/app';
import messaging from '@react-native-firebase/messaging';
import { name as appName } from './app.json';
import './src/helpers/i18n';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => gestureHandlerRootHOC(App));
