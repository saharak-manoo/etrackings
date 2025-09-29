import i18next from 'i18next';
import {
  HTTP_STATUSES,
  HOST,
  HOST_BACKUP,
  APP_VERSION_PATH,
  COURIERS_PATH,
  CHECK_PRICE_SIZES_PATH,
  USER_DEVICES_GUEST_PATH,
  CHECK_PRICES_PATH,
  GUEST_TRACKING_SEARCH_PATH,
  STORES_PATH,
  ADDRESSES_PATH,
  SIGN_IN_WITH_PATH,
  TRACK_HISTORIES_PATH,
  PROFILE_PATH,
  DEVICES_PATH,
  TRACKING_SEARCH_PATH,
  UPDATE_TRACK_HISTORIES_PATH,
  DELETE_TRACK_HISTORIES_PATH,
  UPDATE_USER_PATH,
  KEEP_TRACK_HISTORIES_PATH,
  NOTIFICATIONS_PATH,
  APP_NOTIFICATIONS_PATH,
  DELETE_NOTIFICATIONS_PATH,
  TRACK_OCRS_PATH,
  DELETE_DEVICE_PATH,
  CHECK_PHONE_NUMBER_PATH,
  PREMIUM_PATH,
  NO_ADS_PATH,
  SIGN_IN_WITH_LINK_PATH,
  SIGN_UP_PATH,
  SIGN_IN_PATH,
  SIGN_OUT_PATH,
  RESET_PASSWORD_PATH,
  RE_CONFIRM_EMAIL_PATH,
  SYSTEM_MAINTENANCE_PATH,
  DELETE_ALL_TRACK_HISTORIES_PATH,
  DELETE_ALL_NOTIFICATIONS_PATH,
  STORES_BY_COURIER_PATH,
  IAP_PURCHASE_PATH,
  IAP_VALIDATE_RECEIPT_ANDROID_PATH,
  IAP_VALIDATE_RECEIPT_IOS_PATH,
  DELETE_USER_PATH,
} from './constants';
import { Platform } from 'react-native';
import {
  getBuildNumber,
  getVersion,
  getDeviceId,
  getUniqueId,
  getBrand,
  getDeviceName,
} from 'react-native-device-info';
const { errorMessage } = require('../../helpers/globalFunction');
let warnedBackup = false;
let lastWarnTime = 0;

joinURL = (host, path) => {
  if (host.endsWith('/')) {
    if (path.startsWith('/')) {
      path = path.slice(1);
    }
  } else {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
  }

  return encodeURI(host + path);
};

createFormData = (photo, body) => {
  const data = new FormData();

  data.append('photo', {
    name: photo.fileName || 'photo',
    type: photo.type,
    uri:
      Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
  });

  Object.keys(body).forEach(key => {
    data.append(key, body[key]);
  });

  return data;
};

