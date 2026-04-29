import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_BAR_ASPECT_RATIO = 1867 / 574;
const TAB_BAR_MAX_WIDTH = 560;

export function useTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const barHeight = Math.min(screenWidth, TAB_BAR_MAX_WIDTH) / TAB_BAR_ASPECT_RATIO;
  const bottomInset = Math.max(insets.bottom - 28, 0);
  return barHeight + bottomInset;
}
