import { Platform } from 'react-native'
import { useTheme } from 'native-base'
import {
  createBottomTabNavigator,
  BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs'

import { Home } from '@screens/Home'
import { MyAds } from '@screens/MyAds'
import { SignIn } from '@screens/SignIn'

import HomeSvg from '@assets/home.svg'
import AdsSvg from '@assets/ads.svg'
import GetOutSvg from '@assets/getout.svg'

type SecondaryAppRoutesProps = {
  home: undefined
  myads: undefined
  getout: undefined
}

const { Navigator, Screen } =
  createBottomTabNavigator<SecondaryAppRoutesProps>()

export type SecondaryAppNavigatorRoutesProps =
  BottomTabNavigationProp<SecondaryAppRoutesProps>

export const SecondaryAppRoutes = () => {
  const { sizes, colors } = useTheme()

  const iconSize = sizes[6]

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.gray[200],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: Platform.OS === 'android' ? 'auto' : 96,
          paddingBottom: sizes[10],
          paddingTop: sizes[6],
        },
      }}
    >
      <Screen
        name="home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <HomeSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
      <Screen
        name="myads"
        component={MyAds}
        options={{
          tabBarIcon: ({ color }) => (
            <AdsSvg
              fill={color}
              stroke={color}
              width={iconSize}
              height={iconSize}
            />
          ),
        }}
      />
      <Screen
        name="getout"
        component={SignIn}
        options={{
          tabBarIcon: ({ color }) => (
            <GetOutSvg fill={color} width={iconSize} height={iconSize} />
          ),
        }}
      />
    </Navigator>
  )
}
