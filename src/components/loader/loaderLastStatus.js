import React from 'react';
import ContentLoader, {Rect} from 'react-content-loader/native';
import {useSelector} from 'react-redux';
import * as Animatable from 'react-native-animatable';

export default LoaderLastStatus = props => {
  const {hp, wp, isIpad} = require('../../helpers/globalFunction');
  const setting = useSelector(state => state.setting);

  return (
    <Animatable.View
      animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
      delay={setting?.animation == 'normal' ? 280 : 140}
      style={{
        fontFamily: 'Kanit-Light',
        backgroundColor: setting.cardColor,
        margin: hp(1),
        borderRadius: 20,
        width: isIpad() ? wp(46.5) : wp(90),
        height: 130,
      }}>
      <ContentLoader
        height={140}
        speed={0.5}
        backgroundColor={setting.isDarkMode ? '#E0E0E0' : '#C6C6C6'}
        foregroundColor={setting.isDarkMode ? '#5D5D5D' : '#686868'}
        viewBox={'0 0 380 70'}>
        <Rect x={'20'} y={'12'} rx={'5'} ry={'5'} width={'40'} height={'40'} />
        <Rect x={'80'} y={'0'} rx={'4'} ry={'4'} width={'170'} height={'13'} />
        <Rect x={'80'} y={'25'} rx={'3'} ry={'3'} width={'90'} height={'10'} />
        <Rect x={'80'} y={'45'} rx={'3'} ry={'3'} width={'230'} height={'10'} />
        <Rect x={'330'} y={'45'} rx={'5'} ry={'5'} width={'40'} height={'40'} />
      </ContentLoader>
    </Animatable.View>
  );
};
