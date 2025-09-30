// app/tabs/index.tsx
import {
  Alert,
  ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
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
import { useRef, useState } from 'react';

import ModernButton from '@/components/ModernButton';
import ImageViewer from '@/components/ImageViewer';
import EmojiPicker from '@/components/EmojiPicker';
import EmojiList from '@/components/EmojiList';
import EmojiSticker from '@/components/EmojiSticker';

const PlaceholderImage = require('@/assets/images/background-image.png');

type FeatureHighlight = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

const featureHighlights: FeatureHighlight[] = [
  {
    icon: 'flame',
    title: 'Forno a lenha autêntico',
    description:
      'Receitas de família assadas lentamente, com massa de fermentação natural e ingredientes selecionados.',
  },
  {
    icon: 'color-palette',
    title: 'Experiência sensorial completa',
    description:
      'Ambiente acolhedor, trilha sonora exclusiva e stickers personalizados para divulgar cada novidade.',
  },
  {
    icon: 'share-social',
    title: 'Compartilhe momentos',
    description:
      'Crie stickers temáticos em segundos, salve e envie para a galera marcar presença na Danike.',
  },
];

const statHighlights = [
  { value: '25k+', label: 'Clientes apaixonados por nossas pizzas' },
  { value: '18', label: 'Sabores autorais no cardápio fixo' },
  { value: '15 min', label: 'Para criar um sticker inesquecível' },
];

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
  const imageRef = useRef<any>(null);
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 960;

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
          <View pointerEvents="none" style={styles.decorativeLayer}>
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.18)',
                'rgba(255, 255, 255, 0)',
              ]}
              style={[styles.decorativeBlob, styles.blobTopLeft]}
            />
            <LinearGradient
              colors={['rgba(255, 107, 53, 0.35)', 'rgba(255, 107, 53, 0)']}
              style={[styles.decorativeBlob, styles.blobBottomRight]}
            />
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0)']}
              style={[styles.decorativeBlob, styles.blobCenter]}
            />
          </View>

          <View style={[styles.contentWrapper, isWideLayout && styles.contentWrapperWide]}>
            <BlurView
              intensity={55}
              tint="dark"
              style={[styles.heroCard, isWideLayout && styles.heroCardWide]}
            >
              <View style={styles.heroBadge}>
                <Ionicons
                  name="restaurant"
                  size={18}
                  color={colors.textOnPrimary}
                  style={styles.heroBadgeIcon}
                />
                <Text style={styles.heroBadgeText}>Clássicos da pizza artesanal</Text>
              </View>

              <Text style={styles.heroTitle}>Danike • Pizzaria &amp; Experiência Digital</Text>
              <Text style={styles.heroSubtitle}>
                Transforme a forma de divulgar a pizzaria com uma vitrine digital imersiva. Crie stickers
                personalizados para cada sabor, compartilhe nas redes e encante a clientela em segundos.
              </Text>

              <View style={styles.statsRow}>
                {statHighlights.map((stat, index) => (
                  <View
                    key={stat.label}
                    style={[
                      styles.statCard,
                      index !== statHighlights.length - 1 && styles.statCardSpacing,
                    ]}
                  >
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.featureList}>
                {featureHighlights.map((feature, index) => (
                  <View
                    key={feature.title}
                    style={[
                      styles.featureItem,
                      index !== featureHighlights.length - 1 && styles.featureItemSpacing,
                    ]}
                  >
                    <View style={styles.featureIconWrapper}>
                      <Ionicons
                        name={feature.icon}
                        size={20}
                        color={colors.textOnPrimary}
                      />
                    </View>
                    <View style={styles.featureCopy}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {!showAppOptions && (
                <View style={styles.heroButtons}>
                  <ModernButton
                    title="Selecionar foto da galeria"
                    icon="image-outline"
                    size="large"
                    onPress={pickImageAsync}
                  />
                  <ModernButton
                    title="Explorar foto padrão"
                    variant="outline"
                    icon="pizza-outline"
                    onPress={() => setShowAppOptions(true)}
                  />
                </View>
              )}
            </BlurView>

            <BlurView
              intensity={65}
              tint="light"
              style={[styles.previewCard, isWideLayout && styles.previewCardWide]}
            >
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>Studio de stickers Danike</Text>
                <Text style={styles.previewSubtitle}>
                  Monte composições exclusivas com fotos, emojis e ilustrações para destacar o sabor do dia.
                </Text>
              </View>

              <View style={styles.previewCanvasWrapper}>
                <View
                  ref={imageRef}
                  collapsable={false}
                  style={styles.previewCanvas}
                >
                  <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
                  {pickedEmoji && <EmojiSticker imageSize={120} stickerSource={pickedEmoji} />}
                </View>
              </View>

              <Text style={styles.previewHint}>
                {showAppOptions
                  ? 'Ajuste seus stickers, reposicione e salve o resultado em alta qualidade.'
                  : 'Escolha uma imagem inspiradora e explore os recursos para criar um sticker irresistível.'}
              </Text>

              {showAppOptions ? (
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
                    label="Salvar imagem"
                    onPress={onSaveImageAsync}
                  />
                </View>
              ) : (
                <View style={styles.previewCtaFallback}>
                  <ModernButton
                    title="Quero começar agora"
                    size="large"
                    icon="star"
                    onPress={() => setShowAppOptions(true)}
                  />
                </View>
              )}
            </BlurView>
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
    position: 'relative',
  },
  decorativeLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeBlob: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.8,
  },
  blobTopLeft: {
    top: -80,
    left: -60,
  },
  blobBottomRight: {
    bottom: -100,
    right: -90,
  },
  blobCenter: {
    top: '38%',
    right: '20%',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  contentWrapperWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    marginBottom: 24,
  },
  heroCardWide: {
    flex: 1,
    marginRight: 28,
    marginBottom: 0,
    borderRadius: 32,
    padding: 28,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  heroBadgeIcon: {
    marginRight: 6,
  },
  heroBadgeText: {
    color: colors.textOnPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.textOnPrimary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 12,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 15,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statCardSpacing: {
    marginRight: 0,
  },
  statValue: {
    color: colors.textOnPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  featureList: {
    marginTop: 28,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 16,
  },
  featureItemSpacing: {
    marginBottom: 16,
  },
  featureIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    marginRight: 12,
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  featureDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  heroButtons: {
    marginTop: 28,
  },
  previewCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  previewCardWide: {
    flex: 1,
    marginLeft: 28,
    borderRadius: 32,
    padding: 28,
  },
  previewHeader: {
    marginBottom: 20,
  },
  previewTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  previewSubtitle: {
    color: colors.text,
    opacity: 0.75,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  previewCanvasWrapper: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
  },
  previewCanvas: {
    width: '100%',
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  previewHint: {
    color: colors.text,
    opacity: 0.75,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  quickActionsRow: {
    flexDirection: 'row',
    marginTop: 28,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    paddingVertical: 14,
    marginHorizontal: 4,
    marginVertical: 4,
    minWidth: 120,
  },
  quickActionPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  quickActionPressed: {
    transform: [{ scale: 0.97 }],
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
  previewCtaFallback: {
    marginTop: 28,
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 120,
  },
});
