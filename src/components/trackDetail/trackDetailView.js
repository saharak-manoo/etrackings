/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useEffect} from 'react';
import {View, Linking, SafeAreaView} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {TestIds, useInterstitialAd} from 'react-native-google-mobile-ads';
import {admobKey} from '../../helpers/admob';
import {setAppTrackCount} from '../actions';
import {useSelector, useDispatch} from 'react-redux';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import {
  Button,
  FAB,
  Text,
  ProgressBar,
  Colors,
  Snackbar,
  Switch,
} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import * as Api from '../actions/api';
import {styles} from '../../helpers/styles';
import Timeline from 'react-native-timeline-flatlist';
import {ListItem, Icon} from 'react-native-elements';
import IonicIcon from 'react-native-vector-icons/Ionicons';
import FastImage from '@d11/react-native-fast-image';
import ImageView from 'react-native-image-viewing';
import {HOST_BACKUP, WAIT_PARCEL_URL} from '../actions/constants';
import QRCode from 'react-native-qrcode-svg';
import Ripple from 'react-native-material-ripple';
import analytics from '@react-native-firebase/analytics';
import {SliderBox} from 'react-native-image-slider-box';
import {SheetManager} from 'react-native-actions-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// View
import IOSHeader from '../header/iosHeaderView';

