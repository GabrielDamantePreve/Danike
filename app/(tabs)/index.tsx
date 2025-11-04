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
  ActivityIndicator,
  Pressable
} from 'react-native';
import { colors, gradients } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import domtoimage from 'dom-to-image';
import { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import ModernButton from '@/components/ModernButton';
import ImageViewer from '@/components/ImageViewer';
import EmojiPicker from '@/components/EmojiPicker';
import EmojiList from '@/components/EmojiList';
import EmojiSticker from '@/components/EmojiSticker';
import IconButton from '@/components/IconButton';
import CircleButton from '@/components/CircleButton';

const PlaceholderImage = require('@/assets/images/background-image.png');

type QuickActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  variant?: 'default' | 'primary';
};

function QuickAction({ icon, label, onPress, variant = 'default' }: QuickActionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        variant === 'primary' && styles.quickActionPrimary,
        pressed && styles.quickActionPressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={variant === 'primary' ? colors.textOnPrimary : colors.primary}
        style={styles.quickActionIcon}
      />
      <Text
        style={[
          styles.quickActionLabel,
          variant === 'primary' && styles.quickActionLabelPrimary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

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
              ) : null}

              {!showAppOptions && (
                <View style={styles.initialActions}>
                  <ModernButton
                    title="Escolher da galeria"
                    icon="image-outline"
                    size="large"
                    onPress={pickImageAsync}
                  />
                  <ModernButton
                    title="Usar foto padrão"
                    variant="outline"
                    icon="pizza-outline"
                    onPress={() => setShowAppOptions(true)}
                  />
                </View>
              )}

              {showAppOptions && (
                <View style={styles.editingActions}>
                  <View style={styles.quickActionsRow}>
                    <QuickAction icon="refresh" label="Resetar" onPress={onReset} />
                    <QuickAction
                      icon="add-circle"
                      label="Adicionar emoji"
                      onPress={onAddSticker}
                      variant="primary"
                    />
                    <QuickAction
                      icon="cloud-download"
                      label="Salvar"
                      onPress={onSaveImageAsync}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.bottomSpacer} />
        </ScrollView>

        <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
          <EmojiList onSelect={emoji => setPickedEmoji(emoji)} onCloseModal={onModalClose} />
        </EmojiPicker>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bg: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 120,
  },
  header: {
    width: '100%',
    marginBottom: 20,
  },
  headerGradient: {
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textOnPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  centerContent: {
    alignItems: 'center',
    width: '100%',
  },
  introBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    width: '100%',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textOnPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  hint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    gap: 12,
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
  initialActions: {
    width: '100%',
    gap: 12,
  },
  editingActions: {
    alignItems: 'center',
    width: '100%',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    minWidth: 140,
    maxWidth: 200,
  },
  quickActionPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  quickActionPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.8,
  },
  quickActionIcon: {
    marginRight: 8,
  },
  quickActionLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionLabelPrimary: {
    color: colors.textOnPrimary,
  },
  bottomSpacer: {
    height: 80,
  },
});
