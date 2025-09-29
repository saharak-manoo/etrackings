import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import styles, {
  container,
  _dateTitleStyle,
  _largeTitleStyle,
} from './appleHeader.style';
import Ripple from 'react-native-material-ripple';
import FastImage from '@d11/react-native-fast-image';

const AppleHeader = props => {
  const {fontSize} = require('../../helpers/globalFunction');
  const setting = useSelector(state => state.setting);
  const {
    onPress,
    dateTitle,
    largeTitle,
    avatarStyle,
    imageSource,
    containerStyle,
    dateTitleStyle,
    largeTitleStyle,
    borderColor,
    backgroundColor,
    dateTitleFontSize,
    dateTitleFontColor,
    dateTitleFontWeight,
    largeTitleFontSize,
    largeTitleFontColor,
    largeTitleFontWeight,
    isIcon,
    iconName,
  } = props;
  return (
    <View style={containerStyle || container(backgroundColor, borderColor)}>
      <View>
        <Text
          allowFontScaling={false}
          style={
            dateTitleStyle ||
            _dateTitleStyle(
              dateTitleFontColor,
              dateTitleFontSize,
              dateTitleFontWeight,
            )
          }>
          {dateTitle}
        </Text>
        <Text
          allowFontScaling={false}
          style={
            largeTitleStyle ||
            _largeTitleStyle(
              largeTitleFontColor,
              largeTitleFontSize,
              largeTitleFontWeight,
            )
          }>
          {largeTitle}
        </Text>
      </View>

      <Ripple
        rippleDuration={setting?.animation == 'normal' ? 600 : 450}
        rippleContainerBorderRadius={15}
        style={styles.avatarContainerStyle}
        onPress={onPress}>
        {isIcon ? (
          <Icon
            name={iconName}
            style={{
              marginTop: 10,
              fontSize: fontSize(28),
              zIndex: 1000,
              color: setting.textColor,
            }}
          />
        ) : (
          <FastImage
            resizeMode={FastImage.resizeMode.contain}
            style={avatarStyle}
            source={imageSource}
          />
        )}
      </Ripple>
    </View>
  );
};

AppleHeader.propTypes = {
  dateTitle: PropTypes.string,
  largeTitle: PropTypes.string,
  dateTitleFontSize: PropTypes.number,
  dateTitleFontColor: PropTypes.string,
  dateTitleFontWeight: PropTypes.string,
  backgroundColor: PropTypes.string,
  largeTitleFontSize: PropTypes.number,
  largeTitleFontColor: PropTypes.string,
  largeTitleFontWeight: PropTypes.string,
};

AppleHeader.defaultProps = {
  dateTitleFontSize: 13,
  largeTitle: 'For You',
  dateTitleFontWeight: '600',
  largeTitleFontSize: 34,
  borderColor: '#EFEFF4',
  dateTitleFontColor: '#8E8E93',
  avatarStyle: styles.avatar,
  dateTitleStyle: styles.date,
  largeTitleFontWeight: 'bold',
  backgroundColor: 'transparent',
  dateTitle: 'MONDAY, 27 NOVEMBER',
  containerStyle: styles.container,
  largeTitleStyle: styles.largeTitleStyle,
};

export default AppleHeader;
