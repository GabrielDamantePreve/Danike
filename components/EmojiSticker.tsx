import { ImageSourcePropType } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type Props = {
  imageSize: number;
  stickerSource: ImageSourcePropType;
};

export default function EmojiSticker({ imageSize, stickerSource }: Props) {
  const scaleImage = useSharedValue(imageSize);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(-imageSize * 1.5);

  // Double tap gesture to toggle size
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (scaleImage.value !== imageSize * 2) {
        scaleImage.value = withSpring(imageSize * 2);
      } else {
        scaleImage.value = withSpring(imageSize);
      }
    });

  // Pan gesture to move the sticker
  const drag = Gesture.Pan()
    .onChange((event) => {
      translateX.value += event.changeX;
      translateY.value += event.changeY;
    })
    .onFinalize(() => {
      // Add bounce effect when releasing
      translateX.value = withSpring(translateX.value);
      translateY.value = withSpring(translateY.value);
    });

  const imageStyle = useAnimatedStyle(() => ({
    width: withSpring(scaleImage.value),
    height: withSpring(scaleImage.value),
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={doubleTap}>
      <GestureDetector gesture={drag}>
        <Animated.Image
          source={stickerSource}
          style={[imageStyle]}
          resizeMode="contain"
        />
      </GestureDetector>
    </GestureDetector>
  );

  // Os gestos já estão compostos no primeiro return
}
