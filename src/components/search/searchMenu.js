/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Button} from 'react-native-paper';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import {useSelector} from 'react-redux';

export default SearchMenu = props => {
  const setting = useSelector(state => state.setting);

  return (
    <Animatable.View
      delay={props.index * 40}
      animation={setting?.animation != 'close' ? 'fadeInRight' : ''}>
      <TouchableOpacity
        rippleDuration={setting?.animation == 'normal' ? 600 : 450}
        style={{marginLeft: 5, marginRight: 5, height: 50}}
        onPress={() => props.onPress()}>
        <Button
          icon={({size, color}) => (
            <MatIcon name={props.iconName} size={size} color={color} />
          )}
          mode={props.selected ? 'contained' : 'outlined'}
          style={{
            borderColor: setting.isDarkMode ? '#D3D3D3' : '#B0B0B0',
          }}
          color={
            props.selected ? props.color : setting.isDarkMode ? '#FFF' : '#000'
          }>
          {props.title}
        </Button>
      </TouchableOpacity>
    </Animatable.View>
  );
};
