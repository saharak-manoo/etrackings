/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Button} from 'react-native-paper';
import {TouchableOpacity} from 'react-native';
import {styles} from '../../helpers/styles';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import {useSelector} from 'react-redux';
import FastImage from '@d11/react-native-fast-image';

export default menu = props => {
  const setting = useSelector(state => state.setting);

  return (
    <Animatable.View
      delay={props.index * 40}
      animation={setting?.animation != 'close' ? 'fadeInRight' : ''}>
      <TouchableOpacity
        style={{marginLeft: 5, marginRight: 5}}
        onPress={() => props.onPress()}>
        <Button
          icon={({size, color}) => {
            return props.imageURL ? (
              <FastImage
                resizeMode={FastImage.resizeMode.contain}
                style={styles.imageTrackingMenu}
                source={{
                  uri: props.imageURL,
                  priority: FastImage.priority.normal,
                }}
              />
            ) : (
              <MatIcon
                name={props.iconName}
                size={size}
                color={setting.isDarkMode ? '#FFF' : '#000'}
              />
            );
          }}
          style={{
            borderColor: setting.isDarkMode ? '#D3D3D3' : '#B0B0B0',
          }}
          mode={props.selected ? 'contained' : 'outlined'}
          color={
            props.selected ? props.color : setting.isDarkMode ? '#FFF' : '#000'
          }>
          {props.title}
        </Button>
      </TouchableOpacity>
    </Animatable.View>
  );
};
