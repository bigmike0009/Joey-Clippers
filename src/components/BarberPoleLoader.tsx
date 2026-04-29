import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, radius, spacing, typography } from '@/theme';

type BarberPoleLoaderProps = {
  size?: number;
  label?: string;
  compact?: boolean;
};

const STRIPE_COLORS = [
  colors.primary.default,
  colors.text.inverse,
  colors.secondary.default,
  colors.text.inverse,
];

export function BarberPoleLoader({
  size = 72,
  label = 'Loading...',
  compact = false,
}: BarberPoleLoaderProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const poleWidth = Math.round(size * 0.34);
  const poleHeight = size;
  const stripeHeight = Math.max(10, Math.round(size * 0.18));
  const stripeTravel = stripeHeight * STRIPE_COLORS.length;
  const stripeCount = Math.ceil((poleHeight + stripeTravel * 2) / stripeHeight);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();
    return () => animation.stop();
  }, [progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-stripeTravel, 0],
  });

  return (
    <View style={[styles.wrapper, compact && styles.compactWrapper]}>
      <View style={styles.poleStack}>
        <View
          style={[
            styles.cap,
            { width: poleWidth + 14, height: Math.max(9, size * 0.12) },
          ]}
        />
        <View
          style={[
            styles.poleFrame,
            {
              width: poleWidth,
              height: poleHeight,
              borderRadius: Math.max(radius.md, poleWidth / 2),
            },
          ]}
        >
          <Animated.View
            style={[
              styles.stripeLayer,
              {
                height: poleHeight + stripeTravel * 2,
                transform: [{ translateY }],
              },
            ]}
          >
            {Array.from({ length: stripeCount }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.stripe,
                  {
                    top: index * stripeHeight,
                    left: -poleWidth,
                    width: poleWidth * 3,
                    height: stripeHeight,
                    backgroundColor: STRIPE_COLORS[index % STRIPE_COLORS.length],
                  },
                ]}
              />
            ))}
          </Animated.View>
          <View style={styles.highlight} />
        </View>
        <View
          style={[
            styles.cap,
            { width: poleWidth + 14, height: Math.max(9, size * 0.12) },
          ]}
        />
      </View>

      {label ? (
        <Text style={[styles.label, compact && styles.compactLabel]}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    padding: spacing[2],
  },
  compactWrapper: {
    gap: spacing[2],
    padding: 0,
  },
  poleStack: {
    alignItems: 'center',
  },
  poleFrame: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.neutral[300],
    backgroundColor: colors.text.inverse,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  stripeLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  stripe: {
    position: 'absolute',
    transform: [{ rotate: '-26deg' }],
  },
  highlight: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    width: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  cap: {
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    borderWidth: 2,
    borderColor: colors.neutral[300],
    marginVertical: -1,
  },
  label: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  compactLabel: {
    fontSize: typography.fontSize.sm,
  },
});
