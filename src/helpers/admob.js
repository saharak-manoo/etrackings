import {Platform} from 'react-native';

export const admobKey = {
  banner: Platform.select({
    ios: 'ca-app-pub-3054848166657614/5942433180',
    android: 'ca-app-pub-3054848166657614/4115998584',
  }),
  interstitial: Platform.select({
    ios: 'ca-app-pub-3054848166657614/8793610197',
    android: 'ca-app-pub-3054848166657614/5237508560',
  }),
  appOpen: Platform.select({
    ios: 'ca-app-pub-3054848166657614/6690391966',
    android: 'ca-app-pub-3054848166657614/2751146954',
  }),
  test: 'ca-app-pub-3940256099942544/6300978111',
  interstitialTest: 'ca-app-pub-3940256099942544/1033173712',
};
