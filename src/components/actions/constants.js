// image
export const LOGO_DARK_URL = 'https://fast.etrackings.com/app-logo-dark.png';
export const LOGO_LIGHT_URL = 'https://fast.etrackings.com/app-logo-light.png';
export const NO_WIFI_URL = 'https://fast.etrackings.com/no-wifi.png';
export const REMOVE_ADS_URL = 'https://fast.etrackings.com/remove-ads.png';
export const LOGIN_PAGE_URL = 'https://fast.etrackings.com/login.png';
export const SERVER_ERROR_URL = 'https://fast.etrackings.com/server-error.png';
export const SYSTEM_MAINTENANCE_URL =
  'https://fast.etrackings.com/system-maintenance.png';
export const APP_UPDATE_URL = 'https://fast.etrackings.com/update.png';
export const SEARCH_NOT_FOUND_URL =
  'https://fast.etrackings.com/search-not-found.png';
export const WAIT_PARCEL_URL = 'https://fast.etrackings.com/wait-parcel.png';

export const HTTP_STATUSES = [200, 201, 204, 400, 404];
export const HOST_PROD = 'https://api.etrackings.com';
export const HOST_DEV = 'http://192.168.0.115:9100';
export const HOST_BACKUP = 'https://fast.etrackings.com';
export const HOST = __DEV__ ? HOST_DEV : HOST_PROD;
export const ALL = 'ALL';
export const NOTE = 'NOTE';
export const FAVORITES = 'FAVORITES';
export const ON_KEEP = 'ON_KEEP';
export const ON_PICKED_UP = 'ON_PICKED_UP';
export const ON_SHIPPING = 'ON_SHIPPING';
export const ON_DELIVERED = 'ON_DELIVERED';
export const ON_UNABLE_TO_SEND = 'ON_UNABLE_TO_SEND';
export const ON_RETURNED_TO_SENDER = 'ON_RETURNED_TO_SENDER';
export const ON_OTHER_STATUS = 'ON_OTHER_STATUS';
export const RESET = 'RESET';
export const GUEST_REMOVED_ADS = 'GUEST_REMOVED_ADS';
export const SYSTEM_DARK_MODE = 'SYSTEM_DARK_MODE';
export const DARK_MODE = 'DARK_MODE';
export const LANGUAGE = 'LANGUAGE';
export const USER = 'USER';
export const COURIERS = 'COURIERS';
export const SEARCH_HISTORIES = 'SEARCH_HISTORIES';
export const LAST_STATUS = 'LAST_STATUS';
export const BIOMETRICS = 'BIOMETRICS';
export const COPIED_TEXT = 'COPIED_TEXT';
export const SHOW_COURIERS = 'SHOW_COURIERS';
export const SIZE_PARCEL = 'SIZE_PARCEL';
export const TRACKING_COUNT = 'TRACKING_COUNT';
export const LIMIT_TRACKING_HISTORIES = 'LIMIT_TRACKING_HISTORIES';
export const KEYWORD_TRACKING_HISTORIES = 'KEYWORD_TRACKING_HISTORIES';
export const ANIMATION = 'ANIMATION';
export const SELECT_COLOR = 'SELECT_COLOR';
export const GUEST = 'GUEST';
export const INITIAL_URL = 'INITIAL_URL';
export const STATUS = 'STATUS';
export const HAS_LAUNCHED = 'hasLaunched';
export const NEW_API = 'NEW_API';
export const SIGN_UP_PATH = '/app/api/v1/registrations/sign-up';
export const SIGN_IN_PATH = '/app/api/v1/sessions/sign-in';
export const SIGN_IN_WITH_PATH = '/app/api/v1/sessions/sign-in-with';
export const SIGN_IN_WITH_LINK_PATH = '/app/api/v1/users/sign-in-with/link';
export const SIGN_OUT_PATH = '/app/api/v1/sessions/sign-out';
export const RESET_PASSWORD_PATH = '/app/api/v1/users/reset-password';
export const RE_CONFIRM_EMAIL_PATH = '/app/api/v1/users/re-confirm-email';
export const APP_VERSION_PATH = '/app/api/v1/app-version';
export const COURIERS_PATH = '/app/api/v1/couriers';
export const CHECK_PRICE_SIZES_PATH = '/app/api/v1/check-price/sizes';
export const STORES_PATH = '/app/api/v1/stores';
export const STORES_BY_COURIER_PATH = '/app/api/v1/stores/find/:courier';
export const ADDRESSES_PATH = '/app/api/v1/addresses';
export const USER_DEVICES_GUEST_PATH = '/app/api/v1/user-devices/guest';
export const GUEST_TRACKING_SEARCH_PATH = '/app/api/v1/tracks/guest-search';
export const CHECK_PRICES_PATH = '/app/api/v1/check-price';
export const PROFILE_PATH = '/app/api/v1/users/profile';
export const DEVICES_PATH = '/app/api/v1/user-devices';
export const DELETE_DEVICE_PATH = '/app/api/v1/user-devices/:id';
export const TRACKING_SEARCH_PATH = '/app/api/v1/tracks/search';
export const TRACK_HISTORIES_PATH = '/app/api/v1/track-histories';
export const UPDATE_TRACK_HISTORIES_PATH = '/app/api/v1/track-histories/:id';
export const DELETE_TRACK_HISTORIES_PATH = '/app/api/v1/track-histories/:id';
export const KEEP_TRACK_HISTORIES_PATH = '/app/api/v1/track-histories/keep';
export const UPDATE_USER_PATH = '/app/api/v1/users';
export const DELETE_USER_PATH = '/app/api/v1/users';
export const NOTIFICATIONS_PATH = '/app/api/v1/user-notifications';
export const APP_NOTIFICATIONS_PATH = '/app/api/v1/app-notifications';
export const DELETE_NOTIFICATIONS_PATH = '/app/api/v1/user-notifications/:id';
export const TRACK_OCRS_PATH = '/app/api/v1/track-ocrs';
export const CHECK_PHONE_NUMBER_PATH = '/app/api/v1/users/check-phone-number';
export const PREMIUM_PATH = '/app/api/v1/users/premium';
export const NO_ADS_PATH = '/app/api/v1/users/no-ads';
export const SYSTEM_MAINTENANCE_PATH = '/app/api/v1/system-maintenance';
export const DELETE_ALL_TRACK_HISTORIES_PATH = '/app/api/v1/me/track-histories';
export const DELETE_ALL_NOTIFICATIONS_PATH =
  '/app/api/v1/me/user-notifications';
