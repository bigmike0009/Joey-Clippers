import { ImageBackground, StyleSheet, View } from 'react-native';
import type { PropsWithChildren } from 'react';
import { usePathname, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const signInBackground = require('../../assets/images/barbershop-background.png');
const defaultBackground = require('../../assets/images/barbershop-background-awning-only.png');
const AWNING_CLEARANCE = 96;

export function AppBackground({ children }: PropsWithChildren) {
  const segments = useSegments();
  const pathname = usePathname();
  const inAuthGroup = segments[0] === '(auth)';
  const isSignInScreen =
    pathname === '/login' ||
    pathname === '/(auth)/login' ||
    (inAuthGroup && segments[1] === 'login');
  const isAuthScreen = inAuthGroup || pathname === '/login' || pathname === '/register';
  const backgroundImage = isSignInScreen ? signInBackground : defaultBackground;
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={backgroundImage}
      resizeMode="stretch"
      style={styles.background}
      imageStyle={styles.image}
    >
      <View style={[styles.content, !isAuthScreen && { paddingTop: insets.top + AWNING_CLEARANCE }]}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#7B3F32',
  },
  content: {
    flex: 1,
  },
  image: {
    opacity: 0.9,
  },
});
