import { ImageBackground, StyleSheet } from 'react-native';
import type { PropsWithChildren } from 'react';
import { usePathname, useSegments } from 'expo-router';

const signInBackground = require('../../assets/images/barbershop-background.png');
const defaultBackground = require('../../assets/images/barbershop-background-awning-only.png');

export function AppBackground({ children }: PropsWithChildren) {
  const segments = useSegments();
  const pathname = usePathname();
  const isSignInScreen =
    pathname === '/login' ||
    pathname === '/(auth)/login' ||
    (segments[0] === '(auth)' && segments[1] === 'login');
  const backgroundImage = isSignInScreen ? signInBackground : defaultBackground;

  return (
    <ImageBackground
      source={backgroundImage}
      resizeMode="stretch"
      style={styles.background}
      imageStyle={styles.image}
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#7B3F32',
  },
  image: {
    opacity: 0.9,
  },
});
