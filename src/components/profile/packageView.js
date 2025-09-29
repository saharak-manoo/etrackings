/* eslint-disable react-native/no-inline-styles */
import React, {createRef, useState, useEffect} from 'react';
import Config from 'react-native-config';
import {SafeAreaView, View, FlatList} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ActionSheet from 'react-native-actions-sheet';
import AnimateLoadingButton from 'react-native-animate-loading-button';
import {requestPurchase, useIAP, withIAPContext} from 'react-native-iap';
import {useTranslation} from 'react-i18next';
import {Colors, Text} from 'react-native-paper';
import {ListItem} from 'react-native-elements';
import Ripple from 'react-native-material-ripple';
import Spinner from 'react-native-loading-spinner-overlay';
import {SKUS} from '../actions/constants';
import {setUserToStorage, setGuestRemovedAds, setUserWithApi} from '../actions';
import {appleTermsOfUse, etrackingsPrivacyPolicy} from '../../../app.json';
import analytics from '@react-native-firebase/analytics';
import * as Api from '../actions/api';

import IOSHeader from '../header/iosHeaderView';

const PackageView = ({navigation, route: {params}}) => {
  const {t} = useTranslation();
  const {checkReceiptAndroid, checkReceiptIos} = require('../../helpers/iap');
  const {
    isLogin,
    successMessage,
    errorMessage,
    isIos,
    isIpad,
    isAndroid,
    width,
    fontSize,
    hp,
    encryptedStorageSetItem,
    encryptedStorageRemoveItem,
  } = require('../../helpers/globalFunction');
  const {products, getProducts, currentPurchase, finishTransaction} = useIAP();
  const dispatch = useDispatch();
  const actionSheetRef = createRef();
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const [spinner, setSpinner] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  loadProducts = async () => {
    try {
      await getProducts({skus: SKUS});

      // console.log('getProducts products -> ', products);
      // await getSubscriptions({skus: ITEM_SKUS});

      // if (params?.productID) {
      //   let item = subscriptions.find(p => p.productId === params?.productID);
      //   setProduct(item);
      //   buySubscription(item);
      // }

      setSpinner(false);
    } catch (error) {
      console.log('loadProducts error -> ', error);
      setSpinner(false);
      errorMessage('ETrackings', t('message.purchaseError'));
      navigation.goBack();
    }
  };

  useEffect(() => {
    checkCurrentPurchase();
  }, [currentPurchase, finishTransaction]);

  const checkCurrentPurchase = async () => {
    try {
      if (currentPurchase?.productId) {
        let receipt = currentPurchase.transactionReceipt;

        if (receipt) {
          let receiptData = currentPurchase;
          receiptData.isSubscription = true;
          receiptData.price = product.price;
          await checkIsPayment(receiptData);

          if (isLogin(data?.user)) {
            await dispatch(setUserWithApi(navigation));
          } else {
            await dispatch(setGuestRemovedAds());
          }
        }

        await finishTransaction({
          purchase: currentPurchase,
          isConsumable: false,
        });
      }
    } catch (error) {
      console.log('checkCurrentPurchase error -> ', error);
    }
  };

  const buy = async productData => {
    try {
      if (isLogin(data?.user)) {
        await analytics().logEvent('iap', {
          productId: productData?.productId,
          price: productData?.price,
        });

        await encryptedStorageRemoveItem('isDoNotWarnMeAgain');
        setLoading(true);
        loadingBtn?.showLoading(true);

        let sku = isAndroid()
          ? {skus: [productData.productId]}
          : {sku: productData.productId};

        await requestPurchase(sku);

        let userParams = {isPremium: false, isNoAds: false};
        if (productData.productId == 'no_ads') {
          userParams = {isPremium: false, isNoAds: true};
        } else {
          userParams = {isPremium: true, isNoAds: true};
        }

        let resp = await Api.updateUser(
          data?.user?.authenticationJWT,
          userParams,
        );

        if (resp?.meta?.code === 200) {
          dispatch(setUserToStorage(resp.data));
          successMessage('ETrackings', t('message.purchaseSuccess'));
          loadingBtn?.showLoading(false);
          setLoading(false);
          actionSheetRef?.current?.setModalVisible(false);
          navigation.goBack();
        } else {
          console.log('[buySubscription] update error -> ', resp?.meta);
          loadingBtn?.showLoading(false);
          setLoading(false);
          errorMessage('ETrackings', t('message.purchaseError'));
        }
      }
    } catch (error) {
      console.log('[buySubscription] error -> ', error);
      loadingBtn?.showLoading(false);
      setLoading(false);
      errorMessage('ETrackings', t('message.purchaseError'));
    }
  };

  checkIsPayment = async receiptData => {
    try {
      let respData;
      if (isAndroid()) {
        let payload = {
          packageName: receiptData.packageName,
          productId: receiptData.productId,
          purchaseToken: receiptData.purchaseToken,
          price: receiptData.price,
          isSubscription: receiptData.isSubscription,
        };

        respData = await checkReceiptAndroid(product, payload);
      } else {
        respData = await checkReceiptIos(product, receiptData);
      }

      await encryptedStorageSetItem('purchaseData', JSON.stringify(respData));
    } catch (error) {
      console.log('checkIsPayment err => ', err);
      errorMessage('ETrackings', t('message.error'));
    }
  };

  getProduct = key => {
    return products.filter(s => {
      if (key == 'remove_ads') {
        return s.productId.includes(key) || s.productId.includes('no_ads');
      } else {
        return s.productId.includes(key);
      }
    });
  };

  renderProducts = (key, productID) => {
    return (
      <View>
        <Text
          theme={{
            dark: setting.isDarkMode,
            colors: {text: setting.textColor},
          }}
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            paddingBottom: 10,
            fontFamily: 'Kanit-Light',
            fontSize: fontSize(18),
            alignSelf: 'flex-start',
            paddingTop: hp(0.5),
            paddingLeft: hp(1),
          }}>
          {t(`placeholder.${key}`)}
        </Text>
        <FlatList
          data={getProduct(productID)}
          renderItem={({item, index}) => {
            return (
              <Ripple
                rippleDuration={
                  setting?.animation == 'normal' ? 100 * index : 50 * index
                }
                onPress={() => {
                  actionSheetRef.current?.setModalVisible(true);
                  setProduct(item);
                }}>
                <ListItem
                  containerStyle={{
                    backgroundColor: setting.cardColor,
                  }}
                  title={`${t(`text.${item.productId}`)} ${
                    item.localizedPrice
                  }`}
                  titleStyle={{
                    fontFamily: 'Kanit-Light',
                    color: setting.textColor,
                  }}
                  rightIcon
                />
              </Ripple>
            );
          }}
          keyExtractor={(_item, index) => index}
        />
      </View>
    );
  };

  renderIAPDetail = () => {
    return (
      <View>
        <Text
          theme={{
            dark: setting.isDarkMode,
            colors: {text: setting.textColor},
          }}
          allowFontScaling={false}
          style={{
            alignContent: 'center',
            fontFamily: 'Kanit-Light',
            fontSize: fontSize(13),
            paddingTop: hp(0.5),
            paddingLeft: hp(1),
          }}>
          {`- ${t('text.removeAds')}`}
        </Text>
        {product.productId.includes('premium') && (
          <>
            <Text
              theme={{
                dark: setting.isDarkMode,
                colors: {text: setting.textColor},
              }}
              allowFontScaling={false}
              style={{
                alignContent: 'center',
                fontFamily: 'Kanit-Light',
                fontSize: fontSize(13),
                paddingTop: hp(0.5),
                paddingLeft: hp(1),
              }}>
              {`- ${t('text.openNotificationAuto')}`}
            </Text>
            <Text
              theme={{
                dark: setting.isDarkMode,
                colors: {text: setting.textColor},
              }}
              allowFontScaling={false}
              style={{
                alignContent: 'center',
                fontFamily: 'Kanit-Light',
                fontSize: fontSize(13),
                paddingTop: hp(0.5),
                paddingLeft: hp(1),
              }}>
              {`- ${t('text.notificationOfParcelStatusCanSeparateStatus')}`}
            </Text>
            <Text
              theme={{
                dark: setting.isDarkMode,
                colors: {text: setting.textColor},
              }}
              allowFontScaling={false}
              style={{
                alignContent: 'center',
                fontFamily: 'Kanit-Light',
                fontSize: fontSize(13),
                paddingTop: hp(0.5),
                paddingLeft: hp(1),
              }}>
              {`- ${t('text.fullStatusNotification')}`}
            </Text>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: setting.appColor}}>
      <IOSHeader
        title={t(spinner ? 'text.loading' : 'text.package')}
        subtitle={t(spinner ? 'text.loading' : 'text.choosePackage')}
        canGoBack={true}
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: setting.appColor,
        }}>
        <Spinner
          visible={loading}
          textContent={t('text.loading')}
          textStyle={{color: '#FFF', fontFamily: 'Kanit-Light'}}
        />
        {!spinner && (
          <View
            style={{
              backgroundColor: setting.appColor,
              height: '100%',
              borderRadius: 15,
              paddingTop: 10,
            }}>
            {JSON.parse(Config.IS_IN_APP_PURCHASE)
              ? renderProducts('removeAds', 'remove_ads')
              : null}
            {JSON.parse(Config.IS_IN_APP_PURCHASE)
              ? renderProducts('premium', 'premium')
              : null}
          </View>
        )}

        <ActionSheet
          ref={actionSheetRef}
          gestureEnabled
          bounceOnOpen
          containerStyle={{backgroundColor: setting.cardColor}}>
          <View
            style={{
              padding: 10,
              marginBottom: 30,
              backgroundColor: setting.cardColor,
            }}>
            {product != null && (
              <>
                <View style={{flexDirection: 'row'}}>
                  <View style={{width: '65%'}}>
                    <Text
                      theme={{
                        dark: setting.isDarkMode,
                        colors: {text: setting.textColor},
                      }}
                      numberOfLines={2}
                      allowFontScaling={false}
                      style={{
                        alignContent: 'center',
                        fontFamily: 'Kanit-Light',
                        fontSize: fontSize(20),
                        paddingTop: hp(0.5),
                        paddingLeft: hp(1),
                      }}>
                      {t(`text.${product.productId}`)}
                    </Text>
                  </View>
                  <View style={{width: '35%'}}>
                    <Text
                      theme={{
                        dark: setting.isDarkMode,
                        colors: {text: setting.textColor},
                      }}
                      numberOfLines={2}
                      allowFontScaling={false}
                      style={{
                        marginTop: 5,
                        alignContent: 'flex-end',
                        alignSelf: 'flex-end',
                        fontFamily: 'Kanit-Light',
                        fontSize: fontSize(15),
                        paddingTop: hp(0.5),
                        paddingLeft: hp(1),
                      }}>
                      {product.localizedPrice}
                    </Text>
                  </View>
                </View>
                {renderIAPDetail()}

                {['no_ads', 'premium'].includes(product.productId) ? (
                  <>
                    <Text
                      theme={{
                        dark: setting.isDarkMode,
                        colors: {text: Colors.red300},
                      }}
                      allowFontScaling={false}
                      style={{
                        alignContent: 'center',
                        fontFamily: 'Kanit-Light',
                        fontSize: fontSize(10),
                        paddingTop: hp(0.5),
                        paddingLeft: hp(1),
                        paddingBottom: 15,
                      }}>
                      {`* ${t('text.forAccountEtrackingsOnly')}`}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text
                      theme={{
                        dark: setting.isDarkMode,
                        colors: {text: setting.textColor},
                      }}
                      allowFontScaling={false}
                      style={{
                        padding: 10,
                        paddingBottom: 10,
                        fontFamily: 'Kanit-Light',
                        fontSize: fontSize(13),
                        alignSelf: 'flex-start',
                        paddingTop: hp(0.5),
                        paddingLeft: hp(1),
                      }}>
                      {`- ${t('text.theSystemWillAutomaticallyRenew')}`}
                    </Text>
                    <Text
                      theme={{
                        dark: setting.isDarkMode,
                        colors: {text: Colors.red300},
                      }}
                      allowFontScaling={false}
                      style={{
                        alignContent: 'center',
                        fontFamily: 'Kanit-Light',
                        fontSize: fontSize(10),
                        paddingTop: hp(0.5),
                        paddingLeft: hp(1),
                        paddingBottom: 15,
                      }}>
                      {`* ${t('text.forAccountPaymentOnly')}`}
                    </Text>
                  </>
                )}

                {isIos() && (
                  <Text
                    theme={{
                      dark: setting.isDarkMode,
                      colors: {text: Colors.blue600},
                    }}
                    allowFontScaling={false}
                    style={{
                      alignContent: 'center',
                      fontFamily: 'Kanit-Light',
                      fontSize: fontSize(10),
                      paddingTop: hp(0.5),
                      paddingLeft: hp(1),
                      paddingBottom: 15,
                    }}
                    onPress={() => {
                      openLink(appleTermsOfUse);
                    }}>
                    {t('text.appleTermsOfUse')}
                  </Text>
                )}

                <Text
                  theme={{
                    dark: setting.isDarkMode,
                    colors: {text: Colors.blue600},
                  }}
                  allowFontScaling={false}
                  style={{
                    alignContent: 'center',
                    fontFamily: 'Kanit-Light',
                    fontSize: fontSize(10),
                    paddingTop: hp(0.5),
                    paddingLeft: hp(1),
                    paddingBottom: 15,
                  }}
                  onPress={() => {
                    openLink(etrackingsPrivacyPolicy);
                  }}>
                  {t('text.privacyPolicy')}
                </Text>

                <AnimateLoadingButton
                  ref={c => setLoadingBtn(c)}
                  width={isIpad() ? width() / 1.25 : width() / 1.1}
                  height={50}
                  title={t('button.pay')}
                  titleFontFamily={'Kanit-Light'}
                  titleFontSize={fontSize(14)}
                  titleColor={'#FFF'}
                  backgroundColor={'#03DAC6'}
                  borderRadius={12}
                  onPress={() => buy(product)}
                />
              </>
            )}
          </View>
        </ActionSheet>
      </View>
    </SafeAreaView>
  );
};

export default withIAPContext(PackageView);
