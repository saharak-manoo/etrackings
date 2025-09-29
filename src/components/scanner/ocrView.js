/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useState, useEffect } from 'react';
import { Animated, FlatList, View, Platform, StatusBar } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { Text, Searchbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import * as Api from '../actions/api';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import * as Animatable from 'react-native-animatable';
import * as Error from '../../helpers/errorResponse';
import ImageResizer from 'react-native-image-resizer';
import Spinner from 'react-native-loading-spinner-overlay';
import { SheetManager } from 'react-native-actions-sheet';

// View
import Courier from '../courier/courierView';

const options = {
  title: i18next.t('button.imagePicker'),
  takePhotoButtonTitle: i18next.t('button.takePhoto'),
  chooseFromLibraryButtonTitle: i18next.t('button.chooseFromLibrary'),
  cancelButtonTitle: i18next.t('button.cancel'),
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
  mediaType: 'photo',
  quality: 0.99,
  pauseAfterCapture: true,
  doNotSave: true,
  fixOrientation: true,
  forceUpOrientation: true,
  isVertical: true,
  rotation: 360,
};

export default OcrView = props => {
  const { t } = useTranslation();
  const {
    errorMessage,
    isIpad,
    isLandscape,
    fontSize,
    hex2rgba,
    hp,
  } = require('../../helpers/globalFunction');
  const isInitialMount = useRef(true);
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const [spinner, setSpinner] = useState(true);
  const [courier, setCourier] = useState('');
  const [couriers, setCouriers] = useState([]);
  const [limit, setLimit] = useState(isIpad() ? 30 : 15);
  const [searchCourier, setSearchCourier] = useState('');
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setup();
    }
  });

  setup = async () => {
    try {
      setupCourier(limit);
      setSpinner(false);
    } catch {
      Error.ResponseView(props.navigation, 0, SheetManager);
    }
  };

  setupCourier = loadLimit => [
    setCouriers(
      data?.couriers.slice(0, loadLimit)?.filter(c => c.key !== 'auto-detect'),
    ),
  ];

  handleLoadMore = async () => {
    if (data?.couriers?.length !== couriers?.length) {
      setLimit(limit + 10);
      setupCourier(limit + 10);
    }
  };

  isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = isIpad() ? 65 : 85;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  onSelectCourier = async (courierData, index) => {
    couriers.forEach(s => {
      s.selected = false;
    });
    courierData.selected = !courierData.selected;
    couriers[index] = courierData;
    setCouriers(couriers);
    setCourier(courierData);
  };

  renderCouriers = () => {
    return (
      <FlatList
        data={couriers}
        numColumns={isIpad() ? (isLandscape() ? 4 : 3) : 2}
        showsVerticalScrollIndicator={false}
        initialNumToRender={isIpad() ? 40 : 30}
        renderItem={({ item, index }) => {
          return (
            <Courier
              key={index}
              isLasted={couriers.length - 1 == index}
              index={index + 2}
              selected={item.selected}
              selectedColor={hex2rgba(item.color || '#5A4DF2', 1)}
              title={setting.isLanguageTH ? item.nameTH : item.nameEN}
              backgroundColor={hex2rgba(
                item.color || '#5A4DF2',
                setting.isDarkMode ? 0.5 : 0.3,
              )}
              imageURL={item.imageURL}
              textColor={setting.textColor}
              disabled={!item.active}
              onPress={() => onSelectCourier(item, index)}
              onLongPress={async () => {
                onSelectCourier(item, index);
                openImagePicker();
              }}
            />
          );
        }}
        keyExtractor={(item, index) => index}
      />
    );
  };

  imageToBase64 = async uri => {
    const filePath =
      Platform.OS === 'android' && uri.replace
        ? uri.replace('file:/data', '/data')
        : uri;
    const photoData = await RNFS.readFile(filePath, 'base64');
    const photoBase64 = `data:image/jpeg;base64, ${photoData}`;

    return photoBase64;
  };

  openImagePicker = async () => {
    if (!courier.key) {
      errorMessage('ETrackings', t('placeholder.pleaseSelectCourier'));
      setSpinner(false);
      return;
    }

    launchImageLibrary(options, async response => {
      if (response.uri) {
        setSpinner(true);
        ImageResizer.createResizedImage(response.uri, 2200, 1200, 'PNG', 10)
          .then(async imageResizerResp => {
            let resp = await Api.trackOcr(
              data?.user?.authenticationJWT,
              courier.key,
              imageResizerResp,
            );
            if (resp?.meta?.code === 200) {
              if (resp.data.length == 0) {
                errorMessage('ETrackings', t('message.noDataPleaseTryAgain'));
              } else {
                props.navigation.navigate('OcrDetail', {
                  showAds: () => show(),
                  tracks: resp?.data?.map(d => {
                    return {
                      trackingNo: d,
                      currentStatus: t('text.loadingParcel'),
                      courier: courier,
                    };
                  }),
                });
              }
              setSpinner(false);
            } else {
              errorMessage('ETrackings', t('message.noDataPleaseTryAgain'));
              setSpinner(false);
            }
          })
          .catch(() => {
            errorMessage('ETrackings', t('message.noDataPleaseTryAgain'));
            setSpinner(false);
          });
      } else {
        setSpinner(false);
      }
    });
  };

  renderSearchInput = () => {
    return (
      <Animatable.View
        delay={setting?.animation == 'normal' ? 70 : 35}
        animation={setting?.animation != 'close' ? 'fadeIn' : ''}
      >
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
          value={searchCourier}
        />
      </Animatable.View>
    );
  };

  renderNoCourier = () => {
    return (
      <Animatable.View
        delay={setting?.animation == 'normal' ? 100 : 50}
        animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
      >
        <Text
          theme={{
            dark: setting.isDarkMode,
            colors: { text: setting.textColor },
          }}
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            fontFamily: 'Kanit-Light',
            fontSize: fontSize(20),
            alignSelf: 'center',
            justifyContent: 'center',
            alignContent: 'center',
            paddingTop: hp(2.5),
          }}
        >
          {t('message.noData')}
        </Text>
      </Animatable.View>
    );
  };

  onSearchCourier = keyword => {
    setSearchCourier(keyword);
    setCouriers(
      data?.couriers
        ?.filter(c => c.key !== 'auto-detect')
        ?.filter(
          c =>
            c?.nameTH?.toLowerCase()?.includes(keyword?.toLowerCase()) ||
            c?.nameEN?.toLowerCase()?.includes(keyword?.toLowerCase()),
        )
        .slice(0, limit)
        ?.map((c, index) => {
          return { ...c, selected: index === 0 };
        }),
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle={`${setting.isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={setting.appColor}
      />
      <Spinner
        visible={spinner}
        textContent={t('text.loading')}
        textStyle={{ color: '#FFF', fontFamily: 'Kanit-Light' }}
      />

      <Animatable.View
        delay={0}
        animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
      >
        <Text
          theme={{
            dark: setting.isDarkMode,
            colors: { text: setting.textColor },
          }}
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            fontFamily: 'Kanit-Light',
            fontSize: fontSize(23),
            alignSelf: 'flex-start',
            paddingTop: hp(0.2),
            paddingLeft: hp(1),
          }}
        >
          {t('placeholder.courier')}
          <Text
            theme={{
              dark: setting.isDarkMode,
              colors: { text: setting.textColor },
            }}
            numberOfLines={1}
            allowFontScaling={false}
            style={{
              fontFamily: 'Kanit-Light',
              fontSize: fontSize(14),
              alignSelf: 'flex-start',
              paddingTop: hp(0.2),
              paddingLeft: hp(1),
            }}
          >
            {` (${t('placeholder.pressAndHold')})`}
          </Text>
        </Text>
      </Animatable.View>
      {renderSearchInput()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={true}
        keyboardDismissMode={'on-drag'}
        scrollEventThrottle={16}
        onScroll={Animated.event([
          {
            nativeEvent: {
              contentOffset: {
                y: scrollY,
              },
            },
          },
        ])}
        onMomentumScrollEnd={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) handleLoadMore();
        }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          {couriers.length == 0 ? renderNoCourier() : renderCouriers()}
        </View>
      </ScrollView>
    </View>
  );
};
