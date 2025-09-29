import EncryptedStorage from 'react-native-encrypted-storage';
import { Dimensions, PixelRatio, Platform, NativeModules } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import Share from 'react-native-share';
import _ from 'lodash';
import { isTablet } from 'react-native-device-info';
import {
  HOST_BACKUP,
  ON_KEEP,
  ON_PICKED_UP,
  ON_DELIVERED,
  ON_UNABLE_TO_SEND,
  ON_RETURNED_TO_SENDER,
} from '../components/actions/constants';
import InAppReview from 'react-native-in-app-review';
import email from 'react-native-email';
import jwt_decode from 'jwt-decode';
import Clipboard from '@react-native-community/clipboard';
import i18next from 'i18next';
import validator from 'validator';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const THIRTY_MINUTES = 30 * 60 * 1000;

export async function encryptedStorageGetItem(key) {
  try {
    let data = await EncryptedStorage.getItem(key);
    if (data === undefined) {
      return null;
    } else {
      return data;
    }
  } catch (error) {
    console.log(`Encrypted Storage GetItem Error => ${key} : ${error.message}`);
  }
}

export async function encryptedStorageSetItem(key, item) {
  try {
    await EncryptedStorage.setItem(key, item);
  } catch (error) {
    console.log(`Encrypted Storage SetItem Error => ${key} : ${error.message}`);
  }
}

export async function encryptedStorageRemoveItem(key) {
  try {
    await EncryptedStorage.removeItem(key);
  } catch (error) {
    console.log(
      `Encrypted Storage RemoveItem Error => ${key} : ${error.message}`,
    );
  }
}

export async function encryptedStorageClearStorage() {
  try {
    await EncryptedStorage.clear();
  } catch (error) {
    console.log(`Encrypted Storage Clear Storage Error: ${error.message}`);
  }
}

export function fontSize(size = 10) {
  if (isIpad()) {
    return size * 1.35;
  } else {
    return size * 1.3;
  }
}

export async function getUserData() {
  return JSON.parse(await encryptedStorageGetItem('user'));
}

export function isLogin(currentUser) {
  return currentUser !== null;
}

export function isDisplayAds(data) {
  return isShowAds(data?.user ? data?.user : data?.guest);
}

export function isShowAds(currentUser) {
  if (!currentUser) return true;
  if (currentUser === null || Object.keys(currentUser).length === 0) {
    return true;
  } else {
    return currentUser?.isNoAds === false;
  }
}

export function successMessage(message, description) {
  showMessage({
    message: message,
    description: description,
    type: 'default',
    backgroundColor: '#0BBB60',
    textStyle: {
      fontFamily: 'Kanit-Light',
    },
    titleStyle: {
      fontFamily: 'Kanit-Light',
    },
    color: '#FFF',
    duration: 3000,
  });
}

export function errorMessage(message, description) {
  showMessage({
    message: message,
    description: description,
    type: 'default',
    backgroundColor: '#F60645',
    textStyle: {
      fontFamily: 'Kanit-Light',
    },
    titleStyle: {
      fontFamily: 'Kanit-Light',
    },
    color: '#FFF',
    duration: 3000,
  });
}

export function infoMessage(message, description) {
  showMessage({
    message: message,
    description: description,
    type: 'default',
    backgroundColor: '#006FF6',
    textStyle: {
      fontFamily: 'Kanit-Light',
    },
    titleStyle: {
      fontFamily: 'Kanit-Light',
    },
    color: '#FFF',
    duration: 3000,
  });
}

export function warningMessage(message, description) {
  showMessage({
    message: message,
    description: description,
    type: 'default',
    backgroundColor: '#FBA220',
    textStyle: {
      fontFamily: 'Kanit-Light',
    },
    titleStyle: {
      fontFamily: 'Kanit-Light',
    },
    color: '#FFF',
    duration: 3000,
  });
}

export function camelize(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
      return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/\./g, '');
}

export function validateEmail(val) {
  return !validator.isEmail(val) && val != '';
}

export function validatePhoneNumber(phoneNumber) {
  return phoneNumber.length < 10 && phoneNumber !== '';
}

export function validatePostcode(postcode) {
  return postcode?.length < 5 || postcode === '';
}

export function validatePasswordLessThanEight(password) {
  return password.length < 8 && password !== '';
}

export function validatePasswordMatch(password, confirmPassword) {
  return password !== confirmPassword && confirmPassword !== '';
}

export function validateBlank(value) {
  return value === '';
}

