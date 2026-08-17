import { Tabs } from 'expo-router';
import { Map, List, User } from 'lucide-react-native';
import { colors } from '@/constants/theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.amber,
        tabBarInactiveTintColor: colors.textOnInkMuted,
        tabBarStyle: {
          backgroundColor: colors.ink,
          borderTopColor: colors.inkElevated,
          height: 84,
          paddingTop: 8,
          paddingBottom: 24
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <Map color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Nearby',
          tabBarIcon: ({ color, size }) => <List color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
