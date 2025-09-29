/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useEffect} from 'react';
import {Animated, FlatList, View, SafeAreaView} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {admobKey} from '../../helpers/admob';
import * as Animatable from 'react-native-animatable';
import {useSelector} from 'react-redux';
import {Badge, Text, Searchbar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import * as Api from '../actions/api';
import Ripple from 'react-native-material-ripple';
import {styles} from '../../helpers/styles';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import GetLocation from 'react-native-get-location';
import getDirections from 'react-native-google-maps-directions';
import {HTTP_STATUSES} from '../actions/constants';
import * as Error from '../../helpers/errorResponse';
import {hasNotch} from 'react-native-device-info';
import {SheetManager} from 'react-native-actions-sheet';

// View
import IOSHeader from '../header/iosHeaderView';
import Loading from '../loader/loading';

export default CheckPriceStoreView = ({navigation, route: {params}}) => {
  const {t} = useTranslation();
  const {
    isDisplayAds,
    hp,
    fontSize,
    isPresent,
    isIpad,
    errorMessage,
  } = require('../../helpers/globalFunction');
  const isInitialMount = useRef(true);
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const store = params.store;
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
        .then(async respLocation => {
          setLocation(respLocation);
          let resp = await Api.storesByCourier(
            data?.user?.authenticationJWT,
            store?.key,
            respLocation?.latitude,
            respLocation?.longitude,
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
        .catch(e => {
          console.log('error -> ', e);
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
        renderItem={({item, index}) => {
          return (
            <Animatable.View
              delay={
                index <= 25
                  ? index * (index + setting?.animation === 'normal' ? 110 : 55)
                  : 0
              }
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}>
              <View
                style={{
                  marginBottom:
                    stores.length - 1 == index ? (hasNotch() ? 85 : 65) : 0,
                  backgroundColor: setting.cardColor,
                  height: 110,
                  marginTop: 10,
                  borderRadius: 20,
                  justifyContent: 'center',
                }}>
                <View style={{flexDirection: 'row'}}>
                  <View style={{width: '75%'}}>
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
                      width: '15%',
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
                      width: '15%',
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
        keyExtractor={(_item, index) => `zipcode-${index}`}
      />
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: setting.appColor}}>
      <IOSHeader
        title={t('placeholder.store')}
        subtitle={store?.name}
        canGoBack={true}
        imageURL={store?.imageURL}
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: setting.appColor,
          padding: isIpad() ? 80 : 0,
        }}>
        <View style={{flex: 1, padding: 10}}>
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
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps={true}
              scrollEventThrottle={16}
              keyboardDismissMode={'on-drag'}
              onScroll={Animated.event([
                {
                  nativeEvent: {
                    contentOffset: {
                      y: scrollY,
                    },
                  },
                },
              ])}
              onMomentumScrollEnd={({nativeEvent}) => {
                if (isCloseToBottom(nativeEvent)) handleLoadMore();
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
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
