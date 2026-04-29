import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';
import { useAuth } from '@/lib/AuthContext';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];
type FlowerBoxTabBarProps = TabBarProps & { isAdmin: boolean };

const adminTabBarFlowerBox = require('../../../assets/images/tab-bar-flower-box-admin-labeled.png');
const customerTabBarFlowerBox = require('../../../assets/images/tab-bar-flower-box-customer-labeled.png');
const TAB_BAR_SOURCE_WIDTH = 1867;
const TAB_BAR_SOURCE_HEIGHT = 574;
const TAB_BAR_ASPECT_RATIO = TAB_BAR_SOURCE_WIDTH / TAB_BAR_SOURCE_HEIGHT;
const TAB_BAR_MAX_WIDTH = 560;
const ADMIN_TAB_NAMES = ['index', 'requests', 'members', 'profile'];
const CUSTOMER_TAB_NAMES = ['index', 'bookings', 'requests', 'profile'];
const SLOT_CENTER_RATIOS = [
  { x: 306.33 / TAB_BAR_SOURCE_WIDTH, y: 0.565 },
  { x: 717.78 / TAB_BAR_SOURCE_WIDTH, y: 0.565 },
  { x: 1128.53 / TAB_BAR_SOURCE_WIDTH, y: 0.565 },
  { x: 1544.77 / TAB_BAR_SOURCE_WIDTH, y: 0.565 },
];

function TabIcon({
  name,
  focused,
  color,
  size = 24,
}: {
  name: IoniconName;
  focused: boolean;
  color?: string;
  size?: number;
}) {
  return (
    <Ionicons
      name={focused ? name : (`${name}-outline` as IoniconName)}
      size={size}
      color={color ?? (focused ? colors.primary.default : colors.text.disabled)}
    />
  );
}

const transparentSceneOptions = {
  sceneStyle: { backgroundColor: 'transparent' },
};

function FlowerBoxTabBar({ state, descriptors, navigation, isAdmin }: FlowerBoxTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const visibleTabNames = isAdmin ? ADMIN_TAB_NAMES : CUSTOMER_TAB_NAMES;
  const visibleRoutes = visibleTabNames
    .map((tabName) => state.routes.find((route) => route.name === tabName))
    .filter((route): route is (typeof state.routes)[number] => Boolean(route));
  const tabBarImage = isAdmin ? adminTabBarFlowerBox : customerTabBarFlowerBox;
  const barWidth = Math.min(screenWidth, TAB_BAR_MAX_WIDTH);
  const barHeight = barWidth / TAB_BAR_ASPECT_RATIO;
  const bottomInset = Math.max(insets.bottom - 28, 0);
  const cornerRadius = Math.min(48, screenWidth * 0.12);
  const slotSize = Math.max(48, Math.min(64, barWidth * 0.14));
  const iconSize = Math.max(18, Math.min(25, barWidth * 0.052));

  return (
    <View style={[styles.tabBarRoot, { height: barHeight + bottomInset }]}>
      <View
        style={[
          styles.flowerBox,
          {
            width: barWidth,
            height: barHeight,
            borderBottomLeftRadius: cornerRadius,
            borderBottomRightRadius: cornerRadius,
          },
        ]}
      >
        <Image source={tabBarImage} style={styles.flowerBoxImage} resizeMode="stretch" />
        {visibleRoutes.map((route, visibleIndex) => {
          const descriptor = descriptors[route.key];
          const options = descriptor.options;
          const focused = state.index === state.routes.indexOf(route);
          const slot = SLOT_CENTER_RATIOS[visibleIndex] ?? SLOT_CENTER_RATIOS[SLOT_CENTER_RATIOS.length - 1];
          const color = focused ? colors.primary.default : colors.text.disabled;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : undefined}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabButton,
                {
                  width: slotSize,
                  height: slotSize,
                  borderRadius: slotSize / 2,
                  left: barWidth * slot.x - slotSize / 2,
                  top: barHeight * slot.y - slotSize / 2,
                },
              ]}
            >
              {options.tabBarIcon?.({
                focused,
                color,
                size: iconSize,
              })}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <Tabs
      tabBar={(props: TabBarProps) => <FlowerBoxTabBar {...props} isAdmin={isAdmin} />}
      screenOptions={{
        ...transparentSceneOptions,
        headerShown: false,
        tabBarActiveTintColor: colors.primary.default,
        tabBarInactiveTintColor: colors.text.disabled,
      } as never}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop Days',
          tabBarIcon: ({ focused, color, size }) => <TabIcon name="calendar" focused={focused} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          href: isAdmin ? null : undefined,
          title: 'My Bookings',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="checkmark-circle" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="chatbubble-ellipses" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          href: !isAdmin ? null : undefined,
          title: 'Members',
          tabBarIcon: ({ focused, color, size }) => <TabIcon name="people" focused={focused} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color, size }) => <TabIcon name="person" focused={focused} color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarRoot: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    bottom: 0,
    elevation: 18,
    justifyContent: 'flex-end',
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  flowerBox: {
    overflow: 'hidden',
    position: 'relative',
  },
  flowerBoxImage: {
    height: '100%',
    width: '100%',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
});
