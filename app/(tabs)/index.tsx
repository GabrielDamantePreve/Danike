// app/tabs/index.tsx
import { 
  ImageSourcePropType, 
  View, 
  StyleSheet, 
  Alert, 
  Platform, 
  Text, 
  ScrollView,
  Animated,
  ActivityIndicator
} from 'react-native';
import { colors, gradients } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import domtoimage from 'dom-to-image';
import { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import Button from '@/components/Button';
import ImageViewer from '@/components/ImageViewer';
import IconButton from '@/components/IconButton';
import CircleButton from '@/components/CircleButton';
import EmojiPicker from '@/components/EmojiPicker';
import EmojiList from '@/components/EmojiList';
import EmojiSticker from '@/components/EmojiSticker';

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [pickedEmoji, setPickedEmoji] = useState<ImageSourcePropType | undefined>(undefined);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const imageRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [selectedImage]);

  const pickImageAsync = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setShowAppOptions(true);
      } else {
        Alert.alert('Você não selecionou nenhuma imagem.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    }
  };

  const onReset = () => {
    setShowAppOptions(false);
    setSelectedImage(undefined);
    setPickedEmoji(undefined);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    try {
      setIsLoading(true);
      if (!status?.granted) {
        const newPermission = await requestPermission();
        if (!newPermission.granted) {
          Alert.alert(
            'Permissão necessária',
            'Permita acesso à galeria para salvar imagens',
            [{ text: 'OK' }]
          );
          return;
        }
      }
      if (imageRef.current) {
        let localUri;
        if (Platform.OS === 'web') {
          const dataUrl = await domtoimage.toPng(imageRef.current, {
            quality: 0.95,
            width: 440,
            height: 440,
          });
          const link = document.createElement('a');
          link.download = 'sticker-image.png';
          link.href = dataUrl;
          link.click();
          Alert.alert('Sucesso', 'Imagem baixada com sucesso!', [{ text: 'OK' }]);
        } else {
          localUri = await captureRef(imageRef.current, {
            height: 440,
            quality: 1,
            format: 'png',
          });
          await MediaLibrary.saveToLibraryAsync(localUri);
          Alert.alert('Sucesso', 'Imagem salva na galeria!', [{ text: 'OK' }]);
        }
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Falha ao salvar imagem: ' + (error instanceof Error ? error.message : 'Erro desconhecido'),
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient 
        colors={gradients.primary as [string, string]} 
        style={styles.bg} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="restaurant" size={32} color={colors.textOnPrimary} style={styles.logo} />
              <Text style={styles.title}>Danike</Text>
              <Text style={styles.subtitle}>Stickers divertidos em segundos</Text>
            </LinearGradient>
          </Animated.View>

          <View style={styles.mainContainer}>
            <View style={styles.centerContent}>
              <Animated.View style={[styles.introBox, { opacity: fadeAnim }]}>
                <Text style={styles.introTitle}>Bem-vindo à Pizzaria Danike!</Text>
                <Text style={styles.introText}>
                  Descubra o sabor autêntico da nossa pizzaria artesanal. Ingredientes frescos, ambiente acolhedor e experiências deliciosas para toda a família. Crie stickers divertidos com o tema da nossa pizzaria e compartilhe momentos especiais!
                </Text>
              </Animated.View>
              
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.textOnPrimary} />
                </View>
              )}
              <View style={styles.card}>
                <ImageViewer ref={imageRef} imgSource={PlaceholderImage} selectedImage={selectedImage} />
                {pickedEmoji && <EmojiSticker imageSize={56} stickerSource={pickedEmoji} />}
              </View>
              <Text style={styles.hint}>Escolha uma foto, adicione emoji e salve</Text>
              
              {/* Botões alinhados com a página */}
              {showAppOptions ? (
                <View style={styles.optionsRow}>
                  <IconButton icon="refresh" label="Resetar" onPress={onReset} />
                  <CircleButton onPress={onAddSticker} />
                  <IconButton icon="save-alt" label="Salvar" onPress={onSaveImageAsync} />
                </View>
              ) : (
                <View style={styles.buttonColumn}>
                  <View style={styles.actionButton}>
                    <Button theme="primary" label="Escolher foto" onPress={pickImageAsync} />
                  </View>
                  <View style={styles.actionButton}>
                    <Button label="Usar esta foto" onPress={() => setShowAppOptions(true)} />
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>



        <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
          <EmojiList onSelect={emoji => setPickedEmoji(emoji)} onCloseModal={onModalClose} />
        </EmojiPicker>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  headerGradient: {
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
    paddingBottom: 32,
    minHeight: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bg: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
    marginBottom: 24,
  },
  logo: {
    marginBottom: 8,
  },
  title: {
    color: colors.textOnPrimary,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  subtitle: {
    color: colors.textOnPrimary,
    opacity: 0.8,
    fontSize: 15,
    marginBottom: 0,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 380,
    paddingHorizontal: 16,
  },
  introBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 22,
    marginBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  introTitle: {
    color: colors.textOnPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  introText: {
    color: colors.textOnPrimary,
    opacity: 0.92,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  card: {
    width: 320,
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  hint: {
    color: colors.textOnPrimary,
    opacity: 0.85,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 0,
  },
  bottomArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 36,
    paddingTop: 16,
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    width: '100%',
    maxWidth: 380,
    marginTop: 32,
  },
  buttonColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 380,
    gap: 20,
    marginTop: 32,
    paddingHorizontal: 16,
  },
  actionButton: {
    width: '100%',
    maxWidth: 320,
  },
});
