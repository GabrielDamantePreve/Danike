import { ImageSourcePropType, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from "react-native-view-shot";
import { useRef } from 'react';

// O tipo é definido pelo próprio ViewShot

type Props = {
  imageSize: number;
  stickerSource: ImageSourcePropType;
};

export default function EmojiSticker({ imageSize, stickerSource }: Props) {
  const scaleImage = useSharedValue(imageSize);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(-350); // Initial position from original component
  const viewShotRef = useRef<ViewShot>(null);

  const requestPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  };

  const onCapture = async () => {
    if (viewShotRef.current) {
      try {
        const hasPermission = await requestPermission();
        if (!hasPermission) {
          console.log('Permissão necessária para salvar a imagem');
          return;
        }

        const captureMethod = viewShotRef.current?.capture;
        if (captureMethod) {
          const uri = await captureMethod();
          await MediaLibrary.saveToLibraryAsync(uri);
        }
        console.log('Captura de tela salva com sucesso!');
      } catch (error) {
        console.log('Erro ao capturar tela:', error);
      }
    }
  };

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

  // Pan gesture to move the sticker - optimizado para mobile
  const drag = Gesture.Pan()
    .minDistance(0) // Inicia o drag imediatamente
    .onBegin(() => {
      // Cancela animações anteriores
    })
    .onChange((event) => {
      translateX.value += event.changeX;
      translateY.value += event.changeY;
    })
    .onEnd(() => {
      // Add bounce effect when releasing
      translateX.value = withSpring(translateX.value, {
        damping: 15,
        stiffness: 100,
      });
      translateY.value = withSpring(translateY.value, {
        damping: 15,
        stiffness: 100,
      });
    });

  // Compõe os gestos de forma exclusiva - o tap tem prioridade
  const composedGesture = Gesture.Exclusive(doubleTap, drag);

  const imageStyle = useAnimatedStyle(() => ({
    width: withSpring(scaleImage.value),
    height: withSpring(scaleImage.value),
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
      <GestureDetector gesture={composedGesture}>
        <Animated.Image
          source={stickerSource}
          style={[imageStyle]}
          resizeMode="contain"
        />
      </GestureDetector>
    </ViewShot>
  );
}
