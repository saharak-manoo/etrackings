/* eslint-disable react-native/no-inline-styles */
import React, {createRef, useRef, useState, useEffect} from 'react';
import {FlatList, View, StatusBar, Keyboard} from 'react-native';
import {useSelector} from 'react-redux';
import {TextInput, Text, HelperText, ProgressBar} from 'react-native-paper';
import ActionSheet from 'react-native-actions-sheet';
import {useTranslation} from 'react-i18next';
import * as Api from '../actions/api';
import * as Animatable from 'react-native-animatable';
import {HTTP_STATUSES} from '../actions/constants';
import Ripple from 'react-native-material-ripple';
import Icon from 'react-native-vector-icons/Ionicons';
import Spinner from 'react-native-loading-spinner-overlay';
import {SheetManager} from 'react-native-actions-sheet';

// View
import SizeParcel from './sizeParcel';
import ActionSheetCustomBoxView from '../actionSheet/actionSheetCustomBoxView';

export default CheckPriceSearchView = props => {
  const {
    validatePostcode,
    errorMessage,
    validateBlank,
    isIpad,
    hex2rgba,
    fontSize,
    hp,
    animationSpeed,
    animationFadeInUp,
    isLandscape,
  } = require('../../helpers/globalFunction');
  const {t} = useTranslation();
  const isInitialMount = useRef(true);
  const setting = useSelector(state => state.setting);
  const actionSheetRef = createRef();
  const [spinner, setSpinner] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [postcodeFrom, setPostcodeFrom] = useState('');
  const [postcodeTo, setPostcodeTo] = useState('');
  const [weight, setWeight] = useState('100');
  const [sizeParcel, setSizeParcel] = useState('');
  const [sizeParcels, setSizeParcels] = useState([]);
  const [width, setWidth] = useState(1);
  const [length, setLength] = useState(1);
  const [height, setHeight] = useState(1);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setup();
    }
  });

  setup = async () => {
    let resp = await Api.checkPriceSizes();
    if (resp?.meta?.code === 200) {
      setSizeParcel(resp?.data.find(s => s.selected).key);
      setSizeParcels(resp?.data);
      setSpinner(false);
    }

    if (setting.isAutoCopiedText) {
      const text = await Clipboard.getString();
      setTrackingNumber(text);
    } else {
      setTrackingNumber(null);
    }
  };

  checkPriceSearch = async () => {
    setLoadingSearch(true);
    if (validatePostcode(postcodeFrom) || validatePostcode(postcodeTo)) {
      errorMessage('ETrackings', t('message.zipcodeMustBeFive'));
      setLoadingSearch(false);
      return;
    } else if (validateBlank(weight)) {
      errorMessage('ETrackings', t('message.weightCannotBeBlank'));
      setLoadingSearch(false);
      return;
    }

    let params = {
      postcodeFrom: postcodeFrom,
      postcodeTo: postcodeTo,
      weight: weight,
      sizeParcel: sizeParcel,
      width: width,
      length: length,
      height: height,
    };

    let resp = await Api.checkPrice(params);
    if (!HTTP_STATUSES.includes(resp.status) && !resp?.meta) {
      Error.ResponseView(props.navigation, resp.status, SheetManager);
      return;
    }
    if (resp?.meta?.code === 200) {
      if (resp?.data && resp?.data?.length != 0) {
        props.navigation.navigate('CheckPriceDetail', {
          courierPrices: resp.data,
        });
      } else {
        errorMessage('ETrackings', t('message.noDataPleaseTryAgain'));
      }

      setLoadingSearch(false);
    } else {
      errorMessage('ETrackings', t('message.noDataPleaseTryAgain'));
    }

    setLoadingSearch(false);
  };

  onSelectSizeParcel = async (item, index) => {
    sizeParcels.forEach(s => {
      s.selected = false;
    });
    item.selected = !item.selected;
    sizeParcels[index] = item;
    setSizeParcels(sizeParcels);
    setSizeParcel(item.key);
  };

  renderHeader = () => {
    return (
      <View>
        <Animatable.View
          delay={0}
          animation={animationFadeInUp(setting?.animation)}>
          <Text
            theme={{
              dark: setting.isDarkMode,
              colors: {text: setting.textColor},
            }}
            allowFontScaling={false}
            numberOfLines={1}
            style={{
              fontFamily: 'Kanit-Light',
              fontSize: fontSize(23),
              alignSelf: 'flex-start',
              paddingTop: hp(0.1),
              paddingLeft: hp(1),
            }}>
            {t('placeholder.zipcode')}
          </Text>
        </Animatable.View>

        <Animatable.View
          delay={animationSpeed(1)}
          animation={animationFadeInUp(setting?.animation)}>
          <TextInput
            returnKeyLabel={t('button.done')}
            returnKeyType={'done'}
            onSubmitEditing={Keyboard.dismiss}
            keyboardType={'numeric'}
            maxLength={5}
            theme={{
              dark: setting.isDarkMode,
              colors: {text: setting.textColor},
            }}
            style={{
              fontFamily: 'Kanit-Light',
              marginTop: 5,
              marginLeft: 10,
              marginRight: 10,
              backgroundColor: setting.inputColor,
            }}
            autoCapitalize={'none'}
            label={t('placeholder.postcodeFrom')}
            mode={'outlined'}
            value={postcodeFrom}
            keyboardAppearance={setting.theme}
            onChangeText={code => setPostcodeFrom(code)}
          />
          <HelperText
            allowFontScaling={false}
            style={{fontFamily: 'Kanit-Light', color: '#FF3260'}}
            type="error"
            visible={validatePostcode(postcodeFrom)}>
            {t('message.zipcodeMustBeFive')}
          </HelperText>
        </Animatable.View>

        <Animatable.View
          delay={animationSpeed(2)}
          animation={animationFadeInUp(setting?.animation)}>
          <TextInput
            returnKeyLabel={t('button.done')}
            returnKeyType={'done'}
            onSubmitEditing={Keyboard.dismiss}
            keyboardType={'numeric'}
            maxLength={5}
            theme={{
              dark: setting.isDarkMode,
              colors: {text: setting.textColor},
            }}
            style={{
              fontFamily: 'Kanit-Light',
              marginLeft: 10,
              marginRight: 10,
              backgroundColor: setting.inputColor,
            }}
            autoCapitalize={'none'}
            label={t('placeholder.postcodeTo')}
            mode={'outlined'}
            value={postcodeTo}
            keyboardAppearance={setting.theme}
            onChangeText={code => setPostcodeTo(code)}
          />
          <HelperText
            allowFontScaling={false}
            style={{fontFamily: 'Kanit-Light', color: '#FF3260'}}
            type="error"
            visible={validatePostcode(postcodeTo)}>
            {t('message.zipcodeMustBeFive')}
          </HelperText>
        </Animatable.View>

        <Animatable.View
          delay={animationSpeed(3)}
          animation={animationFadeInUp(setting?.animation)}>
          <Text
            theme={{
              dark: setting.isDarkMode,
              colors: {text: setting.textColor},
            }}
            allowFontScaling={false}
            numberOfLines={1}
            style={{
              fontFamily: 'Kanit-Light',
              fontSize: fontSize(23),
              alignSelf: 'flex-start',
              paddingTop: hp(0.1),
              paddingLeft: hp(1),
            }}>
            {t('placeholder.weight')}
          </Text>
        </Animatable.View>
        <Animatable.View
          delay={animationSpeed(3)}
          animation={animationFadeInUp(setting?.animation)}>
          <View style={{flexDirection: 'row'}}>
            <View
              style={{
                width: isIpad() ? (isLandscape() ? '95%' : '90%') : '85%',
              }}>
              <TextInput
                returnKeyLabel={t('button.done')}
                returnKeyType={'done'}
                onSubmitEditing={Keyboard.dismiss}
                keyboardType={'numeric'}
                maxLength={6}
                theme={{
                  dark: setting.isDarkMode,
                  colors: {text: setting.textColor},
                }}
                style={{
                  fontFamily: 'Kanit-Light',
                  marginLeft: 10,
                  marginRight: 10,
                  backgroundColor: setting.inputColor,
                }}
                autoCapitalize={'none'}
                label={t('placeholder.gram')}
                mode={'outlined'}
                value={weight}
                keyboardAppearance={setting.theme}
                onChangeText={val => setWeight(val)}
              />
              <HelperText
                allowFontScaling={false}
                style={{fontFamily: 'Kanit-Light', color: '#FF3260'}}
                type="error"
                visible={validateBlank(weight)}>
                {t('message.weightCannotBeBlank')}
              </HelperText>
            </View>

            <Ripple
              rippleDuration={animationSpeed(4)}
              rippleCentered
              rippleSize={75}
              style={{
                width: isIpad() ? '5%' : '15%',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -20,
              }}
              onPress={() => checkPriceSearch()}>
              <Icon
                name={'search-outline'}
                size={34}
                disabled={loadingSearch}
                color={
                  validatePostcode(postcodeTo) ||
                  validatePostcode(postcodeFrom) ||
                  validateBlank(weight)
                    ? setting.notSelectColor
                    : setting.textColor
                }
              />
            </Ripple>
          </View>
        </Animatable.View>
        <Animatable.View
          delay={animationSpeed(5)}
          animation={animationFadeInUp(setting?.animation)}>
          <Text
            theme={{
              dark: setting.isDarkMode,
              colors: {text: setting.textColor},
            }}
            allowFontScaling={false}
            numberOfLines={1}
            style={{
              fontFamily: 'Kanit-Light',
              fontSize: fontSize(23),
              alignSelf: 'flex-start',
              marginTop: validateBlank(weight) ? hp(0.3) : -16,
              paddingLeft: hp(1),
            }}>
            {t('placeholder.sizeParcel')}
          </Text>
        </Animatable.View>
      </View>
    );
  };

  renderSizeParcel = () => {
    return (
      <FlatList
        ListHeaderComponent={renderHeader()}
        data={sizeParcels}
        numColumns={isIpad() ? (isLandscape() ? 4 : 3) : 2}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={true}
        keyboardDismissMode={'on-drag'}
        renderItem={({item, index}) => {
          let name = setting.isLanguageTH ? item.nameTH : item.nameEN;
          return (
            <SizeParcel
              key={index}
              isLasted={sizeParcels.length - 1 == index}
              index={index + 6}
              selected={item.selected}
              selectedColor={hex2rgba('#3F8AFE', 1)}
              title={
                item.key === 'custom'
                  ? `${name} \n(${width}x${length}x${height} cm)`
                  : name
              }
              backgroundColor={hex2rgba(
                '#3F8AFE',
                setting.isDarkMode ? 0.5 : 0.3,
              )}
              textColor={setting.textColor}
              onPress={() => {
                if (item.key === 'custom') {
                  actionSheetRef.current?.setModalVisible(true);
                } else {
                  setWidth(item?.width);
                  setLength(item?.length);
                  setHeight(item?.height);
                }
                onSelectSizeParcel(item, index);
              }}
            />
          );
        }}
        keyExtractor={(_item, index) => index}
      />
    );
  };

  return (
    <View style={{flex: 1}}>
      <StatusBar
        barStyle={`${setting.isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={setting.appColor}
      />
      <Spinner
        visible={loadingSearch}
        textContent={t('text.loading')}
        textStyle={{color: '#FFF', fontFamily: 'Kanit-Light'}}
      />
      <View>
        {spinner ? (
          <ProgressBar indeterminate={true} color={'#32ADFC'} />
        ) : (
          <View>{renderSizeParcel()}</View>
        )}
      </View>

      <ActionSheet
        ref={actionSheetRef}
        gestureEnabled
        bounceOnOpen
        containerStyle={{backgroundColor: setting.cardColor}}
        onClose={() => {
          SheetManager.hide(sheetName);
        }}>
        <ActionSheetCustomBoxView
          ref={actionSheetRef}
          title={t(`placeholder.customBox`)}
          width={width || 1}
          length={length || 1}
          height={height || 1}
          onSubmit={(w, l, h) => {
            actionSheetRef.current.setModalVisible(false);
            setWidth(w);
            setLength(l);
            setHeight(h);
          }}
        />
      </ActionSheet>
    </View>
  );
};
