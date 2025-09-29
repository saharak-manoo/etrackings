/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {styles} from '../../helpers/styles';
import * as Animatable from 'react-native-animatable';
import {useSelector} from 'react-redux';
import FastImage from '@d11/react-native-fast-image';
import Ripple from 'react-native-material-ripple';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import Swipeout from 'react-native-swipeout';
import {useTranslation} from 'react-i18next';

export default Track = props => {
  const {t} = useTranslation();
  const {
    fontSize,
    hp,
    wp,
    isIpad,
    isPresent,
    getImageAndColor,
  } = require('../../helpers/globalFunction');
  const setting = useSelector(state => state.setting);
  const {item, index, isHistory, onPress, onLongPress} = props;
  let {imageURL, color} = getImageAndColor(item.status, setting);

  return (
    <Animatable.View
      delay={
        index <= 25
          ? index * (index + setting?.animation == 'normal' ? 100 : 50)
          : 0
      }
      animation={
        setting?.animation != 'close'
          ? isHistory
            ? 'fadeInRight'
            : 'fadeInUp'
          : ''
      }>
      <Swipeout
        disabled={!item.active}
        autoClose
        right={props.onSwipeoutBtns(item.id, item.courierKey, item.trackingNo)}
        backgroundColor={setting.appColor}
        style={{
          alignContent: 'center',
          textAlign: 'center',
        }}>
        <Ripple
          rippleDuration={setting?.animation == 'normal' ? 600 : 450}
          rippleContainerBorderRadius={15}
          onPress={() => onPress()}
          onLongPress={() => onLongPress()}
          style={{
            flex: 1,
            backgroundColor: setting.cardColor,
            fontFamily: 'Kanit-Light',
            margin: hp(1),
            borderRadius: 15,
            width: isHistory ? 300 : isIpad() ? wp(46.5) : wp(90),
            height: 130,
          }}
          key={`searchHistories-${index}`}>
          <View
            style={{
              flex: 1,
            }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
              }}>
              <View
                style={[
                  styles.circle,
                  {
                    width: `${isHistory ? 25 : 20}%`,
                    backgroundColor: color,
                  },
                ]}>
                <FastImage
                  resizeMode={FastImage.resizeMode.contain}
                  style={styles.imageCircleStatus}
                  source={{
                    uri: imageURL,
                    priority: FastImage.priority.normal,
                  }}
                />
              </View>
              <View
                style={{
                  width: `${isHistory ? 70 : 75}%`,
                  justifyContent: 'flex-start',
                  paddingTop: 10,
                }}>
                <Text
                  theme={{
                    dark: setting.isDarkMode,
                    colors: {
                      text: setting.textColor,
                    },
                  }}
                  allowFontScaling={false}
                  numberOfLines={1}
                  style={{
                    alignContent: 'flex-start',
                    fontFamily: 'Kanit-Light',
                    fontSize: fontSize(15),
                    alignSelf: 'flex-start',
                    paddingTop: hp(0.2),
                    paddingLeft: hp(1),
                    width: '90%',
                  }}>
                  {item.note
                    ? `(${item.note}) ${item.trackingNo}`
                    : item.trackingNo}
                </Text>
                <Text
                  theme={{
                    dark: setting.isDarkMode,
                    colors: {
                      text: setting.textColor,
                    },
                  }}
                  allowFontScaling={false}
                  numberOfLines={1}
                  style={{
                    fontFamily: 'Kanit-Light',
                    fontSize: fontSize(13),
                    alignSelf: 'flex-start',
                    paddingTop: hp(0.5),
                    paddingLeft: hp(1),
                  }}>
                  {`${setting.isLanguageTH ? item.nameTH : item.nameEN} ${
                    item.active ? '' : `(${t('text.closedForMaintenance')})`
                  }`}
                </Text>
                <Text
                  theme={{
                    dark: setting.isDarkMode,
                    colors: {
                      text: setting.textColor,
                    },
                  }}
                  allowFontScaling={false}
                  numberOfLines={2}
                  style={{
                    fontFamily: 'Kanit-Light',
                    fontSize: fontSize(10),
                    alignSelf: 'flex-start',
                    paddingTop: hp(0.3),
                    paddingLeft: hp(1),
                    width: `${isHistory ? 75 : 80}%`,
                  }}>
                  {item.isKeep && !isPresent(item.currentStatus)
                    ? t('message.keepStatus')
                    : `${
                        setting.isLanguageTH
                          ? item.lastUpdatedStatusStrTH
                          : item.lastUpdatedStatusStrEN
                      } ${item.currentStatus}`}
                </Text>
              </View>

              <View
                style={{
                  width: '5%',
                  justifyContent: 'flex-end',
                }}>
                {item?.isFavorite && (
                  <View>
                    <MatIcon
                      name={'favorite'}
                      style={[
                        styles.cardMatIcon,
                        {
                          color: '#F81E49',
                        },
                      ]}
                    />
                  </View>
                )}

                <View style={{justifyContent: 'flex-end'}}>
                  <FastImage
                    resizeMode={FastImage.resizeMode.contain}
                    style={[
                      styles.imageRight,
                      {
                        marginBottom: 10,
                      },
                    ]}
                    source={{
                      uri: item.imageURL,
                      priority: FastImage.priority.normal,
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </Ripple>
      </Swipeout>
    </Animatable.View>
  );
};
