/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useEffect, useState} from 'react';
import {View, StatusBar, FlatList, SafeAreaView} from 'react-native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

// View
import HeaderView from '../header/headerView';
import SearchMenu from './searchMenu';
import TrackingSearch from './trackingSearch';
import CheckPriceSearchView from '../checkPrice/checkPriceSearchView';
import StoreView from '../store/storeView';
import CallCenterView from '../callCenter/callCenterView';
import OcrView from '../scanner/ocrView';
import ZipcodeView from '../zipcode/zipcodeView';

export default SearchView = ({navigation}) => {
  const {t} = useTranslation();
  const {isIpad, hex2rgba} = require('../../helpers/globalFunction');
  const isInitialMount = useRef(true);
  const [screen, setScreen] = useState('tracking');
  const data = useSelector(state => state.data);
  const setting = useSelector(state => state.setting);
  const screens = [
    {
      name: 'tracking',
      icon: 'search',
    },
    {
      name: 'checkPrice',
      icon: 'check',
    },
    {
      name: 'store',
      icon: 'store',
    },
    {
      name: 'callCenter',
      icon: 'phone',
    },
    {
      name: 'zipcode',
      icon: 'send',
    },
  ];

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  });

  renderSearchMenu = () => {
    return (
      <FlatList
        style={{
          flex: 1,
          paddingLeft: 10,
          paddingRight: 10,
        }}
        data={screens}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({item, index}) => {
          return (
            <SearchMenu
              index={index}
              selected={screen == item.name}
              title={t(`placeholder.${item.name}`)}
              iconName={item.icon}
              color={hex2rgba('#13D3B6', 1)}
              onPress={() => setScreen(item.name)}
            />
          );
        }}
        keyExtractor={(item, index) => index}
      />
    );
  };

  renderContent = () => {
    switch (screen) {
      case 'tracking':
        return <TrackingSearch navigation={navigation} />;

      case 'checkPrice':
        return <CheckPriceSearchView navigation={navigation} />;

      case 'store':
        return <StoreView navigation={navigation} />;

      case 'callCenter':
        return <CallCenterView navigation={navigation} />;

      case 'ocr':
        return <OcrView navigation={navigation} />;

      case 'zipcode':
        return <ZipcodeView navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: setting.appColor}}>
      <StatusBar
        barStyle={`${setting.isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={setting.appColor}
      />
      <HeaderView
        title={t(`placeholder.${screen}`)}
        imageURL={
          data.user?.imageURL ||
          `https://ui-avatars.com/api/?name=${data?.user?.name}&size=350`
        }
        navigation={navigation}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: setting.appColor,
        }}>
        <View
          style={{
            flex: 0.095,
            paddingRight: 15,
            marginBottom: isIpad() ? -50 : 0,
          }}>
          {renderSearchMenu()}
        </View>
        <View style={{flex: 1, paddingLeft: 10, paddingRight: 10}}>
          {renderContent()}
        </View>
      </View>
    </SafeAreaView>
  );
};
