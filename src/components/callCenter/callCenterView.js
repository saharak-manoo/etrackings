/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useEffect} from 'react';
import {Animated, FlatList, View, StatusBar, Linking} from 'react-native';
import {useSelector} from 'react-redux';
import {Text, Searchbar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import Ripple from 'react-native-material-ripple';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import {styles} from '../../helpers/styles';
import * as Animatable from 'react-native-animatable';
import FastImage from '@d11/react-native-fast-image';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import {hasNotch} from 'react-native-device-info';

// View
import Loading from '../loader/loading';

export default callCenterView = props => {
  const {t} = useTranslation();
  const {
    isPresent,
    isLandscape,
    isIpad,
    hp,
    fontSize,
  } = require('../../helpers/globalFunction');
  const isInitialMount = useRef(true);
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const [spinner, setSpinner] = useState(true);
  const [search, setSearch] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [limit, setLimit] = useState(isIpad() ? 30 : 20);
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
    setCouriers(courierForCallCenter(limit));
    setSpinner(false);
  };

  courierForCallCenter = limiter => {
    return data?.couriers
      .slice(0, limiter)
      ?.filter(c => c.key !== 'auto-detect')
      ?.filter(
        c =>
          isPresent(c.websiteURL) ||
          isPresent(c.facebookURL) ||
          isPresent(c.lineOfficialURL) ||
          isPresent(c.callCenterPhoneNumber),
      );
  };

  handleLoadMore = async () => {
    if (data?.couriers?.length !== couriers?.length) {
      setLimit(limit + 10);
      setCouriers(courierForCallCenter(limit + 10));
    }
  };

  onSearchCourier = keyword => {
    setSearch(keyword);
    if (isPresent(keyword)) {
      setCouriers(
        data?.couriers
          ?.filter(c => c.key !== 'auto-detect')
          ?.filter(
            c =>
              isPresent(c.websiteURL) ||
              isPresent(c.facebookURL) ||
              isPresent(c.lineOfficialURL) ||
              isPresent(c.callCenterPhoneNumber),
          )
          ?.filter(s => {
            keyword = keyword?.toLowerCase();

            return (
              s?.nameTH?.toLowerCase()?.includes(keyword) ||
              s?.nameEN?.toLowerCase()?.includes(keyword) ||
              s?.callCenterPhoneNumber?.toLowerCase()?.includes(keyword) ||
              s?.websiteURL?.toLowerCase()?.includes(keyword) ||
              s?.facebookURL?.toLowerCase()?.includes(keyword)
            );
          })
          .slice(0, limit),
      );
    } else {
      setup();
    }
  };

  renderCourierCallCenter = () => {
    return (
      <FlatList
        data={couriers}
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
        keyboardDismissMode={'on-drag'}
        onEndReachedThreshold={0.5}
        onEndReached={({distanceFromEnd}) => {
          if (distanceFromEnd < 0) return;
          handleLoadMore();
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
                    couriers.length - 1 == index ? (hasNotch() ? 95 : 75) : 0,
                  backgroundColor: setting.cardColor,
                  height: 110,
                  marginTop: 10,
                  borderRadius: 20,
                  justifyContent: 'center',
                }}>
                <View style={{flexDirection: 'row'}}>
                  <View
                    style={{
                      width: isLandscape() ? '7%' : '16%',
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
                  <View style={{width: isLandscape() ? '75%' : '50%'}}>
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
                        fontSize: fontSize(isIpad() ? 19 : 15),
                        alignSelf: 'flex-start',
                        paddingTop: hp(0.2),
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
                      numberOfLines={1}
                      style={{
                        alignContent: 'flex-start',
                        fontFamily: 'Kanit-Light',
                        fontSize: fontSize(isIpad() ? 13 : 11),
                        alignSelf: 'flex-start',
                        paddingLeft: hp(2),
                      }}>
                      {setting.isLanguageTH ? item.nameEN : item.nameTH}
                    </Text>
                  </View>

                  {isPresent(item?.websiteURL) && (
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      rippleContainerBorderRadius={15}
                      onPress={() => openLink(item?.websiteURL)}
                      style={{
                        width: isLandscape() ? '7%' : '10%',
                        justifyContent: 'flex-end',
                        alignSelf: 'center',
                      }}>
                      <MatIcon
                        name={'language'}
                        style={[
                          styles.callIcon,
                          {
                            color: '#0FC8F1',
                          },
                        ]}
                      />
                    </Ripple>
                  )}
                  {isPresent(item?.callCenterPhoneNumber) && (
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      rippleContainerBorderRadius={15}
                      onPress={() =>
                        openLink(`tel:${item?.callCenterPhoneNumber}`)
                      }
                      style={{
                        width: isLandscape() ? '5%' : '10%',
                        justifyContent: 'flex-end',
                        alignSelf: 'center',
                      }}>
                      <MatIcon
                        name={'phone'}
                        style={[
                          styles.callIcon,
                          {
                            color: '#28DCA5',
                          },
                        ]}
                      />
                    </Ripple>
                  )}
                  {isPresent(item?.facebookURL) && (
                    <Ripple
                      rippleDuration={
                        setting?.animation == 'normal' ? 600 : 450
                      }
                      rippleContainerBorderRadius={15}
                      onPress={() => openLink(item?.facebookURL)}
                      style={{
                        width: isLandscape() ? '5%' : '10%',
                        justifyContent: 'flex-end',
                        alignSelf: 'center',
                      }}>
                      <FAIcon
                        name={'facebook'}
                        style={[
                          styles.callIcon,
                          {
                            color: '#298EFF',
                          },
                        ]}
                      />
                    </Ripple>
                  )}
                </View>
              </View>
            </Animatable.View>
          );
        }}
        keyExtractor={(_item, index) => `callCenter-${index}`}
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
          onSearchCourier(keyword);
        }}
        value={search}
      />
      <View
        style={{
          padding: 15,
          height: '100%',
          backgroundColor: setting.appColor,
        }}>
        {!spinner && couriers.length == 0 ? (
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
          renderCourierCallCenter()
        )}
      </View>
    </View>
  );
};
