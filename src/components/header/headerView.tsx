// Header.tsx
import React from 'react';
import AppleHeader from './appleHeader';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { StackNavigationProp } from '@react-navigation/stack';

interface HeaderProps {
  navigation: StackNavigationProp<any>;
  title: string;
  titleFontSize?: number;
  titleColor?: string;
  imageURL?: string;
  isIcon?: boolean;
  iconName?: string;
}

const Header: React.FC<HeaderProps> = ({
  navigation,
  title,
  titleFontSize,
  titleColor,
  imageURL,
  isIcon = false,
  iconName,
}) => {
  const { fontSize } = require('../../helpers/globalFunction');

  const setting = useSelector((state: RootState) => state.setting);

  return (
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
  );
};

export default Header;