export const IAP_PURCHASE_PATH = '/app/api/v1/iap/purchase';
export const IAP_VALIDATE_RECEIPT_ANDROID_PATH =
  '/app/api/v1/iap/validate-receipt-android';
export const IAP_VALIDATE_RECEIPT_IOS_PATH =
  '/app/api/v1/iap/validate-receipt-ios';
export const APP_TRACK_COUNT = 'APP_TRACK_COUNT';
export const REMOVED_ADS_DATE = 'REMOVED_ADS_DATE';
export const MENU = 'MENU';
export const HIDE_ON_DELIVERED = 'HIDE_ON_DELIVERED';
export const HIDE_ON_RETURNED_TO_SENDER = 'HIDE_ON_RETURNED_TO_SENDER';
export const TRACK_NOTIFICATIONS = 'TRACK_NOTIFICATIONS';
export const APP_NOTIFICATIONS = 'APP_NOTIFICATIONS';
export const NON_PERSONALIZED_ADS_ONLY = 'NON_PERSONALIZED_ADS_ONLY';
export const HIDE_TRACKING_BUTTON = 'HIDE_TRACKING_BUTTON';
export const SHOW_SWITCH_NOTIFICATION = 'SHOW_SWITCH_NOTIFICATION';
export const AGREE_TERMS_AND_CONDITIONS = 'AGREE_TERMS_AND_CONDITIONS';
export const AD_APP_OPEN_LAST_TIME = 'AD_APP_OPEN_LAST_TIME';
export const ITEM_SKUS = [
  'remove_ads_7d',
  'premium_7d',
  'remove_ads_1m',
  'premium_1m',
  'remove_ads_3m',
  'premium_3m',
  'remove_ads_6m',
  'premium_6m',
  'remove_ads_1y',
  'premium_1y',
];
export const ITEM_SKUS_FOR_ANDROID = ['no_ads', 'premium'];
export const SKUS = ['no_ads', 'premium'];
