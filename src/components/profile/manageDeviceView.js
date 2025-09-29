/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useEffect} from 'react';
import {Alert, ActionSheetIOS, View, FlatList} from 'react-native';
import {useSelector} from 'react-redux';
import * as Api from '../actions/api';
import {useTranslation} from 'react-i18next';
import {styles} from '../../helpers/styles';
import {Text} from 'react-native-paper';
import {ListItem} from 'react-native-elements';
import {getUniqueId} from 'react-native-device-info';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import Ripple from 'react-native-material-ripple';

import IOSHeader from '../header/iosHeaderView';

export default ManageDevice = ({navigation, route: {params}}) => {
  const {t} = useTranslation();
  const {
    fontSize,
    errorMessage,
    isIos,
    hp,
  } = require('../../helpers/globalFunction');
  const isInitialMount = useRef(true);
  const setting = useSelector(state => state.setting);
  const data = useSelector(state => state.data);
  const [uniqueId, setUniqueId] = useState('');
  const [spinner, setSpinner] = useState(true);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setup();
    }
  });

  setup = async () => {
    Api.devices(data?.user?.authenticationJWT).then(resp => {
      if (resp?.meta?.code === 200) {
        setDevices(resp.data);
      } else {
        errorMessage(t('message.error'), t('message.unableToLoadDevices'));
      }

      setSpinner(false);
    });

    respUniqueId = await getUniqueId();
    setUniqueId(respUniqueId);
  };

  deleteDevice = async id => {
    Api.deleteDevice(data?.user?.authenticationJWT, id).then(resp => {
      if (resp?.meta?.code === 200) {
        Api.devices(data?.user?.authenticationJWT).then(response => {
          if (response?.meta?.code === 200) {
            setDevices(response.data);
          } else {
            errorMessage(t('message.error'), t('message.unableToLoadDevices'));
          }

          setSpinner(false);
        });
      } else {
        errorMessage(t('message.error'), t('message.unableToLoadDevices'));
      }
    });
  };

  dialogDeleteDevice = id => {
    if (isIos())
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t('text.areYouSureToDeleteDevice'),
          options: [t('button.cancel'), t('button.deleteDevice')],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            deleteDevice(id);
          }
        },
      );
    else {
      Alert.alert(
        '',
        t('text.areYouSureToDeleteDevice'),
        [
          {
            text: t('button.cancel'),
          },
          {
            text: t('button.deleteDevice'),
            onPress: () => deleteDevice(id),
            style: 'destructive',
          },
        ],
        {
          cancelable: false,
        },
      );
    }
  };

  renderDevices = () => {
    return (
      <FlatList
        style={{flex: 1, paddingTop: 10, backgroundColor: setting.appColor}}
        data={devices}
        horizontal={false}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        renderItem={({item, index}) => {
          return (
            <Ripple
              rippleDuration={setting?.animation == 'normal' ? 600 : 450}
              disabled={item.deviceUniqueID === uniqueId}
              onPress={() => dialogDeleteDevice(item.id)}>
              <ListItem
                containerStyle={{
                  backgroundColor: setting.cardColor,
                }}
                title={`${item.brand} ${item.name} ${
                  item.deviceUniqueID === uniqueId
                    ? `(${t('text.thisDevice')})`
                    : ''
                }`}
                titleStyle={{
                  fontFamily: 'Kanit-Light',
                  color: setting.textColor,
                }}
                subtitle={`${t('text.addAt')} ${
                  setting.isLanguageTH
                    ? item.createdAtStrTH
                    : item.createdAtStrEN
                }`}
                subtitleStyle={{
                  fontFamily: 'Kanit-Light',
                  color: setting.textColor,
                }}
                rightIcon={
                  item.deviceUniqueID !== uniqueId && (
                    <MatIcon
                      name={'delete'}
                      style={styles.signOutIcon}
                      color={'#FF0055'}
                    />
                  )
                }
              />
            </Ripple>
          );
        }}
        keyExtractor={(_item, index) => `device-${index}`}
      />
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: setting.appColor}}>
      <IOSHeader
        title={t(spinner ? 'text.loading' : 'placeholder.setting')}
        subtitle={t(spinner ? 'text.loading' : 'text.manageDevices')}
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
        <View style={{flex: 1}}>
          <View
            style={{
              backgroundColor: setting.appColor,
              height: '100%',
              borderRadius: 15,
            }}>
            {!spinner && (
              <View style={{flex: 1, paddingTop: 20}}>
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
                    fontSize: fontSize(17),
                    alignSelf: 'flex-start',
                    paddingTop: hp(0.5),
                    paddingLeft: hp(1),
                  }}>
                  {`${t('placeholder.allDevice')} (${devices.length || 0})`}
                </Text>

                {renderDevices()}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
