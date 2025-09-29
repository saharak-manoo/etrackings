import React from 'react';
import {ActivityIndicator, View, SafeAreaView} from 'react-native';
import {useSelector} from 'react-redux';
import {Text} from 'react-native-paper';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from '@d11/react-native-fast-image';
import {styles} from '../../helpers/styles';
import Ripple from 'react-native-material-ripple';

export default IOSHeader = ({
  canGoBack,
  title,
  titleColor,
  subtitle,
  subtitleColor,
  showShareButton,
  spinner,
  share,
  showFlashButton,
  isFlashOn,
  flash,
  imageURL,
  showPayButton,
  pay,
  payColor,
  payIsDisable,
  onPressBack,
  onPressContent,
  showFavoriteButton,
  favoriteIsDisable,
  isFavorite,
  favorite,
  showNotificationButton,
  notificationIsDisable,
  isNotification,
  notification,
}) => {
  const setting = useSelector(state => state.setting);
  const {isIpad, isLandscape} = require('../../helpers/globalFunction');

  shareButton = () => {
    return (
      showShareButton &&
      (spinner ? (
        <ActivityIndicator size={'small'} style={styles.floatRight} />
      ) : (
        <Ripple
          rippleDuration={setting?.animation == 'normal' ? 600 : 450}
          disabled={share == undefined}
          onPress={() => share()}
          style={styles.floatRight}>
          <Icon
            name={'ios-share-outline'}
            style={[
              styles.headerIcon,
              {color: setting.textColor, marginTop: -4},
            ]}
          />
        </Ripple>
      ))
    );
  };

  flashButton = () => {
    return (
      showFlashButton && (
        <Ripple
          rippleDuration={setting?.animation == 'normal' ? 600 : 450}
          disabled={flash == undefined}
          onPress={() => flash()}
          style={styles.floatRight}>
          <Icon
            name={isFlashOn ? 'flash-outline' : 'flash-off-outline'}
            style={[
              styles.headerIcon,
              {color: setting.textColor, marginTop: -4},
            ]}
          />
        </Ripple>
      )
    );
  };

  payButton = () => {
    return (
      showPayButton && (
        <Ripple
          rippleDuration={setting?.animation == 'normal' ? 600 : 450}
          disabled={payIsDisable || pay == undefined}
          onPress={() => pay()}
          style={styles.floatRight}>
          <Icon
            name={'card-outline'}
            style={[
              styles.headerIcon,
              {color: payColor || setting.textColor, marginTop: -4},
            ]}
          />
        </Ripple>
      )
    );
  };

  notificationButton = () => {
    return (
      showNotificationButton && (
        <Ripple
          rippleDuration={setting?.animation == 'normal' ? 600 : 450}
          disabled={notificationIsDisable || notification == undefined}
          onPress={() => notification()}
          style={styles.floatRight}>
          <MatIcon
            name={isNotification ? 'notifications-active' : 'notifications-off'}
            style={[
              styles.headerMatIcon,
              {
                color: setting.textColor,
                marginTop: -1,
              },
            ]}
          />
        </Ripple>
      )
    );
  };

  favoriteButton = () => {
    return (
      showFavoriteButton && (
        <Ripple
          rippleDuration={setting?.animation == 'normal' ? 600 : 450}
          disabled={favoriteIsDisable || favorite == undefined}
          onPress={() => favorite()}
          style={styles.floatRight}>
          <MatIcon
            name={isFavorite ? 'favorite' : 'favorite-border'}
            style={[
              styles.headerMatIcon,
              {
                color: isFavorite ? '#F81E49' : setting.textColor,
                marginTop: -1,
              },
            ]}
          />
        </Ripple>
      )
    );
  };

  renderTopBar = () => {
    return (
      <View style={styles.topBarContainer}>
        <View style={{flex: 1, justifyContent: 'flex-start'}}>
          {canGoBack && (
            <Ripple
              rippleDuration={setting?.animation == 'normal' ? 600 : 450}
              disabled={onPressBack == undefined}
              onPress={() => onPressBack()}
              style={styles.floatLeft}>
              <MatIcon
                name={'keyboard-backspace'}
                style={[styles.headerIcon, {color: setting.textColor}]}
              />
            </Ripple>
          )}
        </View>
        <View
          style={{
            flex: 1,
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <View
              style={{
                width: isIpad() ? (isLandscape() ? '73%' : '60%') : '10%',
              }}></View>
            {showFavoriteButton && (
              <View
                style={{
                  width: isIpad() ? (isLandscape() ? '9%' : '13%') : '30%',
                }}>
                {!spinner && favoriteButton()}
              </View>
            )}
            {showNotificationButton && (
              <View
                style={{
                  width: isIpad() ? (isLandscape() ? '9%' : '13%') : '30%',
                }}>
                {!spinner && notificationButton()}
              </View>
            )}
            {showShareButton && (
              <View
                style={{
                  width: isIpad() ? (isLandscape() ? '9%' : '13%') : '30%',
                }}>
                {shareButton()}
              </View>
            )}
          </View>
          {flashButton()}
          {payButton()}
        </View>
      </View>
    );
  };

  renderContent = () => {
    return (
      <Ripple
        style={{flexDirection: 'row'}}
        disabled={onPressContent == undefined}
        onPress={() => onPressContent()}>
        <View
          style={{
            width: imageURL ? '80%' : '100%',
            justifyContent: 'center',
          }}>
          <View style={styles.contentContainer}>
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={[
                styles.titleTextStyle,
                {color: titleColor || setting.textColor},
              ]}>
              {title || 'ETrackings'}
            </Text>
            {subtitle && (
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={[
                  styles.subtitleTextStyle,
                  {color: subtitleColor || setting.textColor},
                ]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {imageURL && (
          <View style={{width: '20%', justifyContent: 'center'}}>
            <FastImage
              resizeMode={FastImage.resizeMode.contain}
              style={styles.headerImageTrackingStatus}
              source={{
                uri: imageURL,
                priority: FastImage.priority.low,
              }}
            />
          </View>
        )}
      </Ripple>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: setting.appColor, marginBottom: 10},
      ]}>
      {renderTopBar()}
      {renderContent()}
    </SafeAreaView>
  );
};
