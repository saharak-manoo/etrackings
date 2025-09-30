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

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface Headers {
  [key: string]: string;
}

const joinURL = (host: string, path: string): string => {
  if (host.endsWith('/')) {
    if (path.startsWith('/')) path = path.slice(1);
  } else if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return encodeURI(host + path);
};

const createFormData = (
  photo: { fileName?: string; type: string; uri: string },
  body: Record<string, any>,
): FormData => {
  const data = new FormData();

  data.append('photo', {
    name: photo.fileName || 'photo',
    type: photo.type,
    uri:
      Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
  } as any);

  Object.entries(body).forEach(([key, value]) => {
    data.append(key, value);
  });

  return data;
};

export async function setHeaders(
  token: string | null = null,
): Promise<Headers> {
  const headers: Headers = {
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

  console.log('token -> ', token);

  if (token) headers.Authorization = `Bearer ${token}`;

  console.log('headers -> ', headers);
  return headers;
}

export async function callAPI<T>(
  method: HttpMethod,
  path: string,
  params: Record<string, any> = {},
  token: string | null = null,
  isBackup = false,
): Promise<ApiResponse | Response | Error> {
  try {
    const headers = await setHeaders(token);
    const request: RequestInit = {
      method,
      headers,
      body:
        method === 'GET' || method === 'DELETE'
          ? undefined
          : JSON.stringify(params),
    };

    const host = isBackup ? HOST_BACKUP : HOST;
    const response = await fetch(joinURL(host, path), request);

    if (HTTP_STATUSES.includes(response.status)) {
      return await response.json();
    }
    return response;
  } catch (err: any) {
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
        return await callAPI<T>(method, path, params, token, true);
      }
    } else {
      errorMessage('ETrackings', i18next.t('message.somethingWentWrong'));
    }
    console.warn('[Call API Error] -> ', err);
    return err;
  }
}

export async function callFormDataAPI<T>(
  method: HttpMethod,
  path: string,
  params: FormData,
  token: string | null = null,
  isBackup = false,
): Promise<T | Response | Error> {
  try {
    const request: RequestInit = {
      method,
      headers: await setHeaders(token),
      body: params,
    };

    const host = isBackup ? HOST_BACKUP : HOST;
    const response = await fetch(joinURL(host, path), request);

    if (HTTP_STATUSES.includes(response.status)) {
      return await response.json();
    }
    return response;
  } catch (err: any) {
    if (err.message === 'Network request failed') {
      if (isBackup) {
        errorMessage('ETrackings', i18next.t('message.internetLost'));
      } else {
        console.warn('[Use API backup]');
        return await callFormDataAPI<T>(method, path, params, token, true);
      }
    } else {
      errorMessage('ETrackings', i18next.t('message.somethingWentWrong'));
    }
    console.warn('[Call Form data API Error] -> ', err);
    return err;
  }
}

export async function getAppVersion() {
  return callAPI('GET', APP_VERSION_PATH);
}

export async function signIn(params: Record<string, any>) {
  return callAPI('POST', SIGN_IN_PATH, params);
}

export async function signUp(params: Record<string, any>) {
  return callAPI('POST', SIGN_UP_PATH, params);
}

export async function forgotPassword(params: Record<string, any>) {
  return callAPI('POST', RESET_PASSWORD_PATH, params);
}

export async function reConfirmEmail(params: Record<string, any>) {
  return callAPI('POST', RE_CONFIRM_EMAIL_PATH, params);
}

export async function signOut(token: string) {
  return callAPI('DELETE', SIGN_OUT_PATH, {}, token);
}

export async function trackHistories(
  token: string,
  limit: number,
  keyword = '',
  status = 'all',
  isHideOnDelivered = false,
  isHideReturnedToSender = false,
  menu = 'trackHistoryOnly',
) {
  const query = new URLSearchParams({
    keyword,
    limit: limit.toString(),
    status,
    isHideOnDelivered: isHideOnDelivered.toString(),
    isHideReturnedToSender: isHideReturnedToSender.toString(),
    menu,
  }).toString();

  return callAPI('GET', `${TRACK_HISTORIES_PATH}?${query}`, {}, token);
}

export async function tracking(token: string, params: Record<string, any>) {
  return callAPI('POST', TRACKING_SEARCH_PATH, params, token);
}

export async function keepTracking(
  token: string,
  courierKey: string,
  params: Record<string, any>,
) {
  return callAPI(
    'POST',
    `${KEEP_TRACK_HISTORIES_PATH}?courierName=${courierKey}`,
    params,
    token,
  );
}

export async function guestTracking(params: Record<string, any>) {
  return callAPI('POST', GUEST_TRACKING_SEARCH_PATH, params);
}

export async function courier() {
  return callAPI('GET', COURIERS_PATH);
}

export async function notifications(
  token: string,
  limit: number,
  keyword = '',
) {
  const query = new URLSearchParams({
    limit: limit.toString(),
    keyword,
  }).toString();
  return callAPI('GET', `${NOTIFICATIONS_PATH}?${query}`, {}, token);
}