export default TrackDetailView = ({navigation, route: {params}}) => {
  const {t} = useTranslation();
  const {
    isDisplayAds,
    canShowInterstitialAd,
    fontSize,
    hp,
    isPresent,
    isIpad,
    infoMessage,
    errorMessage,
    isLogin,
    getImageWithColor,
    shareTracking,
    reviewApp,
    currencyFormat,
    addressFormat,
    encryptedStorageGetItem,
    encryptedStorageSetItem,
    copyToClipboard,
  } = require('../../helpers/globalFunction');
  const dispatch = useDispatch();
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const insets = useSafeAreaInsets();
  const adInterstitialUnitId = __DEV__
    ? TestIds.GAM_INTERSTITIAL
    : admobKey.interstitial;
  const {load, show, isLoaded, isClosed} = useInterstitialAd(
    adInterstitialUnitId,
    {
      requestNonPersonalizedAdsOnly: setting.isNonPersonalizedAdsOnly || false,
    },
  );
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingUpdateKeepTrack, setLoadingUpdateKeepTrack] = useState(false);
  const [spinner, setSpinner] = useState(true);
  const [isError, setIsError] = useState(false);
  const [snackBarObj, setSnackBarObj] = useState({});
  const courier = params.courier;
  const trackingNumber = params.trackingNumber;
  const [tracking, setTracking] = useState(null);
  const [trackingData, setTrackingData] = useState({});
  const [timelines, setTimelines] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setURL] = useState('');
  const [isImageIndex, setIsImageIndex] = useState(0);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState({});
  const [expanded, setExpanded] = useState(params.expanded || false);
  const [isShowSendTo, setIsShowSendTo] = useState(false);
  const [isWordWarp, setIsWordWarp] = useState(true);
  const [images, setImages] = useState([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    try {
      load();
    } catch (error) {
      console.log('load interstitial ads error -> ', error);
    }
  }, [load]);

  useEffect(() => {
    const checkAndShowAd = async () => {
      if (isLoaded && !spinner && isDisplayAds(data)) {
        try {
          if (data?.appTrackCount === 0) {
            const canShow = await canShowInterstitialAd();
            if (canShow) {
              setTimeout(() => {
                show();
              }, 1000);
            }
          }

          dispatch(setAppTrackCount(data?.appTrackCount + 1));
        } catch (error) {
          console.log('Show interstitial ads error -> ', error);
        }
      }
    };

    checkAndShowAd();
  }, [spinner, isLoaded]);

  useEffect(() => {
    if (
      trackingData?.trackingNo?.toUpperCase() !==
        trackingNumber?.toUpperCase() ||
      (trackingData?.courierKey?.toUpperCase() !== courier?.toUpperCase() &&
        courier !== 'AUTO-DETECT' &&
        !spinner)
    ) {
      setSpinner(true);
      setup();
    }
  }, [params]);

  handleTrackInfo = () => {
    SheetManager.show('TrackInfoView', {
      payload: {
        sheetName: 'TrackInfoView',
        navigation: navigation,
        title: t('text.trackDetail'),
        subTitle: trackingNumber,
        isShowDetail: trackingData?.isShowDetail,
        trackingNumber: trackingNumber,
        courierImageURL: trackingData?.courierImageURL,
        trackDetail: trackingData?.isShowDetail && trackDetail(),
        isShowQrCode: true,
        close: () => {
          if (isMountedRef.current) {
            setExpanded(false);
          }
        },
      },
    });

    if (isMountedRef.current) {
      setExpanded(true);
    }
  };

  hideTrackInfo = () => {
    SheetManager.hide('TrackInfoView');
    if (isMountedRef.current) {
      setExpanded(false);
    }
  };

  onToggleSnackBar = (visible, message) => {
    setSnackBarObj({visible: visible, message: message});
  };

  onDismissSnackBar = () => {
    if (isMountedRef.current) {
      setSnackBarObj({});
    }
  };

  trackingCounter = async () => {
    return parseInt(await encryptedStorageGetItem('trackingCounter'));
  };

  setup = async () => {
    let paramsApi = {
      courier: courier,
      trackingNo: trackingNumber,
    };

    await analytics().logEvent('track', {
      courier: courier,
      trackingNo: trackingNumber,
    });

    let resp = {};
    if (isLogin(data?.user)) {
      paramsApi.isNoAds = data?.user?.isNoAds;
      paramsApi.isPremium = data?.user?.isPremium;

      resp = await Api.tracking(data?.user?.authenticationJWT, paramsApi);
    } else {
      resp = await Api.guestTracking(paramsApi);
    }

    if (resp?.meta?.code === 200) {
      setIsError(false);
      let respData = resp.data;
      let detail = respData.data.detail;
      let {originAddress, originLine} = addressFormat('origin', detail, true);

      let {destinationAddress, destinationLine} = addressFormat(
        'destination',
        detail,
        true,
      );

      detail.originAddress = originAddress;
      detail.originLine = originLine;
      detail.destinationAddress = destinationAddress;
      detail.destinationLine = destinationLine;
      detail.isShowAddress =
        isPresent(originAddress) && isPresent(destinationAddress);
      detail.isShowSenderAndRecipient =
        isPresent(detail.sender) && isPresent(detail.recipient);
      setTrackingData(respData.data);

      setIsShowSendTo(detail.isShowAddress || detail.isShowSenderAndRecipient);
      setTimelines(setImageToTimeline(respData.timelines));
      setURL(respData.shareLink);
      setTitle(
        `${t('text.shareTracking', {
          courier: respData.data.courier,
          trackingNumber: trackingNumber,
        })}`,
      );

      setTrackingStatus(getImageWithColor(respData.data.status, setting));
      setTracking(respData.trackHistory);

      let imageURLs = [];
      if (detail.signerImageURL != '') imageURLs.push(detail.signerImageURL);
      if (detail.productImageURL != '') imageURLs.push(detail.productImageURL);
      if (detail.parcelImageURL != '') imageURLs.push(detail.parcelImageURL);
      setImages(imageURLs);

      setSpinner(false);
    } else {
      setSpinner(true);
      setIsError(true);

      if (isLogin(data?.user) && params.isTrackingSearch) {
        SheetManager.show('InputWithSelectCourierView', {
          payload: {
            sheetName: 'InputWithSelectCourierView',
            navigation: navigation,
            isLoading: loadingUpdateKeepTrack,
            word: '',
            title: t('text.trackingNumber', {
              trackingNumber: trackingNumber,
            }),
            isRequired: true,
            dataCouriers: data.couriers || [],
            subTitle: t('text.keepTracking'),
            inputPlaceholder: t(`placeholder.enterNote`),
            inputLabel: t(`placeholder.note`),
            onSubmit: (text, courierKey) => {
              keepTrack(text, courier === 'auto-detect' ? courierKey : courier);
            },
          },
        });
      }
    }
  };

  setImageToTimeline = arr => {
    return arr.map(timeline => {
      timeline = {
        ...timeline,
        ...getImageWithColor(timeline.status, setting, true),
      };

      return timeline;
    });
  };

  openLink = async urlLink => {
    Linking.openURL(urlLink);
  };

  onNotificationOn = async () => {
    let isOpen = !tracking?.isNotify;
    onToggleSnackBar(
      true,
      t(`text.${isOpen ? 'notificationOn' : 'notificationOff'}`),
    );
    let resp = await Api.updateTracking(
      data?.user?.authenticationJWT,
      tracking.id,
      {
        isNotify: isOpen,
      },
    );

    if (resp?.meta?.code === 200) {
      setTracking(resp.data);
    } else {
      errorMessage('ETrackings', t('message.somethingWentWrong'));
    }
  };

  goToSetting = () => {
    navigation.navigate('TrackingSetting', {
      tracking: tracking,
      courier: courier,
      trackingNumber: trackingNumber,
      note: tracking?.note,
      onBack: updateTracking,
      onShare: onShare,
    });
  };

  updateTracking = trackingUpdated => setTracking(trackingUpdated);

  textRipple = (text, isOpenLink, url) => {
    return (
      <Ripple
        rippleDuration={setting?.animation == 'normal' ? 600 : 450}
        onPress={() =>
          isOpenLink ? openLink(url) : setIsWordWarp(!isWordWarp)
        }>
        <Text
          theme={{
            dark: setting.isDarkMode,
            colors: {text: setting.textColor},
          }}
          numberOfLines={isWordWarp ? 2 : 8}
          allowFontScaling={false}
          style={{
            color: setting.textColor,
            alignContent: 'center',
            fontFamily: 'Kanit-Light',
            fontSize: fontSize(17),
            paddingTop: hp(0.5),
            paddingLeft: hp(1),
          }}>
          {text}
        </Text>
      </Ripple>
    );
  };

  trackDetail = () => {
    return (
      <View>
        {isShowSendTo && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              padding: 10,
            }}>
            <View
              style={{
                width: '40%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {trackingData.detail.isShowAddress &&
                isPresent(trackingData.detail.originAddress) && (
                  <>
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      onPress={() => setIsWordWarp(!isWordWarp)}>
                      <Text
                        theme={{
                          dark: setting.isDarkMode,
                          colors: {text: setting.textColor},
                        }}
                        numberOfLines={isWordWarp ? 1 : 8}
                        allowFontScaling={false}
                        style={{
                          textAlign: 'center',
                          color: setting.textColor,
                          fontFamily: 'Kanit-Light',
                          fontSize: fontSize(14),
                        }}>
                        {t('placeholder.sendFrom')}
                      </Text>
                    </Ripple>
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      onPress={() => setIsWordWarp(!isWordWarp)}>
                      <Text
                        theme={{
                          dark: setting.isDarkMode,
                          colors: {text: setting.textColor},
                        }}
                        numberOfLines={
                          isWordWarp ? trackingData.detail.originLine : 4
                        }
                        allowFontScaling={false}
                        style={{
                          textAlign: 'center',
                          color: setting.textColor,
                          fontFamily: 'Kanit-Light',
                          fontSize: fontSize(20),
                        }}>
                        {trackingData.detail.originAddress}
                      </Text>
                    </Ripple>
                  </>
                )}

              {trackingData.detail.isShowSenderAndRecipient &&
                isPresent(trackingData.detail.sender) && (
                  <>
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      onPress={() => setIsWordWarp(!isWordWarp)}>
                      <Text
                        theme={{
                          dark: setting.isDarkMode,
                          colors: {text: setting.textColor},
                        }}
                        numberOfLines={isWordWarp ? 1 : 8}
                        allowFontScaling={false}
                        style={{
                          paddingTop: trackingData.detail.isShowAddress
                            ? 10
                            : 0,
                          textAlign: 'center',
                          color: setting.textColor,
                          fontFamily: 'Kanit-Light',
                          fontSize: fontSize(14),
                        }}>
                        {t('placeholder.sendName')}
                      </Text>
                    </Ripple>
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      onPress={() => setIsWordWarp(!isWordWarp)}>
                      <Text
                        theme={{
                          dark: setting.isDarkMode,
                          colors: {text: setting.textColor},
                        }}
                        numberOfLines={isWordWarp ? 1 : 8}
                        allowFontScaling={false}
                        style={{
                          paddingTop: trackingData.detail.isShowAddress
                            ? 10
                            : 0,
                          textAlign: 'center',
                          color: setting.textColor,
                          fontFamily: 'Kanit-Light',
                          fontSize: fontSize(17),
                        }}>
                        {trackingData.detail.sender}
                      </Text>
                    </Ripple>
                  </>
                )}
            </View>
            <View
              style={{
                width: '20%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MatIcon
                name={'trending-flat'}
                size={38}
                style={{color: setting.textColor}}
              />
            </View>

            <View
              style={{
                width: '40%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {trackingData.detail.isShowAddress &&
                isPresent(trackingData.detail.destinationAddress) && (
                  <>
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      onPress={() => setIsWordWarp(!isWordWarp)}>
                      <Text
                        theme={{
                          dark: setting.isDarkMode,
                          colors: {text: setting.textColor},
                        }}
                        numberOfLines={isWordWarp ? 1 : 8}
                        allowFontScaling={false}
                        style={{
                          textAlign: 'center',
                          color: setting.textColor,
                          fontFamily: 'Kanit-Light',
                          fontSize: fontSize(14),
                        }}>
                        {t('placeholder.destination')}
                      </Text>
                    </Ripple>
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      onPress={() => setIsWordWarp(!isWordWarp)}>
                      <Text
                        theme={{
                          dark: setting.isDarkMode,
                          colors: {text: setting.textColor},
                        }}
                        numberOfLines={
                          isWordWarp ? trackingData.detail.destinationLine : 4
                        }
                        allowFontScaling={false}
                        style={{
                          textAlign: 'center',
                          color: setting.textColor,
                          fontFamily: 'Kanit-Light',
                          fontSize: fontSize(20),
                        }}>
                        {trackingData.detail.destinationAddress}
                      </Text>
                    </Ripple>
                  </>
                )}

              {trackingData.detail.isShowSenderAndRecipient &&
                isPresent(trackingData.detail.recipient) && (
                  <>
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      onPress={() => setIsWordWarp(!isWordWarp)}>
                      <Text
                        theme={{
                          dark: setting.isDarkMode,
                          colors: {text: setting.textColor},
                        }}
                        numberOfLines={isWordWarp ? 1 : 8}
                        allowFontScaling={false}
                        style={{
                          paddingTop: trackingData.detail.isShowAddress
                            ? 10
                            : 0,
                          textAlign: 'center',
                          color: setting.textColor,
                          fontFamily: 'Kanit-Light',
                          fontSize: fontSize(14),
                        }}>
                        {t('placeholder.receiverName')}
                      </Text>
                    </Ripple>
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      onPress={() => setIsWordWarp(!isWordWarp)}>
                      <Text
                        theme={{
                          dark: setting.isDarkMode,
                          colors: {text: setting.textColor},
                        }}
                        numberOfLines={isWordWarp ? 1 : 8}
                        allowFontScaling={false}
                        style={{
                          paddingTop: trackingData.detail.isShowAddress
                            ? 10
                            : 0,
                          textAlign: 'center',
                          color: setting.textColor,
                          fontFamily: 'Kanit-Light',
                          fontSize: fontSize(17),
                        }}>
                        {trackingData.detail.recipient}
                      </Text>
                    </Ripple>
                  </>
                )}
            </View>
          </View>
        )}
        <View
          style={{
            alignSelf: 'center',
            justifyContent: 'center',
            paddingTop: 10,
          }}>
          <QRCode
            value={trackingNumber}
            logo={{uri: `${HOST_BACKUP}/ic-web.png`}}
            logoSize={isIpad() ? 45 : 30}
            size={isIpad() ? 220 : 120}
            quietZone={10}
            logoBorderRadius={15}
            logoBackgroundColor={'transparent'}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            padding: 7,
            margin: 10,
            width: '60%',
            borderRadius: 15,
            backgroundColor: setting.isDarkMode ? '#1C1C1C' : '#F0F0F0',
            alignSelf: 'center',
            justifyContent: 'center',
          }}>
          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            rippleContainerBorderRadius={15}
            style={{marginLeft: 20, marginRight: 20}}
            disabled={
              !isPresent(trackingData?.detail?.courierCallCenterPhoneNumber)
            }
            onPress={() =>
              openLink(
                `tel:${trackingData?.detail?.courierCallCenterPhoneNumber}`,
              )
            }>
            <IonicIcon
              name={'call-outline'}
              style={[
                styles.detailIcon,
                {
                  color: isPresent(
                    trackingData?.detail?.courierCallCenterPhoneNumber,
                  )
                    ? '#28DCA5'
                    : '#CFCFCF',
                },
              ]}
            />
          </Ripple>

          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            rippleContainerBorderRadius={15}
            style={{marginRight: 20}}
            disabled={!isPresent(trackingData?.detail?.courierFacebookURL)}
            onPress={() => openLink(trackingData?.detail?.courierFacebookURL)}>
            <IonicIcon
              name={'logo-facebook'}
              style={[
                styles.detailIcon,
                {
                  color: isPresent(trackingData?.detail?.courierFacebookURL)
                    ? '#298EFF'
                    : '#CFCFCF',
                },
              ]}
            />
          </Ripple>

          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            rippleContainerBorderRadius={15}
            style={{marginRight: 20}}
            disabled={!isPresent(trackingData?.detail?.courierWebsiteURL)}
            onPress={() => openLink(trackingData?.detail?.courierWebsiteURL)}>
            <IonicIcon
              name={'link-outline'}
              style={[
                styles.detailIcon,
                {
                  color: isPresent(trackingData?.detail?.courierWebsiteURL)
                    ? '#0FC8F1'
                    : '#CFCFCF',
                },
              ]}
            />
          </Ripple>

          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            rippleContainerBorderRadius={15}
            style={{marginRight: 20}}
            disabled={!isPresent(trackingNumber)}
            onPress={() => copyToClipboard(trackingNumber)}>
            <IonicIcon
              name={'copy-outline'}
              style={[
                styles.detailIcon,
                {
                  color: isPresent(trackingNumber) ? '#FFDF2D' : '#CFCFCF',
                },
              ]}
            />
          </Ripple>
        </View>
        {isPresent(trackingData.detail.product) &&
          textRipple(
            `${t('placeholder.product')} : ${trackingData.detail.product}`,
          )}
        {isPresent(tracking?.note) &&
          textRipple(`${t('placeholder.note')} : ${tracking?.note}`)}
        {isPresent(trackingData.detail.deliveryTime) &&
          textRipple(
            `${t('placeholder.deliveryTime')} : ${
              trackingData.detail.deliveryTime
            } ${t('placeholder.day')}`,
          )}
        {isPresent(trackingData.detail.signer) &&
          textRipple(
            `${t('placeholder.consignee')} : ${trackingData.detail.signer}`,
          )}
        {isPresent(trackingData.detail.freight) &&
          textRipple(
            `${t('placeholder.freight')} : ${t('placeholder.thb', {
              bath: trackingData.detail.freight,
            })}`,
          )}
        {isPresent(trackingData.detail.fee) &&
          textRipple(
            `${t('placeholder.fee')} : ${t('placeholder.thb', {
              bath: trackingData.detail.fee,
            })}`,
          )}
        {isPresent(trackingData.detail.deliveryType) &&
          textRipple(
            `${t('placeholder.deliveryType')} : ${
              trackingData.detail.deliveryType
            }`,
          )}
        {isPresent(trackingData.detail.pickupDate) &&
          textRipple(
            `${t('placeholder.pickupDate')} : ${
              trackingData.detail.pickupDate
            }`,
          )}
        {isPresent(trackingData.detail.sendDate) &&
          textRipple(
            `${t('placeholder.sendDate')} : ${trackingData.detail.sendDate}`,
          )}
        {isPresent(trackingData.detail.dueDate) &&
          textRipple(
            `${t('placeholder.dueDate')} : ${trackingData.detail.dueDate}`,
          )}
        {isPresent(trackingData.detail.shipDate) &&
          textRipple(
            `${t('placeholder.shipDate')} : ${trackingData.detail.shipDate}`,
          )}
        {!trackingData.detail.isShowSenderAndRecipient &&
          isPresent(trackingData.detail.sender) &&
          textRipple(
            `${t('placeholder.sendName')} : ${trackingData.detail.sender}`,
          )}
        {isPresent(trackingData.detail.senderCompany) &&
          textRipple(
            `${t('placeholder.senderCompany')} : ${
              trackingData.detail.senderCompany
            }`,
          )}
        {isPresent(trackingData.detail.senderAddress) &&
          textRipple(
            `${t('placeholder.senderAddress')} : ${
              trackingData.detail.senderAddress
            }`,
          )}
        {isPresent(trackingData.detail.senderPhoneNumber) &&
          textRipple(
            `${t('placeholder.senderPhoneNumber')} : ${
              trackingData.detail.senderPhoneNumber
            }`,
            true,
            `tel:${trackingData.detail.senderPhoneNumber}`,
          )}
        {isPresent(trackingData.detail.originPostcode) &&
          textRipple(
            `${t('placeholder.originPostcode')} : ${
              trackingData.detail.originPostcode
            }`,
          )}
        {!trackingData.detail.isShowSenderAndRecipient &&
          isPresent(trackingData.detail.recipient) &&
          textRipple(
            `${t('placeholder.receiverName')} : ${
              trackingData.detail.recipient
            }`,
          )}
        {isPresent(trackingData.detail.recipientCompany) &&
          textRipple(
            `${t('placeholder.recipientCompany')} : ${
              trackingData.detail.recipientCompany
            }`,
          )}
        {isPresent(trackingData.detail.recipientAddress) &&
          textRipple(
            `${t('placeholder.recipientAddress')} : ${
              trackingData.detail.recipientAddress
            }`,
          )}
        {isPresent(trackingData.detail.recipientPhoneNumber) &&
          textRipple(
            `${t('placeholder.recipientPhoneNumber')} : ${
              trackingData.detail.recipientPhoneNumber
            }`,
            true,
            `tel:${trackingData.detail.recipientPhoneNumber}`,
          )}
        {isPresent(trackingData.detail.destinationPostcode) &&
          textRipple(
            `${t('placeholder.destinationPostcode')} : ${
              trackingData.detail.destinationPostcode
            }`,
          )}
        {isPresent(trackingData.detail.address) &&
          textRipple(
            `${t('placeholder.address')} : ${trackingData.detail.address}`,
          )}
        {!trackingData.detail.isShowAddress &&
          isPresent(addressFormat('origin', trackingData.detail)) &&
          textRipple(
            `${t('placeholder.sendFrom')} : ${addressFormat(
              'origin',
              trackingData.detail,
            )}`,
          )}
        {!trackingData.detail.isShowAddress &&
          isPresent(addressFormat('destination', trackingData.detail)) &&
          textRipple(
            `${t('placeholder.destination')} : ${addressFormat(
              'destination',
              trackingData.detail,
            )}`,
          )}
        {isPresent(trackingData.detail.weight) &&
          textRipple(
            `${t('placeholder.weight')} : ${t('placeholder.weightValue', {
              value: currencyFormat(trackingData.detail.weight),
            })}`,
          )}
        {isPresent(trackingData.detail.qty) &&
          textRipple(
            `${t('placeholder.qty')} : ${t('placeholder.qtyCount', {
              count: trackingData.detail.qty,
            })}`,
          )}
        {isPresent(trackingData.detail.courierPartner) && (
          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            onPress={() => {
              if (isPresent(trackingData?.detail?.courierPartnerTrackingNo)) {
                hideTrackInfo();
                navigation.navigate('TrackDetail', {
                  courier: trackingData?.detail?.courierPartnerKey,
                  trackingNumber:
                    trackingData?.detail?.courierPartnerTrackingNo,
                  isKeep: false,
                  expanded: false,
                });
              }
            }}>
            <Text
              theme={{
                dark: setting.isDarkMode,
                colors: {text: setting.textColor},
              }}
              numberOfLines={isWordWarp ? 2 : 8}
              allowFontScaling={false}
              style={{
                color: setting.textColor,
                alignContent: 'center',
                fontFamily: 'Kanit-Light',
                fontSize: fontSize(17),
                paddingTop: hp(0.5),
                paddingLeft: hp(1),
              }}>
              {`${t('placeholder.courierPartner')} : ${
                trackingData.detail.courierPartner
              }`}
            </Text>
          </Ripple>
        )}
        {isPresent(trackingData.detail.courierPartnerTrackingNo) ? (
          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            onPress={() => {
              if (isPresent(trackingData?.detail?.courierPartnerKey)) {
                hideTrackInfo();
                navigation.navigate('TrackDetail', {
                  courier: trackingData?.detail?.courierPartnerKey,
                  trackingNumber:
                    trackingData?.detail?.courierPartnerTrackingNo,
                  isKeep: false,
                  expanded: false,
                });
              }
            }}>
            <Text
              theme={{
                dark: setting.isDarkMode,
                colors: {text: setting.textColor},
              }}
              numberOfLines={isWordWarp ? 2 : 8}
              allowFontScaling={false}
              style={{
                alignContent: 'center',
                fontFamily: 'Kanit-Light',
                fontSize: fontSize(17),
                paddingTop: hp(0.5),
                paddingLeft: hp(1),
              }}>
              {`${t('placeholder.courierPartnerTrackingNo')} : ${
                trackingData.detail.courierPartnerTrackingNo
              }`}
            </Text>
          </Ripple>
        ) : null}
        {isPresent(trackingData.detail.returnCourier) && (
          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            onPress={() => {
              if (isPresent(trackingData?.detail?.returnTrackingNo)) {
                hideTrackInfo();
                navigation.navigate('TrackDetail', {
                  courier: trackingData?.detail?.returnCourierKey,
                  trackingNumber: trackingData?.detail?.returnTrackingNo,
                  isKeep: false,
                  expanded: false,
                });
              }
            }}>
            <Text
              theme={{
                dark: setting.isDarkMode,
                colors: {text: setting.textColor},
              }}
              numberOfLines={isWordWarp ? 2 : 8}
              allowFontScaling={false}
              style={{
                color: setting.textColor,
                alignContent: 'center',
                fontFamily: 'Kanit-Light',
                fontSize: fontSize(17),
                paddingTop: hp(0.5),
                paddingLeft: hp(1),
              }}>
              {`${t('placeholder.returnCourier')} : ${
                trackingData.detail.returnCourier
              }`}
            </Text>
          </Ripple>
        )}
        {isPresent(trackingData.detail.returnTrackingNo) ? (
          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            onPress={() => {
              if (isPresent(trackingData?.detail?.returnCourierKey)) {
                hideTrackInfo();
                navigation.navigate('TrackDetail', {
                  courier: trackingData?.detail?.returnCourierKey,
                  trackingNumber: trackingData?.detail?.returnTrackingNo,
                  isKeep: false,
                  expanded: false,
                });
              }
            }}>
            <Text
              theme={{
                dark: setting.isDarkMode,
                colors: {text: setting.textColor},
              }}
              numberOfLines={isWordWarp ? 2 : 8}
              allowFontScaling={false}
              style={{
                alignContent: 'center',
                fontFamily: 'Kanit-Light',
                fontSize: fontSize(17),
                paddingTop: hp(0.5),
                paddingLeft: hp(1),
              }}>
              {`${t('placeholder.returnTrackingNo')} : ${
                trackingData.detail.returnTrackingNo
              }`}
            </Text>
          </Ripple>
        ) : null}
        {isPresent(trackingData.detail.cashOnDelivery) &&
          textRipple(
            `${t('placeholder.cashOnDelivery')} : ${parseFloat(
              trackingData.detail.cashOnDelivery,
            ).toLocaleString(undefined, {minimumFractionDigits: 2})} ${t(
              'placeholder.bath',
            )}`,
          )}
        {isPresent(trackingData.detail.businessPartner) &&
          textRipple(
            `${t('placeholder.businessPartner')} : ${
              trackingData.detail.businessPartner
            }`,
          )}
        {isPresent(trackingData.detail.isPayCashOnDelivery) &&
          textRipple(
            `${t('placeholder.paymentTransferred')} : ${t(
              'placeholder.paymentTransferredFinished',
            )}`,
          )}
        {isPresent(trackingData.detail.shippingService) &&
          textRipple(
            `${t('placeholder.shippingService')} : ${
              trackingData.detail.shippingService
            }`,
          )}
        {isPresent(trackingData.detail.returnShippingService) &&
          textRipple(
            `${t('placeholder.returnShippingService')} : ${
              trackingData.detail.returnShippingService
            }`,
          )}
        {isPresent(trackingData.detail.payType) &&
          textRipple(
            `${t('placeholder.payType')} : ${trackingData.detail.payType}`,
          )}

        {isPresent(trackingData.detail.priceMethod) &&
          textRipple(
            `${t('placeholder.priceMethod')} : ${
              trackingData.detail.priceMethod
            }`,
          )}

        {isPresent(trackingData.detail.deliveryStaffName) &&
          textRipple(
            `${t('placeholder.deliveryStaffName')} : ${
              trackingData.detail.deliveryStaffName
            }`,
          )}

        {isPresent(trackingData.detail.deliveryStaffPhoneNumber) &&
          textRipple(
            `${t('placeholder.deliveryStaffPhoneNumber')} : ${
              trackingData.detail.deliveryStaffPhoneNumber
            }`,
            true,
            `tel:${trackingData.detail.deliveryStaffPhoneNumber}`,
          )}

        {isPresent(trackingData.detail.deliveryStaffBranchPhoneNumber) &&
          textRipple(
            `${t('placeholder.deliveryStaffBranchPhoneNumber')} : ${
              trackingData.detail.deliveryStaffBranchPhoneNumber
            }`,
            true,
            `tel:${trackingData.detail.deliveryStaffBranchPhoneNumber}`,
          )}

        {isPresent(trackingData.detail.referenceNumber) &&
          textRipple(
            `${t('placeholder.referenceNumber')} : ${
              trackingData.detail.referenceNumber
            }`,
          )}
      </View>
    );
  };

  trackImage = () => {
    return (
      <View>
        {isImageVisible && (
          <ImageView
            images={images.map(image => {
              return {uri: image};
            })}
            imageIndex={isImageIndex}
            visible={isImageVisible}
            onRequestClose={() => setIsImageVisible(false)}
          />
        )}

        {images.length != 0 ? (
          <SliderBox
            ImageComponent={FastImage}
            images={images}
            sliderBoxHeight={125}
            onCurrentImagePressed={index => {
              setIsImageIndex(index);
              setIsImageVisible(true);
            }}
            dotColor={'#03DAC6'}
            inactiveDotColor={'rgba(128, 128, 128, 0.92)'}
            autoplay
            resizeMethod={'resize'}
            resizeMode={'cover'}
            paginationBoxStyle={{
              position: 'absolute',
              bottom: 5,
              padding: 0,
              alignItems: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
              paddingVertical: 10,
            }}
            dotStyle={{
              width: 7,
              height: 7,
              borderRadius: 5,
              backgroundColor: 'rgba(128, 128, 128, 0.92)',
            }}
            ImageComponentStyle={styles.imageSigner}
            imageLoadingColor={setting.textColor}
          />
        ) : null}
      </View>
    );
  };

  renderDetail = () => {
    return (
      <View style={{flex: 1, backgroundColor: setting.appColor}}>
        {!isLogin(data?.user) && (
          <Button
            mode={'contained'}
            style={{margin: 10, marginLeft: 20, marginRight: 20}}
            icon={({size, _color}) => {
              return (
                <IonicIcon name={'log-in-outline'} size={size} color={'#000'} />
              );
            }}
            onPress={async () => {
              const paramsData = {
                courierKey: trackingData?.courierKey,
                trackingNumber: trackingData?.trackingNo.toUpperCase(),
              };
              await encryptedStorageSetItem(
                'trackNotLogin',
                JSON.stringify(paramsData),
              );
              navigation.navigate('Auth');
            }}>
            {t('button.loginForNotification')}
          </Button>
        )}

        {isLogin(data?.user) && setting.isShowSwitchNotification && (
          <ListItem
            containerStyle={{
              backgroundColor: setting.appColor,
            }}
            title={t('placeholder.notificationStatus')}
            titleStyle={{
              fontFamily: 'Kanit-Light',
              color: setting.textColor,
              alignSelf: 'flex-end',
            }}
            rightIcon={
              <Switch
                value={tracking?.isNotify}
                onValueChange={isOpen => onNotificationOn(isOpen)}
              />
            }
          />
        )}

        {trackImage()}

        {trackingData?.isShowDetail && (
          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            rippleContainerBorderRadius={15}
            onPress={handleTrackInfo}
            style={{
              flex: 1,
              padding: 4,
              marginLeft: 20,
              marginRight: 20,
              backgroundColor: setting.cardColor,
              borderRadius: 15,
            }}>
            <View style={{flexDirection: 'row'}}>
              <View style={{width: '70%'}}>
                <Text
                  theme={{
                    dark: setting.isDarkMode,
                    colors: {text: setting.textColor},
                  }}
                  style={{
                    marginLeft: 10,
                    fontFamily: 'Kanit-Light',
                    fontSize: fontSize(12),
                    padding: 8,
                  }}>
                  {t('text.trackDetail')}
                </Text>
              </View>
              <View style={{width: '30%'}}>
                <IonicIcon
                  name={
                    expanded ? 'chevron-up-outline' : 'chevron-down-outline'
                  }
                  color={setting.textColor}
                  style={styles.infoIcon}
                />
              </View>
            </View>
          </Ripple>
        )}

        <View
          style={{
            flex: 1,
            padding: 20,
            paddingTop: 5,
            backgroundColor: setting.appColor,
          }}>
          <Timeline
            isUsingFlatlist={false}
            innerCircle={'icon'}
            circleColor={'transparent'}
            lineColor={trackingStatus?.color || '#08dcc1'}
            showTime={false}
            separator={true}
            style={styles.list}
            data={timelines}
            titleStyle={{
              marginTop: -12,
              fontFamily: 'Kanit-Light',
              color: setting.textColor,
            }}
            descriptionStyle={{
              color: setting.textTimelineColor,
              fontFamily: 'Kanit-Light',
            }}
            circleSize={25}
            iconStyle={{borderRadius: 5}}
            options={{
              style: {paddingTop: 10},
            }}
          />
        </View>
      </View>
    );
  };

  onShare = async () => {
    await shareTracking(title, url);
  };

  updateNote = async note => {
    setLoadingUpdate(true);
    let resp = await Api.updateTracking(
      data?.user?.authenticationJWT,
      tracking.id,
      {
        note: note,
      },
    );

    if (resp?.meta?.code === 200) {
      onToggleSnackBar(true, t('text.saveNote'));
      setTracking(resp.data);
      await analytics().logEvent('note', {
        courier: courier,
        trackingNo: resp.data.trackingNo,
        note: note,
      });
      setLoadingUpdate(false);
    } else {
      errorMessage('ETrackings', t('message.somethingWentWrong'));
      setLoadingUpdate(false);
    }
  };

  keepTrack = async (note, courierKey) => {
    setLoadingUpdateKeepTrack(true);

    if (note == '') {
      setLoadingUpdateKeepTrack(false);
      errorMessage('ETrackings', t('message.noteCanNotBeBlank'));
    } else {
      let trackParams = {
        trackingNo: trackingNumber,
        language: setting.locale,
        note: note,
        isKeep: true,
      };

      let response = await Api.keepTracking(
        data?.user?.authenticationJWT,
        courierKey,
        trackParams,
      );

      if (response?.meta?.code === 200) {
        infoMessage('ETrackings', t('message.keepTracking'));
        setLoadingUpdateKeepTrack(false);
      } else {
        setLoadingUpdateKeepTrack(false);
        errorMessage('ETrackings', t('message.somethingWentWrong'));
      }
    }
  };

  onFavorite = async () => {
    let resp = await Api.updateTracking(
      data?.user?.authenticationJWT,
      tracking.id,
      {
        isFavorite: !tracking?.isFavorite,
      },
    );

    if (resp?.meta?.code === 200) {
      onToggleSnackBar(
        true,
        t(`text.${!tracking?.isFavorite ? 'saveFavorite' : 'unSaveFavorite'}`),
      );
      setTracking(resp.data);
      setLoadingUpdate(false);
    } else {
      errorMessage('ETrackings', t('message.somethingWentWrong'));
      setLoadingUpdate(false);
    }
  };

  renderError = () => {
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <FastImage
            resizeMode={FastImage.resizeMode.contain}
            style={styles.imageError}
            source={{uri: WAIT_PARCEL_URL}}
          />

          <Text
            theme={{
              dark: setting.isDarkMode,
              colors: {text: setting.textColor},
            }}
            style={{
              marginTop: -40,
              alignSelf: 'center',
              alignContent: 'center',
              textAlign: 'center',
              fontFamily: 'Kanit-Light',
              fontSize: fontSize(12),
              paddingTop: hp(0.5),
              padding: hp(2),
            }}>
            {t(`message.${params.isKeep ? 'keepStatus' : 'trackingNotFound'}`)}
          </Text>

          <View
            style={{
              alignSelf: 'center',
              alignContent: 'center',
              textAlign: 'center',
            }}>
            <Icon
              raised
              name={'refresh'}
              type={'material'}
              color={'#1E5CDF'}
              onPress={() => {
                setIsError(false);
                setSpinner(true);
                setup();
              }}
            />
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: setting.appColor}}>
      <IOSHeader
        title={
          spinner
            ? isError
              ? trackingNumber
              : t('text.loading')
            : trackingData?.courier
        }
        titleColor={spinner ? setting.textColor : trackingData?.color}
        subtitle={
          spinner
            ? isError
              ? t('message.noData')
              : t('text.loading')
            : tracking?.note
            ? `(${tracking?.note}) ${trackingData?.trackingNo}`
            : trackingData?.trackingNo
        }
        showFavoriteButton={isLogin(data?.user) ? !isError : false}
        favorite={() => onFavorite()}
        isFavorite={spinner ? null : tracking?.isFavorite}
        showNotificationButton={
          isLogin(data?.user)
            ? !setting.isShowSwitchNotification && !isError
            : false
        }
        notification={() => onNotificationOn()}
        isNotification={spinner ? null : tracking?.isNotify}
        showShareButton={!isError}
        spinner={spinner}
        share={() => onShare()}
        imageURL={spinner ? null : trackingStatus?.imageURL}
        canGoBack={true}
        onPressBack={async () => {
          if (trackingData?.trackingNo) {
            reviewApp();
          }
          navigation.goBack();
        }}
        onPressContent={() => (spinner ? undefined : goToSetting())}
      />

      {isError ? (
        renderError()
      ) : (
        <View
          style={{
            flex: 1,
            padding: isIpad() ? 80 : 0,
          }}>
          <View style={{flex: 1}}>
            <View
              style={{
                height: isDisplayAds(data) ? '90%' : '100%',
                borderRadius: 15,
              }}>
              {spinner ? (
                <ProgressBar indeterminate={true} color={Colors.blue300} />
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {renderDetail()}
                </ScrollView>
              )}
            </View>
          </View>

          {isLogin(data?.user) && (
            <FAB
              style={isDisplayAds(data) ? styles.fabWithAd : styles.fabNote}
              loading={spinner}
              disabled={spinner}
              label={t('button.note')}
              icon={() => <MatIcon name={'event-note'} size={28} />}
              onPress={() => {
                SheetManager.show('InputView', {
                  payload: {
                    sheetName: 'InputView',
                    navigation: navigation,
                    title: t('placeholder.note'),
                    isLoading: loadingUpdate,
                    word: tracking?.note,
                    title: t(`placeholder.note`),
                    inputPlaceholder: t(`placeholder.enterNote`),
                    inputLabel: t(`placeholder.note`),
                    onSubmit: text => updateNote(text),
                  },
                });
              }}
            />
          )}
        </View>
      )}

      <Snackbar
        style={{
          marginBottom: isDisplayAds(data) ? insets.bottom + 70 : insets.bottom,
        }}
        visible={snackBarObj?.visible || false}
        onDismiss={onDismissSnackBar}
        action={{
          label: t('button.close'),
          onPress: () => onDismissSnackBar(),
        }}>
        {snackBarObj?.message}
      </Snackbar>
    </SafeAreaView>
  );
};
