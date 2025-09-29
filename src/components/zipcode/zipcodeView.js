/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useEffect} from 'react';
import {hasNotch} from 'react-native-device-info';
import FastImage from '@d11/react-native-fast-image';
import {SafeAreaView, FlatList, View, StatusBar} from 'react-native';
import {useSelector} from 'react-redux';
import {Searchbar, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import * as Api from '../actions/api';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import {styles} from '../../helpers/styles';
import * as Animatable from 'react-native-animatable';
import {HTTP_STATUSES, SEARCH_NOT_FOUND_URL} from '../actions/constants';
import * as Error from '../../helpers/errorResponse';
import Ripple from 'react-native-material-ripple';
import {SheetManager} from 'react-native-actions-sheet';

// View
import Loading from '../loader/loading';

export default zipcodeView = props => {
  const {t} = useTranslation();
  const {
    errorMessage,
    isIpad,
    isLandscape,
    fontSize,
    hp,
    copyToClipboard,
  } = require('../../helpers/globalFunction');
  const isInitialMount = useRef(true);
  const setting = useSelector(state => state.setting);
  const [search, setSearch] = useState('');
  const [spinner, setSpinner] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [limit, setLimit] = useState(30);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setup();
    }
  });

  setup = async () => {
    try {
      let resp = await Api.addresses(limit);
      if (!HTTP_STATUSES.includes(resp.status) && !resp?.meta) {
        Error.ResponseView(props.navigation, resp.status, SheetManager);
        return;
      }

      if (resp?.meta?.code === 200) {
        setAddresses(resp?.data);
      } else {
        props.onClose();
        errorMessage(t('message.error'), t('message.unableToLoadZipcode'));
      }

      setSpinner(false);
    } catch {
      Error.ResponseView(props.navigation, 0, SheetManager);
    }
  };

  onSearch = async keyword => {
    setSpinner(true);
    setSearch(keyword);

    let resp = await Api.addresses(limit, keyword);
    if (resp?.meta?.code === 200) {
      setAddresses(resp?.data);
      setSpinner(false);
    }
  };

  copyToClipboardText = item => {
    let text = setting.isLanguageTH
      ? `${t('text.subDistrict')} ${item.subDistrictNameTH} ${t(
          'text.district',
        )} ${item.districtNameTH} ${t('text.province')} ${
          item.provinceNameTH
        } ${t('text.zipcode')} ${item.zipcode}`
      : `${item.subDistrictNameEN}, ${item.districtNameEN}, ${item.provinceNameEN} ${item.zipcode}`;

    copyToClipboard(text);
  };

  renderText = (item, isTH) => {
    return isTH
      ? `ต.${item.subDistrictNameTH} อ.${item.districtNameTH} จ.${item.provinceNameTH}`
      : `${item.subDistrictNameEN}, ${item.districtNameEN}, ${item.provinceNameEN}`;
  };

  renderZipcode = () => {
    return (
      <FlatList
        data={addresses}
        initialNumToRender={40}
        horizontal={false}
        showsVerticalScrollIndicator={false}
        renderItem={({item, index}) => {
          return (
            <Animatable.View
              delay={
                index <= 25
                  ? index * (index + setting?.animation == 'normal' ? 110 : 55)
                  : 0
              }
              animation={setting?.animation != 'close' ? 'fadeInUp' : ''}>
              <Ripple
                rippleDuration={600}
                rippleContainerBorderRadius={20}
                onPress={() => copyToClipboardText(item)}
                style={{
                  marginBottom:
                    addresses.length - 1 == index ? (hasNotch() ? 85 : 65) : 0,
                  backgroundColor: setting.cardColor,
                  height: 100,
                  marginTop: 10,
                  borderRadius: 20,
                  justifyContent: 'center',
                }}>
                <View style={{flexDirection: 'row'}}>
                  <View style={{width: isLandscape() ? '95%' : '90%'}}>
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
                        paddingTop: hp(1),
                        paddingLeft: hp(2),
                      }}>
                      {`${item.zipcode} ${
                        setting.isLanguageTH
                          ? item.subDistrictNameTH
                          : item.subDistrictNameEN
                      }`}
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
                      {renderText(item, setting.isLanguageTH)}
                    </Text>
                  </View>

                  <View
                    style={{
                      width: '10%',
                      justifyContent: 'flex-end',
                      alignSelf: 'center',
                    }}>
                    <MatIcon name={'content-copy'} style={styles.copyIcon} />
                  </View>
                </View>
              </Ripple>
            </Animatable.View>
          );
        }}
        keyExtractor={(item, index) => `addesse-${index}`}
      />
    );
  };

  renderNoData = () => {
    return (
      <View style={{flex: 1, marginTop: 15}}>
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
            {t('message.noDataPostalCodeInformation')}
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
            onPress={() => {
              onSearch('');
            }}>
            <View style={{flex: 1, alignItems: 'center'}}>
              <Text
                allowFontScaling={false}
                style={{
                  color: '#FFF',
                  fontSize: fontSize(10),
                  fontFamily: 'Kanit-Light',
                }}>
                {t('button.clear')}
              </Text>
            </View>
          </Ripple>
        </Animatable.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: setting.appColor}}>
      <StatusBar
        barStyle={`${setting.isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={setting.appColor}
      />
      <Searchbar
        theme={{dark: setting.isDarkMode, colors: {text: setting.textColor}}}
        style={{
          backgroundColor: setting.cardColor,
          marginLeft: 10,
          marginRight: 10,
          marginTop: 15,
          marginBottom: 10,
        }}
        inputStyle={{
          fontFamily: 'Kanit-Light',
          backgroundColor: setting.cardColor,
        }}
        placeholder={t('button.search')}
        onChangeText={search => {
          onSearch(search);
        }}
        value={search}
      />
      <View
        style={{
          padding: 15,
          height: '100%',
          backgroundColor: setting.appColor,
        }}>
        {!spinner && addresses.length == 0 ? (
          renderNoData()
        ) : spinner ? (
          <Loading />
        ) : (
          renderZipcode()
        )}
      </View>
    </SafeAreaView>
  );
};
