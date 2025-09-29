import React from 'react';
import { SafeAreaView } from 'react-native';
import AppleHeader from './appleHeader';
import { useSelector } from 'react-redux';

export default Header = ({
  navigation,
  title,
  titleFontSize,
  titleColor,
  imageURL,
  isIcon,
  iconName,
}) => {
  const { fontSize } = require('../../helpers/globalFunction');
  const setting = useSelector(state => state.setting);

  return (
    <SafeAreaView style={{ backgroundColor: setting.appColor }}>
      <AppleHeader
        backgroundColor={setting.appColor}
        borderColor={setting.appColor}
        dateTitle={''}
        largeTitle={title}
        largeTitleStyle={{
          fontFamily: 'Kanit-Light',
          fontSize: fontSize(titleFontSize || 30),
          color: titleColor || setting.textColor,
          flexWrap: 'wrap',
        }}
        isIcon={isIcon}
        iconName={iconName}
        imageSource={{
          uri: imageURL,
        }}
        onPress={() => navigation.navigate('Profile')}
      />
    </SafeAreaView>
  );
};
