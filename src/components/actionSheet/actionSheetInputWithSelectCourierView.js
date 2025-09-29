import React, { useState } from 'react';
import ActionSheet, {
  SheetManager,
  useSheetPayload,
} from 'react-native-actions-sheet';
import { View, FlatList } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import {
  Text,
  TextInput,
  HelperText,
  Searchbar,
  Button,
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';
import Ripple from 'react-native-material-ripple';
import Icon from 'react-native-vector-icons/Ionicons';

// View
import Courier from '../courier/courierView';

export default ActionSheetInputWithSelectCourierView = () => {
  const {
    sheetName,
    navigation,
    title,
    subTitle,
    isLoading,
    onSubmit,
    word,
    dataCouriers,
    inputPlaceholder,
    inputLabel,
    requiredText,
    isRequired,
  } = useSheetPayload('payload');
  const {
    hp,
    fontSize,
    validateBlank,
    isPresent,
    isIpad,
    height,
    hex2rgba,
  } = require('../../helpers/globalFunction');
  // redux
  const { t } = useTranslation();
  const setting = useSelector(state => state.setting);
  const [text, setText] = useState(word);
  const [courier, setCourier] = useState('');
  const [couriers, setCouriers] = useState(
    (dataCouriers || []).filter(c => c.key !== 'auto-detect'),
  );
  const [searchCourier, setSearchCourier] = useState('');
  const [isSearchCourier, setIsSearchCourier] = useState(false);

  onSelectedCourier = async (courierData, index) => {
    couriers.forEach(s => {
      s.selected = false;
    });

    courierData.selected = !courierData.selected;
    couriers[index] = courierData;
    setCouriers(couriers);
    setCourier(courierData.key);
  };

  renderCouriers = () => {
    return (
      <FlatList
        style={{ flex: 1 }}
        data={couriers}
        numColumns={isIpad() ? 3 : 2}
        showsVerticalScrollIndicator={false}
        initialNumToRender={30}
        renderItem={({ item, index }) => {
          return (
            <Courier
              key={index}
              isLasted={couriers.length - 1 == index}
              index={index + 3}
              selected={item.selected}
              selectedColor={hex2rgba(item.color || '#5A4DF2', 1)}
              title={setting.isLanguageTH ? item.nameTH : item.nameEN}
              backgroundColor={hex2rgba(
                item.color || '#5A4DF2',
                setting.isDarkMode ? 0.5 : 0.3,
              )}
              isSmall={true}
              isNoBottom={true}
              isCloseAnimation={true}
              imageURL={item.imageURL}
              textColor={setting.textColor}
              disabled={!item.active}
              onPress={() => onSelectedCourier(item, index)}
            />
          );
        }}
        keyExtractor={(item, index) => index}
      />
    );
  };

  validateAll = () => {
    if (isRequired) {
      if (!validateBlank(text)) {
        if (couriers.length != 0) {
          return !validateBlank(courier);
        } else {
          return true;
        }
      } else {
        return false;
      }
    } else {
      return true;
    }
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
        delay={setting?.animation == 'normal' ? 70 : 35}
        animation={setting?.animation != 'close' ? 'fadeIn' : ''}
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
      (dataCouriers || [])
        ?.filter(c => c.key !== 'auto-detect')
        ?.filter(
          c =>
            c?.nameTH?.toLowerCase()?.includes(keyword?.toLowerCase()) ||
            c?.nameEN?.toLowerCase()?.includes(keyword?.toLowerCase()),
        )
        ?.map((c, index) => {
          return { ...c, selected: index === 0 };
        }),
    );
  };

  return (
    <ActionSheet
      gestureEnabled
      bounceOnOpen
      containerStyle={{ backgroundColor: setting.cardColor }}
      onClose={() => {
        SheetManager.hide(sheetName);
        navigation.goBack();
      }}
    >
      <View
        style={{
          padding: 10,
          backgroundColor: setting.cardColor,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: '70%' }}>
            <Text
              theme={{
                dark: setting.isDarkMode,
                colors: { text: setting.textColor },
              }}
              numberOfLines={2}
              allowFontScaling={false}
              style={{
                alignContent: 'center',
                fontFamily: 'Kanit-Light',
                fontSize: fontSize(23),
                paddingTop: hp(0.5),
                paddingLeft: hp(1),
              }}
            >
              {title}
            </Text>
          </View>
          <View style={{ width: '30%' }}>
            <View style={{ marginTop: 7 }}>
              <Button
                mode={'contained'}
                style={{
                  textColor: setting.textColor,
                  borderRadius: 8,
                  shadowColor: '#03DAC6',
                }}
                color={'#03DAC6'}
                loading={isLoading}
                disabled={isLoading || !validateAll()}
                onPress={() => {
                  if (validateAll()) onSubmit(text, courier);

                  SheetManager.hide(sheetName);
                  navigation.goBack();
                }}
              >
                {t('button.save')}
              </Button>
            </View>
          </View>
        </View>

        {subTitle && (
          <Text
            theme={{
              dark: setting.isDarkMode,
              colors: { text: setting.textColor },
            }}
            allowFontScaling={false}
            style={{
              alignContent: 'center',
              fontFamily: 'Kanit-Light',
              fontSize: fontSize(12),
              paddingTop: hp(0.5),
              paddingLeft: hp(1),
            }}
          >
            {subTitle}
          </Text>
        )}

        <TextInput
          placeholder={inputPlaceholder}
          theme={{
            dark: setting.isDarkMode,
            colors: { text: setting.textColor },
          }}
          style={{
            fontFamily: 'Kanit-Light',
            marginTop: 5,
            margin: 10,
            backgroundColor: setting.inputColor,
          }}
          right={
            <TextInput.Icon
              icon={'close'}
              theme={{
                dark: setting.isDarkMode,
                colors: { text: setting.notSelectColor },
              }}
              style={{
                display: isPresent(text) ? 'flex' : 'none',
              }}
              onPress={() => {
                setText(null);
              }}
            />
          }
          allowFontScaling={false}
          autoCapitalize={'none'}
          label={inputLabel}
          mode={'outlined'}
          value={text}
          keyboardAppearance={setting.theme}
          onChangeText={t => setText(t)}
        />

        {isRequired && validateBlank(text) ? (
          <HelperText
            allowFontScaling={false}
            style={{ fontFamily: 'Kanit-Light', color: '#FF3260' }}
            type={'error'}
            visible={validateBlank(text)}
          >
            {requiredText || t('message.cannotBeBlank')}
          </HelperText>
        ) : null}

        {couriers.length != 0 || searchCourier != '' ? (
          <>
            <View>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '90%' }}>
                  <Text
                    theme={{
                      dark: setting.isDarkMode,
                      colors: { text: setting.textColor },
                    }}
                    numberOfLines={1}
                    allowFontScaling={false}
                    style={{
                      fontFamily: 'Kanit-Light',
                      fontSize: fontSize(18),
                      alignSelf: 'flex-start',
                      marginTop: hp(0.5),
                      paddingLeft: hp(1),
                    }}
                  >
                    {t('placeholder.courier')}
                  </Text>
                </View>
                <View style={{ width: '10%' }}>
                  <Ripple
                    rippleDuration={setting?.animation == 'normal' ? 600 : 450}
                    rippleCentered
                    rippleSize={75}
                    rippleContainerBorderRadius={50}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 5,
                    }}
                    onPress={() => setIsSearchCourier(!isSearchCourier)}
                  >
                    <Icon
                      name={'search-outline'}
                      size={24}
                      color={setting.textColor}
                    />
                  </Ripple>
                </View>
              </View>

              {isSearchCourier && renderSearchInput()}
            </View>

            <View style={{ height: height() / 4 }}>
              <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps={true}
                keyboardDismissMode={'on-drag'}
              >
                {couriers.length == 0 ? renderNoCourier() : renderCouriers()}
              </ScrollView>
            </View>
          </>
        ) : null}
      </View>
    </ActionSheet>
  );
};