export function validatePasswordFormat(password) {
  return !password.match(/(?=.*\d)(?=.*[A-Z])(?=.*\W)[^ ]{8,}/gi);
}

export function strToDate(dateStr) {
  let date = dateStr.split('/');
  let day = date[1];
  let month = date[0];
  let year = date[2];
  return new Date(day + '/' + month + '/' + year) || new Date();
}

export function dateToStr(date) {
  let month = date.getMonth() + 1;
  return date.getDate() + '/' + month + '/' + date.getFullYear();
}

export function uniq(datas) {
  return Array.from(new Set(datas));
}

export function unique(arr, comp) {
  return arr
    .map(e => e[comp])
    .map((e, i, final) => final.indexOf(e) === i && i)
    .filter(e => arr[e])
    .map(e => arr[e]);
}

export function sortByDate(datas, asc = false) {
  datas = unique(datas, 'id');

  return datas.sort(function compare(a, b) {
    let dateA = new Date(a.created_at);
    let dateB = new Date(b.created_at);

    return asc ? dateA - dateB : dateB - dateA;
  });
}

export const wp = widthPercent => {
  const elemWidth =
    typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);

  return PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
};

export const hp = heightPercent => {
  const elemHeight =
    typeof heightPercent === 'number'
      ? heightPercent
      : parseFloat(heightPercent);

  return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
};

export const hex2rgba = (hex, alpha = 1) => {
  const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
};

export const shareTracking = async (title, url) => {
  const options = Platform.select({
    default: {
      title,
      subject: title,
      message: url,
    },
  });

  await Share.open(options);
};

export const reviewApp = async () => {
  let isReviewer = JSON.parse(await encryptedStorageGetItem('isReviewer'));
  let isAvailable = InAppReview.isAvailable();
  if (isAvailable && !isReviewer) {
    await encryptedStorageSetItem('isReviewer', 'true');
    InAppReview.RequestInAppReview();
  }
};

export const os = () => {
  return Platform.OS;
};

export const isIpad = () => {
  return isTablet();
};

export const isIos = () => {
  return Platform.OS === 'ios';
};

export const isAndroid = () => {
  return Platform.OS === 'android';
};

export const isPortrait = () => {
  const dim = Dimensions.get('screen');
  return dim.height >= dim.width;
};

export const isLandscape = () => {
  const dim = Dimensions.get('screen');
  return dim.width >= dim.height;
};

export const width = () => {
  return screenWidth;
};

export const height = () => {
  return screenHeight;
};

export const isURL = string => {
  let regex =
    /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

  return regex.test(string);
};

export const formatPhoneNumber = phoneNumberString => {
  let cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `+66 ${match[1].substring(1)} ${match[2]} ${match[3]}`;
  }
  return '';
};

export const phoneNumberOnly = phoneNumberString => {
  let match = phoneNumberString.match(
    /[+0-9]{3,5}\s*([0-9]{2})\s*([0-9]{3})\s*([0-9]{4})/,
  );

  if (match) {
    return `0${match[1]}${match[2]}${match[3]}`;
  }
  return '';
};

export const camelCase = str => {
  return _.camelCase(str);
};

export const isPresent = value => {
  return (
    value != null &&
    value !== '' &&
    value.length != 0 &&
    value != undefined &&
    value != 0
  );
};

export const isAnimationNormal = value => {
  return value === 'normal';
};

export const isOpenAnimation = value => {
  return value !== 'close';
};

export const animationSpeed = (value, plus = 1) => {
  return isAnimationNormal(value) ? 100 * plus : 50 * plus;
};

export const animationFadeInUp = value => {
  return isOpenAnimation(value) ? 'fadeInUp' : '';
};

export const getImageWithColor = (status, setting, isTimeline = false) => {
  let theme = setting.isDarkMode ? 'light' : 'dark';
  let imageURL = '';
  let color = '';

  switch (status.toUpperCase()) {
    case ON_KEEP:
      imageURL = `${HOST_BACKUP}/waiting-${theme}.png`;
      color = '#368CF4';
      break;
    case ON_PICKED_UP:
      imageURL = `${HOST_BACKUP}/pick-up-${theme}.png`;
      color = '#368CF4';
      break;
    case ON_DELIVERED:
      imageURL = `${HOST_BACKUP}/artboard-${theme}.png`;
      color = '#08dcc1';
      break;
    case ON_UNABLE_TO_SEND:
      imageURL = `${HOST_BACKUP}/unable-send-parcel-${theme}.png`;
      color = '#FF332D';
      break;
    case ON_RETURNED_TO_SENDER:
      imageURL = `${HOST_BACKUP}/returned-to-sender-${theme}.png`;
      color = '#FFA726';
      break;
    default:
      imageURL = `${HOST_BACKUP}/logistics-truck-${theme}.png`;
      color = '#FFD839';
      break;
  }

  return isTimeline
    ? { lineColor: color, circleColor: color }
    : { imageURL: imageURL, color: color };
};

