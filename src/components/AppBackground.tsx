import { ImageBackground, StyleSheet } from 'react-native';
import type { PropsWithChildren } from 'react';

const backgroundImage = require('../../assets/images/barbershop-background.png');

export function AppBackground({ children }: PropsWithChildren) {
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