export async function setHeaders(token = null) {
  let headers = {
    Accept: 'application/json',
    'Accept-Language': i18next.language || 'th',
    'Content-Type': 'application/json',
    OS: Platform.OS,
    'ETrackings-app-version': getVersion(),
    'ETrackings-app-build-number': getBuildNumber(),
    'Device-brand': getBrand(),
    'Device-name': await getDeviceName(),
    'Device-id': getDeviceId(),
    'Device-unique-id': await getUniqueId(),
    'App-Api-Key': 'a1573902-59b1-4c14-97a6-a8947e78f4f3',
    'Etrackings-Key': 'ET-395256c6-d302-47ef-8a11-dac23f924f9e',
    e_platform: 'mobile',
    app: 'APP-API-ET',
  };

  if (token != null) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function callAPI(
  method,
  path,
  params = {},
  token = null,
  isBackup = false,
) {
  try {
    let headers = await setHeaders(token);
    let request = {
      method: method,
      headers: await setHeaders(token),
      body: JSON.stringify(params),
    };

    if (method === 'GET' || method === 'DELETE') delete request.body;

    let host = isBackup ? HOST_BACKUP : HOST;
    const resp = await fetch(joinURL(host, path), request);

    if (HTTP_STATUSES.includes(resp.status)) {
      return await resp.json();
    } else {
      return resp;
    }
  } catch (err) {
    if (err.message === 'Network request failed') {
      if (isBackup) {
        errorMessage('ETrackings', i18next.t('message.internetLost'));
      } else {
        const now = Date.now();
        if (!warnedBackup || now - lastWarnTime > 3000) {
          console.warn('[Use API backup]');
          warnedBackup = true;
          lastWarnTime = now;
        }
        return await callAPI(method, path, params, token, true);
      }
    } else {
      errorMessage('ETrackings', i18next.t('message.somethingWentWrong'));
    }
    console.warn('[Call API Error] -> ', err);

    return err;
  }
}

export async function callFormDataAPI(
  method,
  path,
  params = {},
  token = null,
  isBackup = false,
) {
  try {
    let request = {
      method: method,
      headers: await setHeaders(token),
      body: params,
    };

    let host = HOST;
    if (isBackup) {
      host = HOST_BACKUP;
    }

    const resp = await fetch(joinURL(host, path), request);
    if (HTTP_STATUSES.includes(resp.status)) {
      return await resp.json();
    } else {
      return resp;
    }
  } catch (err) {
    if (err.message === 'Network request failed') {
      if (isBackup) {
        errorMessage('ETrackings', i18next.t('message.internetLost'));
      } else {
        console.warn('[Use API backup]');
        return await callAPI(method, path, params, token, true);
      }
    } else {
      errorMessage('ETrackings', i18next.t('message.somethingWentWrong'));
    }

    console.warn('[Call Form data API Error] -> ', err);

    return err;
  }
}

export async function getAppVersion() {
  return this.callAPI('GET', APP_VERSION_PATH);
}

export async function signIn(params) {
  return this.callAPI('POST', SIGN_IN_PATH, params);
}

export async function signUp(params) {
  return this.callAPI('POST', SIGN_UP_PATH, params);
}

export async function forgotPassword(params) {
  return this.callAPI('POST', RESET_PASSWORD_PATH, params);
}

export async function reConfirmEmail(params) {
  return this.callAPI('POST', RE_CONFIRM_EMAIL_PATH, params);
}

export async function signOut(token) {
  return this.callAPI('DELETE', SIGN_OUT_PATH, {}, token);
}

export async function trackHistories(
  token,
  limit,
  keyword = '',
  status = 'all',
  isHideOnDelivered = false,
  isHideReturnedToSender = false,
  menu = 'trackHistoryOnly',
) {
  return this.callAPI(
    'GET',
    `${TRACK_HISTORIES_PATH}?keyword=${keyword}&limit=${limit}&status=${status}&isHideOnDelivered=${isHideOnDelivered}&isHideReturnedToSender=${isHideReturnedToSender}&menu=${menu}`,
    {},
    token,
  );
}

export async function tracking(token, params) {
  return await this.callAPI('POST', TRACKING_SEARCH_PATH, params, token);
}

export async function keepTracking(token, courierKey, params) {
  return this.callAPI(
    'POST',
    `${KEEP_TRACK_HISTORIES_PATH}?courierName=${courierKey}`,
    params,
    token,
  );
}

export async function guestTracking(params) {
  return this.callAPI('POST', GUEST_TRACKING_SEARCH_PATH, params);
}

export async function courier() {
  return this.callAPI('GET', COURIERS_PATH);
}

export async function notifications(token, limit, keyword = '') {
  return this.callAPI(
    'GET',
    `${NOTIFICATIONS_PATH}?limit=${limit}&keyword=${keyword}`,
    {},
    token,
  );
}

export async function profile(token) {
  return this.callAPI('GET', PROFILE_PATH, {}, token);
}

export async function signInWith(params) {
  return this.callAPI('POST', SIGN_IN_WITH_PATH, params);
}

export async function checkPhoneNumber(token, params) {
  return this.callAPI('POST', CHECK_PHONE_NUMBER_PATH, params, token);
}

export async function updateUser(token, params) {
  return this.callAPI('PUT', UPDATE_USER_PATH, params, token);
}

export async function linkSigninWith(token, isLink, params) {
  return this.callAPI(
    'POST',
    `${SIGN_IN_WITH_LINK_PATH}?isLink=${isLink}`,
    params,
    token,
  );
}

export async function saveDeviceFirebaseToken(fcmToken) {
  return this.callAPI('POST', USER_DEVICES_GUEST_PATH, {
    token: fcmToken,
  });
}

export async function saveUserDeviceFirebaseToken(token, fcmToken) {
  return this.callAPI(
    'POST',
    DEVICES_PATH,
    {
      token: fcmToken,
    },
    token,
  );
}

export async function deleteTracking(token, id) {
  return this.callAPI(
    'DELETE',
    DELETE_TRACK_HISTORIES_PATH.replace(':id', id),
    {},
    token,
  );
}

export async function deleteTrackingNotification(token, id) {
  return this.callAPI(
    'DELETE',
    DELETE_NOTIFICATIONS_PATH.replace(':id', id),
    {},
    token,
  );
}

export async function stores(token, latitude, longitude) {
  return this.callAPI(
    'GET',
    `${STORES_PATH}?latitude=${latitude}&longitude=${longitude}`,
    {},
    token,
  );
}

export async function storesByCourier(token, courierKey, latitude, longitude) {
  return this.callAPI(
    'GET',
    `${STORES_BY_COURIER_PATH.replace(
      ':courier',
      courierKey,
    )}?latitude=${latitude}&longitude=${longitude}`,
    {},
    token,
  );
}

export async function addresses(limit, keyword = '') {
  return this.callAPI(
    'GET',
    `${ADDRESSES_PATH}?keyword=${keyword}&limit=${limit}`,
  );
}

export async function checkPrice(params) {
  return this.callAPI('POST', CHECK_PRICES_PATH, params);
}

export async function checkPriceSizes() {
  return this.callAPI('GET', CHECK_PRICE_SIZES_PATH);
}

export async function trackOcr(token, courierName, photo) {
  return this.callFormDataAPI(
    'POST',
    TRACK_OCRS_PATH,
    createFormData(photo, { courierName: courierName }),
    token,
  );
}

export async function updateTracking(token, id, params) {
  return this.callAPI(
    'PUT',
    UPDATE_TRACK_HISTORIES_PATH.replace(':id', id),
    params,
    token,
  );
}

export async function upToPremium(token, price, transactionId) {
  return this.callAPI(
    'PUT',
    PREMIUM_PATH,
    { transactionID: transactionId, price: price },
    token,
  );
}

export async function upToNoAds(token, price, transactionId) {
  return this.callAPI(
    'PUT',
    NO_ADS_PATH,
    { transactionID: transactionId, price: price },
    token,
  );
}

export async function devices(token) {
  return this.callAPI('GET', DEVICES_PATH, {}, token);
}

export async function deleteDevice(token, deviceId) {
  return this.callAPI(
    'DELETE',
    DELETE_DEVICE_PATH.replace(':id', deviceId),
    {},
    token,
  );
}

export async function systemMaintenance() {
  return this.callAPI('GET', SYSTEM_MAINTENANCE_PATH, {});
}

export async function deleteAllTrackHistories(token) {
  return this.callAPI('DELETE', DELETE_ALL_TRACK_HISTORIES_PATH, {}, token);
}

export async function deleteAllNotifications(token) {
  return this.callAPI('DELETE', DELETE_ALL_NOTIFICATIONS_PATH, {}, token);
}

export async function appNotifications(token) {
  return this.callAPI('GET', `${APP_NOTIFICATIONS_PATH}`, {}, token);
}

export async function purchase(token, params) {
  return this.callFormDataAPI('POST', IAP_PURCHASE_PATH, params, token);
}

export async function validateReceiptAndroid(params) {
  return this.callFormDataAPI(
    'POST',
    IAP_VALIDATE_RECEIPT_ANDROID_PATH,
    params,
  );
}

export async function validateReceiptIos(params) {
  return this.callFormDataAPI('POST', IAP_VALIDATE_RECEIPT_IOS_PATH, params);
}

export async function deletedUser(token, deviceId) {
  return this.callAPI('DELETE', DELETE_USER_PATH, {}, token);
}
