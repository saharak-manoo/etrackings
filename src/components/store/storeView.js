/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useEffect} from 'react';
import {hasNotch} from 'react-native-device-info';
import {Animated, FlatList, View, StatusBar, Linking} from 'react-native';
import {useSelector} from 'react-redux';
import {Badge, Text, Searchbar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import Ripple from 'react-native-material-ripple';
import * as Api from '../actions/api';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import {styles} from '../../helpers/styles';
import * as Animatable from 'react-native-animatable';
import {HTTP_STATUSES} from '../actions/constants';
import * as Error from '../../helpers/errorResponse';
import GetLocation from 'react-native-get-location';
import FastImage from '@d11/react-native-fast-image';
import getDirections from 'react-native-google-maps-directions';
import {SheetManager} from 'react-native-actions-sheet';

// View
import Loading from '../loader/loading';

export default storeView = props => {
  const {t} = useTranslation();
  const {
    isIpad,
    isPresent,
    fontSize,
    hp,
    isLandscape,
    errorMessage,
  } = require('../../helpers/globalFunction');
  const isInitialMount = useRef(true);
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const [spinner, setSpinner] = useState(true);
  const [location, setLocation] = useState(null);
  const [search, setSearch] = useState(null);
  const [allStore, setAllStore] = useState([]);
  const [stores, setStores] = useState([]);
  const [limit, setLimit] = useState(isIpad() ? 30 : 10);
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setup();
    }
  });

  openLink = async urlLink => {
    Linking.openURL(urlLink);
  };

  setup = async () => {
    try {
      GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      })
        .then(async loc => {
          setLocation(loc);
          let resp = await Api.stores(
            data?.user?.authenticationJWT,
            loc?.latitude,
            loc?.longitude,
          );
          if (!HTTP_STATUSES.includes(resp.status) && !resp?.meta) {
            Error.ResponseView(props.navigation, resp.status, SheetManager);
            return;
          }

          if (resp?.meta?.code === 200) {
            setAllStore(resp?.data);
            setupStore(limit);
          } else {
            errorMessage(t('message.error'), t('message.unableToGetStores'));
          }

          setSpinner(false);
        })
        .catch(() => {
          setSpinner(false);
          errorMessage(t('message.error'), t('message.unableToGetLocation'));
        });
    } catch {
      Error.ResponseView(props.navigation, 0, SheetManager);
    }
  };

  mapDirections = (latitude, longitude) => {
    const googleMapParams = {
      source: {
        latitude: location?.latitude,
        longitude: location?.longitude,
      },
      destination: {
        latitude: latitude,
        longitude: longitude,
      },
      params: [
        {
          key: 'travelmode',
          value: 'driving',
        },
        {
          key: 'dir_action',
          value: 'navigate',
        },
      ],
    };

    getDirections(googleMapParams);
  };

  setupStore = loadLimit => {
    setStores(allStore?.slice(0, loadLimit));
  };

  handleLoadMore = async () => {
    if (allStore?.length !== stores?.length) {
      setLimit(limit + 10);
      setupStore(limit + 10);
    }
  };

  onSearchStore = keyword => {
    setSearch(keyword);
    if (isPresent(keyword)) {
      setStores(
        allStore
          ?.filter(s => {
            keyword = keyword?.toLowerCase();

            return (
              s?.name?.toLowerCase()?.includes(keyword) ||
              s?.address?.toLowerCase()?.includes(keyword) ||
              s?.type?.toLowerCase()?.includes(keyword) ||
              s?.openHour?.toLowerCase()?.includes(keyword)
            );
          })
          .slice(0, limit),
      );
    } else {
      setupStore(limit);
    }
  };

  renderStore = () => {
    return (
      <FlatList
        data={stores}
        initialNumToRender={35}
        onScroll={Animated.event([
          {
            nativeEvent: {
              contentOffset: {
                y: scrollY,
              },
            },
          },
        ])}
        scrollEventThrottle={16}
        onEndReachedThreshold={0.5}
        onEndReached={({distanceFromEnd}) => {
          if (distanceFromEnd < 0) return;
          handleLoadMore();
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({item, index}) => {
          return (
            <Animatable.View
              delay={
                index <= 25
                  ? index * (index + setting?.animation == 'normal' ? 110 : 55)
                  : 0
              }
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}>
              <View
                style={{
                  marginBottom:
                    stores.length - 1 == index ? (hasNotch() ? 95 : 75) : 0,
                  backgroundColor: setting.cardColor,
                  height: 110,
                  marginTop: 10,
                  borderRadius: 20,
                  justifyContent: 'center',
                }}>
                <View style={{flexDirection: 'row'}}>
                  <View
                    style={{
                      width: isLandscape() ? '7%' : '14%',
                      justifyContent: 'center',
                    }}>
                    <FastImage
                      resizeMode={FastImage.resizeMode.contain}
                      style={
                        isLandscape()
                          ? styles.imageStoreForIpadLandscape
                          : styles.imageStore
                      }
                      source={{
                        uri: item.imageURL,
                        priority: FastImage.priority.normal,
                      }}
                    />
                  </View>
                  <View style={{width: isLandscape() ? '80%' : '61%'}}>
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
                        fontSize: fontSize(isIpad() ? 18 : 14),
                        alignSelf: 'flex-start',
                        paddingTop: hp(0.2),
                        paddingLeft: hp(2),
                      }}>
                      {item?.name}
                    </Text>

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
                        fontSize: fontSize(isIpad() ? 12 : 10),
                        alignSelf: 'flex-start',
                        paddingLeft: hp(2),
                      }}>
                      {item?.address}
                    </Text>

                    <View style={{flexDirection: 'row'}}>
                      {isPresent(item?.type) && (
                        <Badge
                          style={{
                            backgroundColor: '#006ECF',
                            marginLeft: 15,
                          }}>
                          <Text
                            theme={{
                              dark: setting.isDarkMode,
                              colors: {text: '#FFF'},
                            }}
                            allowFontScaling={false}
                            numberOfLines={1}
                            style={{
                              alignContent: 'flex-start',
                              fontFamily: 'Kanit-Light',
                              fontSize: fontSize(isIpad() ? 12 : 10),
                              alignSelf: 'flex-start',
                            }}>
                            {item?.type}
                          </Text>
                        </Badge>
                      )}
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
                          fontSize: fontSize(isIpad() ? 12 : 10),
                          alignSelf: 'flex-start',
                          paddingLeft: hp(2),
                        }}>
                        {`${parseFloat(item?.distance)?.toFixed(2)} ${t(
                          'placeholder.km',
                        )}`}
                      </Text>
                    </View>

                    {isPresent(item?.openHour) && (
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
                          fontSize: fontSize(isIpad() ? 12 : 10),
                          alignSelf: 'flex-start',
                          paddingLeft: hp(2),
                        }}>
                        {`${t('placeholder.open')} ${item?.openHour}`}
                      </Text>
                    )}
                  </View>

                  <Ripple
                    rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                    rippleContainerBorderRadius={15}
                    onPress={() =>
                      isPresent(item?.phoneNumber)
                        ? openLink(`tel:${item?.phoneNumber}`)
                        : null
                    }
                    style={{
                      paddingLeft: 10,
                      width: isLandscape() ? '7%' : '15%',
                      justifyContent: 'flex-end',
                      alignSelf: 'center',
                    }}>
                    <MatIcon
                      name={'phone'}
                      style={[
                        styles.callIcon,
                        {
                          color: isPresent(item?.phoneNumber)
                            ? '#28DCA5'
                            : '#666666',
                        },
                      ]}
                    />
                  </Ripple>
                  <Ripple
                    rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                    rippleContainerBorderRadius={15}
                    onPress={() =>
                      mapDirections(item?.latitude, item?.longitude)
                    }
                    style={{
                      width: '10%',
                      justifyContent: 'flex-end',
                      alignSelf: 'center',
                    }}>
                    <MatIcon name={'map'} style={styles.mapIcon} />
                  </Ripple>
                </View>
              </View>
            </Animatable.View>
          );
        }}
        keyExtractor={(item, index) => `store-${index}`}
      />
    );
  };

  return (
    <View style={{flex: 1}}>
      <StatusBar
        barStyle={`${setting.isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={setting.appColor}
      />
      <Searchbar
        theme={{
          dark: setting.isDarkMode,
          colors: {
            text: setting.textColor,
          },
        }}
        style={{
          backgroundColor: setting.cardColor,
          marginTop: 5,
          margin: 10,
        }}
        allowFontScaling={false}
        inputStyle={{
          fontFamily: 'Kanit-Light',
          backgroundColor: setting.cardColor,
        }}
        placeholder={t('button.search')}
        onChangeText={keyword => {
          onSearchStore(keyword);
        }}
        value={search}
      />
      <View
        style={{
          padding: 15,
          height: '100%',
          backgroundColor: setting.appColor,
        }}>
        {!spinner && stores.length == 0 ? (
          <Text
            allowFontScaling={false}
            theme={{
              dark: setting.isDarkMode,
              colors: {
                text: setting.textColor,
              },
            }}
            style={{
              marginTop: 10,
              alignSelf: 'center',
              justifyContent: 'center',
              fontSize: fontSize(isIpad() ? 22 : 18),
              fontFamily: 'Kanit-Light',
            }}>
            {t('message.noData')}
          </Text>
        ) : spinner ? (
          <Loading />
        ) : (
          renderStore()
        )}
      </View>
    </View>
  );
};