export const getImageAndColor = (status, setting) => {
  let theme = setting.isDarkMode ? 'light' : 'dark';

  switch (status.toUpperCase()) {
    case ON_KEEP:
      return {
        imageURL: `${HOST_BACKUP}/waiting-${theme}.png`,
        color: setting.pickedUpColor,
      };
    case ON_PICKED_UP:
      return {
        imageURL: `${HOST_BACKUP}/pick-up-${theme}.png`,
        color: setting.pickedUpColor,
      };
    case ON_DELIVERED:
      return {
        imageURL: `${HOST_BACKUP}/artboard-${theme}.png`,
        color: setting.deliveredColor,
      };
    case ON_UNABLE_TO_SEND:
      return {
        imageURL: `${HOST_BACKUP}/unable-send-parcel-${theme}.png`,
        color: setting.unableSendParcelColor,
      };
    case ON_RETURNED_TO_SENDER:
      return {
        imageURL: `${HOST_BACKUP}/returned-to-sender-${theme}.png`,
        color: setting.returnedToSenderColor,
      };
      break;
    default:
      return {
        imageURL: `${HOST_BACKUP}/logistics-truck-${theme}.png`,
        color: setting.inDeliveredColor,
      };
  }
};

export const adBottomWithBtn = () => {
  return isAndroid() ? 60.4 : 45.4;
};

export const adBottom = () => {
  return 20;
};

export const isOdd = num => {
  return num % 2;
};

export const sendEmail = (to, subject, body) => {
  email(to, {
    cc: ['etracking.th@gmail.com'],
    bcc: 'etracking.th@gmail.com',
    subject: subject,
    body: body,
  }).catch(e => console.log('Send email err -> ', e));
};

export const currencyFormat = num => {
  return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

export const addressFormat = (key, data, isWithLineNumber = false) => {
  let address = '';
  let line = 0;
  if (isPresent(data[`${key}City`])) {
    line += 1;
    address = address == '' ? data[`${key}City`] : '';
  }

  if (isPresent(data[`${key}Province`])) {
    line += 1;
    address +=
      address == ''
        ? data[`${key}Province`]
        : `${isWithLineNumber ? '\n' : ','} ${data[`${key}Province`]}`;
  }

  if (isPresent(data[`${key}Country`])) {
    line += 1;
    address +=
      address == ''
        ? data[`${key}Country`]
        : ` ${isWithLineNumber ? '\n' : '-'} ${data[`${key}Country`]}`;
  }

  if (isWithLineNumber) {
    let obj = {};
    obj[`${key}Address`] = address;
    obj[`${key}Line`] = line;

    return obj;
  } else {
    return address;
  }
};

export const decodeJWT = jwtStr => {
  return jwt_decode(jwtStr);
};

export const copyToClipboard = (
  text,
  flashMessage = 'message.copyDataToClipboard',
) => {
  if (flashMessage) infoMessage('ETrackings', i18next.t(flashMessage));
  Clipboard.setString(text);
};

export const accountType = user => {
  let accountTypeStr = i18next.t('text.free');
  if (user?.isPremium) {
    accountTypeStr = i18next.t('text.premium');
  } else if (user?.isNoAds) {
    accountTypeStr = i18next.t('text.noAds');
  }

  if (user?.productId) {
    accountTypeStr = i18next.t(`text.${user?.productId}`);
  }

  return accountTypeStr;
};

export const isBeforeDate = (dateA, dateB) => dateA <= dateB;

export const getPlatformLanguage = () => {
  const locale = Platform.select({
    ios: () =>
      NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0],
    default: () => NativeModules.I18nManager.localeIdentifier,
  })();

  return locale.replace('-', '_').split('_')[0];
};

export async function canShowInterstitialAd() {
  try {
    const now = Date.now();
    const lastShownStr = await EncryptedStorage.getItem('lastInterstitialTime');
    const lastShown = parseInt(lastShownStr ?? '0', 10);

    if (now - lastShown >= THIRTY_MINUTES) {
      await EncryptedStorage.setItem('lastInterstitialTime', String(now));
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking interstitial ad time:', error);
    return true;
  }
}