export async function profile(token: string) {
  return callAPI('GET', PROFILE_PATH, {}, token);
}

export async function signInWith(params: Record<string, any>) {
  return callAPI('POST', SIGN_IN_WITH_PATH, params);
}

export async function checkPhoneNumber(
  token: string,
  params: Record<string, any>,
) {
  return callAPI('POST', CHECK_PHONE_NUMBER_PATH, params, token);
}

export async function updateUser(token: string, params: Record<string, any>) {
  return callAPI('PUT', UPDATE_USER_PATH, params, token);
}

export async function linkSigninWith(
  token: string,
  isLink: boolean,
  params: Record<string, any>,
) {
  return callAPI(
    'POST',
    `${SIGN_IN_WITH_LINK_PATH}?isLink=${isLink}`,
    params,
    token,
  );
}

export async function saveDeviceFirebaseToken(fcmToken: string) {
  return callAPI('POST', USER_DEVICES_GUEST_PATH, { token: fcmToken });
}

export async function saveUserDeviceFirebaseToken(
  token: string,
  fcmToken: string,
) {
  return callAPI('POST', DEVICES_PATH, { token: fcmToken }, token);
}

export async function deleteTracking(token: string, id: string) {
  return callAPI(
    'DELETE',
    DELETE_TRACK_HISTORIES_PATH.replace(':id', id),
    {},
    token,
  );
}

export async function deleteTrackingNotification(token: string, id: string) {
  return callAPI(
    'DELETE',
    DELETE_NOTIFICATIONS_PATH.replace(':id', id),
    {},
    token,
  );
}

export async function stores(
  token: string,
  latitude: number,
  longitude: number,
) {
  return callAPI(
    'GET',
    `${STORES_PATH}?latitude=${latitude}&longitude=${longitude}`,
    {},
    token,
  );
}

export async function storesByCourier(
  token: string,
  courierKey: string,
  latitude: number,
  longitude: number,
) {
  return callAPI(
    'GET',
    `${STORES_BY_COURIER_PATH.replace(':courier', courierKey)}?latitude=${latitude}&longitude=${longitude}`,
    {},
    token,
  );
}

export async function addresses(limit: number, keyword = '') {
  const query = new URLSearchParams({
    keyword,
    limit: limit.toString(),
  }).toString();
  return callAPI('GET', `${ADDRESSES_PATH}?${query}`);
}

export async function checkPrice(params: Record<string, any>) {
  return callAPI('POST', CHECK_PRICES_PATH, params);
}

export async function checkPriceSizes() {
  return callAPI('GET', CHECK_PRICE_SIZES_PATH);
}

export async function trackOcr(
  token: string,
  courierName: string,
  photo: { fileName?: string; type: string; uri: string },
) {
  return callFormDataAPI(
    'POST',
    TRACK_OCRS_PATH,
    createFormData(photo, { courierName }),
    token,
  );
}

export async function updateTracking(
  token: string,
  id: string,
  params: Record<string, any>,
) {
  return callAPI(
    'PUT',
    UPDATE_TRACK_HISTORIES_PATH.replace(':id', id),
    params,
    token,
  );
}

export async function upToPremium(
  token: string,
  price: number,
  transactionId: string,
) {
  return callAPI(
    'PUT',
    PREMIUM_PATH,
    { transactionID: transactionId, price },
    token,
  );
}

export async function upToNoAds(
  token: string,
  price: number,
  transactionId: string,
) {
  return callAPI(
    'PUT',
    NO_ADS_PATH,
    { transactionID: transactionId, price },
    token,
  );
}

export async function devices(token: string) {
  return callAPI('GET', DEVICES_PATH, {}, token);
}

export async function deleteDevice(token: string, deviceId: string) {
  return callAPI(
    'DELETE',
    DELETE_DEVICE_PATH.replace(':id', deviceId),
    {},
    token,
  );
}

export async function systemMaintenance() {
  return callAPI('GET', SYSTEM_MAINTENANCE_PATH, {});
}

export async function deleteAllTrackHistories(token: string) {
  return callAPI('DELETE', DELETE_ALL_TRACK_HISTORIES_PATH, {}, token);
}

export async function deleteAllNotifications(token: string) {
  return callAPI('DELETE', DELETE_ALL_NOTIFICATIONS_PATH, {}, token);
}

export async function appNotifications(token: string) {
  return callAPI('GET', APP_NOTIFICATIONS_PATH, {}, token);
}

export async function purchase(token: string, params: FormData) {
  return callFormDataAPI('POST', IAP_PURCHASE_PATH, params, token);
}

export async function validateReceiptAndroid(params: FormData) {
  return callFormDataAPI('POST', IAP_VALIDATE_RECEIPT_ANDROID_PATH, params);
}

export async function validateReceiptIos(params: FormData) {
  return callFormDataAPI('POST', IAP_VALIDATE_RECEIPT_IOS_PATH, params);
}

export async function deletedUser(token: string) {
  return callAPI('DELETE', DELETE_USER_PATH, {}, token);
}
