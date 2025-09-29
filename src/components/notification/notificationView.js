/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useEffect} from 'react';
import {
  Animated,
  ActivityIndicator,
  FlatList,
  View,
  StatusBar,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {useSelector} from 'react-redux';
import {Badge, Text, Searchbar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import * as Api from '../actions/api';
import {styles} from '../../helpers/styles';
import ActionSheet from 'react-native-action-sheet';
import FastImage from '@d11/react-native-fast-image';
import {
  HTTP_STATUSES,
  TRACK_NOTIFICATIONS,
  APP_NOTIFICATIONS,
  SEARCH_NOT_FOUND_URL,
} from '../actions/constants';
import * as Error from '../../helpers/errorResponse';
import Ripple from 'react-native-material-ripple';
import Swipeout from 'react-native-swipeout';
import {Icon} from 'react-native-elements';
import {hasNotch} from 'react-native-device-info';
import {SheetManager} from 'react-native-actions-sheet';

// View
import HeaderView from '../header/headerView';
import Loading from '../loader/loading';

export default NotificationView = ({navigation}) => {
  const {t} = useTranslation();
  const {
    infoMessage,
    fontSize,
    wp,
    hp,
    isIpad,
    errorMessage,
    copyToClipboard,
  } = require('../../helpers/globalFunction');
  const isInitialMount = useRef(true);
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const [spinner, setSpinner] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [limit, setLimit] = useState(isIpad() ? 30 : 8);
  const [scrollY, setScrollY] = useState(new Animated.Value(0));
  const [notificationCount, setNotificationCount] = useState(0);
  const [search, setSearch] = useState('');
  const [appNotifications, setAppNotifications] = useState([]);
  const [tab, setTab] = useState(TRACK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);
  const types = [
    {
      type: TRACK_NOTIFICATIONS,
      imageURL: null,
      icon: 'notifications',
    },
  ];

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setup();
    }
  });

  setup = async () => {
    await trackNotifications();
  };

  useEffect(() => {
    return navigation.addListener('focus', () => {
      trackNotifications();
    });
  }, [navigation]);

  trackNotifications = () => {
    setRefreshing(true);

    Api.notifications(data?.user?.authenticationJWT, limit).then(resp => {
      if (!HTTP_STATUSES.includes(resp.status) && !resp?.meta) {
        Error.ResponseView(navigation, resp.status, SheetManager);
        return;
      }
      if (resp?.meta?.code === 200) {
        setNotifications(resp.data.notifications);
        setNotificationCount(resp.data.count);
      } else {
        errorMessage(t('message.error'), t('message.unableToLoadNotification'));
      }

      setSpinner(false);
      setRefreshing(false);
    });
  };

  loadAppNotifications = () => {
    Api.appNotifications(data?.user?.authenticationJWT).then(resp => {
      if (!HTTP_STATUSES.includes(resp.status) && !resp?.meta) {
        Error.ResponseView(navigation, resp.status, SheetManager);
        return;
      }
      if (resp?.meta?.code === 200) {
        setAppNotifications(resp.data);
      } else {
        errorMessage(t('message.error'), t('message.unableToLoadNotification'));
      }

      setSpinner(false);
    });
  };

  onActionSheet = async (
    notificationTrackingID,
    courier,
    trackingNumber,
    serviceName,
  ) => {
    let title = `${t('text.notiTracking', {
      courier: serviceName,
      trackingNumber: trackingNumber,
    })}`;

    ActionSheet.showActionSheetWithOptions(
      {
        title: title,
        options: [
          t('button.open'),
          t('button.copy'),
          t('button.delete'),
          t('button.cancel'),
        ],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 3,
      },
      async buttonIndex => {
        if (buttonIndex === 0) {
          navigation.navigate('TrackDetail', {
            courier: courier,
            trackingNumber: trackingNumber,
          });
        } else if (buttonIndex === 1) {
          copyToClipboard(trackingNumber);
        } else if (buttonIndex === 2) {
          await deleteTrackingNotification(notificationTrackingID);
        }
      },
    );
  };

  deleteTrackingNotification = async notificationTrackingID => {
    let resp = await Api.deleteTrackingNotification(
      data?.user?.authenticationJWT,
      notificationTrackingID,
    );
    if (!HTTP_STATUSES.includes(resp.status) && !resp?.meta) {
      Error.ResponseView(navigation, resp.status, SheetManager);
      return;
    }

    if (resp?.meta?.code === 200) {
      await setup();
      infoMessage(
        t('placeholder.appName'),
        t('text.deleteTrackingNotification'),
      );
    }
  };

  isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = isIpad() ? 65 : 85;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  renderFooter = () => {
    return loadingMore ? (
      <View style={styles.footer}>
        <ActivityIndicator color={setting.textColor} style={{marginLeft: 8}} />
      </View>
    ) : null;
  };

  handleLoadMore = async () => {
    if (!loadingMore && notificationCount !== notifications.length) {
      setLoadingMore(true);
      setLimit(limit + 5);
      Api.notifications(data?.user?.authenticationJWT, limit + 5).then(resp => {
        if (resp?.meta?.code === 200) {
          setNotifications(resp.data.notifications);
          setNotificationCount(resp.data.count);
          setLoadingMore(false);
        } else {
          errorMessage(
            t('message.error'),
            t('message.unableToLoadNotification'),
          );
        }
      });
    }
  };

  swipeoutBtns = (notificationTrackingID, courier, trackingNumber) => {
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
            <Icon
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
            <Icon
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
            <Icon
              raised
              name={'delete'}
              type={'material'}
              reverse
              color={'#FC2045'}
            />
          </View>
        ),
        onPress: async () =>
          await deleteTrackingNotification(notificationTrackingID),
      },
    ];
  };

  renderNotifications = () => {
    return (
      <FlatList
        style={{flex: 1, backgroundColor: setting.appColor}}
        data={notifications}
        horizontal={false}
        numColumns={isIpad() ? 2 : 1}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderFooter.bind(this)}
        scrollEventThrottle={16}
        onScroll={Animated.event([
          {nativeEvent: {contentOffset: {y: scrollY}}},
        ])}
        onEndReachedThreshold={0.5}
        onEndReached={({distanceFromEnd}) => {
          if (distanceFromEnd < 0) return;
          handleLoadMore();
        }}
        refreshControl={
          <RefreshControl
            tintColor={setting.textColor}
            refreshing={refreshing}
            onRefresh={refreshNotifications}
          />
        }
        contentContainerStyle={{
          paddingBottom: data?.user?.isPremium ? (hasNotch() ? 85 : 65) : 0,
        }}
        renderItem={({item, index}) => {
          let dates = (
            setting.isLanguageTH ? item.updatedAtStrTH : item.updatedAtStrEN
          ).split(' ');
          return (
            <Animatable.View
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
              delay={
                limit == (isIpad() ? 25 : 8)
                  ? index <= 25
                    ? index *
                      (index + setting?.animation == 'normal' ? 110 : 55)
                    : 0
                  : 0
              }>
              <Swipeout
                autoClose
                right={swipeoutBtns(item.id, item.courierKey, item.trackingNo)}
                backgroundColor={setting.appColor}
                style={{
                  alignContent: 'center',
                  textAlign: 'center',
                }}>
                <Ripple
                  rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                  rippleContainerBorderRadius={15}
                  key={`notification-${index}`}
                  onPress={() => {
                    navigation.navigate('TrackDetail', {
                      courier: item.courierKey,
                      trackingNumber: item.trackingNo,
                    });
                  }}
                  style={{
                    flex: 1,
                    fontFamily: 'Kanit-Light',
                    backgroundColor: setting.cardColor,
                    margin: hp(1),
                    borderRadius: 15,
                    width: isIpad() ? wp(46.5) : wp(90),
                    height: 130,
                  }}
                  onLongPress={() =>
                    onActionSheet(
                      item.id,
                      item.courierKey,
                      item.trackingNo,
                      setting.isLanguageTH ? item.nameTH : item.nameEN,
                    )
                  }>
                  <View style={{flex: 1}}>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                      <View
                        style={{
                          width: '20%',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={[
                            styles.notiTextStyle,
                            {color: setting.textColor},
                          ]}>
                          {dates[0]}
                        </Text>
                        <Text
                          style={[
                            styles.notiSubTextStyle,
                            {color: setting.textColor},
                          ]}>
                          {dates[1]}
                        </Text>
                        <Text
                          style={[
                            styles.notiSubTextStyle,
                            {color: setting.textColor},
                          ]}>
                          {dates[2]}
                        </Text>
                      </View>
                      <View
                        style={{width: '62%', justifyContent: 'flex-start'}}>
                        <Text
                          theme={{
                            dark: setting.isDarkMode,
                            colors: {text: setting.textColor},
                          }}
                          allowFontScaling={false}
                          numberOfLines={1}
                          style={{
                            alignContent: 'flex-start',
                            fontFamily: 'Kanit-Light',
                            fontSize: fontSize(18),
                            alignSelf: 'flex-start',
                            paddingTop: hp(1),
                            paddingLeft: hp(2),
                          }}>
                          {item.trackingNo}
                        </Text>

                        <Text
                          theme={{
                            dark: setting.isDarkMode,
                            colors: {text: setting.textColor},
                          }}
                          allowFontScaling={false}
                          numberOfLines={1}
                          style={{
                            fontFamily: 'Kanit-Light',
                            fontSize: fontSize(14),
                            alignSelf: 'flex-start',
                            paddingTop: hp(0.5),
                            paddingLeft: hp(2),
                          }}>
                          {setting.isLanguageTH ? item.nameTH : item.nameEN}
                        </Text>

                        <Text
                          theme={{
                            dark: setting.isDarkMode,
                            colors: {text: setting.textColor},
                          }}
                          allowFontScaling={false}
                          numberOfLines={2}
                          style={{
                            fontFamily: 'Kanit-Light',
                            fontSize: fontSize(9),
                            alignSelf: 'flex-start',
                            paddingTop: hp(0.5),
                            paddingLeft: hp(2),
                          }}>
                          {item.message}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: '13%',
                          justifyContent: 'center',
                          marginLeft: 6.5,
                        }}>
                        <Badge
                          size={20}
                          style={{
                            marginEnd: -6,
                            marginBottom: -10,
                            zIndex: 100,
                            backgroundColor: '#12F08B',
                          }}
                          visible={item.isUnread}></Badge>
                        <FastImage
                          resizeMode={FastImage.resizeMode.contain}
                          style={[
                            styles.imageNotification,
                            {
                              marginBottom: 10,
                            },
                          ]}
                          source={{
                            uri: item.imageURL,
                            priority: FastImage.priority.normal,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </Ripple>
              </Swipeout>
            </Animatable.View>
          );
        }}
        keyExtractor={(item, index) => `notification-${index}`}
      />
    );
  };

  renderNoNotification = () => {
    return (
      <View style={{flex: 1, marginTop: 30}}>
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
            {t('message.yourNoDataNotification')}
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
          delay={100 * 2}
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
            onPress={() => navigation.navigate(t('placeholder.menu'))}>
            <View style={{flex: 1, alignItems: 'center'}}>
              <Text
                allowFontScaling={false}
                style={{
                  color: '#FFF',
                  fontSize: fontSize(10),
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

  onSearch = async keyword => {
    setSpinner(true);
    setSearch(keyword);
    setTimeout(async () => {
      let resp = await Api.notifications(
        data?.user?.authenticationJWT,
        limit,
        keyword,
      );
      if (!HTTP_STATUSES.includes(resp.status) && !resp?.meta) {
        Error.ResponseView(navigation, resp.status, SheetManager);
        return;
      }

      if (resp?.meta?.code === 200) {
        setNotifications(resp.data.notifications);
        setNotificationCount(resp.data.count);
      } else {
        errorMessage(t('message.error'), t('message.unableToLoadNotification'));
      }

      setSpinner(false);
    }, 400);
  };

  renderListNotifications = () => {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: setting.appColor,
        }}>
        <View style={{flex: 1}}>
          <Searchbar
            theme={{
              dark: setting.isDarkMode,
              colors: {text: setting.textColor},
            }}
            style={{
              backgroundColor: setting.cardColor,
              marginLeft: 20,
              marginRight: 20,
              marginBottom: 20,
              marginTop: 5,
            }}
            inputStyle={{
              fontFamily: 'Kanit-Light',
              backgroundColor: setting.cardColor,
            }}
            allowFontScaling={false}
            placeholder={t('button.search')}
            onChangeText={keyword => {
              onSearch(keyword);
            }}
            value={search}
          />
          <View
            style={{
              padding: 12,
              height: '90%',
              borderRadius: 15,
            }}>
            {!spinner && notifications.length == 0 ? (
              renderNoNotification()
            ) : spinner ? (
              <Loading />
            ) : (
              renderNotifications()
            )}
          </View>
        </View>
      </View>
    );
  };

  renderNoAppNotification = () => {
    return (
      <View style={{flex: 1, justifyContent: 'center', marginBottom: 10}}>
        <Animatable.View animation={'slideInUp'} delay={100 * 0}>
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
            {t('message.noAppNotifications')}
          </Text>
        </Animatable.View>
      </View>
    );
  };

  renderAppNotifications = () => {
    return (
      <FlatList
        style={{flex: 1, backgroundColor: setting.appColor}}
        data={appNotifications}
        horizontal={false}
        numColumns={isIpad() ? 2 : 1}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderFooter.bind(this)}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}
        onEndReachedThreshold={0.5}
        onEndReached={({distanceFromEnd}) => {
          if (distanceFromEnd < 0) return;
          handleLoadMore();
        }}
        contentContainerStyle={{
          paddingBottom: data?.user?.isPremium ? (hasNotch() ? 85 : 65) : 0,
        }}
        renderItem={({item, index}) => {
          let dates = (
            setting.isLanguageTH ? item.updatedAtStrTH : item.updatedAtStrEN
          ).split(' ');
          return (
            <Animatable.View
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
              delay={
                limit == (isIpad() ? 25 : 8)
                  ? index <= 25
                    ? index *
                      (index + setting?.animation == 'normal' ? 110 : 55)
                    : 0
                  : 0
              }>
              <Ripple
                rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                rippleContainerBorderRadius={15}
                key={`notification-${index}`}
                onPress={() => {
                  navigation.navigate('NotificationDetail', {
                    notification: item,
                  });
                }}
                style={{
                  flex: 1,
                  fontFamily: 'Kanit-Light',
                  backgroundColor: setting.cardColor,
                  margin: hp(1),
                  borderRadius: 15,
                  width: isIpad() ? wp(46.5) : wp(90),
                  height: 130,
                }}>
                <View style={{flex: 1}}>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <View
                      style={{
                        width: '20%',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={[
                          styles.notiTextStyle,
                          {color: setting.textColor},
                        ]}>
                        {dates[0]}
                      </Text>
                      <Text
                        style={[
                          styles.notiSubTextStyle,
                          {color: setting.textColor},
                        ]}>
                        {dates[1]}
                      </Text>
                      <Text
                        style={[
                          styles.notiSubTextStyle,
                          {color: setting.textColor},
                        ]}>
                        {dates[2]}
                      </Text>
                    </View>
                    <View style={{width: '75%', justifyContent: 'flex-start'}}>
                      <Text
                        theme={{
                          dark: setting.isDarkMode,
                          colors: {text: setting.textColor},
                        }}
                        allowFontScaling={false}
                        numberOfLines={1}
                        style={{
                          alignContent: 'flex-start',
                          fontFamily: 'Kanit-Light',
                          fontSize: fontSize(18),
                          alignSelf: 'flex-start',
                          paddingTop: hp(1),
                          paddingLeft: hp(2),
                        }}>
                        {item.title}
                      </Text>

                      <Text
                        theme={{
                          dark: setting.isDarkMode,
                          colors: {text: setting.textColor},
                        }}
                        allowFontScaling={false}
                        numberOfLines={2}
                        style={{
                          fontFamily: 'Kanit-Light',
                          fontSize: fontSize(15),
                          alignSelf: 'flex-start',
                          paddingTop: hp(0.5),
                          paddingLeft: hp(2),
                        }}>
                        {item.message}
                      </Text>
                    </View>
                  </View>
                </View>
              </Ripple>
            </Animatable.View>
          );
        }}
        keyExtractor={(item, index) => `notification-${index}`}
      />
    );
  };

  renderListAppNotifications = () => {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: setting.appColor,
        }}>
        <View style={{flex: 1}}>
          <View
            style={{
              padding: 12,
              height: '100%',
              backgroundColor: setting.appColor,
              borderRadius: 15,
            }}>
            {!spinner && appNotifications.length == 0 ? (
              renderNoAppNotification()
            ) : spinner ? (
              <Loading />
            ) : (
              renderAppNotifications()
            )}
          </View>
        </View>
      </View>
    );
  };

  renderNoti = () => {
    if (tab === APP_NOTIFICATIONS) {
      return renderListAppNotifications();
    } else {
      return renderListNotifications();
    }
  };

  refreshNotifications = async (reload = true) => {
    setRefreshing(reload);
    await trackNotifications();
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: setting.appColor}}>
      <StatusBar
        barStyle={`${setting.isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={setting.appColor}
      />
      <HeaderView
        title={t('placeholder.notifications')}
        titleFontSize={33}
        imageURL={
          data?.user?.imageURL ||
          `https://ui-avatars.com/api/?name=${data?.user?.name}&size=350`
        }
        navigation={navigation}
      />
      {renderListNotifications()}
    </SafeAreaView>
  );
};
