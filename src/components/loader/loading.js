import React from 'react';
import ContentLoader, {Rect} from 'react-content-loader/native';
import {useSelector} from 'react-redux';
import * as Animatable from 'react-native-animatable';

export default Loading = props => {
  const setting = useSelector(state => state.setting);

  return (
    <Animatable.View
      delay={setting?.animation == 'normal' ? 110 : 55}
      animation={setting?.animation != 'close' ? 'fadeInUp' : ''}
      style={{
        backgroundColor: setting.cardColor,
        height: 100,
        marginTop: 10,
        borderRadius: 20,
        marginLeft: 10,
        marginRight: 10,
      }}>
      <ContentLoader
        height={120}
        speed={0.5}
        backgroundColor={setting.isDarkMode ? '#E0E0E0' : '#C6C6C6'}
        foregroundColor={setting.isDarkMode ? '#5D5D5D' : '#686868'}
        viewBox={'0 0 380 70'}>
        <Rect x={'20'} y={'0'} rx={'4'} ry={'4'} width={'170'} height={'15'} />
        <Rect x={'20'} y={'25'} rx={'3'} ry={'3'} width={'90'} height={'8'} />
        <Rect x={'20'} y={'45'} rx={'3'} ry={'3'} width={'230'} height={'8'} />
        <Rect x={'320'} y={'5'} rx={'5'} ry={'5'} width={'40'} height={'40'} />
      </ContentLoader>
    </Animatable.View>
  );
};
