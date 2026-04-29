import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { useAuth } from '@/lib/AuthContext';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused }: { name: IoniconName; focused: boolean }) {
  return (
    <Ionicons
      name={focused ? name : (`${name}-outline` as IoniconName)}
      size={24}
      color={focused ? colors.primary.default : colors.text.disabled}
    />
  );
}

const transparentSceneOptions = {
  sceneStyle: { backgroundColor: 'transparent' },
};

export default function TabsLayout() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        ...transparentSceneOptions,
        headerShown: false,
        tabBarActiveTintColor: colors.primary.default,
        tabBarInactiveTintColor: colors.text.disabled,
        tabBarStyle: {
          backgroundColor: colors.surface.tabBar,
          borderTopColor: 'rgba(128,30,23,0.18)',
          borderTopWidth: 1,
          elevation: 18,
          shadowColor: colors.neutral[900],
          shadowOpacity: 0.14,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -6 },
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      } as never}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop Days',
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          href: isAdmin ? null : undefined,
          title: 'My Bookings',
          tabBarIcon: ({ focused }) => <TabIcon name="checkmark-circle" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ focused }) => <TabIcon name="chatbubble-ellipses" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          href: !isAdmin ? null : undefined,
          title: 'Members',
          tabBarIcon: ({ focused }) => <TabIcon name="people" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
