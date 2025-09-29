/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useEffect} from 'react';
import {
  Alert,
  ActionSheetIOS,
  AppState,
  ActivityIndicator,
  BackHandler,
  ToastAndroid,
  Animated,
  FlatList,
  RefreshControl,
  View,
  StatusBar,
  Linking,
  SafeAreaView,
} from 'react-native';
import {TestIds, useAppOpenAd} from 'react-native-google-mobile-ads';
import {useDispatch, useSelector} from 'react-redux';
import {SheetManager} from 'react-native-actions-sheet';
import {
  setUserWithApi,
  lastStatus,
  searchHistories,
  trackingCount,
  setKeywordTrackingHistories,
  setLimitTrackingHistories,
  setInitialURL,
  setTrackingStatus,
} from '../actions';
import Ripple from 'react-native-material-ripple';
import {Text, Searchbar, Colors, FAB} from 'react-native-paper';
import MatIonicIcon from 'react-native-vector-icons/MaterialIcons';
import {useTranslation} from 'react-i18next';
import * as Api from '../actions/api';
import {styles} from '../../helpers/styles';
import * as Animatable from 'react-native-animatable';
import ActionSheet from 'react-native-action-sheet';
import {admobKey} from '../../helpers/admob';
import FastImage from '@d11/react-native-fast-image';
import {
  HTTP_STATUSES,
  ALL,
  NOTE,
  FAVORITES,
  ON_KEEP,
  ON_PICKED_UP,
  ON_SHIPPING,
  ON_DELIVERED,
  ON_UNABLE_TO_SEND,
  SEARCH_NOT_FOUND_URL,
  ON_RETURNED_TO_SENDER,
} from '../actions/constants';
import {request, PERMISSIONS} from 'react-native-permissions';
import Icon from 'react-native-vector-icons/Ionicons';
import {Icon as ElIcon} from 'react-native-elements';

// View
import HeaderView from '../header/headerView';
import LoaderLastStatus from '../loader/loaderLastStatus';
import Menu from '../menu/menu';
import Track from '../track/track';

