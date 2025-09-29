import React from 'react';
import AnimatedTabBarNavigator from '../animatedNavTabBar/animatedTabBarNavigator';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

// Views
import HomeView from '../home/homeView';
import SearchView from '../search/searchView';
import NotificationView from '../notification/notificationView';

// Define type for Redux state if not already defined
interface RootState {
  setting: {
    textColor: string;
    appColor: string;
  };
}

// Type for TabBarIcon props
type TabBarIconProps = {
  name: string;
  tintColor: string;
  focused?: boolean;
  size?: number;
};

const Tabs = AnimatedTabBarNavigator();

// TabBarIcon component with type annotations
const TabBarIcon: React.FC<TabBarIconProps> = ({
  name,
  tintColor,
  size = 24,
}) => <Icon name={`${name}-outline`} size={size} color={tintColor} />;

// Main TabNavigation component
const TabNavigation: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const setting = useSelector((state: RootState) => state.setting);

  return (
    <Tabs.Navigator
      tabBarPosition={'bottom'}
      tabBarOptions={{
        keyboardHidesTabBar: false,
        activeTintColor: '#000',
        inactiveTintColor: setting.textColor,
        activeBackgroundColor: theme.colors.primaryContainer,
        tabStyle: {
          fontFamily: 'Kanit-Light',
          backgroundColor: setting.appColor,
          position: 'absolute',
        },
        allowFontScaling: true,
        labelStyle: {
          fontFamily: 'Kanit-Light',
          fontWeight: 'bold',
        },
      }}
      appearence={{
        topPadding: 5,
        horizontalPadding: 10,
      }}
      initialRouteName={'Home'}
    >
      <Tabs.Screen
        name={t('placeholder.home')}
        component={SearchView}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon focused={focused} tintColor={color} name="home" />
          ),
        }}
      />
      <Tabs.Screen
        name={t('placeholder.menu')}
        component={SearchView}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon focused={focused} tintColor={color} name="menu" />
          ),
        }}
      />
      <Tabs.Screen
        name={t('placeholder.notifications')}
        component={SearchView}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              focused={focused}
              tintColor={color}
              name="notifications"
            />
          ),
        }}
      />
    </Tabs.Navigator>
  );
};

export default TabNavigation;