export default HomeView = ({navigation, route: {name}}) => {
  const {t} = useTranslation();
  const {
    isIos,
    infoMessage,
    getUserData,
    getImageAndColor,
    camelCase,
    shareTracking,
    isDisplayAds,
    hp,
    fontSize,
    isIpad,
    isAndroid,
    errorMessage,
    copyToClipboard,
    encryptedStorageGetItem,
    encryptedStorageRemoveItem,
  } = require('../../helpers/globalFunction');
  const {ResponseView} = require('../../helpers/errorResponse');
  const {
    openTrackDetail,
    requestFirebasePermission,
    unsubscribeNotification,
    openedAppNotification,
  } = require('../../helpers/firebaseNotification');
  const isInitialMount = useRef(true);
  const dispatch = useDispatch();
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const adAppOpenUnitId = __DEV__ ? TestIds.GAM_APP_OPEN : admobKey.appOpen;
  const adAppOpen = useAppOpenAd(adAppOpenUnitId, {
    requestNonPersonalizedAdsOnly: setting.isNonPersonalizedAdsOnly || false,
  });
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [spinner, setSpinner] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollY = new Animated.Value(0);
  const [exitApp, setExitApp] = useState(false);
  const types = [
    {
      type: ALL,
      imageURL: null,
      icon: 'apps',
    },
    {
      type: FAVORITES,
      imageURL: null,
      icon: 'favorite',
    },
    {
      type: NOTE,
      imageURL: null,
      icon: 'event-note',
    },
    {
      ...getImageAndColor(ON_KEEP, setting),
      type: ON_KEEP,
    },
    {
      ...getImageAndColor(ON_PICKED_UP, setting),
      type: ON_PICKED_UP,
    },
    {
      ...getImageAndColor(ON_SHIPPING, setting),
      type: ON_SHIPPING,
    },
    {
      ...getImageAndColor(ON_DELIVERED, setting),
      type: ON_DELIVERED,
    },
    {
      ...getImageAndColor(ON_UNABLE_TO_SEND, setting),
      type: ON_UNABLE_TO_SEND,
    },
    {
      ...getImageAndColor(ON_RETURNED_TO_SENDER, setting),
      type: ON_RETURNED_TO_SENDER,
    },
  ];

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Start loading the app open ads straight away
    if (isDisplayAds(data)) adAppOpen.load();
  }, [adAppOpen.load]);

  useEffect(() => {
    if (adAppOpen.error !== undefined) {
      console.log(
        `${Platform.OS} app open hook error: ${adAppOpen.error.message}`,
      );
    }
  }, [adAppOpen.error]);

  useEffect(() => {
    // App State Visible is active
    if (appStateVisible === 'active') {
      setRefreshing(true);
      trackingHistories();

      if (isAdOpen && isDisplayAds(data)) {
        setIsAdOpen(false);
        try {
          if (data?.appTrackCount > 0)
            setTimeout(() => {
              adAppOpen.show();
            }, 1000);
        } catch (e) {
          console.log(`${Platform.OS} app open hook error: ${e}`);
        }
      }
    } else {
      if (isDisplayAds(data)) adAppOpen.load();
      setIsAdOpen(true);
    }
  }, [appStateVisible]);

  useEffect(() => {
    if (isDisplayAds(data)) adAppOpen.load();
  }, [adAppOpen.isOpened, adAppOpen.isClicked, adAppOpen.isClosed]);

  handleBackButtonClick = () => {
    if (!exitApp) {
      if (!navigation.canGoBack()) {
        ToastAndroid.showWithGravity(
          t('message.backExitApp'),
          2500,
          ToastAndroid.BOTTOM,
        );

        setExitApp(true);
      } else {
        navigation.goBack();
      }
    } else if (exitApp) {
      BackHandler.exitApp();
    }

    setTimeout(() => {
      setExitApp(false);
    }, 2500);

    return true;
  };

  useEffect(() => {
    let backEventListener = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );

    return () => backEventListener.remove();
  }, [exitApp, navigation]);

  checkInitialURL = async () => {
    Linking.getInitialURL().then(url => {
      if (url != null && setting.initialURL == null && data?.user) {
        handleOpenURL({
          url: url,
        });

        dispatch(setInitialURL(url));
      }
    });
  };

  getInitialURL = () => {
    return Linking.getInitialURL();
  };

  handleOpenURL = ({url}) => {
    if (url.includes('package') || url.includes('packages')) {
      try {
        let [_match, productID] =
          /[packages|package]*\?[packageId|package_id|productID]*\=(\S+)/gi.exec(
            url,
          );
        navigation.navigate('Package', {
          productID: productID,
        });
      } catch {
        navigation.navigate('Package');
      }
    } else if (url.includes('qrcode')) {
      SheetManager.show('QRCode', {
        payload: {
          sheetName: 'QRCode',
          navigation: navigation,
          title: t('text.scanToTracking'),
          courier: data?.couriers[0],
        },
      });
    } else if (url.includes('setting')) {
      navigation.navigate('Profile');
    } else if (url.includes('login')) {
      errorMessage('ETrackings', t('message.yourAreLogin'));
    } else if (url.includes('trackingResult')) {
      let [match, matchCourier, matchTrackingNumber] =
        /courier=(\S+)&trackingNumber=(\S+)/gi.exec(url);

      openTrackDetail(
        navigation.navigate('TrackDetail', {
          courier: matchCourier.replace('_', '-'),
          trackingNumber: matchTrackingNumber,
          isKeep: false,
          showAds: () => show(),
        }),
      );
    } else if (url.includes('tracking')) {
      let [match, matchCourier, matchTrackingNumber] =
        /courier=(\S+)&tracking-no=(\S+)/gi.exec(url);

      openTrackDetail(
        navigation.navigate('TrackDetail', {
          courier: matchCourier,
          trackingNumber: matchTrackingNumber,
          isKeep: false,
        }),
      );
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadData();
      if (isDisplayAds(data)) adAppOpen.load();
    }
  });

  useEffect(() => {
    Linking.addEventListener('url', handleOpenURL);

    return () => Linking.removeEventListener('url', handleOpenURL);
  }, []);

  loadData = async () => {
    await setup();
    checkInitialURL();
  };

  // On notification in open app
  useEffect(() => {
    unsubNotification(navigation);
  }, []);

  unsubNotification = async nav => {
    await unsubscribeNotification(nav);
  };

  // On click notification on OS
  useEffect(() => {
    openedAppNotification(navigation, setting);
  }, []);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      trackingHistories();
    });
  }, [navigation]);

  trackingHistories = async () => {
    let userData = await getUserData();
    Api.trackHistories(
      userData?.authenticationJWT,
      data.limitTrackingHistories,
      data.keywordTrackingHistories,
      data.status,
      setting?.isHideOnDelivered,
      setting?.isHideReturnedToSender,
      setting?.menu,
    ).then(async resp => {
      if (!HTTP_STATUSES.includes(resp.status) && !resp?.meta) {
        ResponseView(navigation, resp.status, SheetManager);
        return;
      }
      if (resp?.meta?.code === 200) {
        await dispatch(searchHistories(resp?.data?.trackHistories || []));
        await dispatch(lastStatus(resp?.data?.trackLastUpdateStatuses || []));
        await dispatch(trackingCount(resp?.data?.count || 0));

        setSpinner(false);
        setRefreshing(false);

        let trackNotLogin = JSON.parse(
          await encryptedStorageGetItem('trackNotLogin'),
        );
        if (trackNotLogin != null) {
          await encryptedStorageRemoveItem('trackNotLogin');
          openTrackDetail(
            navigation.navigate('TrackDetail', {
              courier: trackNotLogin?.courierKey,
              trackingNumber: trackNotLogin?.trackingNumber,
              isKeep: false,
            }),
          );
        }
      }
    });
  };

  setup = async () => {
    try {
      await dispatch(setUserWithApi(navigation));
      let userData = await getUserData();
      requestFirebasePermission().then(async fcmToken => {
        await Api.saveUserDeviceFirebaseToken(
          userData?.authenticationJWT,
          fcmToken,
        );
      });

      if (!isAndroid()) request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);

      trackingHistories();
    } catch (err) {
      console.log('Home setup error => ', err);
      ResponseView(navigation);
    }
  };

  onOpenTrackDetail = item => {
    openTrackDetail(
      navigation.navigate('TrackDetail', {
        courier: item.courierKey,
        trackingNumber: item.trackingNo,
        isKeep: item.isKeep && item.currentStatus == '',
      }),
    );
  };

  onLongPressTrackDetailMenu = item => {
    onActionSheet(
      item.id,
      item.courierKey,
      item.trackingNo,
      setting.isLanguageTH ? item.nameTH : item.nameEH,
      item.shareLink,
      item.serviceImageURL,
    );
  };

  renderTrackingMenu = () => {
    return (
      <FlatList
        style={{
          flex: 1,
          padding: 10,
        }}
        data={types}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({item, index}) => {
          return (
            <Menu
              index={index}
              selected={data.status == item.type}
              title={t(`placeholder.${camelCase(item.type)}`)}
              imageURL={item.imageURL}
              iconName={item.icon}
              color={setting.isDarkMode ? '#009B7D' : '#04D5AC'}
              onPress={async () => {
                setSpinner(true);
                await dispatch(setTrackingStatus(item.type));
                trackingHistories();
              }}
            />
          );
        }}
        keyExtractor={(_, index) => index}
      />
    );
  };

  onSearch = async keyword => {
    await dispatch(setKeywordTrackingHistories(keyword));
    setSpinner(true);
    setTimeout(() => {
      trackingHistories();
    }, 300);
  };

  refreshHistories = async (reload = true) => {
    setRefreshing(reload);
    await trackingHistories();
  };

  onActionSheet = async (
    trackingID,
    courier,
    trackingNumber,
    serviceName,
    shareLink,
    serviceImageURL,
  ) => {
    let title = `${t('text.shareTracking', {
      courier: serviceName,
      trackingNumber: trackingNumber,
    })}`;

    ActionSheet.showActionSheetWithOptions(
      {
        title: t('text.trackingNumber', {
          trackingNumber: trackingNumber,
        }),
        options: [
          t('button.open'),
          t('button.share'),
          t('button.copy'),
          t('button.delete'),
          t('button.cancel'),
        ],
        destructiveButtonIndex: 3,
        cancelButtonIndex: 4,
      },
      async buttonIndex => {
        if (buttonIndex === 0) {
          openTrackDetail(
            navigation.navigate('TrackDetail', {
              courier: courier,
              trackingNumber: trackingNumber,
              isKeep: false,
            }),
          );
        } else if (buttonIndex === 1) {
          await shareTracking(title, shareLink, serviceImageURL);
        } else if (buttonIndex === 2) {
          await copyToClipboard(trackingNumber);
        } else if (buttonIndex === 3) {
          await dialogDeleteTracking(trackingID);
        }
      },
    );
  };

  swipeoutBtns = (
    trackingID,
    courier,
    trackingNumber,
    serviceName,
    shareLink,
    serviceImageURL,
  ) => {
    let title = `${t('text.shareTracking', {
      courier: serviceName,
      trackingNumber: trackingNumber,
    })}`;

    return [
      {
        backgroundColor: setting.appColor,
        component: (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ElIcon
              raised
              name={'launch'}
              type={'material'}
              reverse
              color={'#2DE787'}
            />
          </View>
        ),
        onPress: () =>
          navigation.navigate('TrackDetail', {
            courier: courier,
            trackingNumber: trackingNumber,
          }),
      },
      {
        backgroundColor: setting.appColor,
        component: (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ElIcon
              raised
              name={'content-copy'}
              type={'material'}
              reverse
              color={'#047EF8'}
            />
          </View>
        ),
        onPress: () => copyToClipboard(trackingNumber),
      },
      {
        backgroundColor: setting.appColor,
        component: (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ElIcon
              raised
              name={'share'}
              type={'material'}
              reverse
              color={'#8719FB'}
            />
          </View>
        ),
        onPress: async () =>
          await shareTracking(title, shareLink, serviceImageURL),
      },
      {
        backgroundColor: setting.appColor,
        component: (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ElIcon
              raised
              name={'delete'}
              type={'material'}
              reverse
              color={'#FC2045'}
            />
          </View>
        ),
        onPress: async () => await dialogDeleteTracking(trackingID),
      },
    ];
  };

  dialogDeleteTracking = trackingID => {
    if (isIos())
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t('text.areYouSureToDeleteTracking'),
          options: [t('button.cancel'), t('button.delete')],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            deleteTracking(trackingID);
          }
        },
      );
    else {
      Alert.alert(
        '',
        t('text.areYouSureToDeleteTracking'),
        [
          {
            text: t('button.cancel'),
          },
          {
            text: t('button.delete'),
            onPress: () => deleteTracking(trackingID),
            style: 'destructive',
          },
        ],
        {
          cancelable: false,
        },
      );
    }
  };

  deleteTracking = async trackingID => {
    let resp = await Api.deleteTracking(
      data?.user?.authenticationJWT,
      trackingID,
    );
    if (resp?.meta?.code === 200) {
      await refreshHistories(false);
      infoMessage(t('placeholder.appName'), t('text.deleteTracking'));
    }
  };

  renderLastStatus = dataLastStatus => {
    return (
      <FlatList
        style={{
          flex: 1,
          paddingTop: 10,
        }}
        data={dataLastStatus}
        horizontal={false}
        numColumns={isIpad() ? 2 : 1}
        scrollEnabled={!spinner}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderFooter.bind(this)}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        onMomentumScrollEnd={({nativeEvent}) => {
          if (isCloseToBottom(nativeEvent)) {
            handleLoadMore();
          }
        }}
        refreshControl={
          <RefreshControl
            tintColor={setting.textColor}
            refreshing={refreshing}
            onRefresh={refreshHistories}
          />
        }
        renderItem={({item, index}) => {
          return (
            <Track
              item={item}
              index={index}
              isHistory={false}
              onPress={() =>
                item.active
                  ? onOpenTrackDetail(item)
                  : onCourierClose(
                      setting.isLanguageTH ? item.nameTH : item.nameEN,
                    )
              }
              onLongPress={() =>
                item.active
                  ? onLongPressTrackDetailMenu(item)
                  : onCourierClose(
                      setting.isLanguageTH ? item.nameTH : item.nameEN,
                    )
              }
              onSwipeoutBtns={() =>
                swipeoutBtns(
                  item.id,
                  item.courierKey,
                  item.trackingNo,
                  setting.isLanguageTH ? item.nameTH : item.nameEH,
                  item.shareLink,
                  item.serviceImageURL,
                )
              }
            />
          );
        }}
        keyExtractor={(_, index) => `lastStatus-${index}`}
      />
    );
  };

  renderNoData = () => {
    return (
      <View
        style={{
          flex: 1,
          marginTop: 15,
        }}>
        <Animatable.View
          animation={'slideInUp'}
          delay={setting?.animation == 'normal' ? 100 : 50 * 0}>
          <FastImage
            resizeMode={FastImage.resizeMode.contain}
            style={styles.imageSearchNotFound}
            source={{uri: SEARCH_NOT_FOUND_URL}}
          />
        </Animatable.View>
        <Animatable.View
          animation={'slideInUp'}
          delay={setting?.animation == 'normal' ? 100 : 50 * 1}>
          <Text
            allowFontScaling={false}
            style={{
              textAlign: 'center',
              justifyContent: 'center',
              fontFamily: 'Kanit-Light',
              color: setting.textColor,
              fontSize: fontSize(17),
              alignSelf: 'center',
              paddingTop: hp(1),
            }}>
            {t('message.yourNoData')}
          </Text>
        </Animatable.View>

        <Animatable.View
          animation={'slideInUp'}
          delay={setting?.animation == 'normal' ? 100 : 50 * 2}>
          <Text
            allowFontScaling={false}
            style={{
              textAlign: 'center',
              justifyContent: 'center',
              fontFamily: 'Kanit-Light',
              color: setting.textColor,
              fontSize: fontSize(13),
              alignSelf: 'center',
              paddingTop: hp(1),
            }}>
            {t('message.pleasePressTheSearchButtonToTrackTheParcel')}
          </Text>
        </Animatable.View>

        <Animatable.View
          animation={'slideInUp'}
          delay={setting?.animation == 'normal' ? 100 : 50 * 3}
          style={{
            justifyContent: 'center',
            textAlign: 'center',
            alignSelf: 'center',
            paddingTop: 20,
            width: 200,
          }}>
          <Ripple
            rippleContainerBorderRadius={20}
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            style={[
              styles.buttonLoginWith,
              {
                backgroundColor: '#FF0055',
                flexDirection: 'row',
                borderRadius: 20,
                height: 40,
              },
            ]}
            onPress={() => {
              if (data.keywordTrackingHistories == '') {
                navigation.navigate(t('placeholder.menu'));
              } else {
                navigation.navigate('TrackDetail', {
                  courier: 'auto-detect',
                  trackingNumber: data.keywordTrackingHistories,
                  isTrackingSearch: true,
                  couriers: data?.couriers,
                });
              }
            }}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
              }}>
              <Text
                allowFontScaling={false}
                style={{
                  color: '#FFF',
                  fontSize: fontSize(11),
                  fontFamily: 'Kanit-Light',
                }}>
                {t('button.tracking')}
              </Text>
            </View>
          </Ripple>
        </Animatable.View>
      </View>
    );
  };

  isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = isIpad() ? 65 : 85;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  handleLoadMore = async () => {
    if (!loadingMore && data?.trackingCount !== data?.lastStatus?.length) {
      setLoadingMore(true);
      dispatch(setLimitTrackingHistories(data.limitTrackingHistories + 5));
      let userData = await getUserData();

      Api.trackHistories(
        userData?.authenticationJWT,
        data?.limitTrackingHistories + 5,
        data?.keywordTrackingHistories,
        data?.status,
        setting?.isHideOnDelivered,
        setting?.isHideOnDelivered,
        setting?.menu,
      ).then(resp => {
        if (resp?.meta?.code === 200) {
          dispatch(searchHistories(resp?.data?.trackHistories || []));
          dispatch(lastStatus(resp?.data?.trackLastUpdateStatuses || []));
          dispatch(trackingCount(resp?.data.count || 0));
        }

        setLoadingMore(false);
      });
    }
  };

  renderFooter = () => {
    return loadingMore ? (
      <View style={styles.footer}>
        <ActivityIndicator
          color={setting.textColor}
          style={{
            marginLeft: 8,
          }}
        />
      </View>
    ) : null;
  };

  renderSearchHistory = () => {
    return (
      <View
        style={{
          flex: 1,
          padding: 10,
        }}>
        <View style={styles.listCard}>
          <Text
            theme={{
              dark: setting.isDarkMode,
              colors: {
                text: setting.textColor,
              },
            }}
            allowFontScaling={false}
            style={styles.textCardList}>
            {t('placeholder.searchHistory')}
          </Text>
        </View>
        {spinner ? (
          <LoaderLastStatus />
        ) : data.searchHistories.length == 0 ? (
          renderNoData()
        ) : (
          renderLastStatus(data.searchHistories)
        )}
      </View>
    );
  };

  goToQRCode = () => {
    SheetManager.show('QRCode', {
      payload: {
        sheetName: 'QRCode',
        navigation: navigation,
        title: t('text.scanToTracking'),
        courier: {
          callCenterPhoneNumber: '',
          color: '#27A7F5',
          facebookURL: '',
          imageURL: 'https://etrackings.com/etracking-icon.png',
          key: 'auto-detect',
          lineOfficialURL: '',
          nameEN: 'Auto detection',
          nameTH: 'ตรวจจับขนส่ง',
          selected: true,
          websiteURL: '',
        },
      },
    });
  };

  onCourierClose = courierName => {
    errorMessage(
      courierName,
      `${courierName} ${t('message.courierNotAvailable')}`,
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: setting.appColor,
      }}>
      <StatusBar
        barStyle={`${setting.isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={setting.appColor}
      />
      <HeaderView
        title={'ETrackings'}
        titleColor={setting.isDarkMode ? Colors.blue200 : Colors.blue700}
        imageURL={
          data?.user?.imageURL ||
          `https://ui-avatars.com/api/?name=${data?.user?.name}&size=350`
        }
        navigation={navigation}
      />
      <View
        style={{
          flex: 0.14,
          marginRight: 15,
          marginBottom: isIpad() ? -50 : 0,
        }}>
        {renderTrackingMenu()}
      </View>
      <View
        style={{
          flexDirection: 'row',
        }}>
        <View
          style={{
            width: '85%',
          }}>
          <Searchbar
            theme={{
              dark: setting.isDarkMode,
              colors: {
                text: setting.textColor,
              },
            }}
            style={{
              backgroundColor: setting.cardColor,
              marginLeft: 20,
              marginRight: 5,
              marginBottom: 20,
            }}
            allowFontScaling={false}
            inputStyle={{
              fontFamily: 'Kanit-Light',
              backgroundColor: setting.cardColor,
            }}
            placeholder={t('button.search')}
            onChangeText={keyword => {
              onSearch(keyword);
            }}
            value={data.keywordTrackingHistories}
          />
        </View>
        <View
          style={{
            width: '15%',
          }}>
          <Ripple
            rippleDuration={setting?.animation == 'normal' ? 600 : 450}
            rippleContainerBorderRadius={15}
            rippleCentered
            rippleSize={75}
            style={{
              marginTop: 7.5,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            disabled={spinner}
            onPress={() => goToQRCode()}>
            <Icon
              name={'qr-code-outline'}
              size={34}
              disabled={spinner}
              color={setting.textColor}
            />
          </Ripple>
        </View>
      </View>
      <View
        style={{
          flex: 1,
        }}>
        {!spinner &&
        data.searchHistories.length == 0 &&
        data.lastStatus.length == 0 &&
        data.keywordTrackingHistories == ''
          ? renderNoData()
          : renderSearchHistory()}
        {!setting?.isHideTrackingButton && (
          <FAB
            style={isDisplayAds(data) ? styles.fabWithAdWithTab : styles.fab}
            icon={() => <MatIonicIcon name={'search'} size={24} />}
            onPress={() => navigation.navigate(t('placeholder.menu'))}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
